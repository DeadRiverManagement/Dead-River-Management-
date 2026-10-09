import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import middleware from '../middleware.js';

const vercel = JSON.parse(readFileSync(resolve('vercel.json'), 'utf8'));

const unconditional = (vercel.redirects ?? []).filter((rule) => !rule.missing && !rule.has);

const bySource = new Map(unconditional.map((rule) => [rule.source, rule]));

function assert301(source, destination) {
  const rule = bySource.get(source);
  assert.ok(rule, `${source} redirect missing`);
  assert.equal(rule.destination, destination, `${source} destination`);
  assert.equal(rule.statusCode, 301, `${source} must be HTTP 301`);
  assert.equal(rule.permanent, undefined, `${source} must not use permanent (Vercel maps that to 308/307)`);
}

const harden = {
  '/about': '/company',
  '/services': '/demand-flow',
  '/industries-we-serve': '/',
  '/contact': '/book',
  '/case-studies/parcel-management-group': '/work/parcel-management-group',
  '/case-studies/wicked-logistics': '/work/wicked-logistics',
  '/case-studies/only-fish': '/work/only-fish',
};

const confirmHomeServices = [
  '/el-paso-home-services-marketing',
  '/ai-receptionist-el-paso',
  '/web-design-el-paso',
  '/home-inspector-marketing-el-paso',
  '/sewer-line-marketing-el-paso',
  '/handyman-marketing-el-paso',
  '/junk-removal-marketing-el-paso',
  '/siding-marketing-el-paso',
  '/carpet-cleaning-marketing-el-paso',
  '/countertop-marketing-el-paso',
  '/foundation-repair-marketing-el-paso',
  '/tree-service-marketing-el-paso',
  '/locksmith-marketing-el-paso',
  '/water-damage-restoration-marketing-el-paso',
  '/house-cleaning-marketing-el-paso',
  '/appliance-repair-marketing-el-paso',
];

const confirmIndustries = [
  '/auto-body-shop-marketing-el-paso',
  '/animal-rescue-marketing-el-paso',
  '/barber-shop-marketing-el-paso',
  '/language-school-marketing-el-paso',
  '/yoga-studio-marketing-el-paso',
  '/allergist-marketing-el-paso',
  '/massage-school-marketing-el-paso',
  '/pet-adoption-marketing-el-paso',
  '/primary-care-marketing-el-paso',
  '/ip-lawyer-marketing-el-paso',
  '/labor-lawyer-marketing-el-paso',
  '/physical-therapist-marketing-el-paso',
  '/preschool-marketing-el-paso',
  '/disability-lawyer-marketing-el-paso',
  '/personal-injury-lawyer-marketing-el-paso',
  '/pet-training-marketing-el-paso',
  '/traffic-lawyer-marketing-el-paso',
  '/acupuncturist-marketing-el-paso',
  '/auto-repair-shop-marketing-el-paso',
  '/beauty-school-marketing-el-paso',
  '/car-wash-detailing-marketing-el-paso',
  '/dance-studio-marketing-el-paso',
  '/pet-boarding-marketing-el-paso',
  '/pet-grooming-marketing-el-paso',
  '/tutoring-marketing-el-paso',
  '/veterinarian-marketing-el-paso',
  '/immigration-lawyer-marketing-el-paso',
];

const skuHome = [
  '/front-desk-ai',
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
];

const ambiguityHome = [
  '/pricing',
  '/plans',
  '/dead-river-complete',
  '/front-desk-complete',
  '/whole-river',
  '/whole-river-plan',
  '/the-whole-river',
];

test('STEP 1 soft aliases are HTTP 301 to the same destination', () => {
  for (const [source, destination] of Object.entries(harden)) {
    assert301(source, destination);
    assert301(`${source}.html`, destination);
  }
});

test('STEP 1 trade El Paso landers 301 home now that the trade LPs are retired', () => {
  for (const source of [
    '/hvac-marketing-el-paso',
    '/plumber-marketing-el-paso',
    '/electrician-marketing-el-paso',
    '/roofing-marketing-el-paso',
    '/landscaper-marketing-el-paso',
    '/flooring-marketing-el-paso',
    '/garage-door-marketing-el-paso',
    '/pest-control-marketing-el-paso',
  ]) {
    assert301(source, '/');
  }
  for (const lp of ['/hvac', '/plumbing', '/roofing', '/electrical', '/landscaping', '/remodeling', '/pest-control', '/garage-doors', '/flooring', '/pool-service']) {
    assert301(lp, '/');
  }
  for (const book of ['/book/dental', '/book/med-spas', '/book/real-estate', '/book/ecommerce']) {
    assert301(book, '/book');
  }
  assert301('/guarantee-terms', '/legal/guarantee');
  assert301('/growth-plan', '/');
  assert301('/el-paso-roofers', '/');
  assert301('/demandflow', '/demand-flow');
  assert.equal(bySource.has('/demand-flow'), false, '/demand-flow must be a page, not a redirect');
  assert.equal(bySource.has('/demand-flow.html'), false, '/demand-flow.html must not redirect away from the page');
  assert301('/demandflow/watch', '/');
  assert301('/demandflow/book', '/book/thanks');
});

