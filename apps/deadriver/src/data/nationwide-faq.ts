/** Quinn nationwide GP FAQ pastes — visible copy and FAQPage schema must match exactly. */

export type FaqItem = { q: string; a: string };

export const homeFaq: FaqItem[] = [
  {
    q: 'What does Dead River Management actually do?',
    a: 'We build and manage the infrastructure behind growth. Foundation puts tracking, CRM and pipeline, booking, and follow-up in place. Growth Partner adds a managed acquisition strategy and ongoing conversion work. Scale expands across more channels with deeper retention and strategy. Talk through scope at deadrivermanagement.com/book.',
  },
  {
    q: 'Do you only work with businesses in El Paso?',
    a: 'No. We are based in El Paso, Texas, and work with growing businesses nationwide. Every engagement is run remotely with a named strategist, shared reporting, and a regular review rhythm.',
  },
  {
    q: 'How long is the commitment?',
    a: 'Engagements begin with a three-month initial commitment, then continue month to month with 30-day notice.',
  },
  {
    q: 'Do we need a new website?',
    a: 'Not necessarily. We start by finding what is limiting conversion. Campaign landing pages and conversion improvements are included in the agreed scope. Full rebuilds and major rebrands are quoted separately.',
  },
  {
    q: 'Is Demand Intelligence included?',
    a: 'Audience intelligence informs research and targeting across the engagements where it is useful. Full platform access, covering both B2B and B2C purchase-intent audiences, is a standalone product at $3,000/month with no setup fee. See Demand Intelligence.',
  },
  {
    q: 'How much do nationwide plans cost?',
    a: 'Scope and fees for Foundation, Growth Partner, and Scale are confirmed before you start. Book a conversation at deadrivermanagement.com/book or call (915) 228-3054.',
  },
  {
    q: 'Is Dead River Management the same as Dead River Company?',
    a: 'No. Not Dead River Company (New England fuel) — we do not sell fuel. Dead River Management is a growth partner based in El Paso, Texas, working with businesses nationwide.',
  },
];

export const pricingFaq: FaqItem[] = [
  {
    q: 'What is the difference between Foundation, Growth Partner, and Scale?',
    a: 'Foundation is a focused 90-day engagement that builds tracking, follow-up, conversion, and customer systems when demand already exists. Growth Partner is your managed growth engine — primary acquisition, conversion path, and reporting. Scale expands what is already working across more channels with deeper retention and strategy.',
  },
  {
    q: 'What is included in the monthly fee?',
    a: 'The fee covers strategy and management for the agreed scope. Setup is confirmed in the signed agreement before work starts.',
  },
  {
    q: 'How long do I have to stay?',
    a: 'Three-month initial commitment, then month to month with 30-day notice.',
  },
  {
    q: 'What is Dead River Demand Intelligence?',
    a: 'A standalone platform at $3,000/month with no setup fee. It helps you see where demand is forming and build higher-opportunity B2B and B2C audiences. It is not automatic inside Foundation, Growth Partner, or Scale — full access is sold separately. See Demand Intelligence.',
  },
  {
    q: 'Do you still sell Dead River Complete or Front Desk plans?',
    a: 'No. Those older offers are retired. Current nationwide engagements are Foundation, Growth Partner, and Scale on this page.',
  },
  {
    q: 'Who is a good fit?',
    a: 'Growing businesses that are ready for a connected system — acquisition, conversion, follow-up, and measurement — not a pile of disconnected vendors. We work nationwide from El Paso, Texas.',
  },
  {
    q: 'How do I start?',
    a: 'Call (915) 228-3054 or email brandon@deadrivermanagement.com.',
  },
];

export const homeServicesFaq: FaqItem[] = [
  {
    q: 'Do you work with HVAC, plumbing, roofing, and other trades?',
    a: 'Yes. We partner with home services businesses nationwide — HVAC, plumbing, roofing, electrical, and related trades — wherever you operate.',
  },
  {
    q: 'Which plan should a home services company start with?',
    a: 'If infrastructure needs work first — tracking, booking, follow-up — start with Foundation. If you already have traction and want a managed acquisition strategy, Growth Partner is the usual fit. Scale is for teams ready to expand channels and deepen retention.',
  },
  {
    q: 'Do you only serve El Paso home services?',
    a: 'No. We are based in El Paso and work with home services businesses across the U.S.',
  },
  {
    q: 'Is missed-call recovery part of Growth Partner?',
    a: 'Growth Partner brings your primary acquisition channel together with missed-call recovery, CRM and pipeline, booking, estimate follow-up, and reporting, shaped around your trade and service area. Exact scope is confirmed before you start. Book a conversation at deadrivermanagement.com/book.',
  },
  {
    q: 'Are written lead promises part of current plans?',
    a: 'Current public engagements are Foundation, Growth Partner, and Scale. Older written lead promises are not active public offers. Ask what a lead means and what happens if targets are missed before you buy any promise from anyone.',
  },
  {
    q: 'How do I get pricing?',
    a: 'Scope and fees for Foundation, Growth Partner, and Scale are confirmed before you start. Call (915) 228-3054.',
  },
];

export const elPasoLocationFaq: FaqItem[] = [
  {
    q: 'Are you an El Paso-only agency?',
    a: 'We are based in El Paso, Texas, and serve growing businesses nationwide. This page is for local context. Nationwide plans are Foundation, Growth Partner, and Scale.',
  },
  {
    q: 'What plans do you offer now?',
    a: 'Foundation, Growth Partner, and Scale, plus optional Demand Intelligence. Book a conversation to talk through scope.',
  },
];

/** Live sitemap keep list from Quinn pack 02-sitemap-llms.md */
export const sitemapKeepPaths = [
  '/',
  '/demand-intelligence',
  '/audience-builder',
  '/website-visitor-identification',
  '/intent-data-providers',
  '/solutions',
  '/book',
  '/demo',
  '/company',
  '/resources',
  '/advice',
  '/advice/lead-response-time',
  '/advice/after-a-bad-agency',
  '/privacy',
  '/terms',
  '/locations',
  '/locations/el-paso',
  '/services/facebook-ads',
  '/services/google-ads',
  '/services/google-local-services-ads',
  '/services/seo',
  '/services/local-seo',
  '/services/cold-email',
  '/work',
  '/work/parcel-management-group',
  '/work/wicked-logistics',
  '/work/only-fish',
  '/tools',
  '/tools/campaign-roi',
  '/tools/customer-acquisition-cost',
  '/tools/revenue-goal',
  '/tools/ad-budget',
  '/tools/lead-response',
  '/tools/growth-readiness',
  '/tools/website-conversion',
  '/tools/seo-foundations',
  '/tools/search-preview',
  '/tools/campaign-url',
  '/marketing-advice',
  '/marketing-advice/30-leads-in-60-days-guarantee',
  '/marketing-advice/ai-receptionist-cost',
  '/marketing-advice/ai-search-for-local-business',
  '/marketing-advice/el-paso-home-services-marketing-agency',
  '/marketing-advice/facebook-ads-for-plumbers',
  '/legal/advertising',
  '/legal/cookies',
  '/legal/guarantee',
  '/legal/industries',
  '/legal/sms',
] as const;
