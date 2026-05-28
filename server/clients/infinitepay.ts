import { env } from "~/server/utils/env.ts";

export interface InfinitepayItem {
  quantity: number;
  price: number;
  description: string;
}

export interface InfinitepayCreateLinkInput {
  items: InfinitepayItem[];
  order_nsu?: string;
  redirect_url?: string;
  customer?: {
    name?: string;
    email?: string;
    phone_number?: string;
  };
  address?: {
    cep: string;
    street: string;
    neighborhood: string;
    number: string;
    complement?: string;
  };
}

export interface InfinitepayPaymentCheckInput {
  order_nsu: string;
  transaction_nsu?: string;
  slug?: string;
}

export interface InfinitepayCreateLinkResponse {
  url: string; // URL de pagamento para redirecionar o cliente
}

export interface InfinitepayPaymentCheckResponse {
  success: boolean;
  paid: boolean;
  amount: number;
  paid_amount: number;
  installments: number;
  capture_method: string;
}

async function post<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${env.infinitepayApiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`InfinitePay ${response.status} ${path}: ${text}`);
  }

  return response.json() as Promise<TResponse>;
}

export const infinitepayClient = {
  createLink(input: InfinitepayCreateLinkInput): Promise<InfinitepayCreateLinkResponse> {
    return post<object, InfinitepayCreateLinkResponse>("/links", {
      handle: env.infinitepayHandle,
      ...(env.infinitepayWebhookUrl ? { webhook_url: env.infinitepayWebhookUrl } : {}),
      ...input,
    });
  },

  checkPayment(input: InfinitepayPaymentCheckInput): Promise<InfinitepayPaymentCheckResponse> {
    return post<object, InfinitepayPaymentCheckResponse>("/payment_check", {
      handle: env.infinitepayHandle,
      ...input,
    });
  },
};
