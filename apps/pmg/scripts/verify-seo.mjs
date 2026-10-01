/**
 * Post-build checks for the www canonical, sitemap locs, and real 404 document.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const APEX = 'https://parcelmanagementgroup.com';
const WWW = 'https://www.parcelmanagementgroup.com';
const errors = [];

function fail(msg) {
  errors.push(msg);
}

function read(rel) {
  const path = resolve(dist, rel);
  if (!existsSync(path)) {
    fail(`missing ${rel}`);
    return '';
  }
  return readFileSync(path, 'utf8');
}

function assertNoBareApex(label, text) {
  const stripped = text.replaceAll(WWW, '');
  if (stripped.includes(APEX)) {
    fail(`${label} still uses apex host ${APEX}`);
  }
}

const LEADCONNECTOR_WIDGET =
  '<script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id="6ab2d8cd8615594d9a5e208c" data-source="WEB_USER"></script>';

function assertLeadConnectorWidget(label, html) {
  const count = html.split(LEADCONNECTOR_WIDGET).length - 1;
  if (count !== 1) {
    fail(`${label} should include the LeadConnector chat widget exactly once (found ${count})`);
  }
}

const DEAD_RIVER_PIXEL_URL = 'https://app.deadrivermanagement.com/script';
const DEAD_RIVER_PIXEL_CALL =
  '})(window, "https://app.deadrivermanagement.com/script", "pmg", document, "script");';

function assertDeadRiverPixel(label, html) {
  const urlCount = html.split(DEAD_RIVER_PIXEL_URL).length - 1;
  if (urlCount !== 1) {
    fail(`${label} should include the Dead River pixel exactly once (found ${urlCount})`);
  }
  if (!html.includes('"?request_id="') && !html.includes('request_id=pmg')) {
    fail(`${label} is missing the Dead River request_id=pmg path`);
  }
  if (!html.includes('pixelClientId')) {
    fail(`${label} is missing the Dead River pixelClientId path`);
  }
  if (!html.includes(DEAD_RIVER_PIXEL_CALL)) {
    fail(`${label} is missing the Dead River pixel client id "pmg"`);
  }
}

const LEAD_FORM_MARKERS = [
  '<form',
  'class="form"',
  'id="name"',
  'id="email"',
  'id="phone"',
  'id="msg"',
  'pmgSubmit',
  'name="email"',
  'use the form',
  'contact form',
];

function assertNoLeadForm(label, html) {
  for (const marker of LEAD_FORM_MARKERS) {
    if (html.includes(marker)) fail(`${label} still includes a lead form marker: ${marker}`);
  }
}

function assertLegalFooter(label, html) {
  if (!html.includes('href="/privacy/"')) fail(`${label} is missing the privacy footer link`);
  if (!html.includes('href="/terms/"')) fail(`${label} is missing the terms footer link`);
}

const PROHIBITED_LEAD_LANGUAGE = /affiliate|buy leads|buying leads|lead gen for sale/i;

function walkHtml(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) walkHtml(path, acc);
    else if (entry.name.endsWith('.html')) acc.push(path);
  }
  return acc;
}

const homepage = read('index.html');
if (homepage) {
  if (!homepage.includes(`rel="canonical" href="${WWW}/"`)) {
    fail('homepage canonical is not the www origin');
  }
  if (!homepage.includes(`property="og:url" content="${WWW}/"`)) {
    fail('homepage og:url is not the www origin');
  }
  assertNoBareApex('homepage HTML', homepage);
  assertLeadConnectorWidget('homepage HTML', homepage);
  assertNoLeadForm('homepage HTML', homepage);
  assertLegalFooter('homepage HTML', homepage);
}

const notFound = read('404.html');
if (notFound) {
  if (!/noindex/i.test(notFound)) fail('404.html is missing noindex');
  if (!notFound.includes('Page Not Found')) fail('404.html is missing its own title');
  if (notFound.includes('Shipping Cost Reduction for National Shippers')) {
    fail('404.html rendered the homepage title');
  }
  if (notFound.includes('Shipping cost') && notFound.includes('reduction')) {
    fail('404.html looks like homepage hero copy');
  }
  if (!notFound.includes('That page is gone or never existed')) {
    fail('404.html is missing the pack not-found copy');
  }
  if (!notFound.includes('/#contact')) fail('404.html is missing the contact link');
  if (!notFound.includes('(805) 984-4114')) fail('404.html is missing the phone number');
  assertLeadConnectorWidget('404.html', notFound);
  assertNoLeadForm('404.html', notFound);
  assertLegalFooter('404.html', notFound);
}

const sitemap = read('sitemap.xml');
if (sitemap) {
  if (!sitemap.includes('<urlset')) fail('sitemap.xml is not a urlset');
  if (!sitemap.includes(`${WWW}/`)) fail('sitemap.xml is missing the homepage loc');
  if (!sitemap.includes(`${WWW}/about/`)) fail('sitemap.xml is missing the about loc');
  if (!sitemap.includes(`${WWW}/how-freight-quoting-works/`)) {
    fail('sitemap.xml is missing the how-freight-quoting-works loc');
  }
  if (!sitemap.includes(`${WWW}/blog/`)) fail('sitemap.xml is missing the blog index loc');
  if (!sitemap.includes(`${WWW}/privacy/`)) fail('sitemap.xml is missing the privacy loc');
  if (!sitemap.includes(`${WWW}/terms/`)) fail('sitemap.xml is missing the terms loc');
  if (!sitemap.includes(`${WWW}/blog/what-is-a-parcel-audit/`)) {
    fail('sitemap.xml is missing a real blog loc');
  }
  if (!sitemap.includes(`${WWW}/services/`)) fail('sitemap.xml is missing the services loc');
  if (!sitemap.includes(`${WWW}/freight-broker-vs-carrier/`)) {
    fail('sitemap.xml is missing the freight-broker-vs-carrier loc');
  }
  if (!sitemap.includes(`${WWW}/what-is-a-freight-broker/`)) {
    fail('sitemap.xml is missing the what-is-a-freight-broker loc');
  }
  if (!sitemap.includes(`${WWW}/what-is-ltl-shipping/`)) {
    fail('sitemap.xml is missing the what-is-ltl-shipping loc');
  }
  if (!sitemap.includes(`${WWW}/ltl-vs-ftl/`)) {
    fail('sitemap.xml is missing the ltl-vs-ftl loc');
  }
  if (!sitemap.includes(`${WWW}/ltl-freight-quote/`)) {
    fail('sitemap.xml is missing the ltl-freight-quote loc');
  }
  const sitemapCount = (sitemap.match(/<loc>/g) || []).length;
  if (sitemapCount !== 21) fail(`sitemap.xml should list 21 URLs (found ${sitemapCount})`);
  if (sitemap.includes('/404')) fail('sitemap.xml includes the 404 document');
  assertNoBareApex('sitemap.xml', sitemap);
}

const index = read('sitemap-index.xml');
if (index) {
  if (!index.includes('<sitemapindex')) fail('sitemap-index.xml is not a sitemap index');
  if (!index.includes(`${WWW}/sitemap-0.xml`)) {
    fail('sitemap-index.xml loc is not the www sitemap-0.xml');
  }
  assertNoBareApex('sitemap-index.xml', index);
}

const urlset = read('sitemap-0.xml');
if (urlset) {
  if (!urlset.includes('<urlset')) fail('sitemap-0.xml is not a urlset');
  if (!urlset.includes(`${WWW}/`)) fail('sitemap-0.xml is missing the homepage loc');
  if (!urlset.includes(`${WWW}/how-freight-quoting-works/`)) {
    fail('sitemap-0.xml is missing the how-freight-quoting-works loc');
  }
  if (!urlset.includes(`${WWW}/privacy/`)) fail('sitemap-0.xml is missing the privacy loc');
  if (!urlset.includes(`${WWW}/terms/`)) fail('sitemap-0.xml is missing the terms loc');
  if (!urlset.includes(`${WWW}/services/`)) fail('sitemap-0.xml is missing the services loc');
  if (!urlset.includes(`${WWW}/freight-broker-vs-carrier/`)) {
    fail('sitemap-0.xml is missing the freight-broker-vs-carrier loc');
  }
  if (!urlset.includes(`${WWW}/what-is-a-freight-broker/`)) {
    fail('sitemap-0.xml is missing the what-is-a-freight-broker loc');
  }
  if (!urlset.includes(`${WWW}/what-is-ltl-shipping/`)) {
    fail('sitemap-0.xml is missing the what-is-ltl-shipping loc');
  }
  if (!urlset.includes(`${WWW}/ltl-vs-ftl/`)) {
    fail('sitemap-0.xml is missing the ltl-vs-ftl loc');
  }
  if (!urlset.includes(`${WWW}/ltl-freight-quote/`)) {
    fail('sitemap-0.xml is missing the ltl-freight-quote loc');
  }
  const sitemap0Count = (urlset.match(/<loc>/g) || []).length;
  if (sitemap0Count !== 21) fail(`sitemap-0.xml should list 21 URLs (found ${sitemap0Count})`);
  assertNoBareApex('sitemap-0.xml', urlset);
}

const robots = read('robots.txt');
if (robots && !robots.includes(`Sitemap: ${WWW}/sitemap-index.xml`)) {
  fail('robots.txt sitemap directive is not the www sitemap-index.xml');
}

const ABOUT_TITLE = 'About Parcel Management Group | Freight Broker';
const MODULE_A_FAQ = [
  {
    q: 'How does a freight quote work with PMG?',
    a: 'You tell us what you ship, where it goes, and when you need it. We compare carrier options and send a clear quote. For small packages, you can join the free Small Package Program — no fees and no contract. Call (805) 984-4114 or start a chat.',
  },
  {
    q: 'What is the difference between a shipping broker and a carrier?',
    a: 'A carrier owns the trucks or planes. A broker finds the right carrier for your freight and manages the move. Parcel Management Group is a registered freight broker (USDOT 3266041 · MC 1030328). We shop rates, book the load, and stay with you if something goes wrong.',
  },
  {
    q: 'When should I use small package vs LTL?',
    a: 'Use small package for boxes that are usually under 150 lbs. Use LTL when you have pallet freight that is too big for parcel but does not need a full truck. PMG helps you pick the cheaper, safer mode.',
  },
];
const MODULE_B_FAQ = [
  {
    q: 'Is Parcel Management Group in Ventura, California?',
    a: 'Yes. PMG is based in Ventura, CA 93001 and serves shippers across the United States. Phone: (805) 984-4114.',
  },
  {
    q: 'Does the Small Package Program cost my business anything?',
    a: 'No. There are no fees, no contract, and no cost to your business. PMG is paid on the program itself — not by charging you an extra bill.',
  },
];

function assertFaqVisibleAndJsonLd(label, html, pairs) {
  for (const { q, a } of pairs) {
    if (!html.includes(q)) fail(`${label} FAQ is missing question: ${q}`);
    if (!html.includes(a)) fail(`${label} FAQ is missing answer: ${q}`);
    if (!html.includes(JSON.stringify(q))) fail(`${label} FAQPage JSON-LD is missing question: ${q}`);
    if (!html.includes(JSON.stringify(a))) fail(`${label} FAQPage JSON-LD is missing answer: ${q}`);
  }
}

const about = read('about/index.html');
if (about) {
  if (!about.includes('About Parcel Management Group')) fail('about page is missing its H1');
  if (!about.includes(`<title>${ABOUT_TITLE}</title>`)) fail('about <title> changed');
  if (!about.includes(`property="og:title" content="${ABOUT_TITLE}"`)) fail('about og:title changed');
  if (!about.includes(`name="twitter:title" content="${ABOUT_TITLE}"`)) fail('about twitter:title changed');
  if (!about.includes('helps US businesses pay less to ship')) fail('about lead is not RESULTS FIRST');
  if (!about.includes('USDOT 3266041')) fail('about page is missing USDOT');
  if (!about.includes('MC 1030328')) fail('about page is missing MC');
  if (!about.includes('Ventura, CA 93001')) fail('about page is missing city-level NAP');
  if (!about.includes('(805) 984-4114')) fail('about page is missing the phone number');
  if (/Oxnard/i.test(about)) fail('about page mentions Oxnard');
  if (/streetAddress/i.test(about)) fail('about page includes a street address');
  if (!about.includes(`rel="canonical" href="${WWW}/about/"`)) {
    fail('about canonical is not the www /about/ URL');
  }
  if (!about.includes('"#organization"') && !about.includes(`${WWW}/#organization`)) {
    fail('about schema is missing the organization @id');
  }
  for (const href of ['/#services', '/blog/what-is-a-parcel-audit/', '/blog/parcel-audit-vs-freight-audit/']) {
    if (!about.includes(`href="${href}"`)) fail(`about page is missing internal link ${href}`);
  }
  assertFaqVisibleAndJsonLd('about', about, MODULE_B_FAQ);
  assertNoBareApex('about HTML', about);
  assertLeadConnectorWidget('about HTML', about);
  assertNoLeadForm('about HTML', about);
  assertLegalFooter('about HTML', about);
}

const QUOTING_TITLE = 'How Freight Quoting Works | Parcel Management Group';
const QUOTING_META =
  'Tell PMG what you ship, where it goes, and when you need it. We compare carriers and send a clear quote. Ventura, CA. Call (805) 984-4114.';
const QUOTING_FAQ = [
  {
    q: 'How does a freight quote work with PMG?',
    a: 'You tell us what you ship, where it goes, and when you need it. We compare carriers and send a clear quote. For small packages, join the free Small Package Program — no fees and no contract. Call (805) 984-4114.',
  },
  {
    q: 'What is the difference between a shipping broker and a carrier?',
    a: 'A carrier owns the trucks or planes. A broker finds the right carrier for your freight and manages the move. Parcel Management Group is a registered freight broker (USDOT 3266041 · MC 1030328).',
  },
  {
    q: 'When should I use small package vs LTL?',
    a: 'Use small package for boxes usually under 150 lbs. Use LTL when you have pallet freight too big for parcel but not a full truck. PMG helps you pick the cheaper, safer mode.',
  },
  {
    q: 'Is Parcel Management Group in Ventura, California?',
    a: 'Yes. PMG is based in Ventura, CA 93001 and serves shippers nationwide. Phone: (805) 984-4114.',
  },
];

const quoting = read('how-freight-quoting-works/index.html');
if (quoting) {
  if (!quoting.includes(`<title>${QUOTING_TITLE}</title>`)) fail('quoting page <title> is not exact');
  if (!quoting.includes(`name="description" content="${QUOTING_META}"`)) {
    fail('quoting page meta description is not exact');
  }
  if (!quoting.includes('<h1>How freight quoting works at PMG</h1>')) fail('quoting page H1 is not exact');
  if (!quoting.includes(`rel="canonical" href="${WWW}/how-freight-quoting-works/"`)) {
    fail('quoting canonical is not the www /how-freight-quoting-works/ URL');
  }
  if (!quoting.includes(`property="og:url" content="${WWW}/how-freight-quoting-works/"`)) {
    fail('quoting og:url is not the www /how-freight-quoting-works/ URL');
  }
  if (!quoting.includes('"@type":"WebPage"')) fail('quoting page is missing WebPage JSON-LD');
  if (!quoting.includes(`${WWW}/how-freight-quoting-works/`)) {
    fail('quoting page JSON-LD is missing the page URL');
  }
  if (!quoting.includes('<h2>Steps</h2>')) fail('quoting page is missing the steps heading');
  if (!quoting.includes('Share origin, destination, weight or size, and need-by date.')) {
    fail('quoting page is missing step 1');
  }
  if (!quoting.includes('<h2>Broker vs carrier</h2>')) fail('quoting page is missing the broker heading');
  if (!quoting.includes('<h2>Small package vs LTL</h2>')) fail('quoting page is missing the LTL heading');
  if (!quoting.includes('USDOT 3266041')) fail('quoting page is missing USDOT');
  if (!quoting.includes('MC 1030328')) fail('quoting page is missing MC');
  if (!quoting.includes('Ventura, CA 93001')) fail('quoting page is missing city-level NAP');
  if (!quoting.includes('(805) 984-4114')) fail('quoting page is missing the phone number');
  if (/streetAddress/i.test(quoting)) fail('quoting page includes a street address');
  if (/Oxnard/i.test(quoting)) fail('quoting page mentions Oxnard');
  for (const href of [
    '/services/',
    '/about/',
    '/blog/reduce-shipping-costs-high-volume/',
    '/blog/dimensional-weight/',
    '/blog/prepay-and-add-shipping/',
    '/#contact',
  ]) {
    if (!quoting.includes(`href="${href}"`)) fail(`quoting page is missing internal link ${href}`);
  }
  assertFaqVisibleAndJsonLd('quoting page', quoting, QUOTING_FAQ);
  assertNoBareApex('quoting page HTML', quoting);
  assertLeadConnectorWidget('quoting page HTML', quoting);
  assertDeadRiverPixel('quoting page HTML', quoting);
  assertNoLeadForm('quoting page HTML', quoting);
  assertLegalFooter('quoting page HTML', quoting);
} else {
  fail('how-freight-quoting-works/index.html is missing');
}

const blogIndex = read('blog/index.html');
if (blogIndex) {
  assertLeadConnectorWidget('blog index HTML', blogIndex);
  assertNoLeadForm('blog index HTML', blogIndex);
  assertLegalFooter('blog index HTML', blogIndex);
  if (!blogIndex.includes('How do I get a freight or parcel quote after reading a guide?')) {
    fail('blog index FAQ was removed');
  }
  if (!blogIndex.includes('Call (805) 984-4114 or start a chat.')) {
    fail('blog index quote FAQ does not point to chat or phone');
  }
}

const blogPost = read('blog/what-is-a-parcel-audit/index.html');
if (blogPost) {
  assertLeadConnectorWidget('blog post HTML', blogPost);
  assertNoLeadForm('blog post HTML', blogPost);
  assertLegalFooter('blog post HTML', blogPost);
}

function assertLegalPage(rel, title, canonicalPath) {
  const html = read(rel);
  if (!html) return;
  const label = rel;
  if (html.includes('Page Not Found')) fail(`${label} looks like the 404 document`);
  if (/noindex/i.test(html)) fail(`${label} is noindex, so it is not a public 200 page`);
  if (!html.includes(`<title>${title}</title>`)) fail(`${label} is missing its title`);
  if (!html.includes(`rel="canonical" href="${WWW}${canonicalPath}"`)) {
    fail(`${label} canonical is not ${canonicalPath}`);
  }
  if (!html.includes('(805) 984-4114')) fail(`${label} is missing the phone number`);
  if (!html.includes('Ventura, CA 93001')) fail(`${label} is missing city-level NAP`);
  if (!html.includes('USDOT 3266041')) fail(`${label} is missing USDOT`);
  if (!html.includes('MC 1030328')) fail(`${label} is missing MC`);
  if (/streetAddress/i.test(html)) fail(`${label} includes a street address`);
  if (!html.includes('SMS')) fail(`${label} does not mention that there is no SMS opt-in`);
  if (!html.includes('LeadConnector')) fail(`${label} does not describe the chat widget`);
  assertLeadConnectorWidget(label, html);
  assertNoLeadForm(label, html);
  assertLegalFooter(label, html);
  assertNoBareApex(label, html);
}

assertLegalPage('privacy/index.html', 'Privacy Policy | Parcel Management Group', '/privacy/');
assertLegalPage('terms/index.html', 'Terms of Service | Parcel Management Group', '/terms/');

if (existsSync(dist)) {
  for (const path of walkHtml(dist)) {
    const html = readFileSync(path, 'utf8');
    if (PROHIBITED_LEAD_LANGUAGE.test(html)) {
      fail(`${path} contains affiliate or lead-sale language`);
    }
    assertDeadRiverPixel(path.slice(dist.length + 1), html);
  }
}

if (homepage) {
  assertFaqVisibleAndJsonLd('homepage', homepage, MODULE_A_FAQ);
  const quoteAt = homepage.indexOf(MODULE_A_FAQ[0].q);
  const brokerAt = homepage.indexOf(MODULE_A_FAQ[1].q);
  if (quoteAt === -1 || brokerAt === -1 || quoteAt > brokerAt) {
    fail('homepage quoting FAQ is not answer-first');
  }
  if (!homepage.includes('id="how-quoting-works"')) fail('homepage is missing the quoting blurb');
  if (!homepage.includes('Tell Parcel Management Group what you ship, where it goes, and when you need it.')) {
    fail('homepage quoting blurb does not match the pack');
  }
  const blurbAt = homepage.indexOf('id="how-quoting-works"');
  const contactCtaAt = homepage.indexOf('+1 (805) 984-4114');
  if (blurbAt === -1 || contactCtaAt === -1 || blurbAt > contactCtaAt) {
    fail('quoting blurb is not near the contact CTA');
  }
  const contactSection = homepage.slice(homepage.indexOf('id="contact"'));
  if (!contactSection.includes('href="tel:+18059844114"')) fail('contact section is missing the phone CTA');
  if (!contactSection.includes('Ventura, CA 93001')) fail('contact section is missing city-level NAP');
  if (!homepage.includes('or start a chat')) fail('homepage quoting blurb still points at a form');
  if (!homepage.includes('href="/how-freight-quoting-works/"')) {
    fail('footer is missing the How quoting works link');
  }
  if (!homepage.includes('href="/freight-broker-vs-carrier/">Broker vs carrier</a>')) {
    fail('footer is missing the Broker vs carrier link');
  }
  if (!homepage.includes('href="/what-is-a-freight-broker/">What is a freight broker</a>')) {
    fail('footer is missing the What is a freight broker link');
  }
  if (!homepage.includes('href="/what-is-ltl-shipping/">What is LTL shipping</a>')) {
    fail('footer is missing the What is LTL shipping link');
  }
  if (!homepage.includes('href="/ltl-vs-ftl/">LTL vs FTL</a>')) {
    fail('footer is missing the LTL vs FTL link');
  }
  if (!homepage.includes('href="/ltl-freight-quote/">LTL freight quote</a>')) {
    fail('footer is missing the LTL freight quote link');
  }
  for (const href of [
    '/blog/reduce-shipping-costs-high-volume/',
    '/blog/prepay-and-add-shipping/',
    '/blog/dimensional-weight/',
  ]) {
    if (!homepage.includes(`href="${href}"`)) fail(`homepage is missing internal link ${href}`);
  }
  if (/streetAddress/i.test(homepage)) fail('homepage includes a street address');
}

const llms = read('llms.txt');
if (llms && !llms.includes('## Quoting and how we work')) {
  fail('llms.txt is missing the quoting blurb');
}
if (llms && !llms.includes('Call (805) 984-4114 or start a chat.')) {
  fail('llms.txt quoting blurb does not point to chat or phone');
}
if (llms && /use the form|contact form/i.test(llms)) {
  fail('llms.txt still points people at a form');
}
if (llms && !llms.includes(`${WWW}/services/`)) {
  fail('llms.txt is missing the /services/ link');
}
if (llms && !llms.includes(`${WWW}/how-freight-quoting-works/`)) {
  fail('llms.txt is missing the how-freight-quoting-works link');
}
if (llms && !llms.includes('## Guides')) {
  fail('llms.txt is missing the Guides section');
}
if (llms) {
  const guides = llms.split('## Guides')[1]?.split('## Key facts')[0] ?? '';
  if (!guides.includes(`${WWW}/freight-broker-vs-carrier/`)) {
    fail('llms.txt Guides section is missing the freight-broker-vs-carrier link');
  }
  if (!guides.includes(`${WWW}/what-is-a-freight-broker/`)) {
    fail('llms.txt Guides section is missing the what-is-a-freight-broker link');
  }
  if (!guides.includes(`${WWW}/what-is-ltl-shipping/`)) {
    fail('llms.txt Guides section is missing the what-is-ltl-shipping link');
  }
  if (!guides.includes(`${WWW}/ltl-vs-ftl/`)) {
    fail('llms.txt Guides section is missing the ltl-vs-ftl link');
  }
  if (!guides.includes(`${WWW}/ltl-freight-quote/`)) {
    fail('llms.txt Guides section is missing the ltl-freight-quote link');
  }
  const ltlGuideAt = guides.indexOf(`${WWW}/what-is-ltl-shipping/`);
  const modeGuideAt = guides.indexOf(`${WWW}/ltl-vs-ftl/`);
  const quoteGuideAt = guides.indexOf(`${WWW}/ltl-freight-quote/`);
  if (ltlGuideAt === -1 || modeGuideAt === -1 || modeGuideAt < ltlGuideAt) {
    fail('llms.txt LTL vs FTL guide is not after What Is LTL Shipping');
  }
  if (quoteGuideAt === -1 || modeGuideAt === -1 || quoteGuideAt < modeGuideAt) {
    fail('llms.txt LTL freight quote guide is not after LTL vs FTL');
  }
}

const vercel = readFileSync(resolve(root, 'vercel.json'), 'utf8');
const vercelJson = JSON.parse(vercel);
if (vercelJson.rewrites?.some((rule) => rule.destination === '/index.html' || rule.destination === '/')) {
  fail('vercel.json has an SPA fallback rewrite');
}
if (vercelJson.redirects?.some((rule) => rule.source === '/sitemap.xml')) {
  fail('vercel.json still 308s /sitemap.xml');
}
if (vercelJson.redirects?.some((rule) => (rule.source === '/services' || rule.source === '/services/') && rule.destination === '/#services')) {
  fail('vercel.json still sends /services to /#services');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/services' && rule.destination === '/services/')) {
  fail('vercel.json is missing /services → /services/');
}
if (vercelJson.redirects?.some((rule) => rule.source === '/services/')) {
  fail('vercel.json still redirects /services/ away from the real page');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/contact' && rule.destination === '/#contact')) {
  fail('vercel.json lost the /contact → /#contact redirect');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/ltl-freight' && rule.destination === '/#services')) {
  fail('vercel.json lost the /ltl-freight redirect');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/how-freight-quoting-works' && rule.destination === '/how-freight-quoting-works/' && rule.permanent === true)) {
  fail('vercel.json is missing /how-freight-quoting-works slash redirect');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/quoting' && rule.destination === '/how-freight-quoting-works/' && rule.statusCode === 301)) {
  fail('vercel.json is missing /quoting 301');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/quoting/' && rule.destination === '/how-freight-quoting-works/' && rule.statusCode === 301)) {
  fail('vercel.json is missing /quoting/ 301');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/freight-broker-vs-carrier' && rule.destination === '/freight-broker-vs-carrier/' && rule.permanent === true)) {
  fail('vercel.json is missing /freight-broker-vs-carrier slash redirect');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/broker-vs-carrier' && rule.destination === '/freight-broker-vs-carrier/' && rule.statusCode === 301)) {
  fail('vercel.json is missing /broker-vs-carrier 301');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/broker-vs-carrier/' && rule.destination === '/freight-broker-vs-carrier/' && rule.statusCode === 301)) {
  fail('vercel.json is missing /broker-vs-carrier/ 301');
}
if (vercelJson.redirects?.some((rule) => rule.source === '/freight-broker-vs-carrier/')) {
  fail('vercel.json redirects the canonical /freight-broker-vs-carrier/ path');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/what-is-a-freight-broker' && rule.destination === '/what-is-a-freight-broker/' && rule.permanent === true)) {
  fail('vercel.json is missing /what-is-a-freight-broker slash redirect');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/freight-broker' && rule.destination === '/what-is-a-freight-broker/' && rule.statusCode === 301)) {
  fail('vercel.json is missing /freight-broker 301');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/freight-broker/' && rule.destination === '/what-is-a-freight-broker/' && rule.statusCode === 301)) {
  fail('vercel.json is missing /freight-broker/ 301');
}
if (vercelJson.redirects?.some((rule) => rule.source === '/what-is-a-freight-broker/')) {
  fail('vercel.json redirects the canonical /what-is-a-freight-broker/ path');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/what-is-ltl-shipping' && rule.destination === '/what-is-ltl-shipping/' && rule.permanent === true)) {
  fail('vercel.json is missing /what-is-ltl-shipping slash redirect');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/ltl-shipping' && rule.destination === '/what-is-ltl-shipping/' && rule.statusCode === 301)) {
  fail('vercel.json is missing /ltl-shipping 301');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/ltl-shipping/' && rule.destination === '/what-is-ltl-shipping/' && rule.statusCode === 301)) {
  fail('vercel.json is missing /ltl-shipping/ 301');
}
if (vercelJson.redirects?.some((rule) => rule.source === '/what-is-ltl-shipping/')) {
  fail('vercel.json redirects the canonical /what-is-ltl-shipping/ path');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/ltl-vs-ftl' && rule.destination === '/ltl-vs-ftl/' && rule.permanent === true)) {
  fail('vercel.json is missing /ltl-vs-ftl slash redirect');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/ltl-versus-ftl' && rule.destination === '/ltl-vs-ftl/' && rule.statusCode === 301)) {
  fail('vercel.json is missing /ltl-versus-ftl 301');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/ltl-versus-ftl/' && rule.destination === '/ltl-vs-ftl/' && rule.statusCode === 301)) {
  fail('vercel.json is missing /ltl-versus-ftl/ 301');
}
if (vercelJson.redirects?.some((rule) => rule.source === '/ltl-vs-ftl/')) {
  fail('vercel.json redirects the canonical /ltl-vs-ftl/ path');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/ltl-freight-quote' && rule.destination === '/ltl-freight-quote/' && rule.permanent === true)) {
  fail('vercel.json is missing /ltl-freight-quote slash redirect');
}
if (vercelJson.redirects?.some((rule) => rule.source === '/ltl-freight-quote/')) {
  fail('vercel.json redirects the canonical /ltl-freight-quote/ path');
}
if (vercelJson.redirects?.some((rule) => rule.source === '/freight-quote' || rule.source === '/freight-quote/')) {
  fail('vercel.json adds a /freight-quote/ alias');
}
if (vercelJson.redirects?.some((rule) => rule.destination === '/ltl-freight-quote/' && (rule.source === '/how-freight-quoting-works' || rule.source === '/how-freight-quoting-works/' || rule.source === '/quoting' || rule.source === '/quoting/'))) {
  fail('ltl-freight-quote redirect collides with /how-freight-quoting-works/');
}
if (!vercelJson.redirects?.some((rule) => rule.source === '/ftl-freight' && rule.destination === '/#services' && rule.permanent === true)) {
  fail('vercel.json changed the /ftl-freight redirect');
}
if (vercelJson.redirects?.some((rule) => (
  rule.destination === '/what-is-a-freight-broker/'
  && (rule.source === '/freight-broker-vs-carrier' || rule.source === '/freight-broker-vs-carrier/' || rule.source.startsWith('/freight-broker-vs-carrier'))
))) {
  fail('freight-broker alias collides with /freight-broker-vs-carrier/');
}
if (existsSync(resolve(dist, 'quoting/index.html'))) {
  fail('quoting/index.html should not be a 200 page');
}

const SERVICES_TITLE = 'Freight & Parcel Services | Parcel Management Group';
const SERVICES_TITLE_HTML = 'Freight &amp; Parcel Services | Parcel Management Group';
const SERVICES_DESCRIPTION =
  'Small package discounts for UPS and FedEx, LTL and full truckload freight, and refund recovery audits. Parcel Management Group — Ventura, CA 93001. Call (805) 984-4114.';
const SERVICES_FAQ = [
  {
    q: 'What services does Parcel Management Group offer?',
    a: 'Small package discounts for UPS and FedEx, LTL freight, full truckload freight, and refund recovery audits. Call (805) 984-4114.',
  },
  {
    q: 'Does the Small Package Program cost my business anything?',
    a: 'No. No fees, no contract, and no cost to your business. PMG is paid on the program itself.',
  },
  {
    q: 'Where is Parcel Management Group based?',
    a: 'Ventura, CA 93001. We serve shippers nationwide. Phone: (805) 984-4114.',
  },
];
const SERVICES_BODY = [
  'Parcel Management Group cuts what US businesses pay to ship. Four services. One broker team. Nationwide from Ventura, CA.',
  'Small Package Discounts',
  'Competitive UPS and FedEx rates through PMG’s Small Package Program. No fees. No contract. No cost to your business.',
  'Less-Than-Truckload (LTL)',
  'Pallet freight with a full dispatch team, clear rates, and hands-on service on every load.',
  'Full Truckload (FTL)',
  'Dedicated capacity when you need a full trailer — booked and managed end to end.',
  'Refund Recovery Audit',
  'We audit UPS and FedEx accounts for late or unused shipments, file claims, and chase the refunds.',
];

const servicesPage = read('services/index.html');
if (servicesPage) {
  if (!servicesPage.includes(`<title>${SERVICES_TITLE_HTML}</title>`)) fail('services <title> is not the locked title');
  if (!servicesPage.includes(`content="${SERVICES_DESCRIPTION}"`)) fail('services meta description changed');
  if (!servicesPage.includes('property="og:title" content="Freight &#38; Parcel Services | Parcel Management Group"')) {
    fail('services og:title changed');
  }
  if (!servicesPage.includes(`property="og:description" content="${SERVICES_DESCRIPTION}"`)) fail('services og:description changed');
  if (!servicesPage.includes(`property="og:url" content="${WWW}/services/"`)) fail('services og:url is not /services/');
  if (!servicesPage.includes('<h1>Freight and parcel services</h1>')) fail('services H1 changed');
  if (!servicesPage.includes('<h2>Services, in short.</h2>')) fail('services FAQ heading changed');
  if (!servicesPage.includes(`rel="canonical" href="${WWW}/services/"`)) {
    fail('services canonical is not the www /services/ URL');
  }
  if (!servicesPage.includes(`${WWW}/#organization`)) fail('services WebPage schema is missing the organization @id');
  if (!servicesPage.includes('"@type":"WebPage"') && !servicesPage.includes('"@type": "WebPage"')) {
    fail('services page is missing WebPage JSON-LD');
  }
  if (!servicesPage.includes('"@type":"FAQPage"') && !servicesPage.includes('"@type": "FAQPage"')) {
    fail('services page is missing FAQPage JSON-LD');
  }
  for (const sentence of SERVICES_BODY) {
    if (!servicesPage.includes(sentence)) fail(`services page is missing copy: ${sentence}`);
  }
  for (const href of [
    'tel:+18059844114',
    '/#contact',
    '/blog/reduce-shipping-costs-high-volume/',
    '/blog/what-is-a-parcel-audit/',
    '/blog/parcel-audit-vs-freight-audit/',
    '/about/',
  ]) {
    if (!servicesPage.includes(`href="${href}"`)) fail(`services page is missing link ${href}`);
  }
  if (/streetAddress/i.test(servicesPage)) fail('services page includes a street address');
  if (/noindex/i.test(servicesPage)) fail('services page is noindex');
  assertFaqVisibleAndJsonLd('services', servicesPage, SERVICES_FAQ);
  assertNoBareApex('services HTML', servicesPage);
  assertLeadConnectorWidget('services HTML', servicesPage);
  assertNoLeadForm('services HTML', servicesPage);
  assertLegalFooter('services HTML', servicesPage);
  assertDeadRiverPixel('services HTML', servicesPage);
  const navServices = servicesPage.match(/<nav class="nav-links"[\s\S]*?<\/nav>/);
  if (!navServices || !navServices[0].includes('href="/services/"')) {
    fail('header Services link is not /services/');
  }
  if (navServices[0].includes('/#services')) fail('header still links Services to /#services');
} else {
  fail('services/index.html was not built');
}

if (homepage) {
  if (!homepage.includes('href="/services/"')) fail('homepage header/footer is missing /services/');
  const homeNav = homepage.match(/<nav class="nav-links"[\s\S]*?<\/nav>/);
  if (!homeNav || homeNav[0].includes('/#services')) fail('homepage header still links Services to /#services');
}

if (SERVICES_TITLE.length > 60) fail('services title is over 60 characters');

const BROKER_TITLE = 'Freight Broker vs Carrier | Parcel Management Group';
const BROKER_META =
  'A freight broker finds and manages carriers for your freight. A carrier owns the trucks or planes. PMG is a registered broker in Ventura, CA. Call (805) 984-4114.';
const BROKER_FAQ = [
  {
    q: 'What is the difference between a freight broker and a carrier?',
    a: 'A carrier owns the trucks or planes. A broker finds the right carrier for your freight and manages the move. Parcel Management Group is a registered freight broker (USDOT 3266041 · MC 1030328).',
  },
  {
    q: 'Is Parcel Management Group a broker or a carrier?',
    a: 'PMG is a freight broker. We shop carriers, book the load, and support you after pickup. We serve shippers nationwide from Ventura, CA 93001. Call (805) 984-4114.',
  },
  {
    q: 'When should I use a freight broker instead of calling a carrier directly?',
    a: 'Use a broker when you want one team to compare options across small package, LTL, and full truckload, get a clear quote, and stay involved if something goes wrong. For small packages, you can also join PMG’s free Small Package Program — no fees and no contract.',
  },
];
const BROKER_FAQ_QUOTE =
  'Tell us what you ship, where it goes, and when you need it. We compare carriers and send a clear quote. See How freight quoting works or call (805) 984-4114.';

const brokerPage = read('freight-broker-vs-carrier/index.html');
if (brokerPage) {
  if (BROKER_TITLE.length > 60) fail('broker vs carrier title is over 60 characters');
  if (!brokerPage.includes(`<title>${BROKER_TITLE}</title>`)) fail('broker vs carrier <title> is not exact');
  if (!brokerPage.includes(`name="description" content="${BROKER_META}"`)) {
    fail('broker vs carrier meta description is not exact');
  }
  if (!brokerPage.includes('<h1>Freight broker vs carrier: what shippers need to know</h1>')) {
    fail('broker vs carrier H1 is not exact');
  }
  if (!brokerPage.includes('<h2>Freight broker vs carrier, in short.</h2>')) {
    fail('broker vs carrier FAQ heading is not exact');
  }
  if (!brokerPage.includes(`rel="canonical" href="${WWW}/freight-broker-vs-carrier/"`)) {
    fail('broker vs carrier canonical is not the www URL');
  }
  if (!brokerPage.includes(`property="og:url" content="${WWW}/freight-broker-vs-carrier/"`)) {
    fail('broker vs carrier og:url is not the www URL');
  }
  if (!brokerPage.includes('"@type":"WebPage"')) fail('broker vs carrier page is missing WebPage JSON-LD');
  if (!brokerPage.includes(`${WWW}/freight-broker-vs-carrier/`)) {
    fail('broker vs carrier JSON-LD is missing the page URL');
  }
  if (!brokerPage.includes('A freight broker shops carriers and manages the move so you get a clear rate and support.')) {
    fail('broker vs carrier lead is missing the results-first sentence');
  }
  if (!brokerPage.includes('USDOT 3266041')) fail('broker vs carrier page is missing USDOT');
  if (!brokerPage.includes('MC 1030328')) fail('broker vs carrier page is missing MC');
  if (!brokerPage.includes('Ventura, CA 93001')) fail('broker vs carrier page is missing city-level NAP');
  if (!brokerPage.includes('(805) 984-4114')) fail('broker vs carrier page is missing the phone number');
  if (/streetAddress/i.test(brokerPage)) fail('broker vs carrier page includes a street address');
  if (/Oxnard/i.test(brokerPage)) fail('broker vs carrier page mentions Oxnard');
  if (/noindex/i.test(brokerPage)) fail('broker vs carrier page is noindex');
  if (/connect\.facebook\.net|fbq\(/.test(brokerPage)) fail('broker vs carrier page includes a Meta pixel');
  for (const href of [
    '/how-freight-quoting-works/',
    '/services/',
    '/about/',
    '/blog/reduce-shipping-costs-high-volume/',
    '/blog/parcel-audit-vs-freight-audit/',
    '/#contact',
  ]) {
    if (!brokerPage.includes(`href="${href}"`)) fail(`broker vs carrier page is missing internal link ${href}`);
  }
  if (!brokerPage.includes('See <a href="/how-freight-quoting-works/">How freight quoting works</a> or call (805) 984-4114.')) {
    fail('broker vs carrier quote FAQ is missing the visible quoting link');
  }
  if (!brokerPage.includes(JSON.stringify(BROKER_FAQ_QUOTE))) {
    fail('broker vs carrier FAQPage JSON-LD is missing the quote answer');
  }
  assertFaqVisibleAndJsonLd('broker vs carrier', brokerPage, BROKER_FAQ);
  assertNoBareApex('broker vs carrier HTML', brokerPage);
  assertLeadConnectorWidget('broker vs carrier HTML', brokerPage);
  assertDeadRiverPixel('broker vs carrier HTML', brokerPage);
  assertNoLeadForm('broker vs carrier HTML', brokerPage);
  assertLegalFooter('broker vs carrier HTML', brokerPage);
} else {
  fail('freight-broker-vs-carrier/index.html is missing');
}

const DEFINITION_TITLE = 'What Is a Freight Broker? | Parcel Management Group';
const DEFINITION_META =
  'A freight broker finds and manages carriers for your freight so you get a clear rate and support. PMG is a registered broker in Ventura, CA. Call (805) 984-4114.';
const DEFINITION_FAQ = [
  {
    q: 'What is a freight broker?',
    a: 'A freight broker finds and manages carriers for your freight. They shop options, book the load, and stay with you if something goes wrong. Parcel Management Group is a registered freight broker (USDOT 3266041 · MC 1030328).',
  },
  {
    q: 'Is Parcel Management Group a freight broker?',
    a: 'Yes. PMG is a registered freight broker based in Ventura, CA 93001. We serve shippers nationwide across small package, LTL, and full truckload. Call (805) 984-4114.',
  },
];
const DEFINITION_FAQ_DIFF =
  'A carrier owns the trucks or planes. A broker finds the right carrier for your freight and manages the move. See Freight broker vs carrier for the full comparison.';
const DEFINITION_FAQ_QUOTE =
  'Tell us what you ship, where it goes, and when you need it. We compare carriers and send a clear quote. See How freight quoting works or call (805) 984-4114.';

const definitionPage = read('what-is-a-freight-broker/index.html');
if (definitionPage) {
  if (DEFINITION_TITLE.length > 60) fail('what is a freight broker title is over 60 characters');
  if (DEFINITION_TITLE.length !== 51) fail(`what is a freight broker title should be 51 characters (found ${DEFINITION_TITLE.length})`);
  if (!definitionPage.includes(`<title>${DEFINITION_TITLE}</title>`)) fail('what is a freight broker <title> is not exact');
  if (!definitionPage.includes(`name="description" content="${DEFINITION_META}"`)) {
    fail('what is a freight broker meta description is not exact');
  }
  if (!definitionPage.includes(`property="og:description" content="${DEFINITION_META}"`)) {
    fail('what is a freight broker og:description is not exact');
  }
  if (!definitionPage.includes('<h1>What is a freight broker?</h1>')) {
    fail('what is a freight broker H1 is not exact');
  }
  if (!definitionPage.includes('<h2>Freight brokers, in short.</h2>')) {
    fail('what is a freight broker FAQ heading is not exact');
  }
  if (!definitionPage.includes(`rel="canonical" href="${WWW}/what-is-a-freight-broker/"`)) {
    fail('what is a freight broker canonical is not the www URL');
  }
  if (!definitionPage.includes(`property="og:url" content="${WWW}/what-is-a-freight-broker/"`)) {
    fail('what is a freight broker og:url is not the www URL');
  }
  if (!definitionPage.includes('"@type":"WebPage"')) fail('what is a freight broker page is missing WebPage JSON-LD');
  if (!definitionPage.includes('"@type":"FAQPage"')) fail('what is a freight broker page is missing FAQPage JSON-LD');
  if (!definitionPage.includes(`${WWW}/what-is-a-freight-broker/`)) {
    fail('what is a freight broker JSON-LD is missing the page URL');
  }
  if (!definitionPage.includes('A freight broker shops carriers and manages the move so you get a clear rate and support after pickup.')) {
    fail('what is a freight broker lead is missing the results-first sentence');
  }
  if (!definitionPage.includes('USDOT 3266041')) fail('what is a freight broker page is missing USDOT');
  if (!definitionPage.includes('MC 1030328')) fail('what is a freight broker page is missing MC');
  if (!definitionPage.includes('Ventura, CA 93001')) fail('what is a freight broker page is missing city-level NAP');
  if (!definitionPage.includes('(805) 984-4114')) fail('what is a freight broker page is missing the phone number');
  if (/streetAddress/i.test(definitionPage)) fail('what is a freight broker page includes a street address');
  if (/Oxnard/i.test(definitionPage)) fail('what is a freight broker page mentions Oxnard');
  if (/noindex/i.test(definitionPage)) fail('what is a freight broker page is noindex');
  if (/connect\.facebook\.net|fbq\(/.test(definitionPage)) fail('what is a freight broker page includes a Meta pixel');
  for (const href of [
    '/freight-broker-vs-carrier/',
    '/how-freight-quoting-works/',
    '/services/',
    '/about/',
    '/blog/reduce-shipping-costs-high-volume/',
    '/#contact',
  ]) {
    if (!definitionPage.includes(`href="${href}"`)) fail(`what is a freight broker page is missing internal link ${href}`);
  }
  if (!definitionPage.includes('See <a href="/freight-broker-vs-carrier/">Freight broker vs carrier</a> for the full comparison.')) {
    fail('what is a freight broker difference FAQ is missing the visible comparison link');
  }
  if (!definitionPage.includes('See <a href="/how-freight-quoting-works/">How freight quoting works</a> or call (805) 984-4114.')) {
    fail('what is a freight broker quote FAQ is missing the visible quoting link');
  }
  if (!definitionPage.includes(JSON.stringify(DEFINITION_FAQ_DIFF))) {
    fail('what is a freight broker FAQPage JSON-LD is missing the comparison answer');
  }
  if (!definitionPage.includes(JSON.stringify(DEFINITION_FAQ_QUOTE))) {
    fail('what is a freight broker FAQPage JSON-LD is missing the quote answer');
  }
  assertFaqVisibleAndJsonLd('what is a freight broker', definitionPage, DEFINITION_FAQ);
  assertNoBareApex('what is a freight broker HTML', definitionPage);
  assertLeadConnectorWidget('what is a freight broker HTML', definitionPage);
  assertDeadRiverPixel('what is a freight broker HTML', definitionPage);
  assertNoLeadForm('what is a freight broker HTML', definitionPage);
  assertLegalFooter('what is a freight broker HTML', definitionPage);
} else {
  fail('what-is-a-freight-broker/index.html is missing');
}

const LTL_TITLE = 'What Is LTL Shipping? | Parcel Management Group';
const LTL_META =
  'LTL shipping moves freight that fills part of a truck. You share space and pay for the space you use. PMG is a registered broker in Ventura, CA. Call (805) 984-4114.';
const LTL_FAQ = [
  {
    q: 'What is LTL shipping?',
    a: 'LTL (less-than-truckload) shipping moves freight that fills part of a truck. You share space with other shippers and pay for the space you use. It fits pallet freight too big for small package but not needing a full trailer.',
  },
  {
    q: 'When should I use LTL instead of small package or full truckload?',
    a: 'Use small package for boxes usually under 150 lbs. Use LTL for pallet freight that does not need a full truck. Use full truckload when you need a dedicated trailer. Parcel Management Group helps you choose the right mode.',
  },
  {
    q: 'Does Parcel Management Group handle LTL freight?',
    a: 'Yes. PMG is a registered freight broker (USDOT 3266041 · MC 1030328) based in Ventura, CA 93001. We compare LTL carriers, book the load, and support you after pickup. Call (805) 984-4114.',
  },
];
const LTL_FAQ_QUOTE =
  'Tell us what you ship, where it goes, and when you need it. We compare carriers and send a clear quote. See How freight quoting works or call (805) 984-4114.';

const ltlPage = read('what-is-ltl-shipping/index.html');
if (ltlPage) {
  if (LTL_TITLE.length !== 47) fail(`what is LTL shipping title should be 47 characters (found ${LTL_TITLE.length})`);
  if (LTL_META.length !== 165) fail(`what is LTL shipping meta should be 165 characters (found ${LTL_META.length})`);
  if (!ltlPage.includes(`<title>${LTL_TITLE}</title>`)) fail('what is LTL shipping <title> is not exact');
  if (!ltlPage.includes(`name="description" content="${LTL_META}"`)) {
    fail('what is LTL shipping meta description is not exact');
  }
  if (!ltlPage.includes(`property="og:description" content="${LTL_META}"`)) {
    fail('what is LTL shipping og:description is not exact');
  }
  if (!ltlPage.includes('<h1>What is LTL shipping?</h1>')) {
    fail('what is LTL shipping H1 is not exact');
  }
  if (!ltlPage.includes('<h2>LTL shipping, in short.</h2>')) {
    fail('what is LTL shipping FAQ heading is not exact');
  }
  if (!ltlPage.includes(`rel="canonical" href="${WWW}/what-is-ltl-shipping/"`)) {
    fail('what is LTL shipping canonical is not the www URL');
  }
  if (!ltlPage.includes(`property="og:url" content="${WWW}/what-is-ltl-shipping/"`)) {
    fail('what is LTL shipping og:url is not the www URL');
  }
  if (!ltlPage.includes('"@type":"WebPage"')) fail('what is LTL shipping page is missing WebPage JSON-LD');
  if (!ltlPage.includes('"@type":"FAQPage"')) fail('what is LTL shipping page is missing FAQPage JSON-LD');
  if (!ltlPage.includes(`${WWW}/what-is-ltl-shipping/`)) {
    fail('what is LTL shipping JSON-LD is missing the page URL');
  }
  if (!ltlPage.includes('LTL (less-than-truckload) shipping moves freight that fills part of a truck.')) {
    fail('what is LTL shipping lead is missing the results-first sentence');
  }
  if (!ltlPage.includes('USDOT 3266041')) fail('what is LTL shipping page is missing USDOT');
  if (!ltlPage.includes('MC 1030328')) fail('what is LTL shipping page is missing MC');
  if (!ltlPage.includes('Ventura, CA 93001')) fail('what is LTL shipping page is missing city-level NAP');
  if (!ltlPage.includes('(805) 984-4114')) fail('what is LTL shipping page is missing the phone number');
  if (/streetAddress/i.test(ltlPage)) fail('what is LTL shipping page includes a street address');
  if (/Oxnard/i.test(ltlPage)) fail('what is LTL shipping page mentions Oxnard');
  if (/noindex/i.test(ltlPage)) fail('what is LTL shipping page is noindex');
  if (/connect\.facebook\.net|fbq\(/.test(ltlPage)) fail('what is LTL shipping page includes a Meta pixel');
  const ltlMain = ltlPage.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';
  if (/[—–]/.test(ltlMain)) fail('what is LTL shipping page includes an em or en dash');
  for (const href of [
    '/what-is-a-freight-broker/',
    '/freight-broker-vs-carrier/',
    '/how-freight-quoting-works/',
    '/services/',
    '/about/',
    '/blog/reduce-shipping-costs-high-volume/',
    '/#contact',
  ]) {
    if (!ltlPage.includes(`href="${href}"`)) fail(`what is LTL shipping page is missing internal link ${href}`);
  }
  if (!ltlPage.includes('See <a href="/how-freight-quoting-works/">How freight quoting works</a> or call (805) 984-4114.')) {
    fail('what is LTL shipping quote FAQ is missing the visible quoting link');
  }
  if (!ltlPage.includes(JSON.stringify(LTL_FAQ_QUOTE))) {
    fail('what is LTL shipping FAQPage JSON-LD is missing the quote answer');
  }
  assertFaqVisibleAndJsonLd('what is LTL shipping', ltlPage, LTL_FAQ);
  assertNoBareApex('what is LTL shipping HTML', ltlPage);
  assertLeadConnectorWidget('what is LTL shipping HTML', ltlPage);
  assertDeadRiverPixel('what is LTL shipping HTML', ltlPage);
  assertNoLeadForm('what is LTL shipping HTML', ltlPage);
  assertLegalFooter('what is LTL shipping HTML', ltlPage);
} else {
  fail('what-is-ltl-shipping/index.html is missing');
}

if (existsSync(resolve(dist, 'ltl-shipping/index.html'))) {
  fail('ltl-shipping/index.html should not be a 200 page');
}

const QUOTE_TITLE = 'LTL Freight Quote | Parcel Management Group';
const QUOTE_META =
  'Need an LTL freight quote? Share freight details with PMG. We compare carriers and send a clear rate. Registered broker in Ventura, CA 93001. Call (805) 984-4114.';
const QUOTE_FAQ = [
  {
    q: 'How do I get an LTL freight quote from Parcel Management Group?',
    a: 'Tell us what you ship, where it goes, and when you need it. We compare carriers and send a clear LTL rate. Call (805) 984-4114 or start a chat on parcelmanagementgroup.com.',
  },
  {
    q: 'What details do you need for an accurate LTL quote?',
    a: 'Share origin and destination, freight description, weight, pallet or piece count, dimensions if available, ready date, and any accessorial needs such as liftgate or appointment. More detail usually means a clearer rate.',
  },
  {
    q: 'Is Parcel Management Group a carrier or a broker?',
    a: 'PMG is a registered freight broker (USDOT 3266041 · MC 1030328) based in Ventura, CA 93001. We find and manage carriers for your LTL freight. We do not own the trucks.',
  },
];
const QUOTE_FAQ_MODE =
  'Request LTL when your pallet freight does not need a full trailer. Request FTL when you need dedicated capacity. PMG helps you choose and quote the right mode. See LTL vs FTL or call (805) 984-4114.';

const quotePage = read('ltl-freight-quote/index.html');
if (quotePage) {
  if (QUOTE_TITLE.length !== 43) fail(`LTL freight quote title should be 43 characters (found ${QUOTE_TITLE.length})`);
  if (QUOTE_META.length !== 162) fail(`LTL freight quote meta should be 162 characters (found ${QUOTE_META.length})`);
  if (!quotePage.includes(`<title>${QUOTE_TITLE}</title>`)) fail('LTL freight quote <title> is not exact');
  if (!quotePage.includes(`name="description" content="${QUOTE_META}"`)) {
    fail('LTL freight quote meta description is not exact');
  }
  if (!quotePage.includes(`property="og:description" content="${QUOTE_META}"`)) {
    fail('LTL freight quote og:description is not exact');
  }
  if (!quotePage.includes('<h1>Get an LTL freight quote</h1>')) {
    fail('LTL freight quote H1 is not exact');
  }
  if (!quotePage.includes('<h2>LTL freight quote FAQ</h2>')) {
    fail('LTL freight quote FAQ heading is not exact');
  }
  if (!quotePage.includes(`rel="canonical" href="${WWW}/ltl-freight-quote/"`)) {
    fail('LTL freight quote canonical is not the www URL');
  }
  if (!quotePage.includes(`property="og:url" content="${WWW}/ltl-freight-quote/"`)) {
    fail('LTL freight quote og:url is not the www URL');
  }
  if (!quotePage.includes('"@type":"WebPage"')) fail('LTL freight quote page is missing WebPage JSON-LD');
  if (!quotePage.includes('"@type":"FAQPage"')) fail('LTL freight quote page is missing FAQPage JSON-LD');
  if (!quotePage.includes(`${WWW}/ltl-freight-quote/`)) {
    fail('LTL freight quote JSON-LD is missing the page URL');
  }
  if (!quotePage.includes('Need an LTL freight quote? Tell Parcel Management Group what you ship, where it goes, and when you need it.')) {
    fail('LTL freight quote lead is missing the results-first sentence');
  }
  if (!quotePage.includes('USDOT 3266041')) fail('LTL freight quote page is missing USDOT');
  if (!quotePage.includes('MC 1030328')) fail('LTL freight quote page is missing MC');
  if (!quotePage.includes('Ventura, CA 93001')) fail('LTL freight quote page is missing city-level NAP');
  if (!quotePage.includes('(805) 984-4114')) fail('LTL freight quote page is missing the phone number');
  if (/streetAddress/i.test(quotePage)) fail('LTL freight quote page includes a street address');
  if (/Oxnard/i.test(quotePage)) fail('LTL freight quote page mentions Oxnard');
  if (/noindex/i.test(quotePage)) fail('LTL freight quote page is noindex');
  if (/connect\.facebook\.net|fbq\(/.test(quotePage)) fail('LTL freight quote page includes a Meta pixel');
  const quoteMain = quotePage.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';
  if (/[—–]/.test(quoteMain)) fail('LTL freight quote page includes an em or en dash');
  for (const href of [
    '/what-is-ltl-shipping/',
    '/ltl-vs-ftl/',
    '/how-freight-quoting-works/',
    '/what-is-a-freight-broker/',
    '/freight-broker-vs-carrier/',
    '/services/',
    '/about/',
    '/blog/reduce-shipping-costs-high-volume/',
    '/#contact',
  ]) {
    if (!quotePage.includes(`href="${href}"`)) fail(`LTL freight quote page is missing internal link ${href}`);
  }
  if (!quotePage.includes('See <a href="/ltl-vs-ftl/">LTL vs FTL</a> or call (805) 984-4114.')) {
    fail('LTL freight quote mode FAQ is missing the visible LTL vs FTL link');
  }
  if (!quotePage.includes(JSON.stringify(QUOTE_FAQ_MODE))) {
    fail('LTL freight quote FAQPage JSON-LD is missing the mode answer');
  }
  if (!quotePage.includes('When should I request LTL instead of full truckload?')) {
    fail('LTL freight quote FAQ is missing the mode question');
  }
  assertFaqVisibleAndJsonLd('LTL freight quote', quotePage, QUOTE_FAQ);
  assertNoBareApex('LTL freight quote HTML', quotePage);
  assertLeadConnectorWidget('LTL freight quote HTML', quotePage);
  assertDeadRiverPixel('LTL freight quote HTML', quotePage);
  assertNoLeadForm('LTL freight quote HTML', quotePage);
  assertLegalFooter('LTL freight quote HTML', quotePage);
} else {
  fail('ltl-freight-quote/index.html is missing');
}

if (existsSync(resolve(dist, 'freight-quote/index.html'))) {
  fail('freight-quote/index.html should not be a 200 page');
}

const MODE_TITLE = 'LTL vs FTL Shipping | Parcel Management Group';
const MODE_META =
  'LTL shares a truck; FTL uses a full trailer. Pick the mode that fits your freight size and timeline. PMG is a registered broker in Ventura, CA. Call (805) 984-4114.';
const MODE_FAQ = [
  {
    q: 'What is the difference between LTL and FTL shipping?',
    a: 'LTL (less-than-truckload) shares a truck with other shippers and you pay for the space you use. FTL (full truckload) uses a dedicated trailer for your freight. Choose based on freight size, volume, and timing.',
  },
  {
    q: 'When should I use LTL instead of FTL?',
    a: 'Use LTL for pallet freight that does not need a full trailer. Use FTL when you need dedicated capacity, have enough volume to fill a trailer, or need freight that should not share space. Parcel Management Group helps you pick the right mode.',
  },
  {
    q: 'Does Parcel Management Group handle both LTL and FTL?',
    a: 'Yes. PMG is a registered freight broker (USDOT 3266041 · MC 1030328) based in Ventura, CA 93001. We compare carriers for LTL and full truckload and support you after pickup. Call (805) 984-4114.',
  },
];
const MODE_FAQ_QUOTE =
  'Tell us what you ship, where it goes, and when you need it. We compare carriers and send a clear quote. See How freight quoting works or call (805) 984-4114.';

const modePage = read('ltl-vs-ftl/index.html');
if (modePage) {
  if (MODE_TITLE.length !== 45) fail(`LTL vs FTL title should be 45 characters (found ${MODE_TITLE.length})`);
  if (MODE_META.length !== 164) fail(`LTL vs FTL meta should be 164 characters (found ${MODE_META.length})`);
  if (!modePage.includes(`<title>${MODE_TITLE}</title>`)) fail('LTL vs FTL <title> is not exact');
  if (!modePage.includes(`name="description" content="${MODE_META}"`)) {
    fail('LTL vs FTL meta description is not exact');
  }
  if (!modePage.includes(`property="og:description" content="${MODE_META}"`)) {
    fail('LTL vs FTL og:description is not exact');
  }
  if (!modePage.includes('<h1>LTL vs FTL: which shipping mode fits?</h1>')) {
    fail('LTL vs FTL H1 is not exact');
  }
  if (!modePage.includes('<h2>LTL vs FTL, in short.</h2>')) {
    fail('LTL vs FTL FAQ heading is not exact');
  }
  if (!modePage.includes(`rel="canonical" href="${WWW}/ltl-vs-ftl/"`)) {
    fail('LTL vs FTL canonical is not the www URL');
  }
  if (!modePage.includes(`property="og:url" content="${WWW}/ltl-vs-ftl/"`)) {
    fail('LTL vs FTL og:url is not the www URL');
  }
  if (!modePage.includes('"@type":"WebPage"')) fail('LTL vs FTL page is missing WebPage JSON-LD');
  if (!modePage.includes('"@type":"FAQPage"')) fail('LTL vs FTL page is missing FAQPage JSON-LD');
  if (!modePage.includes(`${WWW}/ltl-vs-ftl/`)) {
    fail('LTL vs FTL JSON-LD is missing the page URL');
  }
  if (!modePage.includes('LTL (less-than-truckload) shares truck space with other shippers.')) {
    fail('LTL vs FTL lead is missing the results-first sentence');
  }
  if (!modePage.includes('USDOT 3266041')) fail('LTL vs FTL page is missing USDOT');
  if (!modePage.includes('MC 1030328')) fail('LTL vs FTL page is missing MC');
  if (!modePage.includes('Ventura, CA 93001')) fail('LTL vs FTL page is missing city-level NAP');
  if (!modePage.includes('(805) 984-4114')) fail('LTL vs FTL page is missing the phone number');
  if (/streetAddress/i.test(modePage)) fail('LTL vs FTL page includes a street address');
  if (/Oxnard/i.test(modePage)) fail('LTL vs FTL page mentions Oxnard');
  if (/noindex/i.test(modePage)) fail('LTL vs FTL page is noindex');
  if (/connect\.facebook\.net|fbq\(/.test(modePage)) fail('LTL vs FTL page includes a Meta pixel');
  const modeMain = modePage.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';
  if (/[—–]/.test(modeMain)) fail('LTL vs FTL page includes an em or en dash');
  for (const href of [
    '/what-is-ltl-shipping/',
    '/what-is-a-freight-broker/',
    '/freight-broker-vs-carrier/',
    '/how-freight-quoting-works/',
    '/services/',
    '/about/',
    '/blog/reduce-shipping-costs-high-volume/',
    '/#contact',
  ]) {
    if (!modePage.includes(`href="${href}"`)) fail(`LTL vs FTL page is missing internal link ${href}`);
  }
  if (!modePage.includes('See <a href="/how-freight-quoting-works/">How freight quoting works</a> or call (805) 984-4114.')) {
    fail('LTL vs FTL quote FAQ is missing the visible quoting link');
  }
  if (!modePage.includes(JSON.stringify(MODE_FAQ_QUOTE))) {
    fail('LTL vs FTL FAQPage JSON-LD is missing the quote answer');
  }
  assertFaqVisibleAndJsonLd('LTL vs FTL', modePage, MODE_FAQ);
  assertNoBareApex('LTL vs FTL HTML', modePage);
  assertLeadConnectorWidget('LTL vs FTL HTML', modePage);
  assertDeadRiverPixel('LTL vs FTL HTML', modePage);
  assertNoLeadForm('LTL vs FTL HTML', modePage);
  assertLegalFooter('LTL vs FTL HTML', modePage);
} else {
  fail('ltl-vs-ftl/index.html is missing');
}

if (errors.length) {
  console.error('verify-seo failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('verify-seo: 404 document, legal pages, www canonical, sitemap locs, chat widget, and Dead River pixel look correct.');
