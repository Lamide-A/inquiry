# SEWA — Demo Storefront

A pitch demo for @sewa_footies: hero, shop grid, product quick-view, cart, and a
full mock checkout flow (shipping → payment → confirmation). No live payment
processor is wired up yet — the payment step is a designed placeholder so the
site is safe to demo today.

## Preview locally

No build step needed — it's plain HTML/CSS/JS.

```
cd sewa-footies
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## Swapping in real product photos

Product visuals are currently drawn with CSS (a stand-in matching each pair's
colorway) since we don't have image files, only Instagram screenshots. To use
real photography:

1. Drop photos into `assets/products/`.
2. In `script.js`, replace the `sandalIcon(product)` calls with an `<img src="assets/products/your-file.jpg">` for each product.

## Going from demo to production

- **Payment**: connect Paystack or Flutterwave test keys at the "Pay" button in `renderPaymentStep()` in `script.js`.
- **Orders**: currently nothing is persisted server-side — cart is in the browser's localStorage only. A real launch needs a backend (or a service like Shopify Lite / a lightweight Node API) to record orders and process payment webhooks.
- **Hosting**: this folder can be deployed as-is to Netlify, Vercel, or GitHub Pages.
