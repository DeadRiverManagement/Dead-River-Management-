import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve(process.argv[2] ?? 'dist');
assert.ok(existsSync(dist), 'Build the site before checking contract terms.');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
const files = walk(dist).filter(file => file.endsWith('.html'));
const text = value => value
  .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#(?:39|x27);|&apos;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();
const blocks = html => [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .map(match => JSON.parse(match[1]));
const nodes = value => !value || typeof value !== 'object' ? [] :
  [value, ...Object.values(value).flatMap(nodes)];
const loadPage = route => {
  const file = join(dist, route === '/' ? 'index.html' : route.slice(1) + '.html');
  return readFileSync(file, 'utf8');
};
let jsonCount = 0;
for (const file of files) jsonCount += blocks(readFileSync(file, 'utf8')).length;

const changedQuestions = {
  '/': [
    'What does Dead River Management do?',
    'Is Dead River Management the same as Dead River Company?',
    'What is Dead River Complete?',
    'How much do plans cost?',
    'Which plan do I need?',
    'How does the 30 leads in 60 days promise work?',
    'Do you only work in El Paso?',
  ],
  '/plans': ['How long do I sign up for?', 'Which plan has the 30 leads in 60 days promise?', 'Which plans have a setup fee?'],
  '/website': ['How long do I sign up for?'],
  '/dead-river-complete': [
    'What is the Dead River Complete promise?',
    'How does the 30 leads in 60 days promise work?',
    'What counts as a lead?',
    'Do you refund my money if you miss 30 leads?',
    'Is this promise on your Google listing?',
    'How much is Dead River Complete?',
    'Is ad spend in the plan?',
    'When do I see the price?',
    'Is Dead River Management the same as Dead River Company?',
  ],
  '/about': [
    'Is Dead River Management the same as Dead River Company?',
    'Does Dead River Management sell fuel?',
    'I searched Dead River and saw a fuel company. Is that you?',
  ],
  '/marketing-advice/el-paso-home-services-marketing-agency': [
    'Who should I hire for home service marketing in El Paso?',
    'What is the difference between Dead River Management and Strategic Key Marketing?',
    'Do you only work in El Paso?',
    'How much do Dead River plans cost?',
  ],
};
let faqCount = 0;
for (const [route, questions] of Object.entries(changedQuestions)) {
  const html = loadPage(route);
  const faq = nodes(blocks(html)).filter(node => node['@type'] === 'Question');
  const details = [...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)]
    .map(match => {
      const question = match[1].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
      const answer = match[1].replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, '');
      return { question: text(question?.[1] ?? ''), answer: text(answer) };
    });
  for (const question of questions) {
    const schemaAnswer = faq.find(item => item.name === question)?.acceptedAnswer?.text;
    const visibleAnswer = details.find(item => item.question === question)?.answer;
    assert.ok(schemaAnswer, route + ': missing schema for ' + question);
    assert.ok(visibleAnswer, route + ': missing visible FAQ for ' + question);
    assert.equal(text(schemaAnswer), visibleAnswer, route + ': FAQ drift: ' + question);
    if (route === '/' && question === 'What is Dead River Complete?') {
      assert.match(text(schemaAnswer), /30 leads in 60 days or we work for free until we get them/, route + ': FAQPage must keep the exact guarantee');
    }
    faqCount++;
  }
}
assert.match(loadPage('/website'), /12 months|12-month/);
for (const file of files) {
  const offers = nodes(blocks(readFileSync(file, 'utf8')))
    .filter(node => node['@type'] === 'Offer');
  for (const offer of offers) {
    if (offer.name === 'Dead River Complete' || offer.url?.endsWith('/dead-river-complete')) {
      assert.equal(offer.price, undefined, 'Do not invent a Complete price: ' + file);
      assert.equal(offer.priceSpecification?.price, undefined);
    }
  }
}
// Foundation / Growth Partner / Scale dollar plans must not be published.
const AGENCY_PLAN_DOLLARS =
  /Foundation[^$\n]{0,80}\$997|Growth Partner[^$\n]{0,80}\$2,497|Scale[^$\n]{0,120}\$4,497|setup from \$1,497|setup from \$1,997|setup from \$2,997/;
