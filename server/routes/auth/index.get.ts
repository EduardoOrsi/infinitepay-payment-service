import { defineHandler } from "nitro";
import { env } from "~/server/utils/env.ts";

const SCOPES = "write_draft_orders,read_orders";
const SHOP = "tmvrfz-kp.myshopify.com";

export default defineHandler(() => {
  const { shopifyClientId, infinitepayWebhookUrl } = env;

  if (!shopifyClientId || !infinitepayWebhookUrl) {
    return Response.json({ error: "SHOPIFY_CLIENT_ID não configurado" }, { status: 500 });
  }

  const redirectUri = "http://localhost:3000/auth/callback";

  const url = new URL(`https://${SHOP}/admin/oauth/authorize`);
  url.searchParams.set("client_id", shopifyClientId);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", crypto.randomUUID());

  return Response.redirect(url.toString(), 302);
});
