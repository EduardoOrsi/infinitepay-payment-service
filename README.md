# InfinitePay Payment Service

Serviço de integração com InfinitePay. Intercepta o checkout da Shopify e redireciona o usuário para o link de pagamento da InfinitePay, com idempotência por carrinho.

## Getting started

```bash
pnpm install
pnpm run dev
```

## Deploying

```bash
pnpm run build
```

---

## Integração com o tema Shopify

### 1. Upload do script

No admin do Shopify, acesse:

**Online Store → Themes → (seu tema) → Edit code → assets/**

Clique em **Add a new asset** e faça upload do arquivo `shopify-theme/assets/infinitepay-checkout.js`.

---

### 2. Incluir o script no tema

Abra o arquivo `layout/theme.liquid` e adicione **antes do `</body>`**:

```liquid
<script>window.__INFINITEPAY_URL__ = 'https://SEU-SERVIDOR.com';</script>
<script src="{{ 'infinitepay-checkout.js' | asset_url }}" defer="defer"></script>
```

Substitua `https://SEU-SERVIDOR.com` pela URL do servidor em produção.

> Não use o filtro `script_tag` — ele gera `<script src="...">` sem `defer`, bloqueando o parser. Use sempre a tag manual com `defer="defer"`.

---

### 3. Verificar o seletor do botão de checkout

O script intercepta cliques em qualquer elemento com `[name="checkout"]` — o atributo padrão do botão "Finalizar compra" na maioria dos temas Shopify.

Para confirmar, inspecione o botão no seu tema e verifique se ele possui `name="checkout"`. Se o tema usar outro atributo, ajuste a linha no script:

```js
let button = e.target.closest("[name=\"checkout\"]");
```

---

### 4. Variáveis de ambiente necessárias

Copie `.env.example` para `.env` e preencha:

`INFINITEPAY_API_URL` Endpoint da API InfinitePay: `https://api.checkout.infinitepay.io`
`INFINITEPAY_HANDLE` Sua Infinite Tag, sem o símbolo `$`
`DATABASE_URL` Caminho do banco
`INFINITEPAY_WEBHOOK_URL` URL pública para receber webhooks da InfinitePay
