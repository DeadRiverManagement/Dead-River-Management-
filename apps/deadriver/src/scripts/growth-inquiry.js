import { track } from './growth-shell.js';
import { collectAttribution } from '../lib/attribution.js';
import {
  buildDemandFlowPayload,
  canOpenDemandFlowCalendar,
  DEMANDFLOW_BOOKING_PATH,
  industryFromBookPath,
  isBookApplicationPath,
} from '../lib/demandflow-handoff.js';

const allowedIndustries = [
  'home-services',
  'med-spas',
  'dental',
  'real-estate',
  'ecommerce',
  'other',
];

document.querySelectorAll('.inquiry-form').forEach((form) => {
  const params = new URLSearchParams(location.search);
  for (const key of ['industry', 'interest']) {
    const field = form.elements.namedItem(key), value = params.get(key);
    if (field instanceof HTMLSelectElement &&
        [...field.options].some((option) => option.value === value)) {
      field.value = value;
    }
  }
  let submitting = false;
  let inquiryId;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    const status = form.querySelector('.form-status');
    const button = form.querySelector('[type=submit]');
    if (!status || !button) return;
    submitting = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending…';
    status.removeAttribute('data-state');
    const values = Object.fromEntries(new FormData(form));
    const pathIndustry = industryFromBookPath(location.pathname);
    if (pathIndustry) {
      values.industry = pathIndustry;
    } else if (location.pathname === '/book' && allowedIndustries.includes(params.get('industry'))) {
      values.industry = params.get('industry');
    }
    // Keep the identifier across retries; it contains no form answers.
    inquiryId ||= crypto.randomUUID();
    const attribution = collectAttribution(window);
    const isDemandFlow = form.dataset.kind === 'demandflow';
    const payload = isDemandFlow
      ? buildDemandFlowPayload(values, attribution, location.pathname)
      : {
          ...values,
          kind: form.dataset.kind,
          consent: values.consent === 'on',
          source: location.pathname,
          submittedAt: new Date().toISOString(),
          attribution,
        };
    payload.inquiryId = inquiryId;
    const controller = new AbortController();
    // Allow for the existing contact, additive-tag and note API calls.
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch('/api/growth-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.ok !== true) {
        throw new Error(data?.error || 'Something went wrong on our end.');
      }
      if (isDemandFlow && !canOpenDemandFlowCalendar(data, payload.industry)) {
        throw new Error('We could not confirm your inquiry. Please try again.');
      }
      form.querySelectorAll('.form-grid, .checkbox-field, [type=submit]')
        .forEach((element) => { element.hidden = true; });
      status.dataset.state = 'success';
      status.textContent = isDemandFlow
        ? (data.preview
            ? 'Preview validated. No inquiry was delivered. Opening the calendar…'
            : 'We have your inquiry. Choose a time for your DemandFlow call next.')
        : (form.dataset.success || data.message || 'Thanks, we have your request. We will reply by email soon.');

      // Analytics must never turn successful delivery into a form error.
      // Validation-only previews are not real leads. No form details are sent.
      if (!data.preview && data.analytics_allowed !== false) {
        try {
          track('lead_submitted', {
            kind: payload.kind,
            event_id: data.event_id,
            transaction_id: data.event_id,
            industry: allowedIndustries.includes(payload.industry)
              ? payload.industry : 'other',
          });
        } catch { /* Delivery succeeded; analytics is non-blocking. */ }
      }
      if (isDemandFlow) {
        const bookingPath = isBookApplicationPath(location.pathname) ? '/book/thanks' : DEMANDFLOW_BOOKING_PATH;
        const next = document.createElement('a');
        next.href = bookingPath;
        next.className = 'text-link';
        next.textContent = 'Choose your appointment →';
        status.append(document.createElement('br'), next);
        // Fixed same-origin route. No contact data enters URLs or storage.
        try { location.assign(bookingPath); } catch {
          // The visible link remains usable when automatic navigation is blocked.
        }
      } else if (form.dataset.redirect) {
        // Emit the saved-inquiry event before leaving the page.
        location.assign(form.dataset.redirect);
      }
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent =
        (error.name === 'AbortError' || error.name === 'TimeoutError'
          ? 'The request timed out. Please try again.'
          : error.message) +
        ' You can also email brandon@deadrivermanagement.com or call (915) 228-3054.';
    } finally {
      clearTimeout(timeout);
      submitting = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
});
