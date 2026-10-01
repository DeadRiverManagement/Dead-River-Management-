import { trackSavedInquiry } from '../lib/ga4-tracking.js';
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  menu?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('is-open');
}
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute(
    'aria-label',
    open ? 'Close navigation' : 'Open navigation',
  );
  nav?.classList.toggle('is-open', open);
});
const toggle = document.querySelector('.concierge-toggle'),
  panel = document.querySelector('#concierge');
function closeConcierge() {
  if (panel) panel.hidden = true;
  toggle?.setAttribute('aria-expanded', 'false');
}
toggle?.addEventListener('click', () => {
  if (!panel) return;
  panel.hidden = !panel.hidden;
  toggle.setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) panel.querySelector('button')?.focus();
});
document
  .querySelector('[data-concierge-close]')
  ?.addEventListener('click', () => {
    closeConcierge();
    toggle?.focus();
  });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    closeConcierge();
    document
      .querySelectorAll('.nav-dropdown[open]')
      .forEach((el) => el.removeAttribute('open'));
  }
});
document.querySelectorAll('.nav-dropdown').forEach((item) =>
  item.addEventListener('toggle', () => {
    if (item.open)
      document.querySelectorAll('.nav-dropdown').forEach((other) => {
        if (other !== item) other.removeAttribute('open');
      });
  }),
);
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-dropdown'))
    document
      .querySelectorAll('.nav-dropdown[open]')
      .forEach((el) => el.removeAttribute('open'));
});
// Site events for Google Tag Manager. Payloads never include contact details.
export function track(name, detail = {}) {
  if (name === 'lead_submitted') trackSavedInquiry(window, detail);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'drm_' + name, ...detail });
  window.dispatchEvent(
    new CustomEvent('drm:analytics', { detail: { event: name, ...detail } }),
  );
}
document
  .querySelectorAll('a[href="/growth-plan"]')
  .forEach((link) =>
    link.addEventListener('click', () =>
      track('growth_plan_start', { path: location.pathname }),
    ),
  );
document.querySelectorAll('[data-filter]').forEach((button) =>
  button.addEventListener('click', () => {
    document
      .querySelectorAll('[data-filter]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    document
      .querySelectorAll('[data-category]')
      .forEach(
        (card) =>
          (card.hidden =
            button.dataset.filter !== 'All' &&
            card.dataset.category !== button.dataset.filter),
      );
  }),
);

// Fade content up as it scrolls into view. Only elements that start below the
// fold get hidden, so nothing on the first screen ever flickers, and nothing is
// hidden at all when JavaScript, IntersectionObserver, or motion is off.
(() => {
  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    return;
  const targets = document.querySelectorAll(
    'main > section:not(:first-child) :is(h2, .section-head, .ms-lead, .ms-offer, .feature-panel, .trade-card, .faq-list, .faq, .ms-plans-head, .button-row, .split > *)',
  );
  const fold = window.innerHeight * 0.92;
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  targets.forEach((el) => {
    if (el.parentElement?.closest('.reveal')) return;
    if (el.getBoundingClientRect().top < fold) return;
    const siblings = [...el.parentElement.children].filter((c) =>
      c.matches('.feature-panel, .trade-card'),
    );
    const index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty('--reveal-delay', Math.min(index, 4) * 0.07 + 's');
    el.classList.add('reveal');
    io.observe(el);
  });
})();
