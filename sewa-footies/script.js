// ---------------------------------------------------------------------------
// SEWA demo storefront — front-end only. Cart lives in localStorage.
// Checkout is a fully-designed MOCK flow (no live payment processor wired up)
// so this is safe to demo today and easy to connect to Paystack/Flutterwave
// later without changing any markup or UX.
// ---------------------------------------------------------------------------

const PRODUCTS = [
  {
    id: 'wine-buckle',
    name: 'Wine Buckle Slide',
    tag: 'Double-strap suede slide, gold buckle',
    price: 48000,
    badge: 'New',
    variant: 'buckle-double',
    colors: { sole: '#f0c9ce', strap: '#7a2748', buckle: '#b08d57' },
    sizes: [36, 37, 38, 39, 40, 41]
  },
  {
    id: 'sahara-buckle',
    name: 'Sahara Buckle Slide',
    tag: 'Suede slide, statement silver buckle',
    price: 45000,
    variant: 'buckle-single-wide',
    colors: { sole: '#8b7c68', strap: '#c9b79c', buckle: '#c7cdd0' },
    sizes: [37, 38, 39, 40, 41, 42]
  },
  {
    id: 'oran-cutout',
    name: 'Oran Cutout Slide',
    tag: 'H-cutout suede slide',
    price: 45000,
    badge: 'Bestseller',
    variant: 'cutout-h',
    colors: { sole: '#7a6a56', strap: '#a99377' },
    sizes: [36, 37, 38, 39, 40, 41]
  },
  {
    id: 'sunset-knot',
    name: 'Sunset Knot Sandal',
    tag: 'Knotted toe-ring sandal',
    price: 42000,
    variant: 'knot',
    colors: { sole: '#d8622d', strap: '#d8622d' },
    sizes: [36, 37, 38, 39, 40]
  },
  {
    id: 'pistachio-bloom',
    name: 'Pistachio Bloom Slide',
    tag: 'Colorblock slide, tan footbed',
    price: 40000,
    variant: 'colorblock',
    colors: { sole: '#8b5e34', strapA: '#8fbf8a', strapB: '#f3c7ce', buckle: '#c7cdd0' },
    sizes: [36, 37, 38, 39, 40, 41]
  }
];

const money = n => '₦' + n.toLocaleString('en-NG');

function findProduct(id) { return PRODUCTS.find(p => p.id === id); }

// ---- Sandal icon renderer (stand-in for real product photography) -------
function sandalIcon(product) {
  const c = product.colors;
  switch (product.variant) {
    case 'buckle-double':
      return `<div class="sandal-icon">
        <div class="sole" style="background:${c.sole}"></div>
        <div class="strap strap-1" style="background:${c.strap}"></div>
        <div class="buckle" style="border-color:${c.buckle}; top:26%;"></div>
        <div class="strap strap-2" style="background:${c.strap}"></div>
      </div>`;
    case 'buckle-single-wide':
      return `<div class="sandal-icon">
        <div class="sole" style="background:${c.sole}"></div>
        <div class="strap strap-1" style="background:${c.strap}; top:30%; height:26%;"></div>
        <div class="buckle" style="border-color:${c.buckle}; top:36%;"></div>
      </div>`;
    case 'cutout-h':
      return `<div class="sandal-icon">
        <div class="sole" style="background:${c.sole}"></div>
        <div class="cutout">
          <div class="bar-side bar-left" style="background:${c.strap}"></div>
          <div class="bar-side bar-right" style="background:${c.strap}"></div>
          <div class="bar" style="background:${c.strap}"></div>
        </div>
      </div>`;
    case 'knot':
      return `<div class="sandal-icon">
        <div class="sole" style="background:${c.sole}"></div>
        <div class="knot" style="background:${c.strap}"></div>
        <div class="strap strap-2" style="background:${c.strap}; top:55%; height:10%; left:20%; right:20%;"></div>
      </div>`;
    case 'colorblock':
      return `<div class="sandal-icon">
        <div class="sole" style="background:${c.sole}"></div>
        <div class="colorband" style="background:${c.strapA}; top:26%; height:16%;"></div>
        <div class="colorband" style="background:${c.strapB}; top:40%; height:12%;"></div>
        <div class="buckle" style="border-color:${c.buckle}; top:28%; width:18%;"></div>
      </div>`;
    default:
      return `<div class="sandal-icon"><div class="sole" style="background:${c.sole}"></div></div>`;
  }
}

