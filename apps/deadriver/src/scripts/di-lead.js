// Demand Intelligence hero form: name, phone and email only. Separate from the
// shared inquiry form; on success it goes straight to the scheduler page.
import { track } from './growth-shell.js';
import { collectAttribution } from '../lib/attribution.js';

const form = document.querySelector('.di-form');
if (form) {
  let submitting = false;
  let inquiryId;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    const status = form.querySelector('.di-form-status');
    const button = form.querySelector('[type=submit]');
    submitting = true;
    button.disabled = true;
    status.textContent = 'Sending…';
    status.removeAttribute('data-state');
    const values = Object.fromEntries(new FormData(form));
    inquiryId ||= crypto.randomUUID();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch('/api/growth-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email,
          fax: values.fax,
          kind: 'demo',
          form: 'di-hero',
          industry: 'other',
          consent: true,
          source: '/demand-intelligence',
          submittedAt: new Date().toISOString(),
          attribution: collectAttribution(window),
          inquiryId,
        }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.ok !== true) {
        throw new Error(data?.error || 'Something went wrong on our end.');
      }
      if (!data.preview && data.analytics_allowed !== false) {
        try {
          track('lead_submitted', {
            kind: 'demo',
            form: 'di-hero',
            event_id: data.event_id,
            transaction_id: data.event_id,
            industry: 'other',
          });
        } catch { /* Analytics is non-blocking. */ }
      }
      status.dataset.state = 'success';
      status.textContent = 'Got it. Opening the calendar…';
      location.assign(form.dataset.redirect);
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent =
        (error.name === 'AbortError'
          ? 'The request timed out. Please try again.'
          : error.message) +
        ' You can also call (915) 228-3054.';
    } finally {
      clearTimeout(timeout);
      submitting = false;
      button.disabled = false;
    }
  });
}
