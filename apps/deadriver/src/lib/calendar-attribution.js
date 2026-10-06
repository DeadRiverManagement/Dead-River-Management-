// The native GHL calendar owns the successful-booking pixel event. This module
// only carries campaign context into it; clicks and page views are not bookings.
export function connectCalendarAttribution(win, collectAttribution) {
  const calendar = 'https://api.leadconnectorhq.com/widget/bookings/demandflow';
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'campaign_id',
    'gclid', 'gbraid', 'wbraid', 'fbclid'];
  const analyticsDenied = (win.dataLayer || []).some(e => e?.[0] === 'consent' &&
    ['default', 'update'].includes(e[1]) && e[2]?.analytics_storage === 'denied');
  const state = analyticsDenied ? {consent: {storage: false}} : collectAttribution(win);
  const denied = win.navigator?.globalPrivacyControl === true ||
    state.consent?.storage === false || state.consent?.ad_user_data === 'denied' ||
    analyticsDenied;
  const target = new URL(calendar);
  if (!denied) {
    // Carry a single campaign touch, never splice one campaign's UTMs onto
    // another campaign's click ID. Shared storage preserves direct returns.
    for (const key of keys) {
      const value = state.latest?.[key];
      if (value) target.searchParams.set(key, value);
    }
  }
  for (const link of win.document.querySelectorAll('a[href]')) {
    if (link.href.split('?')[0] === calendar) link.href = target.href;
  }
  const frame = win.document.getElementById('demandflow-booking');
  if (frame && frame.src !== target.href) frame.src = target.href;
}