// ---- Cart state (localStorage-backed) ------------------------------------
let cart = JSON.parse(localStorage.getItem('sewaCart') || '[]');

function saveCart() {
  localStorage.setItem('sewaCart', JSON.stringify(cart));
  renderCart();
}

function addToCart(productId, size, qty = 1) {
  const existing = cart.find(i => i.id === productId && i.size === size);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, size, qty });
  saveCart();
  showToast('Added to bag');
  openCart();
}

function updateQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const p = findProduct(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function cartCountTotal() {
  return cart.reduce((n, i) => n + i.qty, 0);
}

// ---- Rendering -------------------------------------------------------------
function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-visual-frame">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        ${sandalIcon(p)}
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="product-tag">${p.tag}</p>
        <div class="product-price-row">
          <span class="product-price">${money(p.price)}</span>
          <button class="mini-add" data-quick="${p.id}" aria-label="Quick add ${p.name}">+</button>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.mini-add')) return;
      openProductModal(card.dataset.id);
    });
  });
  grid.querySelectorAll('.mini-add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openProductModal(btn.dataset.quick);
    });
  });
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  document.getElementById('cartCount').textContent = cartCountTotal();
  document.getElementById('cartSubtotal').textContent = money(cartTotal());

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty">Your bag is empty.<br>Start shopping the collection.</div>`;
    return;
  }

  itemsEl.innerHTML = cart.map((item, idx) => {
    const p = findProduct(item.id);
    return `
      <div class="cart-item">
        <div class="cart-item-visual">${sandalIcon(p)}</div>
        <div class="cart-item-body">
          <h4>${p.name}</h4>
          <div class="cart-item-meta">Size ${item.size}</div>
          <div class="qty-row">
            <button class="qty-btn" data-act="dec" data-idx="${idx}">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-act="inc" data-idx="${idx}">+</button>
            <span class="remove-link" data-act="remove" data-idx="${idx}">Remove</span>
          </div>
        </div>
        <div class="cart-item-price">${money(p.price * item.qty)}</div>
      </div>
    `;
  }).join('');

  itemsEl.querySelectorAll('[data-act]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx, 10);
      if (el.dataset.act === 'inc') updateQty(idx, 1);
      else if (el.dataset.act === 'dec') updateQty(idx, -1);
      else removeFromCart(idx);
    });
  });
}

// ---- Cart drawer open/close -------------------------------------------------
const overlay = document.getElementById('overlay');
const cartDrawer = document.getElementById('cartDrawer');

function openCart() {
  cartDrawer.classList.add('open');
  overlay.classList.add('active');
}
function closeCart() {
  cartDrawer.classList.remove('open');
  overlay.classList.remove('active');
}
document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
overlay.addEventListener('click', () => {
  closeCart();
  closeProductModal();
  closeCheckout();
});

// ---- Product quick view modal ----------------------------------------------
const productModalOverlay = document.getElementById('productModalOverlay');
const productModal = document.getElementById('productModal');
let selectedSize = null;

