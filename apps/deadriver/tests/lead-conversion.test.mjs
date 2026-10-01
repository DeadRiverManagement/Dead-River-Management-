import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const page = readFileSync(new URL('../src/pages/watch.astro', import.meta.url), 'utf8');
const script = page.match(/<script is:inline define:vars=\{\{ adsId:[\s\S]*?\}\}>([\s\S]*?)<\/script>/)[1];
function run(search, entries = {}, label = 'google-label', windowOptions = {}) {
  const stored = new Map(Object.entries(entries));
  const meta = [], google = [];
  let ready, stripped = false;
  const context = {
    URLSearchParams, adsId: 'AW-test', label, pixelId: '4422109568077296',
    location: { search, pathname: '/watch', hash: '' },
    document: { addEventListener: (event, callback) => { assert.equal(event, 'DOMContentLoaded'); ready = callback; } },
    localStorage: { getItem: k => stored.get(k) ?? null, setItem: (k,v) => stored.set(k,v), removeItem: k => stored.delete(k) },
    history: { replaceState: () => { stripped = true; } }, window: windowOptions,
  };
  vm.runInNewContext(script, context);
  // The layout installs the queues after page markup, before DOMContentLoaded.
  context.window.fbq = (...args) => meta.push(args);
  context.window.gtag = (...args) => google.push(args);
  ready();
  return { meta, google: google.filter(call => call[1] === 'conversion'), analytics: google.filter(call => call[1] === 'drm_legacy_inquiry_saved'), stored, stripped };
}
test('successful new lead sends Meta Lead to the campaign pixel once and retains Google conversion', () => {
  const result = run('?lead=success-1', { drm_lead_pending: 'success-1' });
  assert.equal(result.meta.length, 1);
  assert.equal(result.meta[0][0], 'trackSingle');
  assert.equal(result.meta[0][1], '4422109568077296');
  assert.equal(result.meta[0][2], 'Lead');
  assert.equal(result.meta[0][4].eventID, 'success-1');
  assert.equal(result.google.length, 1);
  assert.equal(result.google[0][2].transaction_id, 'success-1');
  assert.equal(result.analytics.length, 1);
  assert.equal(result.stored.has('drm_lead_pending'), false);
  assert.equal(result.stripped, true);
  assert.equal(run('?lead=success-1', Object.fromEntries(result.stored)).meta.length, 0);
});
test('direct visits, copied markers and already counted submissions do not count', () => {
  assert.equal(run('').meta.length, 0);
  assert.equal(run('?lead=copied').meta.length, 0);
  assert.equal(run('?lead=old', { drm_lead_pending: 'old', drm_lead_counted: '["old"]' }).meta.length, 0);
});
test('Meta lead does not depend on a Google conversion label', () => {
  const result = run('?lead=success-2', { drm_lead_pending: 'success-2' }, '');
  assert.equal(result.meta.length, 1);
  assert.equal(result.google.length, 0);
});

test('legacy GA4 event requires a valid pending inquiry and honors consent', () => {
  for (const search of ['', '?lead=copied']) assert.equal(run(search).analytics.length, 0);
  const denied = run('?lead=private', {drm_lead_pending:'private'}, 'label', {
    dataLayer:[['consent','update',{analytics_storage:'denied',ad_storage:'denied'}]],
  });
  assert.equal(denied.analytics.length,0);
  assert.equal(denied.google.length,0);
  assert.equal(denied.meta.length,0);
  const gpc = run('?lead=private', {drm_lead_pending:'private'}, 'label', {navigator:{globalPrivacyControl:true}});
  assert.equal(gpc.analytics.length + gpc.google.length + gpc.meta.length,0);
});
