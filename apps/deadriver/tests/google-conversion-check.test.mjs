import test from 'node:test';
import assert from 'node:assert/strict';
import { createGoogleConversionCheck } from '../api/google-conversion-check.js';

const secret = 'test_secret_for_validation_only_123456789';
function harness(overrides = {}) {
  const calls = [];
  const handler = createGoogleConversionCheck({ env: { VERCEL_ENV: 'production', DRM_GHL_LIFECYCLE_WEBHOOK_SECRET: secret },
    getAccessToken: async () => { calls.push('auth'); return 'test_token'; },
    fetchImpl: async (url, options) => { calls.push({ url, body: JSON.parse(options.body) }); return { ok: true, status: 200, json: async () => ({}) }; }, ...overrides });
  return { calls, invoke: async (body = { validateOnly: true }, authorization = `Bearer ${secret}`, method = 'POST') => {
    const res = { setHeader() {}, status(value) { this.code = value; return this; }, json(value) { this.body = value; return this; } };
    await handler({ method, headers: { authorization }, body }, res); return res;
  } };
}
test('Google diagnostic authenticates before network access and rejects live/custom events', async () => {
  const h = harness();
  assert.equal((await h.invoke({}, 'wrong')).code, 401);
  assert.equal((await h.invoke({ validateOnly: false })).code, 400);
  assert.equal((await h.invoke({ validateOnly: true, events: [{}] })).code, 400);
  assert.equal((await h.invoke(null, undefined, 'GET')).code, 405);
  assert.deepEqual(h.calls, []);
});
test('Google diagnostic hardcodes validation without payment value or contact data', async () => {
  const h = harness(); const res = await h.invoke();
  assert.equal(res.code, 200); assert.equal(res.body.conversions, 0);
  const payload = h.calls[1].body;
  assert.equal(payload.validateOnly, true);
  assert.equal(payload.destinations[0].productDestinationId, '7795206688');
  assert.equal(payload.events[0].conversionValue, undefined);
  assert.equal(payload.events[0].userData, undefined);
});
test('Google errors do not expose credentials or provider error messages', async () => {
  const h = harness({ fetchImpl: async () => ({ ok: false, status: 403, json: async () => ({ error: { status: 'PERMISSION_DENIED', message: 'secret echoed data' } }) }) });
  const res = await h.invoke(); assert.equal(res.code, 502);
  assert.equal(res.body.providerError, 'PERMISSION_DENIED');
  assert.ok(!JSON.stringify(res.body).includes('secret'));
  assert.equal((await harness({ getAccessToken: async () => { throw Error('secret'); } }).invoke()).body.error, 'google_auth_failed');
});