function openProductModal(productId) {
  const p = findProduct(productId);
  selectedSize = null;
  productModal.innerHTML = `
    <button class="modal-close" id="pmClose">&times;</button>
    <div class="pm-visual">${sandalIcon(p)}</div>
    <h3 class="pm-title">${p.name}</h3>
    <p class="pm-tag">${p.tag}</p>
    <div class="pm-price">${money(p.price)}</div>
    <div class="pm-label">Select Size (EU)</div>
    <div class="size-grid">
      ${p.sizes.map(s => `<button class="size-chip" data-size="${s}">${s}</button>`).join('')}
    </div>
    <button class="btn btn-primary btn-block" id="pmAdd" disabled>Select a size</button>
  `;

  productModal.querySelectorAll('.size-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      productModal.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedSize = parseInt(chip.dataset.size, 10);
      const addBtn = document.getElementById('pmAdd');
      addBtn.disabled = false;
      addBtn.textContent = 'Add to Bag';
    });
  });

  document.getElementById('pmAdd').addEventListener('click', () => {
    if (!selectedSize) return;
    addToCart(p.id, selectedSize);
    closeProductModal();
  });
  document.getElementById('pmClose').addEventListener('click', closeProductModal);

  productModalOverlay.classList.add('active');
  overlay.classList.add('active');
}
function closeProductModal() {
  productModalOverlay.classList.remove('active');
  if (!cartDrawer.classList.contains('open') && !checkoutOverlay.classList.contains('active')) {
    overlay.classList.remove('active');
  }
}

// ---- Checkout (mock) flow ---------------------------------------------------
const checkoutOverlay = document.getElementById('checkoutOverlay');
const checkoutModal = document.getElementById('checkoutModal');
let checkoutStep = 1;
let shippingInfo = {};

function openCheckout() {
  if (cart.length === 0) { showToast('Your bag is empty'); return; }
  checkoutStep = 1;
  closeCart();
  renderCheckoutStep();
  checkoutOverlay.classList.add('active');
  overlay.classList.add('active');
}
function closeCheckout() {
  checkoutOverlay.classList.remove('active');
  overlay.classList.remove('active');
}
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);

function stepDots(active, total) {
  let html = '<div class="checkout-steps">';
  for (let i = 1; i <= total; i++) html += `<div class="step-dot ${i <= active ? 'active' : ''}"></div>`;
  return html + '</div>';
}

function renderCheckoutStep() {
  if (checkoutStep === 1) renderShippingStep();
  else if (checkoutStep === 2) renderPaymentStep();
  else if (checkoutStep === 3) renderProcessingStep();
  else if (checkoutStep === 4) renderConfirmationStep();
}

function renderShippingStep() {
  checkoutModal.innerHTML = `
    <button class="modal-close" id="coClose">&times;</button>
    ${stepDots(1, 3)}
    <h3 class="co-title">Delivery Details</h3>
    <p class="co-sub">Where should we send your order?</p>
    <div class="form-row">
      <label>Full Name</label>
      <input type="text" id="fName" value="${shippingInfo.name || ''}" placeholder="Your full name">
    </div>
    <div class="form-row">
      <label>Phone Number</label>
      <input type="tel" id="fPhone" value="${shippingInfo.phone || ''}" placeholder="080X XXX XXXX">
    </div>
    <div class="form-row">
      <label>Delivery Address</label>
      <input type="text" id="fAddress" value="${shippingInfo.address || ''}" placeholder="Street, city">
    </div>
    <div class="form-grid-2">
      <div class="form-row">
        <label>State</label>
        <input type="text" id="fState" value="${shippingInfo.state || ''}" placeholder="e.g. Lagos">
      </div>
      <div class="form-row">
        <label>Delivery Method</label>
        <select id="fDelivery">
          <option value="Pay on Delivery">Pay on Delivery</option>
          <option value="Prepaid">Prepaid</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary btn-block" id="toPayment">Continue to Payment</button>
  `;
  document.getElementById('coClose').addEventListener('click', closeCheckout);
  document.getElementById('toPayment').addEventListener('click', () => {
    const name = document.getElementById('fName').value.trim();
    const phone = document.getElementById('fPhone').value.trim();
    const address = document.getElementById('fAddress').value.trim();
    const state = document.getElementById('fState').value.trim();
    if (!name || !phone || !address || !state) { showToast('Please fill in every field'); return; }
    shippingInfo = { name, phone, address, state, delivery: document.getElementById('fDelivery').value };
    checkoutStep = 2;
    renderCheckoutStep();
  });
}

