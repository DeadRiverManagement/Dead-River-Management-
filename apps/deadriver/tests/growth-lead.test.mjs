import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { leadNote, validateLead } from '../api/growth-lead.js';
import { dimensions } from '../src/lib/growth-tools.js';
import { ghlMock } from './helpers/ghl.mjs';
const valid = {
  kind: 'strategy',
  name: 'Preview Test',
  email: 'preview@example.com',
  company: 'Example Company',
  industry: 'home-services',
  message: 'Synthetic preview test.',
  consent: true,
  source: '/growth-plan',
};

for (const industry of ['dental', 'real-estate', 'ecommerce', 'med-spas']) {
  test(`${industry} saved inquiry adds distinct CRM tags`, async () => {
    const env = { ...process.env }, fetchBefore = globalThis.fetch;
    const mock = ghlMock();
    try {
      process.env.VERCEL_ENV = 'production';
      process.env.GHL_PIT = 'test-only';
      process.env.GHL_LOCATION_ID = 'loc-test';
      delete process.env.ENABLE_GROWTH_INTAKE;
      globalThis.fetch = mock.fetch;
      const res = response();
      await handler(req({ ...valid, kind: 'demandflow', source: '/book', industry }), res);
      assert.equal(res.code, 200);
      assert.equal(res.data.route, industry + '-growth-strategist');
      assert.ok(mock.contact.tags.includes('industry-' + industry));
      assert.ok(mock.contact.tags.includes(industry + '-growth-strategist'));
      assert.ok(!mock.contact.tags.includes('demandflow-home-services'));
    } finally { process.env = env; globalThis.fetch = fetchBefore; }
  });
  test(`${industry} booking never enters the home-service campaign`, () => {
    const lead = validateLead({ ...valid, kind: 'demandflow', source: '/book', industry });
    assert.equal(lead.industry, industry);
    assert.equal(lead.campaign, null);
    assert.equal(lead.route, industry + '-growth-strategist');
    assert.equal(lead.requestedAppointment, true);
  });
}
test('home-service booking uses the existing DemandFlow campaign without requiring optional phone', () => {
  const lead = validateLead({ ...valid, kind: 'demandflow', source: '/book' });
  assert.equal(lead.campaign, 'demandflow-home-services');
  assert.equal(lead.route, 'demandflow-home-services');
  assert.equal(lead.source, '/book');
  const unrelated = validateLead({ ...valid, kind: 'demandflow', source: '/growth-plan' });
  assert.equal(unrelated.campaign, null);
});
function response() {
  return {
    headers: {},
    code: 200,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(n) {
      this.code = n;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
}
const req = (body) => ({
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    host: 'preview.example',
    origin: 'https://preview.example',
  },
  body,
});

const roofing = { ...valid, source: '/el-paso-roofers' };

test('public form and campaign text are escaped before writing a rich-text CRM note', () => {
  const note = leadNote(validateLead({ ...roofing, message: '<img src=x onerror=alert(1)> & goals', attribution: { utm_campaign: '<script>bad()</script>' } }));
  assert.doesNotMatch(note, /<img|<script>/);
  assert.match(note, /&lt;img src=x onerror=alert\(1\)&gt; &amp; goals/);
  assert.match(note, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
});

test('roofing campaign routing and attribution are server-allowlisted', () => {
  const lead = validateLead({
    ...roofing,
    tags: ['admin'],
    attribution: {
      utm_source: 'facebook',
      utm_campaign: 'roofing\nfall',
      token: 'not-allowed',
    },
  });
  assert.equal(lead.campaign, 'elpaso-roofer');
  assert.equal(lead.route, 'elpaso-roofer');
  assert.equal(lead.requestedAppointment, true);
  assert.deepEqual(lead.attribution, {
    utm_source: 'facebook',
    utm_campaign: 'roofing fall',
  });
  assert.equal(lead.tags, undefined);
  for (const patch of [
    { source: '/growth-plan', campaign: 'elpaso-roofer' },
    { industry: 'dental' },
    { kind: 'demo' },
  ]) {
    assert.equal(validateLead({ ...roofing, ...patch }).campaign, null);
  }
});

test('roofing inquiry preserves existing tags and confirms the requested tag', async () => {
  const env = { ...process.env },
    fetchBefore = globalThis.fetch,
    mock = ghlMock({ contact: { id: 'contact-1', email: valid.email, source: 'Instantly', tags: ['existing-client'] } });
  try {
    process.env.VERCEL_ENV = 'production';
    process.env.GHL_PIT = 'test-only';
    process.env.GHL_LOCATION_ID = 'loc-test';
    delete process.env.ENABLE_GROWTH_INTAKE;
    globalThis.fetch = mock.fetch;
    const res = response();
    await handler(req(roofing), res);
    assert.equal(res.code, 200);
    assert.equal(res.data.preview, false);
    assert.equal(mock.calls.find((call) => call.method === 'PUT').body.tags, undefined);
    assert.equal(mock.contact.source, 'Instantly');
    assert.deepEqual(mock.contact.tags, ['existing-client', 'elpaso-roofer']);
    assert.match(mock.notes[0], /Campaign tag: elpaso-roofer/);
  } finally {
    process.env = env;
    globalThis.fetch = fetchBefore;
  }
});

test('roofing inquiry fails when CRM or tag confirmation fails, even with a successful webhook', async () => {
  const env = { ...process.env },
    fetchBefore = globalThis.fetch;
  try {
    process.env.VERCEL_ENV = 'production';
    process.env.GHL_PIT = 'test-only';
    process.env.GHL_LOCATION_ID = 'loc-test';
    process.env.ENABLE_GROWTH_INTAKE = 'true';
    process.env.GROWTH_LEAD_WEBHOOK = 'https://example.com/webhook';
    process.env.GROWTH_WEBHOOK_SECRET = 'test-only';
    for (const scenario of [
      'no-id',
      'tag-rejected',
      'tag-missing',
      'crm-rejected',
    ]) {
      const mock = ghlMock({ scenario });
      globalThis.fetch = mock.fetch;
      const res = response();
      await handler(req(roofing), res);
      assert.equal(res.code, 502, scenario);
      assert.equal(mock.calls.some((call) => call.url === 'https://example.com/webhook'), false);
    }
    delete process.env.GHL_PIT;
    const res = response();
    await handler(req(roofing), res);
    assert.equal(res.code, 503);
  } finally {
    process.env = env;
    globalThis.fetch = fetchBefore;
  }
});

test('roofing preview and honeypot never write contacts or tags', async () => {
  const env = { ...process.env },
    fetchBefore = globalThis.fetch;
  try {
    process.env.GHL_PIT = 'test-only';
    process.env.GHL_LOCATION_ID = 'loc-test';
    globalThis.fetch = async () => {
      assert.fail('Must not deliver');
    };
    for (const environment of ['preview', 'development']) {
      process.env.VERCEL_ENV = environment;
      const res = response();
      await handler(req(roofing), res);
      assert.equal(res.data.preview, true);
    }
    process.env.VERCEL_ENV = 'production';
    const res = response();
    await handler(req({ ...roofing, fax: 'spam' }), res);
    assert.equal(res.data.preview, true);
  } finally {
    process.env = env;
    globalThis.fetch = fetchBefore;
  }
});
test('server validates contact, industry, consent, and website', () => {
  assert.equal(validateLead(valid).route, 'home-services-growth-strategist');
  for (const patch of [
    { email: 'invalid' },
    { consent: false },
    { industry: 'fake' },
    { website: 'javascript:alert(1)' },
    { company: '' },
  ])
    assert.throws(() => validateLead({ ...valid, ...patch }));
  assert.equal(
    validateLead({ ...valid, kind: 'demo' }).route,
    'demand-intelligence-demo',
  );
});
test('preview never calls a webhook even with delivery enabled and inherited secrets', async () => {
  const env = { ...process.env },
    fetchBefore = globalThis.fetch;
  let calls = 0;
  try {
    process.env.VERCEL_ENV = 'preview';
    process.env.ENABLE_GROWTH_INTAKE = 'true';
    process.env.GROWTH_LEAD_WEBHOOK = 'https://example.com/webhook';
    process.env.GROWTH_WEBHOOK_SECRET = 'synthetic';
    globalThis.fetch = () => {
      calls++;
      throw new Error('Must not send');
    };
    const res = response();
    await handler(req(valid), res);
    assert.equal(res.code, 200);
    assert.equal(res.data.preview, true);
    assert.equal(calls, 0);
    assert.equal(JSON.stringify(res.data).includes(valid.email), false);
  } finally {
    process.env = env;
    globalThis.fetch = fetchBefore;
  }
});
test('production is fail-closed without explicit configuration', async () => {
  const env = { ...process.env };
  try {
    process.env.VERCEL_ENV = 'production';
    delete process.env.ENABLE_GROWTH_INTAKE;
    delete process.env.GHL_PIT;
    delete process.env.GHL_LOCATION_ID;
    const res = response();
    await handler(req(valid), res);
    assert.equal(res.code, 503);
  } finally {
    process.env = env;
  }
});
test('production delivers to GoHighLevel with the same secrets as the older forms', async () => {
  const env = { ...process.env },
    fetchBefore = globalThis.fetch;
  const mock = ghlMock();
  try {
    process.env.VERCEL_ENV = 'production';
    process.env.GHL_PIT = 'test-only';
    process.env.GHL_LOCATION_ID = 'loc-test';
    delete process.env.ENABLE_GROWTH_INTAKE;
    globalThis.fetch = mock.fetch;
    const res = response();
    await handler(req({ ...valid, phone: '(915) 555-0123' }), res);
    assert.equal(res.code, 200);
    assert.equal(res.data.ok, true);
    assert.equal(res.data.preview, false);
    const { body: contact } = mock.calls.find((call) => call.path === '/contacts/upsert');
    assert.equal(contact.locationId, 'loc-test');
    assert.equal(contact.firstName, 'Preview');
    assert.equal(contact.lastName, 'Test');
    assert.equal(contact.email, valid.email);
    assert.equal(contact.companyName, valid.company);
    assert.equal(contact.tags, undefined);
    assert.deepEqual(mock.contact.tags, ['website-lead', 'growth-strategy']);
    assert.equal(mock.contact.source, 'Website - Strategy call request');
    assert.match(mock.notes[0], /Strategy call request/);
    assert.match(mock.notes[0], /Synthetic preview test/);
  } finally {
    process.env = env;
    globalThis.fetch = fetchBefore;
  }
});
test('a failed CRM delivery in production reports an error instead of silently succeeding', async () => {
  const env = { ...process.env },
    fetchBefore = globalThis.fetch;
  try {
    process.env.VERCEL_ENV = 'production';
    process.env.GHL_PIT = 'test-only';
    process.env.GHL_LOCATION_ID = 'loc-test';
    delete process.env.ENABLE_GROWTH_INTAKE;
    globalThis.fetch = async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    const res = response();
    await handler(req(valid), res);
    assert.equal(res.code, 502);
  } finally {
    process.env = env;
    globalThis.fetch = fetchBefore;
  }
});
test('endpoint rejects wrong methods, origins, oversized bodies, and invalid JSON', async () => {
  for (const [patch, code] of [
    [{ method: 'GET' }, 405],
    [{ headers: { 'content-type': 'text/plain' } }, 415],
    [
      {
        headers: {
          'content-type': 'application/json',
          host: 'preview.example',
          origin: 'https://unrelated.example',
        },
      },
      403,
    ],
    [{ body: 'not json' }, 400],
    [{ body: 'x'.repeat(16001) }, 413],
  ]) {
    const res = response();
    await handler({ ...req(valid), ...patch }, res);
    assert.equal(res.code, code);
  }
});
test('growth plan route recomputes scores and does not trust a client routing flag', () => {
  const answers = {
    ...Object.fromEntries(
      dimensions.flatMap((d) => d.questions.map(([key]) => [key, '2'])),
    ),
    stage: 'established',
    channels: '1',
    revenue: '20000',
    budget: '2500',
    revenueRange: '25-50k',
    budgetRange: '5-10k',
    teamSize: '2-5',
    currentAcquisition: 'mixed',
    currentSystems: 'partial',
    timeline: 'now',
    challenge: 'conversion',
    businessGoal: 'Improve qualified inquiries and booking.',
  };
  const lead = validateLead({
    ...valid,
    kind: 'growth-plan',
    answers,
    route: 'fake-admin',
    reviewReady: true,
  });
  assert.equal(lead.route, 'growth-readiness-review');
  assert.equal(lead.summary.score, 100);
  assert.equal(lead.consent.smsMarketing, false);
});
test('Demand Intelligence hero form needs only name, phone and email', () => {
  const quick = {
    kind: 'demo',
    form: 'di-hero',
    source: '/demand-intelligence',
    industry: 'other',
    consent: true,
    name: 'Pat Lee',
    email: 'pat@example.com',
    phone: '(915) 555-0100',
  };
  const lead = validateLead(quick);
  assert.equal(lead.route, 'demand-intelligence-demo');
  assert.equal(lead.source, '/demand-intelligence');
  assert.throws(() => validateLead({ ...quick, phone: '' }));
  assert.throws(() => validateLead({ ...quick, form: undefined }));
});
