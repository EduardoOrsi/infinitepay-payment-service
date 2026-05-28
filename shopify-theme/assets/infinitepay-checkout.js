(function () {
  'use strict';

  var PAYMENT_SERVICE_URL = window.__INFINITEPAY_URL__;
  if (!PAYMENT_SERVICE_URL) {
    throw new Error('[InfinitePay] window.__INFINITEPAY_URL__ não está definida. Adicione a tag <script>window.__INFINITEPAY_URL__ = "https://..."</script> antes deste script no theme.liquid.');
  }

  function getCart() {
    return fetch('/cart.js', { headers: { 'Content-Type': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Falha ao buscar carrinho');
        return res.json();
      });
  }

  function createCheckoutSession(cart) {
    var url = PAYMENT_SERVICE_URL.replace(/\/$/, '') + '/api/checkout/session';
    console.log('[InfinitePay] POST', url);
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopifyCartId: cart.token,
        amount: cart.total_price,
        cartSnapshot: {
          lineItems: cart.items.map(function (item) {
            return {
              title: item.title,
              quantity: item.quantity,
              price: item.price,
            };
          }),
        },
      }),
    }).then(function (res) {
      return res.json().then(function (body) {
        if (!res.ok) throw new Error(body.message || 'Erro ao criar sessão de pagamento');
        return body;
      });
    });
  }

  function redirectToCheckout(session) {
    if (!session.checkoutUrl) throw new Error('URL de pagamento não recebida do servidor');
    window.location.href = session.checkoutUrl;
  }

  function setLoading(button, loading) {
    button.disabled = loading;
    if (loading) {
      button.dataset.originalText = button.textContent.trim();
      button.textContent = 'Aguarde...';
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }

  function handleCheckout(button) {
    setLoading(button, true);

    getCart()
      .then(function (cart) {
        if (!cart.items || cart.items.length === 0) throw new Error('Carrinho vazio');
        return createCheckoutSession(cart);
      })
      .then(redirectToCheckout)
      .catch(function (err) {
        console.error('[InfinitePay] Erro:', err.message);
        console.error('[InfinitePay] URL configurada:', PAYMENT_SERVICE_URL);
        alert('Não foi possível iniciar o pagamento. Tente novamente.');
        setLoading(button, false);
      });
  }

  // -------------------------------------------------------------------------
  // Intercepta o clique no botão de checkout na fase de CAPTURA.
  //
  // O tema Dawn (cart-drawer web component) registra seus handlers na fase
  // de bubbling. A fase de captura roda antes independente de qual parte do
  // tema originou o clique (cart drawer, página /cart, mini-cart, etc.).
  // -------------------------------------------------------------------------
  document.addEventListener('click', function (e) {
    var button = e.target.closest('[name="checkout"]');
    if (!button || button.disabled) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    handleCheckout(button);
  }, true); // true = fase de captura

})();
