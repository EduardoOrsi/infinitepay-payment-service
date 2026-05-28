import { shopifyClient } from "~/server/clients/shopify.ts";
import { sessionRepository } from "~/server/repositories/session.ts";
import { webhookEventRepository } from "~/server/repositories/webhookEvent.ts";
import { env } from "~/server/utils/env.ts";

export interface InfinitepayWebhookPayload {
  invoice_slug: string;
  amount: number;
  paid_amount: number;
  installments: number;
  capture_method: string;
  transaction_nsu: string;
  order_nsu: string;
  receipt_url: string;
  items: Array<{ price: number; quantity: number; description: string; product_reference: string | null }>;
}

export const webhookService = {
  async processInfinitepay(payload: InfinitepayWebhookPayload): Promise<void> {
    const existing = await webhookEventRepository.findByProviderEventId(payload.transaction_nsu);
    if (existing)
      return;

    const session = await sessionRepository.findByOrderNsu(payload.order_nsu);

    if (session && session.status === "pending") {
      await sessionRepository.markAsPaid(session.id);
    }

    await webhookEventRepository.create({
      id: crypto.randomUUID(),
      providerEventId: payload.transaction_nsu,
      type: "infinitepay.payment.paid",
      payload: JSON.stringify(payload),
      processedAt: new Date(),
    });

    if (!session)
      return;

    if (!env.shopifyStoreDomain || !env.shopifyAdminApiToken)
      return;

    try {
      const shopifyOrderId = await shopifyClient.createAndCompleteDraftOrder({
        lineItems: payload.items.map(item => ({
          title: item.description,
          quantity: item.quantity,
          price: item.price,
        })),
        note: `Pago via InfinitePay (${payload.capture_method}). Recibo: ${payload.receipt_url}`,
        customAttributes: [
          { key: "infinitepay_transaction_nsu", value: payload.transaction_nsu },
          { key: "infinitepay_order_nsu", value: payload.order_nsu },
          { key: "infinitepay_capture_method", value: payload.capture_method },
        ],
      });

      await sessionRepository.setShopifyOrderId(session.id, shopifyOrderId);
    }
    catch {
      // falha silenciosa — sessão já está marcada como paga, shopifyOrderId ficará nulo
    }
  },
};
