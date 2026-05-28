import process from "node:process";

const e = process.env;

export const env = {
  databaseUrl: e.DATABASE_URL ?? "file:dev.db",

  infinitepayApiUrl: e.INFINITEPAY_API_URL ?? "",
  infinitepayApiKey: e.INFINITEPAY_API_KEY ?? "",
  infinitepayWebhookSecret: e.INFINITEPAY_WEBHOOK_SECRET ?? "",

  shopifyStoreDomain: e.SHOPIFY_STORE_DOMAIN ?? "",
  shopifyAdminApiToken: e.SHOPIFY_ADMIN_API_TOKEN ?? "",
  shopifyApiVersion: e.SHOPIFY_API_VERSION ?? "2025-01",

  paymentSessionExpiryMinutes: Number(e.PAYMENT_SESSION_EXPIRY_MINUTES ?? "30"),
};
