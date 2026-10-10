import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://www.deadrivermanagement.com';
const ORG = `${SITE}/#organization`;

const noEmail = {
  q: 'Do these tools require an email?',
  a: 'No. Every Dead River Management tool on this site is free to use with no email required.',
};
const moreResults = {
  q: 'Where can I see more client results?',
  a: 'See all case studies at https://www.deadrivermanagement.com/work',
};

const toolFaqs = {
  'ad-budget': [
    ['What does the Ad Budget Planner do?', 'It connects customer targets, close rate, and media spend so you can plan an ad budget that matches the revenue you want.'],
    ['Who is this planner for?', 'Growing businesses nationwide that need a clear media spend target before they buy ads.'],
    [noEmail.q, noEmail.a],
  ],
  'campaign-roi': [
    ['What does the Campaign ROI Calculator show?', 'It shows the contribution left after a campaign pays for itself so you can judge whether the campaign is worth running.'],
    ['Who is this calculator for?', 'Growing businesses nationwide that need a simple ROI check before or after a paid campaign.'],
    [noEmail.q, noEmail.a],
  ],
  'campaign-url': [
    ['What does the Campaign URL Builder create?', 'It creates consistent tracking links so every campaign stays measurable across ads and landing pages.'],
    ['Who is this builder for?', 'Teams that need clean campaign URLs without guessing UTM parameters by hand.'],
    [noEmail.q, noEmail.a],
  ],
  'customer-acquisition-cost': [
    ['What does the CAC calculator measure?', 'It helps you understand the true cost of winning each new customer from your marketing spend.'],
    ['Who is this calculator for?', 'Growing businesses nationwide that need a clear customer acquisition cost number.'],
    [noEmail.q, noEmail.a],
  ],
  'growth-readiness': [
    ['What does the Growth Readiness Check evaluate?', 'It checks whether your systems can handle more demand before you scale spend.'],
    ['Who is this check for?', 'Businesses that want to know if operations can keep up before they buy more traffic.'],
    [noEmail.q, noEmail.a],
  ],
  'lead-response': [
    ['What does the Lead Response Scorecard find?', 'It finds gaps between a new lead and a useful reply so you can tighten follow-up speed.'],
    ['Who is this scorecard for?', 'Growing businesses nationwide that lose leads to slow or unclear responses.'],
    [noEmail.q, noEmail.a],
  ],
  'revenue-goal': [
    ['What does the Revenue Goal Planner do?', 'It works backward from a revenue target to the leads you need so the goal is tied to a real pipeline number.'],
    ['Who is this planner for?', 'Businesses nationwide that want a lead target that matches a revenue goal.'],
    [noEmail.q, noEmail.a],
  ],
  'search-preview': [
    ['What does the Search Snippet Preview show?', 'It lets you write a clearer page title and meta description and see how it may appear in Google.'],
    ['Who is this preview for?', 'Anyone updating page titles or metas who wants a quick search-result check before publishing.'],
    [noEmail.q, noEmail.a],
  ],
  'seo-foundations': [
    ['What does the SEO Foundations Checklist cover?', 'It reviews the essentials that help your site get found so you can spot missing basics.'],
    ['Who is this checklist for?', 'Growing businesses nationwide that need a practical SEO foundations pass.'],
    [noEmail.q, noEmail.a],
  ],
  'website-conversion': [
    ['What does the Website Conversion Review assess?', 'It assesses the path from first visit to next step so you can find friction on the site.'],
    ['Who is this review for?', 'Growing businesses nationwide that need a clearer path from visit to lead or sale.'],
    [noEmail.q, noEmail.a],
  ],
};

const workFaqs = [
  ['What kind of results are on this page?', 'Real client outcomes Dead River Management helped deliver, including Total Auto Repair going from $20K to $100K months, The Pipe Whisperers from $60K to $250K a year, and Wicked Logistics reaching 5-6 leads a day.'],
  ['Are these guaranteed outcomes for every business?', "No. These are case studies for specific clients. Demand Flow for accepted businesses targets $50,000 in new revenue in 45-60 days, or service fees refunded plus $500; ad spend isn't refunded."],
  ['Can I see the full story for each client?', 'Yes. Each card links to a dedicated case study page with the before-and-after numbers for that business.'],
];

