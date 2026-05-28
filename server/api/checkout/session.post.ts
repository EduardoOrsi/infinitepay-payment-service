import { defineHandler, HTTPError } from "nitro";
import { z } from "zod";
import { sessionService } from "~/server/services/session.ts";

const CartLineItemSchema = z.object({
  title: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().int().positive(),
});

const CreateSessionBody = z.object({
  shopifyCartId: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.string().optional(),
  cartSnapshot: z.object({
    lineItems: z.array(CartLineItemSchema).min(1),
  }),
});

export default defineHandler(async (event) => {
  let raw: unknown;

  try {
    raw = await event.req.json();
  }
  catch {
    throw new HTTPError({ status: 400, message: "Invalid JSON body" });
  }

  const parsed = CreateSessionBody.safeParse(raw);

  if (!parsed.success) {
    throw new HTTPError({
      status: 422,
      message: "Validation failed",
      data: parsed.error.flatten().fieldErrors,
    });
  }

  const { session, created } = await sessionService.createOrFind(parsed.data);

  if (created) {
    event.res.status = 201;
  }

  return session;
});
