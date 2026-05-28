import process from "node:process";
import { z } from "zod";

// Converte string vazia para undefined antes da validação,
// permitindo que campos com default funcionem mesmo quando a variável
// está declarada mas vazia no .env (ex: INFINITEPAY_API_URL=)
function emptyToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(val => (val === "" ? undefined : val), schema);
}

const schema = z.object({
  DATABASE_URL: emptyToUndefined(z.string().default("file:dev.db")),

  INFINITEPAY_API_URL: emptyToUndefined(z.url()),
  INFINITEPAY_HANDLE: z.string().min(1, "INFINITEPAY_HANDLE é obrigatório"),
  INFINITEPAY_WEBHOOK_URL: emptyToUndefined(z.url().optional()),
  PAYMENT_SESSION_EXPIRY_MINUTES: z.coerce.number().int().positive().default(30),

  SHOPIFY_STORE_DOMAIN: emptyToUndefined(z.string().optional()),
  SHOPIFY_ADMIN_API_TOKEN: emptyToUndefined(z.string().optional()),
  SHOPIFY_API_VERSION: emptyToUndefined(z.string().default("2025-01")),
  SHOPIFY_CLIENT_ID: emptyToUndefined(z.string().optional()),
  SHOPIFY_CLIENT_SECRET: emptyToUndefined(z.string().optional()),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues
    .map(i => `  ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Variáveis de ambiente inválidas ou ausentes:\n${issues}`);
}

const e = result.data;

export const env = {
  databaseUrl: e.DATABASE_URL,

  infinitepayApiUrl: e.INFINITEPAY_API_URL,
  infinitepayHandle: e.INFINITEPAY_HANDLE,
  infinitepayWebhookUrl: e.INFINITEPAY_WEBHOOK_URL,

  paymentSessionExpiryMinutes: e.PAYMENT_SESSION_EXPIRY_MINUTES,

  shopifyStoreDomain: e.SHOPIFY_STORE_DOMAIN,
  shopifyAdminApiToken: e.SHOPIFY_ADMIN_API_TOKEN,
  shopifyApiVersion: e.SHOPIFY_API_VERSION,
  shopifyClientId: e.SHOPIFY_CLIENT_ID,
  shopifyClientSecret: e.SHOPIFY_CLIENT_SECRET,
};
