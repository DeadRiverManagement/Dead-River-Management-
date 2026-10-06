import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');
const filter = config.slice(config.indexOf('filter: (page)'));

test('sitemap filter drops retired 30-leads and keeps VSL landers out', () => {
  for (const path of [
    '/marketing-advice/30-leads-in-60-days-guarantee',
    '/50k-demand-flow',
    '/real-estate-buyer-appointments',
  ]) {
    assert.match(filter, new RegExp("'" + path.replaceAll('/', '\\/') + "'"));
  }
  assert.match(filter, /!hiddenFromSitemap\.has\(path\)/);
  assert.match(filter, /pathname\.replace\(\/\\\/\$\/, ''\)/);
});

test('sitemap filter still omits existing non-discovery paths', () => {
  assert.match(filter, /!path\.startsWith\('\/welcome\/'\)/);
  assert.match(filter, /path !== '\/onboarding'/);
  assert.match(filter, /!path\.startsWith\('\/onboarding\/'\)/);
  assert.match(filter, /path !== '\/watch'/);
  assert.match(filter, /path !== '\/free-playbook'/);
  assert.match(filter, /path !== '\/flagship-offer'/);
  assert.match(filter, /path !== '\/book\/thanks'/);
  assert.doesNotMatch(filter, /path !== '\/book'/);
  assert.doesNotMatch(filter, /'\/demand-flow'/);
  assert.doesNotMatch(filter, /'\/hvac'|'\/plumbing'|'\/roofing'|'\/electrical'/);
});
