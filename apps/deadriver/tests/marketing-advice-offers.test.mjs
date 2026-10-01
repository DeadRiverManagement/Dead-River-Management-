import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import middleware from '../middleware.js';

const read = (name) => readFileSync(resolve('src/content/blog', name), 'utf8');

const published = [
  '30-leads-in-60-days-guarantee.md',
  'el-paso-home-services-marketing-agency.md',
  'ai-receptionist-cost.md',
  'ai-search-for-local-business.md',
  'facebook-ads-for-plumbers.md',
];

const LIVE_OFFER = [
  /Dead River Complete/,
  /30 leads in 60 days or we work for free/,
  /Essentials \$97/,
  /Front Desk Complete/,
  /Front Desk AI/,
  /Local Visibility/,
  /Search Growth/,
  /Paid Growth/,
];

const DEK =
  'Dead River’s live public guarantee is Demand Flow: $50,000 in new revenue in 45–60 days, or service fees refunded + $500 (ad spend not refunded). Older 30-in-60 lead promises are not current public offers.';

test('published marketing advice does not sell retired offers', () => {
  for (const name of published) {
    const text = read(name);
    assert.equal(text.includes('draft: true'), false, name);
    for (const pattern of LIVE_OFFER) {
      assert.doesNotMatch(text, pattern, `${name} still matches ${pattern}`);
    }
  }
});

test('30-leads article matches Demand Flow SoR', () => {
  const text = read('30-leads-in-60-days-guarantee.md');
  assert.match(text, new RegExp('description: "' + DEK.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"'));
  assert.match(text, /Demand Flow/);
  assert.match(text, /\$50,000 in new revenue in 45–60 days/);
  assert.match(text, /service fees refunded \+ \$500/);
  assert.match(text, /ad spend/);
  assert.match(text, /no longer a public offer|not.*current public offer/i);
  assert.doesNotMatch(text, /Foundation, Growth Partner, and Scale/);
  assert.doesNotMatch(text, /\/talk/);
  assert.match(text, /\/book/);
  assert.doesNotMatch(text, /\/pricing/);
  assert.doesNotMatch(text, /work for free/);
});

test('El Paso comparison uses Demand Flow without publishing dollars', () => {
  const text = read('el-paso-home-services-marketing-agency.md');
  assert.match(text, /Demand Flow/);
  assert.doesNotMatch(text, /\/talk/);
  assert.match(text, /\/book/);
  assert.doesNotMatch(text, /\/pricing/);
  assert.match(text, /nationwide/i);
  assert.match(text, /El Paso, TX/);
  assert.match(text, /\(915\) 228-3054/);
  assert.doesNotMatch(text, /streetAddress|Montwood|\d{5}/);
  assert.match(text, /Complete is retired/);
  assert.match(text, /Do you still sell Complete\?/);
});

test('advice articles do not publish Foundation, Growth Partner, or Scale dollar plans', () => {
  const ladder =
    /Foundation[^$\n]{0,80}\$997|Growth Partner[^$\n]{0,80}\$2,497|Scale[^$\n]{0,120}\$4,497|setup from \$1,497|setup from \$1,997|setup from \$2,997|\$997\/mo|\$2,497\/mo|\$4,497\/mo/;
  for (const name of published) {
    const text = read(name);
    assert.doesNotMatch(text, ladder, name);
    assert.doesNotMatch(text, /\]\(\/pricing\)/, name);
  }
});

test('marketing advice index excerpt is the post description', () => {
  const index = readFileSync(resolve('src/pages/marketing-advice/index.astro'), 'utf8');
  assert.match(index, /\{p\.data\.description\}/);
});

test('/watch and /watch.html 301 once to the homepage', async () => {
  for (const path of ['/watch', '/watch.html']) {
    const response = await middleware(
      new Request('https://www.deadrivermanagement.com' + path + '?utm_source=advice'),
    );
    assert.equal(response.status, 301);
    assert.equal(
      response.headers.get('location'),
      'https://www.deadrivermanagement.com/?utm_source=advice',
    );
  }
  assert.equal(
    await middleware(new Request('https://www.deadrivermanagement.com/demandflow/watch')),
    undefined,
  );
  assert.equal(
    await middleware(new Request('https://www.deadrivermanagement.com/pricing')),
    undefined,
  );
});
