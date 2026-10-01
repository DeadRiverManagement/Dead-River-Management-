import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { collectAttribution } from '../src/lib/attribution.js';
import {
  buildDemandFlowPayload,
  canOpenDemandFlowCalendar,
  DEMANDFLOW_BOOKING_PATH,
  DEMANDFLOW_CALENDAR_URL,
  DEMANDFLOW_ROUTE,
  industryFromBookPath,
  isBookApplicationPath,
} from '../src/lib/demandflow-handoff.js';

const values = {
  name: 'Test Owner', company: 'Example Roofing',
  email: 'qa@example.test', phone: '+15555550101',
  serviceType: 'Roofing', serviceArea: 'El Paso, TX',
  message: 'Roof replacements', adBudget: '2500-5000', consent: 'on', fax: '',
};
const responseBody = { ok: true, preview: false, route: DEMANDFLOW_ROUTE, event_id: 'drm_inquiry_123' };
const shortValues = {
  name: values.name, company: values.company, email: values.email,
  phone: values.phone, consent: 'on', fax: '',
};

// Exercise the real browser submit handler with a fake DOM/network.
// No production CRM requests or actual calendar appointments are made.
function harness({ kind = 'demandflow', ok = true, body = responseBody, industry = 'home-services',
  fetchError = null, analyticsError = false, fetchImpl = null, pathname = null } = {}) {
  const fields = { ...shortValues }, requests = [], navigations = [], analytics = [];
  const nodes = [{ hidden: false }, { hidden: false }, { hidden: false }];
  const status = {
    dataset: {}, textContent: '', children: [],
    removeAttribute() { delete this.dataset.state; },
    append(...children) { this.children.push(...children); },
  };
  const button = { disabled: false };
  let submit;
  const form = {
    dataset: { kind },
    elements: { namedItem: (key) => ({ value: fields[key] }) },
    reportValidity: () => true,
    setAttribute() {}, removeAttribute() {},
    querySelector: (selector) => selector === '.form-status' ? status : button,
    querySelectorAll: () => nodes,
    addEventListener: (name, callback) => { if (name === 'submit') submit = callback; },
  };
  const source = readFileSync(new URL('../src/scripts/growth-inquiry.js', import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?;\r?\n/gm, '');
  const storage = new Map();
  const browser = {
    navigator: {}, document: { referrer: '', cookie: '' },
    location: { href: 'https://www.deadrivermanagement.com/demandflow?utm_campaign=demandflow' },
    localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) },
  };
  vm.runInNewContext(source, {
    window: browser, collectAttribution,
    crypto: { randomUUID: () => '7dd4ed8e-9207-4381-a0de-624a898f7033' },
    buildDemandFlowPayload, canOpenDemandFlowCalendar, DEMANDFLOW_BOOKING_PATH,
    industryFromBookPath, isBookApplicationPath,
    document: {
      querySelectorAll: () => [form],
      createElement: (tagName) => ({ tagName }),
    },
    location: {
      search: '?industry=' + industry + '&utm_campaign=demandflow',
      pathname: pathname || (kind === 'demandflow' ? '/demandflow' : '/demo'),
      assign: (path) => navigations.push(path),
    },
    FormData: class { constructor() { return Object.entries(fields); } },
    HTMLSelectElement: class {},
    URLSearchParams, AbortController, setTimeout, clearTimeout,
    track: (...args) => {
      if (analyticsError) throw new Error('Analytics unavailable');
      analytics.push(args);
    },
    fetch: async (url, options) => {
      requests.push({ url, payload: JSON.parse(options.body) });
      if (fetchError) throw fetchError;
      if (fetchImpl) return fetchImpl();
      return { ok, json: async () => body };
    },
  });
  return {
    fields, requests, navigations, analytics, nodes, status, button,
    submit: () => submit({ preventDefault() {} }),
  };
}

test('uses the exact supplied calendar and a fixed internal booking route', () => {
  assert.equal(DEMANDFLOW_CALENDAR_URL, 'https://api.leadconnectorhq.com/widget/booking/rfaj3m31onqPQEFYhwyE');
  assert.equal(DEMANDFLOW_BOOKING_PATH, '/demandflow/book');
});