const PRICE_LEAK = /\$2500|\$2,500/;
const OLD_PLAN_NAMES = /Missed Call Rescue|missed-call rescue|The Whole River|Lead Rescue|Growth Engine|Website Rescue|Local Growth/i;
const HOME_SHOP = new RegExp(['home', 'shop'].join('\\s*') + '|' + ['home', 'shop'].join(''), 'i');
const JARGON = /\bAEO\b|answer engine optimization|generative engine optimization/i;
const publicText = files.map(file => readFileSync(file, 'utf8')).join('\n');
assert.doesNotMatch(publicText, PRICE_LEAK);
assert.doesNotMatch(publicText, /"streetAddress"|"postalCode"/);
assert.doesNotMatch(publicText, /money-back|waive (our )?management fee/i);
assert.doesNotMatch(publicText, /\$47\b/);
assert.doesNotMatch(publicText, OLD_PLAN_NAMES);
assert.doesNotMatch(publicText, HOME_SHOP);
assert.doesNotMatch(publicText, /\bhome shops?\b/i);
assert.doesNotMatch(publicText, /Shops we help/i);
// Audience "shops" is banned. Keep trade names (body shop, tire shop, barber shop).
const stripTradeShops = (s) => s.replace(
  /\b(?:auto )?(?:body |repair )?shops\b|\b(?:tire|barber|repair|piercing|brake) shops\b/gi,
  ' ',
);
assert.doesNotMatch(stripTradeShops(publicText), /\bshops\b/i, 'audience shops leftover in public HTML');
const seoSurface = (html) => text([
  html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '',
  [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]).join(' '),
  [...html.matchAll(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/gi)].map(m => m[1]).join(' '),
  [...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)].map(m => m[1]).join(' '),
  nodes(blocks(html)).flatMap(n => [n.description, n.disambiguatingDescription, n.name]).filter(Boolean).join(' '),
].join(' '));
for (const file of files) {
  const surface = stripTradeShops(seoSurface(readFileSync(file, 'utf8')));
  assert.doesNotMatch(surface, /\bhome shops?\b/i, file + ': home shop in title/meta/H1/H2/FAQ/schema');
  assert.doesNotMatch(surface, /\bshops\b/i, file + ': audience shops in title/meta/H1/H2/FAQ/schema');
}
assert.doesNotMatch(publicText, JARGON);
assert.match(publicText, /30 leads in 60 days or we work for free until we get them/);
assert.match(publicText, /not Dead River Company/i);
assert.match(publicText, /Mon[–-]Sat 9[–-]6 Mountain Time/i);
assert.match(publicText, /Team support/i);
assert.match(publicText, /AI system can still book jobs/i);

const orgNodes = nodes(blocks(loadPage('/'))).filter((node) => {
  const type = node['@type'];
  return type === 'LocalBusiness' || (Array.isArray(type) && type.includes('LocalBusiness'));
});
assert.ok(orgNodes.length > 0, 'homepage must publish LocalBusiness JSON-LD');
for (const org of orgNodes) {
  assert.equal(org.address?.streetAddress, undefined, 'LocalBusiness must be city-level only');
  assert.equal(org.address?.postalCode, undefined, 'LocalBusiness must be city-level only');
  assert.equal(org.address?.addressLocality, 'El Paso');
  assert.equal(org.telephone, '+19152283054', 'LocalBusiness NAP phone must stay the office line');
  assert.doesNotMatch(JSON.stringify(org), /228-4551|19152284551/, 'Voice demo number must not be on LocalBusiness/GBP');
  assert.doesNotMatch(org.description ?? '', /30 leads in 60 days/, 'Guarantee must not live on LocalBusiness/GBP');
  assert.doesNotMatch(org.disambiguatingDescription ?? '', /30 leads in 60 days/, 'Guarantee must not live on LocalBusiness/GBP');
}

