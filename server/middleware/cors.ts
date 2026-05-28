import { defineMiddleware } from "nitro";
import { env } from "~/server/utils/env.ts";

const SHOPIFY_ORIGIN = /^https:\/\/(?:[a-z0-9-]+\.)?(?:shopify|myshopify)\.com$/;

function isAllowedOrigin(origin: string): boolean {
  if (SHOPIFY_ORIGIN.test(origin))
    return true;
  if (env.shopifyStoreDomain && origin === `https://${env.shopifyStoreDomain}`)
    return true;
  return false;
}

export default defineMiddleware((event) => {
  if (event.req.url.includes("/api/webhooks/"))
    return;

  const origin = event.req.headers.get("origin");
  if (!origin || !isAllowedOrigin(origin))
    return;

  event.res.headers.set("Access-Control-Allow-Origin", origin);
  event.res.headers.set("Vary", "Origin");
  event.res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  event.res.headers.set("Access-Control-Allow-Headers", "Content-Type");

  if (event.req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: event.res.headers });
  }

  return undefined;
});
