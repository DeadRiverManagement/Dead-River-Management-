import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

const pageTitle = (title) =>
  title.endsWith(' | Dead River Management') ||
  title.endsWith(' | Dead River Demand Intelligence') ||
  title.endsWith(' | Demand Intelligence')
    ? title
    : title + ' | Dead River Management';

const locked = {
  book: {
    title: 'Book Your Free Strategy Call',
    description:
      'Book a free strategy call with Dead River Management. See if your business qualifies for the Demand Flow guarantee: $50,000 in new revenue in 45 to 60 days.',
    descriptionChars: 156,
    headline: '$50,000 in new revenue in 45-60 days. Or your money back, plus $500 for wasting your time.',
  },
  services: [
    {
      slug: 'seo',
      title: 'SEO Services That Bring Customers',
      description:
        'SEO that reports leads, not vanity rankings. Technical fixes, service pages, and AI search readiness for small businesses. Nationwide and El Paso.',
      titleChars: 57,
      descriptionChars: 146,
      headline: 'SEO Services That Get You Found. And Called.',
    },
    {
      slug: 'local-seo',
      title: 'Local SEO & Google Business Profile',
      description:
        'Local SEO and Google Business Profile optimization that brings map calls. Reviews, listings, and local pages. Nationwide and in El Paso.',
      titleChars: 59,
      descriptionChars: 136,
      headline: 'Local SEO Services That Put You in the Map Results.',
    },
    {
      slug: 'google-ads',
      title: 'Google Ads and PPC Management',
      description:
        'Google Ads management for service businesses. Landing pages and call tracking tied to booked jobs, not clicks. Nationwide and in El Paso.',
      titleChars: 53,
      descriptionChars: 137,
      headline: 'Google Ads Management That Turns Searches Into Booked Jobs.',
    },
    {
      slug: 'facebook-ads',
      title: 'Facebook Ads for Service Businesses',
      description:
        'Facebook and Instagram ads that book customers. Lead forms and fast follow-up for local service businesses. Nationwide and in El Paso.',
      titleChars: 59,
      descriptionChars: 134,
      headline: 'Facebook Ads Management That Books Customers. Not Just Likes.',
    },
    {
      slug: 'cold-email',
      title: 'Cold Email for B2B Lead Generation',
      description:
        'Cold email for B2B lead generation. Targeted lists, inbox setup, short emails people answer, and follow-up until they book or say no. Nationwide.',
      titleChars: 58,
      descriptionChars: 145,
      headline: 'Cold Email That Books Sales Calls.',
    },
    {
      slug: 'google-local-services-ads',
      title: 'Google Local Services Ads (LSA)',
      description:
        'Google Local Services Ads management. Google Guaranteed or Screened badge, pay per lead, fast answer times. Nationwide and in El Paso.',
      titleChars: 55,
      descriptionChars: 134,
      headline: 'Google Local Services Ads That Put You at the Very Top.',
    },
  ],
  demandIntelligence: {
    title: 'Buyer Intent & Audience Data | Demand Intelligence',
    description:
      'Find people researching what you sell. Build audiences, identify website visitors, enrich contacts and activate your data with Demand Intelligence.',
    titleChars: 50,
    descriptionChars: 147,
  },
};

test('/book meta carries the Demand Flow guarantee', () => {
  const book = read('src/data/book-pages.ts');
  const home = book.split('export const industryBooks')[0];
  assert.match(home, /title: 'Book Your Free Strategy Call'/);
  assert.match(home, new RegExp(locked.book.headline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(locked.book.description.length, locked.book.descriptionChars);
  assert.match(home, new RegExp(locked.book.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(home, /20 qualified estimate requests or 15 booked estimates in 90 days\. Miss it/);
  assert.doesNotMatch(locked.book.description, /20 qualified estimate|50% of service fees|work free/);
  assert.equal(
    pageTitle(locked.book.title),
    'Book Your Free Strategy Call | Dead River Management',
  );
  assert.equal(pageTitle(locked.book.title).length, 52);
});

test('six service titles and metas match the locked SERP strings', () => {
  const services = read('src/data/service-pages.ts');
  const layout = read('src/layouts/Growth.astro');
  assert.match(layout, /title\.endsWith\(' \| Demand Intelligence'\)/);
  assert.match(layout, /content=\{pageTitle\}/);
  assert.match(layout, /property="og:description" content=\{description\}/);
  assert.match(layout, /name="twitter:description" content=\{description\}/);
  for (const page of locked.services) {
    const rendered = pageTitle(page.title);
    assert.equal(rendered.length, page.titleChars, page.slug + ' title');
    assert.equal(page.description.length, page.descriptionChars, page.slug + ' meta');
    assert.ok(rendered.length <= 60, page.slug);
    assert.ok(page.description.length <= 160, page.slug);
    assert.match(services, new RegExp(`title: '${page.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`));
    assert.match(services, new RegExp(page.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(services, new RegExp(`headline: '${page.headline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`));
  }
});

test('/demand-intelligence metadata describes the product without price or guarantee', () => {
  const page = read('src/pages/demand-intelligence.astro');
  const di = locked.demandIntelligence;
  assert.equal(di.title.length, di.titleChars);
  assert.equal(di.description.length, di.descriptionChars);
  assert.match(page, new RegExp(`title="${di.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.match(page, new RegExp(`description="${di.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.doesNotMatch(di.description, /\$3,000\/month|3000/);
  assert.match(di.description, /Build audiences/);
  assert.doesNotMatch(di.description, /guarantee|refund|2x|pay nothing/i);
  assert.match(page, /<h1>/);
  assert.doesNotMatch(page, /priceSpecification|priceCurrency|\$3,000|partial refund|2x your email response/i);
  assert.equal(pageTitle(di.title), di.title);
});

test('home meta carries the Demand Flow guarantee', () => {
  const home = read('src/pages/index.astro');
  const homeMeta =
    'Purchase intent data finds people ready to buy now. We create, capture, and convert that demand. $50,000 in 45 to 60 days or money back + $500.';
  assert.equal(homeMeta.length, 143);
  assert.match(home, new RegExp(`description="${homeMeta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
});