const preFormRoutes = ['/', '/plans', '/dead-river-complete'];
for (const route of preFormRoutes) {
  const html = loadPage(route);
  assert.doesNotMatch(html, PRICE_LEAK, route + ': no Complete dollar amount pre-form');
  assert.doesNotMatch(html, /6aa5c974ceb12d9fc1a8c8ec/, route + ': no Complete pay link pre-form');
  for (const block of blocks(html)) {
    for (const node of nodes(block)) {
      if (node['@type'] !== 'OfferCatalog') continue;
      for (const item of node.itemListElement ?? []) {
        if (item.name === 'Dead River Complete' || item.url?.endsWith('/dead-river-complete')) {
          assert.equal(item.price, undefined, route + ': OfferCatalog must not price Complete');
          assert.equal(item.priceSpecification?.price, undefined);
        }
      }
    }
  }
}
const llms = readFileSync(join(dist, 'llms.txt'), 'utf8');
assert.doesNotMatch(llms, PRICE_LEAK);
assert.doesNotMatch(llms, OLD_PLAN_NAMES);
assert.doesNotMatch(llms, HOME_SHOP);
assert.doesNotMatch(llms, /\bhome shops?\b/i);
assert.doesNotMatch(stripTradeShops(llms), /\bshops\b/i, 'llms.txt audience shops');
assert.doesNotMatch(llms, JARGON);
assert.match(loadPage('/terms'), /Last updated: September 12, 2026/);
assert.match(loadPage('/dead-river-complete'), /data-success-redirect="\/watch"/);
assert.match(loadPage('/'), /What would a few more jobs mean for your business/);
assert.doesNotMatch(loadPage('/'), /What are 2 or 3 roofing jobs worth to you/);
assert.match(loadPage('/roofing-marketing-el-paso'), /What are 2 or 3 roofing jobs worth to you/);
assert.doesNotMatch(loadPage('/'), />llms\.txt</);
assert.match(loadPage('/'), /Front Desk AI/);
assert.match(loadPage('/'), />Example</);
assert.doesNotMatch(loadPage('/'), />Live</);
assert.match(loadPage('/essentials'), /Open secure checkout/);

const VOICE_DEMO = /228-4551|\+19152284551/;
assert.match(loadPage('/front-desk-complete'), /Call \(915\) 228-4551 to hear the voice AI\./);
assert.match(loadPage('/front-desk-complete'), /tel:\+19152284551/);
assert.match(loadPage('/front-desk-complete'), /This is a demo line\. To reach us, call \(915\) 228-3054\./);
assert.doesNotMatch(loadPage('/'), VOICE_DEMO, 'homepage must not publish the voice demo number');
assert.doesNotMatch(loadPage('/plans'), VOICE_DEMO, 'plans hub must not publish the voice demo number');
assert.doesNotMatch(llms, VOICE_DEMO, 'llms.txt NAP must stay the office line');
assert.match(loadPage('/'), /nav-phone[^>]*>\(915\) 228-3054/);
assert.match(loadPage('/front-desk-complete'), /nav-phone[^>]*>\(915\) 228-3054/);
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  for (const org of nodes(blocks(html)).filter((node) => {
    const type = node['@type'];
    return type === 'LocalBusiness' || (Array.isArray(type) && type.includes('LocalBusiness'));
  })) {
    assert.equal(org.telephone, '+19152283054', file + ': LocalBusiness telephone must stay the office line');
    assert.doesNotMatch(JSON.stringify(org), VOICE_DEMO, file + ': voice demo number leaked into LocalBusiness');
  }
}

