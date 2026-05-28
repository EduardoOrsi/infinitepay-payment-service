import type { Session } from "~/server/repositories/session.ts";
import { infinitepayClient } from "~/server/clients/infinitepay.ts";
import { sessionRepository } from "~/server/repositories/session.ts";
import { env } from "~/server/utils/env.ts";

export interface CartLineItem {
  title: string;
  quantity: number;
  price: number;
}

export interface CartSnapshot {
  lineItems: CartLineItem[];
}

export interface CreateSessionInput {
  shopifyCartId: string;
  amount: number;
  currency?: string;
  cartSnapshot: CartSnapshot;
}

export type SessionResponse = Omit<Session, "cartSnapshot"> & {
  cartSnapshot: CartSnapshot;
  checkoutUrl: string;
};

function toResponse(session: Session, checkoutUrl: string): SessionResponse {
  return {
    ...session,
    cartSnapshot: JSON.parse(session.cartSnapshot),
    checkoutUrl,
  };
}

async function fetchInfinitepayLink(sessionId: string, input: CreateSessionInput): Promise<string> {
  const result = await infinitepayClient.createLink({
    items: input.cartSnapshot.lineItems.map(item => ({
      quantity: item.quantity,
      price: item.price,
      description: item.title,
    })),
    order_nsu: input.shopifyCartId.split("?")[0],
  });

  // Extrai o lenc= da URL como identificador da fatura
  const checkoutId = new URL(result.url).searchParams.get("lenc") ?? result.url;

  await sessionRepository.updateInfinitepay(sessionId, {
    infinitepayCheckoutId: checkoutId,
    infinitepayCheckoutUrl: result.url,
  });

  return result.url;
}

export const sessionService = {
  async createOrFind(input: CreateSessionInput): Promise<{ session: SessionResponse; created: boolean }> {
    const existing = await sessionRepository.findByCartId(input.shopifyCartId);

    if (existing) {
      const newCartSnapshot = JSON.stringify(input.cartSnapshot);
      const cartChanged = existing.amount !== input.amount || existing.cartSnapshot !== newCartSnapshot;

      if (cartChanged) {
        const currency = input.currency ?? "BRL";
        await sessionRepository.resetForNewCart(existing.id, { amount: input.amount, currency, cartSnapshot: newCartSnapshot });
        const updatedSession: Session = { ...existing, amount: input.amount, currency, cartSnapshot: newCartSnapshot, infinitepayCheckoutId: null, infinitepayCheckoutUrl: null };
        const checkoutUrl = await fetchInfinitepayLink(updatedSession.id, input);
        return { session: toResponse(updatedSession, checkoutUrl), created: false };
      }

      // Idempotência: sessão já existe com URL — retorna direto
      if (existing.infinitepayCheckoutUrl) {
        return { session: toResponse(existing, existing.infinitepayCheckoutUrl), created: false };
      }
      // Sessão existe mas InfinitePay falhou antes — tenta novamente
      const checkoutUrl = await fetchInfinitepayLink(existing.id, input);
      return { session: toResponse(existing, checkoutUrl), created: false };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + env.paymentSessionExpiryMinutes * 60 * 1000);

    const newSession = {
      id: crypto.randomUUID(),
      shopifyCartId: input.shopifyCartId,
      status: "pending" as const,
      amount: input.amount,
      currency: input.currency ?? "BRL",
      infinitepayCheckoutId: null as string | null,
      infinitepayCheckoutUrl: null as string | null,
      shopifyOrderId: null as string | null,
      cartSnapshot: JSON.stringify(input.cartSnapshot),
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await sessionRepository.create(newSession);
    }
    catch {
      // Race condition: requisição concorrente ganhou a unique constraint — retorna o existente
      const raceResult = await sessionRepository.findByCartId(input.shopifyCartId);
      if (raceResult?.infinitepayCheckoutUrl) {
        return { session: toResponse(raceResult, raceResult.infinitepayCheckoutUrl), created: false };
      }
      throw new Error("Failed to create payment session");
    }

    const checkoutUrl = await fetchInfinitepayLink(newSession.id, input);

    return {
      session: { ...newSession, cartSnapshot: input.cartSnapshot, checkoutUrl },
      created: true,
    };
  },
};
