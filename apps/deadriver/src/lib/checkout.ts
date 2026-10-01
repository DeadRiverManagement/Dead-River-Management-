import { plans } from '../data/site';

// The plan pages ship a placeholder container where the checkout belongs. The
// payment links live in src/data/site.ts, so swap them in at build time rather
// than duplicating a payment URL into the markup.
const PLACEHOLDER =
  /<!-- CHECKOUT EMBED PLACEHOLDER:[^>]*-->\s*<div class="checkout" id="checkout">Checkout goes here<\/div>/;

export function injectCheckout(html: string, slug: string): string {
  const plan = plans.find((p) => p.slug === slug);
  if (!plan) throw new Error(`injectCheckout: no plan with slug "${slug}"`);
  if (!plan.paymentLink) throw new Error(`injectCheckout: plan "${slug}" has no paymentLink`);
  if (!PLACEHOLDER.test(html)) {
    // Fail the build rather than quietly shipping "Checkout goes here" again.
    throw new Error(`injectCheckout: checkout placeholder not found in "${slug}" markup`);
  }
  const embed =
    `<div class="checkout" id="checkout">` +
    `<iframe src="${plan.paymentLink}" title="Secure checkout for ${plan.name}"` +
    ` loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>` +
    `</div>`;
  return html.replace(PLACEHOLDER, embed);
}