const completePay = '6aa5c974ceb12d9fc1a8c8ec';
const heldPays = ['6a9d8352a7f78e147447f2d8', '6a9d7a7dceb12d9fc1a8b5b8'];
const publicRoutes = [
  '/', '/plans', '/dead-river-complete', '/essentials', '/front-desk-ai',
  '/front-desk-complete', '/local-visibility', '/search-growth', '/paid-growth', '/website',
];
for (const route of publicRoutes) {
  const html = loadPage(route);
  assert.doesNotMatch(html, new RegExp(completePay));
  for (const held of heldPays) assert.doesNotMatch(html, new RegExp(held));
}
assert.match(loadPage('/essentials'), /6aa5c810ceb12d9fc1a8c8ea/);
assert.match(loadPage('/front-desk-ai'), /6aa5c84bceb12d9fc1a8c8eb/);
assert.match(loadPage('/front-desk-complete'), /6aa5c88132f95ae35594a494/);
assert.match(loadPage('/search-growth'), /6aa5c8e732f95ae35594a496/);
assert.match(loadPage('/paid-growth'), /6aa5c91a32f95ae35594a497/);
assert.match(loadPage('/website'), /6aa5c94432f95ae35594a498/);
assert.match(loadPage('/website'), /Open secure checkout/);
assert.match(loadPage('/website'), /Card required/);
assert.match(loadPage('/website'), /after the build and review period/);
assert.doesNotMatch(loadPage('/website'), /free trial|after the trial|Pay \$97 for your first month/i);
assert.doesNotMatch(loadPage('/website'), /Checkout is not live yet/);
assert.match(loadPage('/local-visibility'), /6aa5c8b232f95ae35594a495/);
assert.match(loadPage('/local-visibility'), /Open secure checkout/);
assert.doesNotMatch(loadPage('/local-visibility'), /Checkout is not live yet/);
assert.match(loadPage('/plans'), /6aa5c8b232f95ae35594a495/);
for (const route of ['/', '/plans']) {
  const html = loadPage(route);
  assert.doesNotMatch(html, /6aa5c94432f95ae35594a498/, route + ': Website visitors must see the plan before checkout');
  assert.match(html, /href="\/website"[^>]*>\s*See the Website plan/, route + ': Website plan CTA must open /website');
}
assert.match(loadPage('/website'), /href="\/terms#plans-and-pay"/);
assert.match(loadPage('/terms'), /id="plans-and-pay"/);
assert.doesNotMatch(loadPage('/plans'), /Coming soon/);
assert.match(loadPage('/plans'), /6aa5c810ceb12d9fc1a8c8ea/);
assert.doesNotMatch(loadPage('/plans'), /6aa5c974ceb12d9fc1a8c8ec/);
assert.doesNotMatch(loadPage('/dead-river-complete'), /6aa5c974ceb12d9fc1a8c8ec/);
assert.match(loadPage('/paid-growth'), /\$997 setup/);
for (const route of ['/essentials', '/front-desk-ai', '/front-desk-complete']) {
  assert.match(loadPage(route), /Pay your first month to start/);
  assert.match(loadPage(route), /No setup fee/);
}
for (const route of ['/local-visibility', '/search-growth', '/website']) {
  assert.match(loadPage(route), /no setup fee/i);
}
assert.match(loadPage('/plans'), /Which plans have a setup fee/);
assert.match(loadPage('/terms'), /no setup fee/i);
assert.match(loadPage('/terms'), /\$997 setup/);
assert.match(loadPage('/watch'), new RegExp(completePay));
assert.match(loadPage('/flagship-offer'), new RegExp(completePay));
const completeSrc = readFileSync(resolve('src/data/complete-checkout.ts'), 'utf8');
assert.match(completeSrc, /COMPLETE_MONTHLY\s*=\s*2497/);
assert.match(completeSrc, /COMPLETE_SETUP\s*=\s*2497/);
assert.doesNotMatch(completeSrc, /2500/);
assert.doesNotMatch(loadPage('/watch'), PRICE_LEAK);
assert.doesNotMatch(loadPage('/flagship-offer'), PRICE_LEAK);

// Retired public URLs must be HTTP 301s in vercel.json only — no built HTML
// for aliases that never had a live slug file. SKU/river aliases collapse
// direct to /pricing (no hop through an intermediate plan page).
const oldPlanRedirects = {
  '/missed-call-rescue': '/pricing',
  '/front-desk-essentials': '/pricing',
  '/lead-rescue': '/pricing',
  '/website-rescue': '/pricing',
  '/local-growth': '/pricing',
  '/growth-engine': '/pricing',
  '/whole-river-plan': '/pricing',
  '/whole-river': '/pricing',
  '/the-whole-river': '/pricing',
  '/source-plan': '/pricing',
  '/current-plan': '/pricing',
  '/flood-plan': '/pricing',
  '/el-paso-home-services-marketing': '/',
  '/ai-receptionist-el-paso': '/',
  '/google-ads-management-el-paso': '/services/google-ads',
  '/social-media-management-el-paso': '/services/facebook-ads',
  '/web-design-el-paso': '/',
  '/ai-search-optimization-el-paso': '/marketing-advice/ai-search-for-local-business',
  '/google-business-profile-el-paso': '/locations/el-paso',
  '/local-seo-el-paso': '/locations/el-paso',
  '/welcome/missed-call-rescue': '/welcome/essentials',
  '/welcome/whole-river-plan': '/welcome/dead-river-complete',
};
for (const from of Object.keys(oldPlanRedirects)) {
  const pageFile = resolve('src/pages' + from + '.astro');
  assert.ok(!existsSync(pageFile), from + ': delete Astro shell so the URL cannot 200');
  const built = join(dist, from === '/' ? 'index.html' : from.slice(1) + '.html');
  assert.ok(!existsSync(built), from + ': must not emit a built HTML page (HTTP 200)');
}

