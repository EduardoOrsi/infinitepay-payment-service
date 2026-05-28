import { defineHandler, HTTPError } from "nitro";
import { env } from "~/server/utils/env.ts";

const SHOP = "tmvrfz-kp.myshopify.com";

export default defineHandler(async (event) => {
  const url = new URL(event.req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    throw new HTTPError({ status: 400, message: "Parâmetro 'code' ausente" });
  }

  const { shopifyClientId, shopifyClientSecret } = env;

  if (!shopifyClientId || !shopifyClientSecret) {
    throw new HTTPError({ status: 500, message: "Credenciais Shopify não configuradas" });
  }

  const response = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: shopifyClientId,
      client_secret: shopifyClientSecret,
      code,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new HTTPError({ status: 502, message: `Shopify OAuth falhou: ${text}` });
  }

  const data = await response.json() as { access_token?: string; error?: string };

  if (!data.access_token) {
    throw new HTTPError({ status: 502, message: `Token não retornado: ${JSON.stringify(data)}` });
  }

  return {
    message: "Copie o token abaixo para SHOPIFY_ADMIN_API_TOKEN no .env e reinicie o servidor",
    SHOPIFY_ADMIN_API_TOKEN: data.access_token,
  };
});
