import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler, { validateLead } from '../api/growth-lead.js';
import { buildDemandFlowPayload, canOpenDemandFlowCalendar } from '../src/lib/demandflow-handoff.js';
import { ghlMock } from './helpers/ghl.mjs';

const contact = {
  name: 'Test Owner', company: 'Example Roofing',
  email: 'qa@example.test', phone: '+15555550101', consent: 'on',
};
const payload = () => buildDemandFlowPayload(contact, '?utm_source=meta&utm_campaign=demandflow');

test('four contact details are valid without invented qualification answers', () => {
  const lead = validateLead(payload());
  assert.equal(lead.message, '');
  assert.equal(lead.company, contact.company);
  assert.equal(lead.phone, contact.phone);
  assert.equal(lead.route, 'demandflow-home-services');
  assert.equal(lead.requestedAppointment, true);
  assert.deepEqual(lead.attribution, { utm_source: 'meta', utm_campaign: 'demandflow' });
  for (const key of ['name', 'company', 'email', 'phone']) {
    assert.throws(() => validateLead({ ...payload(), [key]: '' }), key);
    assert.throws(() => validateLead({ ...payload(), [key]: undefined }), key);
  }
  assert.throws(() => validateLead({ ...payload(), consent: false }));
  assert.throws(() => validateLead({ ...payload(), phone: 'invalid' }));
});

test('goals stay required for other inquiry forms and unrelated campaign identities', () => {
  for (const patch of [
    { kind: 'strategy', source: '/growth-plan' },
    { kind: 'demo', source: '/demo' },
    { kind: 'strategy', source: '/el-paso-roofers' },
    { source: '/growth-plan' },
    { industry: 'dental' },
  ]) assert.throws(() => validateLead({ ...payload(), ...patch }));
});

test('short intake saves the contact and campaign tag before allowing booking', async () => {
  const beforeEnv = { ...process.env }, beforeFetch = globalThis.fetch;
  const mock = ghlMock();
  const res = {
    code: 200, setHeader() {},
    status(code) { this.code = code; return this; },
    json(data) { this.data = data; return this; },
  };
  try {
    process.env.VERCEL_ENV = 'production';
    process.env.GHL_PIT = 'test-only';
    process.env.GHL_LOCATION_ID = 'loc-test';
    delete process.env.ENABLE_GROWTH_INTAKE;
    globalThis.fetch = mock.fetch;
    await handler({ method: 'POST', headers: {
      'content-type': 'application/json', host: 'test.example', origin: 'https://test.example',
    }, body: payload() }, res);
    assert.equal(res.code, 200);
    assert.equal(res.data.preview, false);
    assert.equal(canOpenDemandFlowCalendar(res.data), true);
    const saved = mock.calls.find((call) => call.path === '/contacts/upsert').body;
    assert.equal(saved.email, contact.email);
    assert.equal(saved.companyName, contact.company);
    assert.equal(saved.phone, contact.phone);
    assert.equal(saved.tags, undefined);
    assert.deepEqual(mock.contact.tags, ['demandflow-home-services']);
    assert.doesNotMatch(mock.notes[0], /Goals:/);
  } finally {
    process.env = beforeEnv;
    globalThis.fetch = beforeFetch;
  }
});