const vercel = JSON.parse(readFileSync(resolve('vercel.json'), 'utf8'));
const vercelMap = Object.fromEntries(
  (vercel.redirects ?? [])
    .filter(rule => rule.statusCode === 301 && typeof rule.source === 'string')
    .map(rule => [rule.source, rule.destination]),
);
for (const [from, to] of Object.entries(oldPlanRedirects)) {
  assert.equal(vercelMap[from], to, 'vercel.json 301 missing for ' + from);
}

const sitemap = existsSync(join(dist, 'sitemap-0.xml'))
  ? readFileSync(join(dist, 'sitemap-0.xml'), 'utf8')
  : '';
for (const from of Object.keys(oldPlanRedirects)) {
  assert.doesNotMatch(
    sitemap,
    new RegExp('deadrivermanagement\\.com' + from.replaceAll('/', '\\/') + '</loc>'),
    'sitemap must not list ' + from,
  );
}
assert.doesNotMatch(sitemap, /deadrivermanagement\.com\/essentials<\/loc>/, 'sitemap must not list redirected /essentials');
assert.ok(!existsSync(resolve('src/pagehtml/whole-river-plan.html')), 'pagehtml/whole-river-plan.html must not exist');

const exactTitles = {
  '/': 'El Paso Job-Booking System for Home Services | Dead River',
  '/plans': 'Plans & Prices | Dead River Management El Paso',
  '/essentials': 'Never Miss a Call Again | Essentials $97 | Dead River',
  '/front-desk-ai': 'Text & Chat That Books Jobs | Front Desk AI $197',
  '/front-desk-complete': 'Phone Answered Day and Night | Front Desk Complete $497',
  '/local-visibility': 'Show Up in Local Search | Local Visibility $297',
  '/search-growth': 'More of the Right People Find You | Search Growth $497',
  '/paid-growth': 'A Steady Flow of New Job Leads | Paid Growth $997',
  '/website': '$0 Website That Turns Searches Into Calls | Dead River',
  '/dead-river-complete': 'Dead River Complete | Job-Booking System | 30 in 60',
};
const exactH1 = {
  '/': "Clicks don't pay the bills. Booked jobs do.",
  '/plans': "Start where it hurts. Grow when you're ready.",
  '/essentials': 'Never miss a job because you missed a call.',
  '/front-desk-ai': 'We answer texts and chat and book the job while you work.',
  '/front-desk-complete': 'We answer the phone day and night.',
  '/local-visibility': 'Show up when people near you search.',
  '/search-growth': 'More of the right people find you online.',
  '/paid-growth': 'A steady flow of new job leads.',
  '/website': 'A site that turns searches into calls.',
  '/dead-river-complete': 'Dead River Complete',
};
for (const [route, title] of Object.entries(exactTitles)) {
  const html = loadPage(route);
  const found = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  assert.equal(text(found), title, route + ': title mismatch');
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '';
  assert.equal(text(h1), exactH1[route], route + ': H1 mismatch');
}
assert.match(loadPage('/dead-river-complete'), /<h2[^>]*>[\s\S]*30 leads in 60 days or we work for free until we get them/);
assert.doesNotMatch(loadPage('/dead-river-complete'), PRICE_LEAK);
assert.match(
  loadPage('/dead-river-complete'),
  /Dead River Complete is the full lead-to-booking system for home service businesses\. 30 leads in 60 days or we work for free until we get them\. Price after a short form\. El Paso, TX\./,
);
assert.match(loadPage('/dead-river-complete'), /The written promise is: 30 leads in 60 days or we work for free until we get them/);
assert.match(loadPage('/dead-river-complete'), /The 60 days start when the whole system is live/);
assert.doesNotMatch(loadPage('/dead-river-complete'), /money-back|waive (our )?management fee/i);

