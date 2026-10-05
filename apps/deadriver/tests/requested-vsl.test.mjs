import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequestedVslHandler } from '../api/requested-vsl.js';
import { REQUESTED_VSL_CAMPAIGN } from '../api/_lib/requested-vsl-config.js';
import { REAL_ESTATE_LOCATION, REAL_ESTATE_VSL_CAMPAIGN, REAL_ESTATE_COLD_EMAIL_CAMPAIGN } from '../api/_lib/real-estate-config.js';

const secret = 'test-secret-not-live-'.repeat(3);
function fixture(options = {}) {
  const env = { VERCEL_ENV: 'production', ENABLE_INSTANTLY_GHL_SYNC: 'true',
    DRM_GHL_LIFECYCLE_WEBHOOK_SECRET: secret, GHL_OUTREACH_PIT: 'fixture-ghl-key',
    GHL_LOCATION_ID: options.realEstate ? REAL_ESTATE_LOCATION : 'fixture-location', INSTANTLY_WORKSPACE_ID: 'fixture-workspace', INSTANTLY_API_KEY: 'fixture-instantly-key' };
  const contact = { id: 'fixture-contact', locationId: env.GHL_LOCATION_ID, email: 'qa@example.test',
    firstName: 'QA', lastName: 'Owner', tags: ['send demand flow vsl'], ...options.contact };
  const calls = [];
  let leads = options.leads || [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init });
    let data;
    if (url.includes('/contacts/')) data = { contact };
    else if (url.includes('/block-lists-entries')) data = { items: options.blocked ? [{ bl_value: contact.email }] : [] };
    else if (url.endsWith('/leads/list')) data = { items: leads };
    else if (url.includes('/campaigns/')) data = { organization: options.wrongWorkspace ? 'other' : env.INSTANTLY_WORKSPACE_ID };
    else if (url.endsWith('/leads') && init.method === 'POST') {
      leads = [{ id: 'fixture-lead', campaign: JSON.parse(init.body).campaign, organization: env.INSTANTLY_WORKSPACE_ID, email: contact.email }];
      data = leads[0];
    } else throw new Error('Unexpected request');
    return { ok: !options.providerFailure, status: options.providerFailure ? 503 : 200, json: async () => data };
  };
  const handler = createRequestedVslHandler({ env, fetchImpl });
  const run = async (body = { customData: { contact_id: contact.id } }, auth = `Bearer ${secret}`) => {
    const res = { code: null, result: null, setHeader() {}, status(n) { this.code = n; return this; }, json(v) { this.result = v; return this; } };
    await handler({ method: 'POST', headers: { authorization: auth }, body }, res);
    return res;
  };
  return { run, calls, contact };
}
test('unauthenticated and malformed requests make no provider requests', async () => {
  const f = fixture();
  assert.equal((await f.run({}, 'Bearer wrong')).code, 401);
  assert.equal((await f.run({ contact_id: '{{contact.id}}' })).code, 400);
  assert.equal(f.calls.length, 0);
});
test('native customData mapping uses authoritative GHL identity and creates only target campaign lead', async () => {
  const f = fixture();
  assert.equal((await f.run({ email: 'attacker@example.test', customData: { contact_id: f.contact.id } })).result.enrolled, true);
  const writes = f.calls.filter(c => c.url.endsWith('/leads'));
  assert.equal(writes.length, 1);
  assert.deepEqual(JSON.parse(writes[0].init.body), { campaign: REQUESTED_VSL_CAMPAIGN, email: f.contact.email, first_name: 'QA', last_name: 'Owner', skip_if_in_campaign: true });
  assert.equal((await f.run()).result.duplicate, true);
  assert.equal(f.calls.filter(c => c.url.endsWith('/leads')).length, 1);
});
for (const contact of [{ tags: [] }, { locationId: 'other' }, { email: '' }, { dnd: true },
  { dndSettings: { Email: { status: 'active' } } }, { tags: ['send demand flow vsl', 'demandflow-booked'] }]) {
  test(`missing request or stopped/wrong-location contact cannot enroll: ${JSON.stringify(contact)}`, async () => {
    const f = fixture({ contact }); await f.run();
    assert.equal(f.calls.some(c => c.url.endsWith('/leads')), false);
  });
}
test('blocklist and existing booked leads remain protected', async () => {
  for (const options of [{ blocked: true }, { leads: [{ email: 'qa@example.test', id: 'prior', campaign: 'other', lt_interest_status: 2 }] }]) {
    const f = fixture(options); assert.ok((await f.run()).result.skipped);
    assert.equal(f.calls.some(c => c.url.endsWith('/leads')), false);
  }
});
test('validation mode checks readiness without any create request', async () => {
  const f = fixture(); const res = await f.run({ contact_id: f.contact.id, validate: true });
  assert.equal(res.result.dryRun, true); assert.equal(f.calls.some(c => c.url.endsWith('/leads')), false);
});
test('provider failure is retryable and response does not leak contact or secrets', async () => {
  const f = fixture({ providerFailure: true }); const res = await f.run();
  assert.equal(res.code, 502); assert.deepEqual(res.result, { ok: false, error: 'handoff_failed_retry' });
});
test('real estate requires its own tag and enrolls only its isolated campaign', async () => {
  const f = fixture({ realEstate: true, contact: { tags: ['realestate-interested'] } });
  const body = { customData: { contact_id: f.contact.id, offer: 'real_estate' } };
  assert.equal((await f.run(body)).result.enrolled, true);
  assert.equal(JSON.parse(f.calls.find(c => c.url.endsWith('/leads')).init.body).campaign, REAL_ESTATE_VSL_CAMPAIGN);
  assert.equal((await f.run(body)).result.duplicate, true);
});
test('real estate rejects Demand Flow tags, booking suppression and unknown offers', async () => {
  for (const tags of [['send demand flow vsl'], ['realestate-interested', 'realestate-booked']]) {
    const f = fixture({ realEstate: true, contact: { tags } });
    await f.run({ contact_id: f.contact.id, offer: 'real_estate' });
    assert.equal(f.calls.some(c => c.url.endsWith('/leads')), false);
  }
  const f = fixture();
  assert.equal((await f.run({ contact_id: f.contact.id, offer: 'other' })).code, 400);
  assert.equal(f.calls.length, 0);
});
test('interested real estate cold email is handled by reply agent without duplicate VSL enrollment', async () => {
  const f = fixture({ realEstate: true, contact: { tags: ['realestate-interested'] },
    leads: [{ id: 'cold-email-lead', email: 'qa@example.test', campaign: REAL_ESTATE_COLD_EMAIL_CAMPAIGN, lt_interest_status: 1 }] });
  assert.equal((await f.run({ contact_id: f.contact.id, offer: 'real_estate' })).result.skipped, 'real_estate_reply_agent_handles_vsl');
  assert.equal(f.calls.some(c => c.url.endsWith('/leads')), false);
});