for (const industry of ['dental', 'real-estate', 'ecommerce', 'med-spas']) {
  test(`${industry} booking retains its industry and checks the matching saved route`, async () => {
    const h = harness({ pathname: '/book', industry, body: { ...responseBody, route: industry + '-growth-strategist' } });
    await h.submit();
    assert.equal(h.requests[0].payload.industry, industry);
    assert.equal(h.requests[0].payload.source, '/book');
    assert.deepEqual(h.navigations, ['/book/thanks']);
    assert.equal(h.analytics[0][1].industry, industry);
    assert.equal(canOpenDemandFlowCalendar(responseBody, industry), false);
  });
  test(`${industry} book page keeps its industry even if the query says otherwise`, async () => {
    const h = harness({
      pathname: '/book/' + industry,
      industry: 'home-services',
      body: { ...responseBody, route: industry + '-growth-strategist' },
    });
    await h.submit();
    assert.equal(h.requests[0].payload.industry, industry);
    assert.equal(h.requests[0].payload.source, '/book');
    assert.deepEqual(h.navigations, ['/book/thanks']);
  });
}
test('new booking application keeps its source and scheduler with DemandFlow tracking', async () => {
  const h = harness({ pathname: '/book' });
  await h.submit();
  assert.equal(h.requests[0].payload.source, '/book');
  assert.equal(h.requests[0].payload.kind, 'demandflow');
  assert.deepEqual(h.navigations, ['/book/thanks']);
  assert.equal(h.analytics.length, 1);
});
test('new booking application does not redirect or convert on CRM failure', async () => {
  const h = harness({ pathname: '/book', ok: false });
  await h.submit();
  assert.equal(h.navigations.length, 0);
  assert.equal(h.analytics.length, 0);
});
test('preserves qualification notes without changing the form on retries', () => {
  const original = { ...values };
  const first = buildDemandFlowPayload(values);
  const second = buildDemandFlowPayload(values);
  assert.deepEqual(values, original);
  assert.deepEqual(first, second);
  assert.match(first.message, /Roof replacements/);
  assert.match(first.message, /Home service type: Roofing/);
  assert.match(first.message, /Service area: El Paso, TX/);
  assert.match(first.message, /Approx\. monthly ad budget: \$2,500–\$5,000/);
  assert.equal(first.source, '/demandflow');
  assert.equal(first.industry, 'home-services');
  assert.equal(first.consent, true);
});
test('does not invent goals or consent when they are absent', () => {
  const payload = buildDemandFlowPayload({ ...values, message: ' ', consent: '' });
  assert.equal(payload.message, '');
  assert.equal(payload.consent, false);
});
test('allowlists and bounds attribution instead of forwarding contact query data', () => {
  const payload = buildDemandFlowPayload(values, '?utm_source=meta%0Atest&utm_content=' + 'x'.repeat(300) + '&email=private@example.test&redirect=https://example.test');
  assert.equal(payload.attribution.utm_source, 'meta test');
  assert.equal(payload.attribution.utm_content.length, 160);
  assert.deepEqual(Object.keys(payload.attribution).sort(), ['utm_content', 'utm_source']);
});
test('rejects unsuccessful, malformed, spam and unrelated responses', () => {
  for (const result of [null, {}, { ...responseBody, ok: false },
    { ...responseBody, route: 'validation-only' }, { ...responseBody, preview: 'false' },
    { ok: true, preview: true, route: 'other' }]) {
    assert.equal(canOpenDemandFlowCalendar(result), false);
  }
  assert.equal(canOpenDemandFlowCalendar(responseBody), true);
  assert.equal(canOpenDemandFlowCalendar({ ...responseBody, preview: true }), true);
});
test('redirects only after a successful DemandFlow intake', async () => {
  const h = harness();
  await h.submit();
  assert.deepEqual(h.navigations, ['/demandflow/book']);
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].url, '/api/growth-lead');
  assert.equal(h.fields.message, undefined);
  assert.equal(h.requests[0].payload.message, '');
  assert.equal(h.analytics.length, 1);
  assert.equal(h.analytics[0][1].event_id, responseBody.event_id);
  assert.equal(h.analytics[0][1].transaction_id, responseBody.event_id);
  assert.equal(h.requests[0].payload.attribution.latest.utm_campaign, 'demandflow');
  assert.equal(h.status.dataset.state, 'success');
  assert.equal(JSON.stringify(h.analytics).includes(values.email), false);
});
test('delivery failure keeps entered details and does not redirect', async () => {
  const h = harness({ ok: false, body: { error: 'Delivery unavailable' } });
  await h.submit();
  await h.submit();
  assert.equal(h.navigations.length, 0);
  assert.equal(h.analytics.length, 0);
  assert.equal(h.nodes.some((node) => node.hidden), false);
  assert.equal(h.button.disabled, false);
  assert.equal(h.status.dataset.state, 'error');
  assert.deepEqual(h.requests[0].payload, h.requests[1].payload);
});
test('unconfirmed HTTP 200 does not open the calendar', async () => {
  const h = harness({ body: { ok: true, preview: true, route: 'validation-only' } });
  await h.submit();
  assert.equal(h.navigations.length, 0);
  assert.equal(h.status.dataset.state, 'error');
});
test('network failure leaves the form usable', async () => {
  const h = harness({ fetchError: new Error('Network unavailable') });
  await h.submit();
  assert.equal(h.button.disabled, false);
  assert.equal(h.navigations.length, 0);
  assert.equal(h.nodes.some((node) => node.hidden), false);
});
test('preview may test the handoff without recording a real lead conversion', async () => {
  const h = harness({ body: { ...responseBody, preview: true } });
  await h.submit();
  assert.deepEqual(h.navigations, ['/demandflow/book']);
  assert.equal(h.analytics.length, 0);
  assert.match(h.status.textContent, /No inquiry was delivered/);
});
test('analytics failure cannot block a successfully saved inquiry', async () => {
  const h = harness({ analyticsError: true });
  await h.submit();
  assert.deepEqual(h.navigations, ['/demandflow/book']);
  assert.equal(h.status.dataset.state, 'success');
});
test('other inquiry forms keep their existing confirmation behavior', async () => {
  const h = harness({ kind: 'strategy', body: { ok: true, preview: false, message: 'Request received' } });
  await h.submit();
  assert.equal(h.navigations.length, 0);
  assert.equal(h.status.textContent, 'Request received');
  assert.equal(h.requests[0].payload.source, '/demo');
});
test('duplicate clicks do not submit twice while delivery is pending', async () => {
  let release;
  const h = harness({ fetchImpl: () => new Promise((resolve) => { release = resolve; }) });
  const first = h.submit();
  await h.submit();
  assert.equal(h.requests.length, 1);
  release({ ok: true, json: async () => responseBody });
  await first;
  assert.equal(h.navigations.length, 1);
});