const compareRoute = '/marketing-advice/el-paso-home-services-marketing-agency';
const compareHtml = loadPage(compareRoute);
assert.equal(
  text(compareHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ''),
  'El Paso Home Service Marketing: What to Compare',
  compareRoute + ': title mismatch',
);
assert.equal(
  text(compareHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? ''),
  'What to compare before you hire El Paso home service marketing',
  compareRoute + ': H1 mismatch',
);
assert.match(compareHtml, /<h2\b[^>]*>How to compare<\/h2>/);
assert.match(compareHtml, /<h2\b[^>]*>Dead River vs a custom system<\/h2>/);
assert.match(compareHtml, /<h2\b[^>]*>Prices in plain words<\/h2>/);
assert.match(compareHtml, />FAQ</);
assert.match(compareHtml, /Strategic Key Marketing/);
assert.match(compareHtml, /30 leads in 60 days or we work for free until we get them/);
assert.doesNotMatch(compareHtml, PRICE_LEAK);
assert.doesNotMatch(compareHtml, /money-back|waive (our )?management fee/i);
assert.doesNotMatch(compareHtml, OLD_PLAN_NAMES);
const compareFaq = {
  'Who should I hire for home service marketing in El Paso?':
    'Hire the team that helps you get found, answers when you can’t, and books the job. Dead River Management runs the lead-gen and job-booking system for home service businesses. We put plan prices on the site. Dead River Complete has this promise: 30 leads in 60 days or we work for free until we get them.',
  'What is the difference between Dead River Management and Strategic Key Marketing?':
    'Both are El Paso teams that sell ads, a site, follow-up, and AI as a system. Dead River Management shows plan prices and a written 30-leads promise on Dead River Complete. Strategic Key Marketing asks you to book a strategy session and does not publish plan prices or a lead-count promise.',
  'Do you only work in El Paso?':
    'We are based in El Paso and know the borderland. We also help home service businesses in other U.S. cities.',
  'How much do Dead River plans cost?':
    'Essentials is $97 a month. Front Desk AI is $197. Front Desk Complete is $497. Local Visibility is $297. Search Growth is $497. Paid Growth is $997 a month plus $997 setup. You pay the ad platforms for ads. Website is $0 to build and $97 a month for 12 months. Dead River Complete price comes after a short form.',
};
const compareFaqNodes = nodes(blocks(compareHtml)).filter(node => node['@type'] === 'Question');
assert.equal(compareFaqNodes.length, 4, compareRoute + ': FAQPage must have exactly 4 questions');
for (const [question, answer] of Object.entries(compareFaq)) {
  const node = compareFaqNodes.find(item => item.name === question);
  assert.ok(node, compareRoute + ': FAQPage missing: ' + question);
  assert.equal(text(node.acceptedAnswer?.text ?? ''), answer, compareRoute + ': FAQPage answer drift: ' + question);
}
for (const node of nodes(blocks(compareHtml))) {
  const type = node['@type'];
  const isOrg = type === 'Organization' || (Array.isArray(type) && type.includes('Organization'));
  assert.ok(!(isOrg && /strategic key/i.test(String(node.name ?? ''))), 'Do not add SKM as Organization');
}

const homeFaqNodes = nodes(blocks(loadPage('/'))).filter(node => node['@type'] === 'Question');
assert.equal(homeFaqNodes.length, 7, 'home FAQPage must have exactly 7 questions');
const homeFaqExact = {
  'What does Dead River Management do?':
    'Dead River Management runs the lead-gen and job-booking system for home service businesses. Ads, landing pages, calls and forms, follow-up, CRM, booking, reporting, and AI front office — sold alone or as one system. We are based in El Paso. Call (915) 228-3054.',
  'Is Dead River Management the same as Dead River Company?':
    'No. Dead River Management is an El Paso team that runs the job-booking system for home service businesses. Dead River Company is a fuel company in New England. We are not the same company.',
  'What is Dead River Complete?':
    'Dead River Complete is our full done-for-you plan. The whole system runs as one. The written promise is: 30 leads in 60 days or we work for free until we get them. Price comes after a short form. Ad spend is separate and paid by you.',
  'How much do plans cost?':
    'Essentials is $97 a month. Front Desk AI is $197. Front Desk Complete is $497. Local Visibility is $297. Search Growth is $497. Paid Growth is $997 a month plus $997 setup. You pay the ad platforms for ads. Website is $0 to build and $97 a month for 12 months. Dead River Complete price comes after a short form.',
  'Which plan do I need?':
    'Missing calls? Start with Essentials or Front Desk AI. Need the phone answered day and night? Front Desk Complete. Need more local search? Local Visibility or Search Growth. Want a steady flow of new jobs? Paid Growth. Want the whole system? Dead River Complete.',
  'How does the 30 leads in 60 days promise work?':
    'It is only on Dead River Complete. If you do not get 30 real leads in 60 days, we work for free until we get them. Ad spend and setup rules still apply. Spam and junk do not count as leads.',
  'Do you only work in El Paso?':
    'We are based in El Paso and know the borderland. We also help home service businesses in other U.S. cities.',
};
for (const [question, answer] of Object.entries(homeFaqExact)) {
  const node = homeFaqNodes.find(item => item.name === question);
  assert.ok(node, 'home FAQPage missing: ' + question);
  assert.equal(text(node.acceptedAnswer?.text ?? ''), answer, 'home FAQPage answer drift: ' + question);
}