const caseFaqs = {
  'total-auto-repair': [
    ['What result did Total Auto Repair see?', 'Total Auto Repair went from $20,000 a month to $100,000 a month in 18 months with Dead River Management.'],
    ['What kind of business is this case study about?', 'An auto repair shop that needed more consistent demand and higher monthly revenue.'],
    [moreResults.q, moreResults.a],
  ],
  'the-pipe-whisperers': [
    ['What result did The Pipe Whisperers see?', 'The Pipe Whisperers went from $60,000 a year to $250,000 a year in 24 months with Dead River Management.'],
    ['What kind of business is this case study about?', 'A plumbing business that needed stronger demand and higher annual revenue.'],
    [moreResults.q, moreResults.a],
  ],
  'gonzalez-and-sons-roofing': [
    ['What result did Gonzalez & Sons Roofing see?', 'Gonzalez & Sons Roofing went from 2 roofs a month to 8 roofs a month, and from about $50,000 a month to $200,000 a month in revenue with Dead River Management.'],
    ['What kind of business is this case study about?', 'A roofing company that needed more installed jobs per month and higher monthly revenue.'],
    [moreResults.q, moreResults.a],
  ],
  'wicked-logistics': [
    ['What result did Wicked Logistics see?', 'Wicked Logistics went from 1-2 leads a week to 5-6 leads a day in 3 months with Dead River Management. One lead became a $1.2M/year shipping contract.'],
    ['What kind of business is this case study about?', 'A logistics company that needed a much higher daily lead volume.'],
    [moreResults.q, moreResults.a],
  ],
  'parcel-management-group': [
    ['What result did Parcel Management Group see?', 'Parcel Management Group generated 49 Facebook leads in 30 days at $17.70 each with Dead River Management.'],
    ['What kind of business is this case study about?', 'A freight and parcel management business that needed affordable paid social leads.'],
    [moreResults.q, moreResults.a],
  ],
  'only-fish': [
    ['What did Dead River Management deliver for Only Fish?', 'A complete identity and launch for a new business, covering brand and go-to-market in one push.'],
    ['Is Only Fish a Demand Flow revenue case study?', 'No. This case study is about identity and launch, not the $50,000 in 45-60 days Demand Flow guarantee.'],
    [moreResults.q, moreResults.a],
  ],
};

const workOrder = [
  ['Total Auto Repair', '/work/total-auto-repair'],
  ['The Pipe Whisperers', '/work/the-pipe-whisperers'],
  ['Gonzalez & Sons Roofing', '/work/gonzalez-and-sons-roofing'],
  ['Wicked Logistics', '/work/wicked-logistics'],
  ['Parcel Management Group', '/work/parcel-management-group'],
  ['Only Fish', '/work/only-fish'],
];

function text(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function walk(value, out = []) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, out);
    return out;
  }
  if (value && typeof value === 'object') {
    out.push(value);
    for (const child of Object.values(value)) walk(child, out);
  }
  return out;
}

function jsonLd(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(
    (match) => walk(JSON.parse(match[1])),
  );
}

function visibleFaq(html) {
  const section = html.match(/<section\b[^>]*id=["']faq["'][^>]*>([\s\S]*?)<\/section>/i)?.[1] ?? '';
  return [...section.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)].map((match) => {
    const q = match[1].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    const a = match[1].replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, '');
    return { q: text(q?.[1] ?? ''), a: text(a) };
  });
}

function faqNodes(html) {
  return jsonLd(html).filter((node) => node['@type'] === 'FAQPage');
}