function renderPaymentStep() {
  const total = cartTotal();
  checkoutModal.innerHTML = `
    <button class="modal-close" id="coClose">&times;</button>
    ${stepDots(2, 3)}
    <h3 class="co-title">Payment</h3>
    <p class="co-sub">Demo checkout — no live payment processor is connected yet.</p>
    <div class="order-summary">
      ${cart.map(item => {
        const p = findProduct(item.id);
        return `<div class="order-line"><span>${p.name} × ${item.qty} (Size ${item.size})</span><span>${money(p.price * item.qty)}</span></div>`;
      }).join('')}
      <div class="order-line"><span>Delivery</span><span>${shippingInfo.delivery === 'Pay on Delivery' ? 'Pay on arrival' : 'Free'}</span></div>
      <div class="order-line total"><span>Total</span><span>${money(total)}</span></div>
    </div>
    <div class="form-row">
      <label>Card Number</label>
      <input type="text" id="cNumber" placeholder="4242 4242 4242 4242" maxlength="19">
    </div>
    <div class="form-grid-2">
      <div class="form-row">
        <label>Expiry</label>
        <input type="text" id="cExpiry" placeholder="MM/YY" maxlength="5">
      </div>
      <div class="form-row">
        <label>CVV</label>
        <input type="text" id="cCvv" placeholder="123" maxlength="3">
      </div>
    </div>
    <div class="co-actions">
      <button class="btn btn-ghost" id="backToShipping">Back</button>
      <button class="btn btn-primary btn-block" id="payNow">Pay ${money(total)}</button>
    </div>
    <div class="secure-note">🔒 This is a demo form — no card data is transmitted or stored.</div>
  `;
  document.getElementById('coClose').addEventListener('click', closeCheckout);
  document.getElementById('backToShipping').addEventListener('click', () => { checkoutStep = 1; renderCheckoutStep(); });
  document.getElementById('payNow').addEventListener('click', () => {
    checkoutStep = 3;
    renderCheckoutStep();
    setTimeout(() => { checkoutStep = 4; renderCheckoutStep(); }, 1600);
  });
}

function renderProcessingStep() {
  checkoutModal.innerHTML = `
    ${stepDots(3, 3)}
    <h3 class="co-title" style="text-align:center;">Processing Payment…</h3>
    <div class="spinner"></div>
    <p class="co-sub" style="text-align:center;">Please don't close this window.</p>
  `;
}

let lastOrderId = null;
function renderConfirmationStep() {
  lastOrderId = 'SW-' + Math.floor(100000 + Math.random() * 900000);
  const total = cartTotal();
  checkoutModal.innerHTML = `
    <button class="modal-close" id="coClose">&times;</button>
    <div class="confirm-wrap">
      <div class="confirm-icon">✓</div>
      <h3 class="co-title">Order Confirmed</h3>
      <p class="co-sub">Thank you, ${shippingInfo.name.split(' ')[0]}! We've received your order.</p>
      <div class="confirm-order-id">Order #${lastOrderId} · ${money(total)}</div>
      <p class="co-sub">You'll get a WhatsApp update as soon as it ships to ${shippingInfo.address}.</p>
      <button class="btn btn-primary btn-block" id="doneBtn">Continue Shopping</button>
    </div>
  `;
  cart = [];
  saveCart();
  document.getElementById('coClose').addEventListener('click', () => { closeCheckout(); });
  document.getElementById('doneBtn').addEventListener('click', () => { closeCheckout(); });
}

// ---- Toast -------------------------------------------------------------
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ---- Init -------------------------------------------------------------
renderProducts();
renderCart();