const catalog = nodes(blocks(loadPage('/'))).find(node => node['@type'] === 'OfferCatalog');
const offerNames = (catalog?.itemListElement ?? []).map(item => item.name);
assert.deepEqual(offerNames, [
  'Essentials', 'Front Desk AI', 'Front Desk Complete', 'Local Visibility',
  'Search Growth', 'Paid Growth', 'Website', 'Dead River Complete',
]);
const completeOffer = (catalog?.itemListElement ?? []).find(item => item.name === 'Dead River Complete');
assert.equal(completeOffer?.price, undefined);
assert.match(completeOffer?.description ?? '', /30 leads in 60 days or we work for free until we get them/);
const essentialsOffer = (catalog?.itemListElement ?? []).find(item => item.name === 'Essentials');
assert.match(essentialsOffer?.url ?? '', /deadrivermanagement\.com\/essentials$/);
assert.doesNotMatch(essentialsOffer?.url ?? '', /front-desk-essentials/);
const essentialsPageOffers = nodes(blocks(loadPage('/essentials'))).filter(node => node['@type'] === 'Offer');
assert.ok(essentialsPageOffers.some(node => /deadrivermanagement\.com\/essentials$/.test(node.url ?? '')));
assert.ok(essentialsPageOffers.every(node => !/front-desk-essentials/.test(node.url ?? '')));

const GUARANTEE = '30 leads in 60 days or we work for free until we get them';
const homeVisible = loadPage('/')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<meta\b[^>]*>/gi, ' ')
  .replace(/<title>[\s\S]*?<\/title>/gi, ' ')
  .replace(/<link\b[^>]*>/gi, ' ');
const guaranteeRe = new RegExp(GUARANTEE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
assert.equal(
  (homeVisible.match(guaranteeRe) || []).length,
  2,
  'visible homepage body must print the exact guarantee on the Complete card and the Complete FAQ',
);
const plansVisible = loadPage('/plans')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<meta\b[^>]*>/gi, ' ')
  .replace(/<title>[\s\S]*?<\/title>/gi, ' ')
  .replace(/<link\b[^>]*>/gi, ' ');
assert.equal(
  (plansVisible.match(guaranteeRe) || []).length,
  1,
  'visible plans body must print the exact guarantee once (Complete card only)',
);