function assertSingleFaqHeading(html, label) {
  const section = html.match(/<section\b[^>]*id=["']faq["'][^>]*>([\s\S]*?)<\/section>/i)?.[1] ?? '';
  const headings = [...section.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => text(match[1]));
  assert.deepEqual(headings, ['FAQ'], label + ': one FAQ heading');
  assert.equal(/<p\b[^>]*class=["'][^"']*eyebrow[^"']*["'][^>]*>\s*FAQ\s*<\/p>/i.test(section), false, label + ': no extra FAQ label');
}

function assertFaqs(html, pairs, label) {
  const pages = faqNodes(html);
  assert.equal(pages.length, 1, label + ': one FAQPage');
  const questions = pages[0].mainEntity;
  assert.equal(questions.length, pairs.length, label + ': FAQ count');
  const shown = visibleFaq(html);
  assert.equal(shown.length, pairs.length, label + ': visible FAQ count');
  assertSingleFaqHeading(html, label);
  pairs.forEach(([q, a], index) => {
    assert.equal(questions[index]['@type'], 'Question', label);
    assert.equal(questions[index].name, q, label + ': schema question');
    assert.equal(questions[index].acceptedAnswer?.text, a, label + ': schema answer');
    assert.equal(shown[index].q, q, label + ': visible question');
    assert.equal(shown[index].a, a, label + ': visible answer');
  });
}

function crumbs(html) {
  const lists = jsonLd(html).filter((node) => node['@type'] === 'BreadcrumbList');
  assert.equal(lists.length, 1, 'one BreadcrumbList');
  return lists[0].itemListElement;
}

test('locked FAQ source has no en or em dashes', () => {
  // The /kk preview carries another site's copy verbatim, dashes included.
  const diff = execSync("git diff -U0 e5c661f0ac37198bad2f84bf5133d608ab2a9392 -- . ':!src/pages/kk'", {
    encoding: 'utf8',
    cwd: new URL('..', import.meta.url).pathname,
  });
  const added = diff.split('\n').filter((line) => line.startsWith('+') && !line.startsWith('+++'));
  const dashes = added.filter((line) => line.includes('\u2013') || line.includes('\u2014'));
  assert.deepEqual(dashes, []);
});

test('built tools, work hub, and case studies expose locked schema and FAQ', () => {
  if (!existsSync('dist/tools/ad-budget.html') || !existsSync('dist/sitemap-0.xml')) return;

  for (const [slug, pairs] of Object.entries(toolFaqs)) {
    const file = `dist/tools/${slug}.html`;
    const html = readFileSync(file, 'utf8');
    const label = '/tools/' + slug;
    const nodes = jsonLd(html);
    const app = nodes.find((node) => node['@type'] === 'WebApplication');
    assert.ok(app, label + ': WebApplication');
    assert.equal(nodes.filter((node) => node['@type'] === 'SoftwareApplication').length, 0);
    const h1 = text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '');
    const meta = text(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
    assert.equal(app.name, h1, label + ': name is the H1');
    assert.equal(app.url, `${SITE}/tools/${slug}`, label + ': url');
    assert.equal(app.description, meta, label + ': description is the meta');
    assert.equal(app.applicationCategory, 'BusinessApplication');
    assert.equal(app.operatingSystem, 'Any');
    assert.equal(app.isAccessibleForFree, true);
    assert.equal(app.offers?.['@type'], 'Offer');
    assert.equal(app.offers?.price, '0');
    assert.equal(app.offers?.priceCurrency, 'USD');
    assert.equal(app.provider?.['@id'], ORG);
    const trail = crumbs(html);
    assert.deepEqual(
      trail.map((item) => [item.position, item.name, item.item]),
      [
        [1, 'Home', `${SITE}/`],
        [2, 'Tools', `${SITE}/tools`],
        [3, h1, `${SITE}/tools/${slug}`],
      ],
    );
    assertFaqs(html, pairs, label);
  }

  const workHtml = readFileSync('dist/work.html', 'utf8');
  const workTrail = crumbs(workHtml);
  assert.deepEqual(
    workTrail.map((item) => [item.position, item.name, item.item]),
    [
      [1, 'Home', `${SITE}/`],
      [2, 'Work', `${SITE}/work`],
    ],
  );
  const list = jsonLd(workHtml).find((node) => node['@type'] === 'ItemList');
  assert.ok(list, '/work: ItemList');
  assert.deepEqual(
    list.itemListElement.map((item) => [item.position, item.name, item.url]),
    workOrder.map(([name, path], index) => [index + 1, name, SITE + path]),
  );
  assert.equal(jsonLd(workHtml).filter((node) => node['@type'] === 'Article').length, 0);
  assertFaqs(workHtml, workFaqs, '/work');

  for (const [slug, pairs] of Object.entries(caseFaqs)) {
    const html = readFileSync(`dist/work/${slug}.html`, 'utf8');
    const label = '/work/' + slug;
    const article = jsonLd(html).find((node) => node['@type'] === 'Article');
    assert.ok(article, label + ': Article');
    const h1 = text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '');
    const meta = text(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
    assert.equal(article.headline, h1, label + ': headline is the H1');
    assert.equal(article.url, `${SITE}/work/${slug}`);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(article.mainEntityOfPage, `${SITE}/work/${slug}`, label + ': mainEntityOfPage');
    assert.equal(article.mainEntityOfPage, canonical, label + ': mainEntityOfPage is the canonical');
    assert.equal(Object.hasOwn(article, 'datePublished'), false, label + ': no invented datePublished');
    assert.equal(Object.hasOwn(article, 'dateModified'), false, label + ': no invented dateModified');
    assert.equal(article.description, meta, label + ': description is the meta');
    assert.equal(article.author?.['@id'], ORG);
    assert.equal(article.publisher?.['@id'], ORG);
    const trail = crumbs(html);
    assert.equal(trail[0].name, 'Home');
    assert.equal(trail[0].item, `${SITE}/`);
    assert.equal(trail[1].name, 'Work');
    assert.equal(trail[1].item, `${SITE}/work`);
    assert.equal(trail[2].item, `${SITE}/work/${slug}`);
    assert.equal(trail.length, 3);
    assertFaqs(html, pairs, label);
  }

  const locs = readdirSync('dist')
    .filter((name) => /^sitemap-\d+\.xml$/.test(name))
    .flatMap((name) => [...readFileSync(join('dist', name), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))
    .filter((loc) => !/sitemap-\d+\.xml$/.test(loc));
  assert.equal(locs.length, 85, 'sitemap URL count');
  assert.equal(new Set(locs).size, 85, 'sitemap URLs are unique');
});
