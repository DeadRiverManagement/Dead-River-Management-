import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');
const copy = read('src/data/advice-wave-b.ts');
const hub = read('src/pages/advice/index.astro');
const lead = read('src/pages/advice/lead-response-time.astro');
const agency = read('src/pages/advice/after-a-bad-agency.astro');
const cta = read('src/components/growth/AdviceCta.astro');
const resources = read('src/pages/resources.astro');
const adviceSources = [hub, lead, agency, cta, copy];

test('locked advice SEO fields stay in the copy module', () => {
  for (const value of [
    'Advice for Growing Local Businesses | Dead River Management',
    'Practical guides on lead response, hiring help, and booked jobs—not vanity traffic. Free strategy call when you’re ready.',
    'Advice you can use this week',
    'Speed-to-Lead Is the Real Cost | Dead River Management',
    'If you wait hours to call back, you paid for someone else’s job. See what speed-to-lead does to booked appointments—and what to fix first.',
    'How fast you answer is the real cost of a lead',
    'Speed-to-lead beats another ad dollar when the phone already rings.',
    'What to Ask After a Bad Agency | Dead River Management',
    'Got reports, not jobs? Use this question list before you hire again—so the next partner sells booked work, not vanity metrics.',
    'What to ask after a marketing agency burned you',
    'A short list that separates operators from pitch decks.',
    'Book Your Free Strategy Call',
    "CTA_HREF = '/book'",
    "PUBLISHED = '2026-09-27'",
    "path: '/advice'",
    "path: '/advice/lead-response-time'",
    "path: '/advice/after-a-bad-agency'",
    "'@type': 'CollectionPage'",
    "'@type': 'ItemList'",
    "'@type': 'BreadcrumbList'",
    "['BlogPosting', 'Article']",
  ]) {
    assert.ok(copy.includes(value), 'missing locked copy: ' + value);
  }
});