test('STEP 1 collapse and 404 fixes are one-hop 301s', () => {
  assert301('/watch.html', '/');
  assert301('/watch', '/');
  assert301('/voiceiq-demo.html', '/demand-intelligence');
  assert301('/voiceiq-demo', '/demand-intelligence');
  assert301('/talk.html', '/book');
  assert301('/talk', '/book');
  assert301(
    '/marketing-advice/marketing-agency-cost-el-paso',
    '/marketing-advice/el-paso-home-services-marketing-agency',
  );
});

test('CONFIRM landers stay permanent 301 to the ship-map finals', () => {
  for (const source of confirmHomeServices) assert301(source, '/');
  assert301('/local-seo-el-paso', '/services/local-seo');
  assert301('/google-business-profile-el-paso', '/services/local-seo');
  assert301('/google-ads-management-el-paso', '/services/google-ads');
  assert301('/social-media-management-el-paso', '/services/facebook-ads');
  assert301('/seo-el-paso', '/services/seo');
  assert301('/ai-search-optimization-el-paso', '/marketing-advice/ai-search-for-local-business');
  assert301('/dentist-marketing-el-paso', '/');
  assert301('/orthodontist-marketing-el-paso', '/');
  for (const source of confirmIndustries) assert301(source, '/');
  for (const source of skuHome) assert301(source, '/');
});

test('non-Complete SKUs do not hop through /pricing', () => {
  for (const source of skuHome) {
    assert.notEqual(bySource.get(source)?.destination, '/pricing');
    assert.notEqual(bySource.get(`${source}.html`)?.destination, '/pricing');
  }
  assert.equal(
    unconditional.some((rule) => rule.destination === '/pricing'),
    false,
    'no redirect may use /pricing as a destination',
  );
});

test('ambiguity paths are unchanged pending Rowan', () => {
  for (const source of ambiguityHome) {
    assert301(source, '/');
    assert301(`${source}.html`, '/');
  }
  assert.equal(bySource.has('/chatgpt-ads'), false);
  assert.equal(bySource.has('/chatgpt-ads.html'), false);
});

test('cleanUrls .html strip is beaten by bulk 301s for the two failing aliases', () => {
  assert.equal(vercel.cleanUrls, true);
  assert.equal(vercel.bulkRedirectsPath, 'redirects/html-one-hop.json');
  const bulk = JSON.parse(readFileSync(resolve(vercel.bulkRedirectsPath), 'utf8'));
  assert.deepEqual(bulk, [
    {
      source: '/watch.html',
      destination: '/',
      statusCode: 301,
      preserveQueryParams: true,
      caseSensitive: true,
    },
    {
      source: '/voiceiq-demo.html',
      destination: '/demand-intelligence',
      statusCode: 301,
      preserveQueryParams: true,
      caseSensitive: true,
    },
    {
      source: '/talk.html',
      destination: '/book',
      statusCode: 301,
      preserveQueryParams: true,
      caseSensitive: true,
    },
  ]);
  for (const rule of bulk) {
    assert.equal(rule.permanent, undefined, `${rule.source} must not use permanent`);
    assert.equal(bySource.get(rule.source).destination, rule.destination);
  }
});

test('middleware collapses watch.html and voiceiq-demo.html in one 301', async () => {
  const cases = [
    ['/watch', '/'],
    ['/watch.html', '/'],
    ['/voiceiq-demo', '/demand-intelligence'],
    ['/voiceiq-demo.html', '/demand-intelligence'],
    ['/talk', '/book'],
    ['/talk.html', '/book'],
  ];
  for (const [path, dest] of cases) {
    const response = await middleware(
      new Request(`https://www.deadrivermanagement.com${path}?utm_source=step1`),
    );
    assert.equal(response.status, 301, path);
    assert.equal(
      response.headers.get('location'),
      `https://www.deadrivermanagement.com${dest === '/' ? '/' : dest}?utm_source=step1`,
    );
  }
  assert.equal(
    await middleware(new Request('https://www.deadrivermanagement.com/pricing')),
    undefined,
  );
  assert.equal(
    await middleware(new Request('https://www.deadrivermanagement.com/chatgpt-ads')),
    undefined,
  );
});
