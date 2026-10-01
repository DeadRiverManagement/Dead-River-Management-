import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const vercel = JSON.parse(readFileSync(resolve('vercel.json'), 'utf8'));

const permanent301 = Object.fromEntries(
  (vercel.redirects ?? [])
    .filter((rule) => rule.statusCode === 301 && !rule.missing && !rule.has)
    .map((rule) => [rule.source, rule.destination]),
);

const withHtml = (path) => [path, `${path}.html`];

const pricingAliases = [
  '/dead-river-complete',
  '/plans',
  '/front-desk-ai',
  '/front-desk-complete',
  '/essentials',
  '/local-visibility',
  '/search-growth',
  '/paid-growth',
  '/website',
  '/watch',
  '/front-desk-essentials',
  '/missed-call-rescue',
  '/lead-rescue',
  '/website-rescue',
  '/local-growth',
  '/growth-engine',
  '/source-plan',
  '/current-plan',
  '/flood-plan',
  '/whole-river',
  '/whole-river-plan',
  '/the-whole-river',
];

const baseLanders = {
  '/el-paso-home-services-marketing': '/',
  '/ai-receptionist-el-paso': '/',
  '/google-ads-management-el-paso': '/services/google-ads',
  '/social-media-management-el-paso': '/services/facebook-ads',
  '/web-design-el-paso': '/',
  '/ai-search-optimization-el-paso': '/marketing-advice/ai-search-for-local-business',
  '/google-business-profile-el-paso': '/locations/el-paso',
  '/local-seo-el-paso': '/locations/el-paso',
};

const keepTradeLanders = ['/home-inspector-marketing-el-paso'];

// The trade landing pages were retired, so these land on the homepage too.
const tradeLpLanders = {
  '/hvac-marketing-el-paso': '/',
  '/plumber-marketing-el-paso': '/',
  '/electrician-marketing-el-paso': '/',
  '/roofing-marketing-el-paso': '/',
  '/landscaper-marketing-el-paso': '/',
  '/flooring-marketing-el-paso': '/',
  '/garage-door-marketing-el-paso': '/',
  '/pest-control-marketing-el-paso': '/',
};

test('legacy SKU and river aliases are a direct 301 to the homepage', () => {
  for (const path of pricingAliases) {
    for (const source of withHtml(path)) {
      assert.equal(permanent301[source], '/', `${source} must 301 to /`);
    }
  }
});

test('former Base landers 301 away with no hub hop', () => {
  for (const [path, dest] of Object.entries(baseLanders)) {
    for (const source of withHtml(path)) {
      assert.equal(permanent301[source], dest, `${source} must 301 ${dest}`);
      assert.notEqual(
        permanent301[source],
        '/el-paso-home-services-marketing',
        `${source} must not hop through the retired hub`,
      );
    }
  }
});

test('home-services landers without a trade LP 301 to the homepage now that industry pages are retired', () => {
  for (const path of keepTradeLanders) {
    assert.equal(permanent301[path], '/', `${path} must 301 to /`);
  }
});

test('trade-named El Paso landers 301 to the homepage', () => {
  for (const [path, dest] of Object.entries(tradeLpLanders)) {
    assert.equal(permanent301[path], dest, `${path} must 301 to ${dest}`);
  }
});

test('Base lander page sources are gone so they cannot 200', () => {
  for (const path of Object.keys(baseLanders)) {
    const slug = path.slice(1);
    assert.equal(existsSync(resolve(`src/pages/${slug}.astro`)), false, `${slug}.astro must be deleted`);
    assert.equal(existsSync(resolve(`src/pagehtml/${slug}.html`)), false, `${slug}.html must be deleted`);
    assert.equal(
      existsSync(resolve(`src/pagehtml/${slug}.script.js`)),
      false,
      `${slug}.script.js must be deleted`,
    );
  }
});

test('no leftover 307/soft redirect for retired SKU or Base lander URLs', () => {
  const soft = (vercel.redirects ?? []).filter(
    (rule) =>
      !rule.missing &&
      !rule.has &&
      rule.permanent === false &&
      (pricingAliases.includes(rule.source.replace(/\.html$/, '')) ||
        Object.hasOwn(baseLanders, rule.source.replace(/\.html$/, ''))),
  );
  assert.deepEqual(soft, [], 'retired URLs must not stay on 307');
});
