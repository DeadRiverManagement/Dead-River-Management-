import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/lead.js';

test('Complete form applies only its Google Ads tag; other forms keep their routing', async (t) => {
  const saved = { ...process.env };
  const originalFetch = globalThis.fetch;
  process.env.GHL_PIT = 'test-only';
  process.env.GHL_LOCATION_ID = 'test-only';
  delete process.env.GHL_LEAD_TAG;
  t.after(() => { globalThis.fetch = originalFetch; process.env = saved; });
  const cases = [
    ['dead-river-complete-walkthrough', ['google-ads-website-form']],
    ['whole-river-walkthrough', ['website-lead', 'whole-river-walkthrough']],
    ['scale-playbook', ['scale-playbook']],
    ['customer', ['website-lead']],
    ['constructor', ['website-lead']],
    ['__proto__', ['website-lead']],
  ];
  for (const [form, expectedTags] of cases) {
    let sent;
    globalThis.fetch = async (_url, options) => {
      sent = JSON.parse(options.body);
      return { ok: true, json: async () => ({ contact: { id: 'test-contact' }, new: true }) };
    };
    const res = { headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(code) { this.code=code; return this; }, json(body) { this.body=body; return this; } };
    await handler({ method: 'POST', body: { name: 'Test Person', email: 'test@example.com', phone: '+12025550123', form, tags: ['customer'], tag: 'customer' } }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(sent.tags, expectedTags);
    assert.match(res.headers['Set-Cookie'], /drm_watch=1.*HttpOnly/);
  }
});

test('a configured generic lead tag is not added to Complete submissions', async (t) => {
  const saved = { ...process.env };
  const originalFetch = globalThis.fetch;
  process.env.GHL_PIT = 'test-only';
  process.env.GHL_LOCATION_ID = 'test-only';
  process.env.GHL_LEAD_TAG = 'custom-generic-lead';
  t.after(() => { globalThis.fetch = originalFetch; process.env = saved; });
  for (const [form, expectedTags] of [
    ['dead-river-complete-walkthrough', ['google-ads-website-form']],
    ['scale-playbook', ['scale-playbook']],
    ['whole-river-walkthrough', ['custom-generic-lead', 'whole-river-walkthrough']],
    ['customer', ['custom-generic-lead']],
  ]) {
    let sent;
    globalThis.fetch = async (_url, options) => {
      sent = JSON.parse(options.body);
      return { ok: true, json: async () => ({ contact: { id: 'test-contact' }, new: false }) };
    };
    const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await handler({ method: 'POST', body: { name: 'Test Person', email: 'test@example.com', phone: '+12025550123', form } }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(sent.tags, expectedTags);
  }
});

test('preview deploys do not call GHL', async (t) => {
  const saved = { ...process.env };
  const originalFetch = globalThis.fetch;
  process.env.VERCEL_ENV = 'preview';
  process.env.GHL_PIT = 'test-only';
  process.env.GHL_LOCATION_ID = 'test-only';
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error('Must not send');
  };
  t.after(() => { globalThis.fetch = originalFetch; process.env = saved; });
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await handler({
    method: 'POST',
    body: {
      name: 'Test Person',
      email: 'test@example.com',
      phone: '+12025550123',
      form: 'scale-playbook',
      source: 'scale-playbook',
    },
  }, res);
  assert.equal(res.code, 409);
  assert.equal(calls, 0);
});