test('advice pages do not use talk, growth-plan, pricing, or industry book CTAs', () => {
  for (const source of adviceSources) {
    assert.doesNotMatch(source, /\/talk/);
    assert.doesNotMatch(source, /\/growth-plan/);
    assert.doesNotMatch(source, /\/pricing/);
    assert.doesNotMatch(source, /\/book\//);
    assert.doesNotMatch(source, /see pricing/i);
    assert.doesNotMatch(source, /Foundation|Growth Partner|Scale/);
    assert.doesNotMatch(source, /\$\d/);
  }
  assert.match(cta, /CTA_HREF/);
  assert.match(cta, /CTA_LABEL/);
  assert.match(hub, /href="\/resources"/);
  assert.match(hub, /href="\/solutions"/);
  assert.match(lead, /href="\/tools\/lead-response"/);
  assert.equal((lead.match(/\/tools\/lead-response/g) || []).length, 1);
  assert.match(lead, /href="\/advice\/after-a-bad-agency"/);
  assert.match(agency, /href="\/advice\/lead-response-time"/);
  assert.match(agency, /href="\/work\/gonzalez-and-sons-roofing"/);
  assert.equal(
    (agency.match(/\/work\/gonzalez-and-sons-roofing/g) || []).length,
    1,
  );
});

test('resources links to the advice hub once and marketing-advice stays put', () => {
  assert.equal((resources.match(/href="\/advice"/g) || []).length, 1);
  assert.match(resources, />New advice</);
  assert.match(resources, /href="\/marketing-advice"/);
  const library = read('src/pages/marketing-advice/index.astro');
  const article = read('src/pages/marketing-advice/[slug].astro');
  assert.doesNotMatch(library, /\/advice/);
  assert.doesNotMatch(article, /\/advice/);
});

test('sitemap keep lists include the three advice URLs and the old articles', () => {
  for (const file of [
    'scripts/check-growth.mjs',
    'src/data/nationwide-faq.ts',
  ]) {
    const text = read(file);
    for (const path of [
      '/advice',
      '/advice/lead-response-time',
      '/advice/after-a-bad-agency',
      '/marketing-advice',
      '/marketing-advice/30-leads-in-60-days-guarantee',
      '/marketing-advice/ai-receptionist-cost',
      '/marketing-advice/ai-search-for-local-business',
      '/marketing-advice/el-paso-home-services-marketing-agency',
      '/marketing-advice/facebook-ads-for-plumbers',
    ]) {
      assert.ok(text.includes("'" + path + "'"), file + ' missing ' + path);
    }
  }
});

test('built advice pages match locked SEO, schema, and primary CTAs', () => {
  const pages = {
    'dist/advice.html': {
      title: 'Advice for Growing Local Businesses | Dead River Management',
      description:
        'Practical guides on lead response, hiring help, and booked jobs—not vanity traffic. Free strategy call when you’re ready.',
      canonical: 'https://www.deadrivermanagement.com/advice',
      h1: 'Advice you can use this week',
      buttons: 1,
      schema: ['CollectionPage', 'ItemList', 'BreadcrumbList'],
      dated: false,
    },
    'dist/advice/lead-response-time.html': {
      title: 'Speed-to-Lead Is the Real Cost | Dead River Management',
      description:
        'If you wait hours to call back, you paid for someone else’s job. See what speed-to-lead does to booked appointments—and what to fix first.',
      canonical:
        'https://www.deadrivermanagement.com/advice/lead-response-time',
      h1: 'How fast you answer is the real cost of a lead',
      buttons: 2,
      schema: ['BlogPosting', 'FAQPage', 'BreadcrumbList'],
      dated: true,
    },
    'dist/advice/after-a-bad-agency.html': {
      title: 'What to Ask After a Bad Agency | Dead River Management',
      description:
        'Got reports, not jobs? Use this question list before you hire again—so the next partner sells booked work, not vanity metrics.',
      canonical:
        'https://www.deadrivermanagement.com/advice/after-a-bad-agency',
      h1: 'What to ask after a marketing agency burned you',
      buttons: 2,
      schema: ['BlogPosting', 'FAQPage', 'BreadcrumbList'],
      dated: true,
    },
  };
  if (!existsSync('dist/advice.html')) return;
  for (const [file, expected] of Object.entries(pages)) {
    const html = read(file);
    assert.ok(
      html.includes('<title>' + expected.title + '</title>'),
      file + ' title',
    );
    assert.equal(
      (html.match(/<title>/g) || []).length,
      1,
      file + ' title count',
    );
    assert.ok(
      html.includes(
        '<meta name="description" content="' + expected.description + '"',
      ),
      file + ' description',
    );
    assert.ok(
      html.includes('<link rel="canonical" href="' + expected.canonical + '"'),
      file + ' canonical',
    );
    assert.match(html, /name="robots" content="index, follow"/);
    assert.ok(html.includes('<h1>' + expected.h1 + '</h1>'), file + ' h1');
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, file + ' h1 count');
    const buttons = [
      ...html.matchAll(/<a class="button" href="([^"]+)">([\s\S]*?)<\/a>/g),
    ];
    assert.equal(
      buttons.length,
      expected.buttons,
      file + ' primary button count',
    );
    for (const [, href, label] of buttons) {
      assert.equal(href, '/book');
      assert.match(label, /Book Your Free Strategy Call/);
    }
    assert.doesNotMatch(html, /href="\/talk"/);
    assert.doesNotMatch(html, /href="\/growth-plan"/);
    assert.doesNotMatch(html, /href="\/pricing"/);
    assert.doesNotMatch(html, /href="\/book\//);
    for (const type of expected.schema) {
      assert.ok(html.includes(type), file + ' missing schema ' + type);
    }
    if (expected.dated) {
      assert.match(html, /"datePublished":"2026-09-27"/);
      assert.match(html, /"@type":"FAQPage"/);
    }
  }
  const sitemap = read('dist/sitemap-0.xml');
  for (const path of [
    '/advice',
    '/advice/lead-response-time',
    '/advice/after-a-bad-agency',
    '/marketing-advice',
    '/marketing-advice/facebook-ads-for-plumbers',
  ]) {
    assert.match(
      sitemap,
      new RegExp('https://www.deadrivermanagement.com' + path + '</loc>'),
    );
  }
});
