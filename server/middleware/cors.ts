import { defineMiddleware } from "nitro";

const SHOPIFY_ORIGIN = /^https:\/\/(?:[a-z0-9-]+\.)?(?:shopify|myshopify)\.com$/;

export default defineMiddleware((event) => {
  if (event.req.url.includes("/api/webhooks/"))
    return;

  const origin = event.req.headers.get("origin");
  if (!origin || !SHOPIFY_ORIGIN.test(origin))
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
