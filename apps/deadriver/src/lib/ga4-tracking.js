export const GA4_MEASUREMENT_ID = 'G-5MC19Z3162';
const industries = new Set([
  'home-services',
  'dental',
  'real-estate',
  'ecommerce',
  'med-spas',
  'other',
]);
const receipts = new WeakMap();

// Use the existing combined Google tag; never initialize a second pageview tag.
export function trackSavedInquiry(win, detail) {
  if (
    win.navigator?.globalPrivacyControl === true ||
    detail.analytics_allowed === false ||
    detail.preview
  )
    return false;
  let analyticsStorage;
  for (const command of win.dataLayer || []) {
    if (
      command?.[0] === 'consent' &&
      ['default', 'update'].includes(command[1]) &&
      command[2]?.analytics_storage
    ) {
      analyticsStorage = command[2].analytics_storage;
    }
  }
  if (analyticsStorage === 'denied' || typeof win.gtag !== 'function')
    return false;
  if (
    !/^drm_inquiry_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      detail.event_id || '',
    )
  )
    return false;
  const sent = receipts.get(win) || new Set();
  if (sent.has(detail.event_id)) return false;
  // Only allow known classification values; never forward arbitrary form answers.
  try {
    win.gtag('event', 'generate_lead', {
      send_to: GA4_MEASUREMENT_ID,
      industry: industries.has(detail.industry) ? detail.industry : 'other',
      event_id: detail.event_id,
      lead_type: ['strategy', 'demo', 'growth-plan'].includes(detail.kind)
        ? detail.kind
        : 'inquiry',
    });
  } catch {
    return false;
  }
  sent.add(detail.event_id);
  receipts.set(win, sent);
  return true;
}