const org = orgNodes[0];
assert.ok(org.disambiguatingDescription, 'LocalBusiness needs fuel disambiguatingDescription');
assert.equal(
  org.disambiguatingDescription,
  'Dead River Management is an El Paso, TX marketing and AI team for home service businesses. Not Dead River Company, the New England fuel company.',
);
assert.equal(
  org.description,
  'Dead River Management is an El Paso, TX marketing and AI team for home service businesses. We get you leads. We answer when you can’t. We book the job. Not Dead River Company (New England fuel).',
);
assert.deepEqual(
  org.alternateName,
  ['Dead River Management El Paso', 'DRM El Paso'],
  'alternateName must stay the two El Paso forms only',
);
assert.ok(!(org.alternateName ?? []).includes('Dead River'), 'Do not add bare Dead River as alternateName');
const APPROVED_ORG_LINKEDIN = 'https://www.linkedin.com/company/dead-river-management';
const orgCompanyLinkedIn = (org.sameAs ?? []).filter(href => /linkedin\.com\/company/i.test(href));
assert.deepEqual(
  orgCompanyLinkedIn,
  [APPROVED_ORG_LINKEDIN],
  'Organization sameAs may include only the Brandon-approved LinkedIn company URL',
);
assert.ok((org.sameAs ?? []).includes('https://www.facebook.com/profile.php?id=61590635130563'), 'Organization sameAs must keep Facebook');
assert.ok((org.sameAs ?? []).includes('https://www.instagram.com/deadrivermmgt/'), 'Organization sameAs must keep Instagram');
assert.ok((org.sameAs ?? []).includes('https://clutch.co/profile/dead-river-management'), 'Organization sameAs must keep Clutch');
assert.ok((org.sameAs ?? []).includes('https://www.youtube.com/@DeadRiverManagement'), 'Organization sameAs must keep YouTube');
assert.ok((org.sameAs ?? []).some(href => /share\.google/.test(href)), 'LocalBusiness needs GBP sameAs');
assert.deepEqual(
  org.founder?.sameAs ?? [],
  [
    'https://www.tiktok.com/@brandonaubey',
    'https://www.linkedin.com/in/brandon-aubey-6a5aa1393',
  ],
  'Do not change founder Person sameAs',
);
assert.match(llms, /Dead River Management \(El Paso, TX\) helps home service businesses get found, answer leads, and book jobs/);
assert.match(llms, /Not Dead River Company \(New England fuel\)\. We do not sell fuel/);
assert.match(llms, /Phone: \(915\) 228-3054\. City-only location: El Paso, TX/);
assert.match(llms, /Entity: Dead River Management = marketing and AI for home service businesses \(El Paso, TX\)\./);
assert.match(llms, /Not the same as Dead River Company \(fuel \/ heating oil \/ propane, New England\)\./);
assert.match(llms, /Parcel Management Group case study.*49 job leads at \$17\.70 each \(August 11–September 9, 2026\)/);
assert.doesNotMatch(llms, /## Unbranded El Paso hub/);
assert.doesNotMatch(llms, /them\.\./);
assert.doesNotMatch(
  llms,
  /Dead River Complete says: 30 leads in 60 days or we work for free until we get them/,
  'llms.txt must not cite Complete 30-in-60 as an active public offer',
);
assert.match(
  llms,
  /What to check before you buy a written lead promise\. Ask what a lead is\. Ask what happens if they miss\. Talk through current nationwide plans: https:\/\/www\.deadrivermanagement\.com\/book/,
);
assert.doesNotMatch(llms, /\/talk/, 'llms.txt must not cite /talk');
assert.doesNotMatch(llms, /\/pricing/, 'llms.txt must not cite /pricing');
assert.doesNotMatch(llms, AGENCY_PLAN_DOLLARS, 'llms.txt must not publish agency plan dollars');
assert.doesNotMatch(publicText, AGENCY_PLAN_DOLLARS, 'public HTML must not publish agency plan dollars');
assert.match(loadPage('/'), /Not Dead River Company \(fuel\)/);
assert.match(loadPage('/about'), /Does Dead River Management sell fuel/);
assert.match(loadPage('/about'), /I searched Dead River and saw a fuel company/);
assert.match(
  loadPage('/about'),
  /Dead River Management is an El Paso marketing and AI team for home service businesses\. We help you get found, answer when you can’t, and book the job\. We are not Dead River Company, the fuel company\./,
);

const hubRoute = '/el-paso-home-services-marketing';
assert.equal(vercelMap[hubRoute], '/', 'Hub must 301 to /');
assert.ok(!existsSync(join(dist, 'el-paso-home-services-marketing.html')), 'Hub must not emit Base HTML');
assert.doesNotMatch(
  sitemap,
  /deadrivermanagement\.com\/el-paso-home-services-marketing<\/loc>/,
  'sitemap must not list the retired hub',
);
assert.equal(vercelMap['/marketing-advice/el-paso-home-services-marketing-agency'], undefined, 'Do not 301 the comparison article');
assert.match(loadPage('/dead-river-complete'), /What Complete runs/);
assert.match(loadPage('/dead-river-complete'), /Start with the short form/);
assert.match(loadPage('/dead-river-complete'), /El Paso, TX · city only/);
assert.doesNotMatch(publicText, /we are an?( el paso)? digital marketing agency/i);
assert.doesNotMatch(publicText, /el paso digital marketing agency/i);
for (const file of files) {
  for (const node of nodes(blocks(readFileSync(file, 'utf8')))) {
    const type = node['@type'];
    const isOrg = type === 'Organization' || (Array.isArray(type) && type.includes('Organization'));
    assert.ok(
      !(isOrg && /strategic key/i.test(String(node.name ?? ''))),
      'Do not add SKM as Organization: ' + file,
    );
  }
}

console.log(JSON.stringify({ pages: files.length, jsonLdBlocks: jsonCount, matchedFaqs: faqCount, status: 'passed' }));
