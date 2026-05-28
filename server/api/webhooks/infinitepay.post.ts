import { defineHandler, HTTPError } from "nitro";
import { z } from "zod";
import { webhookService } from "~/server/services/webhook.ts";

const InfinitepayWebhookSchema = z.object({
  invoice_slug: z.string().min(1),
  amount: z.number(),
  paid_amount: z.number(),
  installments: z.number().int(),
  capture_method: z.string(),
  transaction_nsu: z.string().min(1),
  order_nsu: z.string().min(1),
  receipt_url: z.string(),
  items: z.array(z.object({
    price: z.number(),
    quantity: z.number().int(),
    description: z.string(),
    product_reference: z.string().nullable(),
  })),
});

export default defineHandler(async (event) => {
  let raw: unknown;

  try {
    raw = await event.req.json();
  }
  catch {
    throw new HTTPError({ status: 400, message: "Invalid JSON body" });
  }

  const parsed = InfinitepayWebhookSchema.safeParse(raw);

  if (!parsed.success) {
    throw new HTTPError({
      status: 400,
      message: "Invalid webhook payload",
      data: parsed.error.flatten().fieldErrors,
    });
  }

  await webhookService.processInfinitepay(parsed.data);

  return { ok: true };
});
