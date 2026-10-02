// Single source of truth for business facts, navigation and reusable copy.
// The monthly SEO routine edits titles/descriptions in src/data/seo.ts and
// adds posts in src/content/blog/, it should not need to touch layouts.

export const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61590635130563', icon: 'facebook', owner: 'org' },
  { label: 'Instagram', href: 'https://www.instagram.com/deadrivermmgt/', icon: 'instagram', owner: 'org' },
  { label: 'Clutch reviews', href: 'https://clutch.co/profile/dead-river-management', icon: 'star', owner: 'org' },
  { label: 'Upwork', href: 'https://www.upwork.com/freelancers/deadrivermanagement', icon: 'upwork', owner: 'org' },
  { label: 'YouTube', href: 'https://www.youtube.com/@DeadRiverManagement', icon: 'youtube', owner: 'org' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@brandonaubey', icon: 'tiktok', owner: 'founder' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/brandon-aubey-6a5aa1393', icon: 'linkedin', owner: 'founder' },
] as const;

/** Brandon-approved company page (via Rowan). Do not invent other company slugs. */
export const orgLinkedInSameAs = [
  'https://www.linkedin.com/company/dead-river-management',
] as const;

export const gbpSameAs = [
  'https://share.google/IHlnxWuhF4l4iffsl',
] as const;

export const GUARANTEE_LINE =
  '30 leads in 60 days or we work for free until we get them.';

/** Organization schema description. Fuel disambiguation stays short. */
export const ORG_DESCRIPTION =
  'Dead River Management is an El Paso, TX marketing and AI team for home service businesses. We get you leads. We answer when you can’t. We book the job. Not Dead River Company (New England fuel).';

export const USAGE_NOTE =
  'Texts, calls, and AI use are billed at what they cost us. We do not add extra. Ad spend is extra and paid by you.';

export const NO_SETUP_LINE = 'No setup fee.';
export const FRONT_DESK_DAY_ONE = 'No setup fee. Pay your first month to start.';
export const PAID_GROWTH_SETUP_LINE = '$997 setup. Then $997 a month. You pay ad spend on the side.';

export const HOURS_LINE = 'Mon–Sat 9–6 Mountain Time';
export const TEAM_SUPPORT_LINE =
  `Team support: ${HOURS_LINE}. After hours, our AI system can still book jobs.`;

/** Visitors can call this to hear the voice AI. Not the office / NAP / GBP number. */
export const VOICE_DEMO_PHONE = '(915) 228-4551';
export const VOICE_DEMO_PHONE_E164 = '+19152284551';
export const VOICE_DEMO_CTA = 'Call (915) 228-4551 to hear the voice AI.';
export const VOICE_DEMO_NOTE = 'This is a demo line. To reach us, call (915) 228-3054.';

export const voiceDemoFaq = {
  q: 'Can I hear the voice AI first?',
  a: 'Yes. Call (915) 228-4551. You will hear it pick up. That is a demo line. To reach us, call (915) 228-3054.',
} as const;

export const business = {
  name: 'Dead River Management',
  legalName: 'Dead River Management',
  tagline: 'We get you leads. We book the job.',
  phone: '(915) 228-3054',
  phoneE164: '+19152283054',
  email: 'brandon@deadrivermanagement.com',
  street: '416 N. Stanton St, Suite 120-M',
  postalCode: '79901',
  city: 'El Paso',
  region: 'TX',
  country: 'US',
  timeZone: 'America/Denver',
  openingHours: {
    open: {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const,
      opens: '09:00',
      closes: '18:00',
    },
    closed: {
      dayOfWeek: ['Sunday'] as const,
    },
  },
  disambiguatingDescription:
    'Dead River Management is an El Paso, TX marketing and AI team for home service businesses. Not Dead River Company, the New England fuel company.',
  alternateName: ['Dead River Management El Paso', 'DRM El Paso'] as const,
  url: 'https://www.deadrivermanagement.com',
  founder: 'Brandon Aubey',
  founderTitle: 'Founder',
  founderBio: 'Ten years helping local businesses get more jobs.',
  serviceArea: [
    'Westside El Paso', 'Eastside El Paso', 'Northeast El Paso', 'Lower Valley',
    'Horizon City', 'Socorro', 'Canutillo', 'Sunland Park, NM', 'Las Cruces, NM',
  ],
  footerBlurb:
    'We help home service businesses in El Paso and the borderland get more jobs. Westside, Eastside, Northeast, Lower Valley, Horizon City, Socorro, Canutillo, plus Sunland Park and Las Cruces, NM. We also help home service businesses in other towns.',
  gtmId: 'GTM-TPRWMXP9',
  fbPixelId: '4422109568077296',
  googleAdsId: 'AW-18438589761',
  googleAdsLeadLabel: 'LltgCOHGxPEcEMGamthE',
  walkthroughVideo: '/videos/walkthrough.mp4?v=20260916',
  sameAs: [
    ...socials.filter((s) => s.owner === 'org').map((s) => s.href),
    ...orgLinkedInSameAs,
    ...gbpSameAs,
  ],
  founderSameAs: socials.filter((s) => s.owner === 'founder').map((s) => s.href),
  leadEndpoint: import.meta.env.PUBLIC_LEAD_FORMS === 'off' ? '' : '/api/lead',
};

export const PLAN_SLUGS = [
  'essentials',
  'front-desk-ai',
  'front-desk-complete',
  'local-visibility',
  'search-growth',
  'paid-growth',
  'website',
  'dead-river-complete',
] as const;

export const nav = {
  main: [
    { label: 'Plans', href: '/plans' },
    { label: 'Services', href: '/services' },
    { label: 'Advice', href: '/marketing-advice' },
    { label: 'About', href: '/about' },
  ],
  plans: [
    { label: 'Essentials', href: '/essentials' },
    { label: 'Front Desk AI', href: '/front-desk-ai' },
    { label: 'Front Desk Complete', href: '/front-desk-complete' },
    { label: 'Local Visibility', href: '/local-visibility' },
    { label: 'Search Growth', href: '/search-growth' },
    { label: 'Paid Growth', href: '/paid-growth' },
    { label: 'Website', href: '/website' },
    { label: 'Dead River Complete', href: '/dead-river-complete' },
  ],
  services: [
    { label: 'Front desk', href: '/ai-receptionist-el-paso' },
    { label: 'Show up in search', href: '/local-seo-el-paso' },
    { label: 'Google listing', href: '/google-business-profile-el-paso' },
    { label: 'New job leads', href: '/google-ads-management-el-paso' },
    { label: 'Websites', href: '/web-design-el-paso' },
    { label: 'El Paso home service marketing', href: '/el-paso-home-services-marketing' },
  ],
  company: [
    { label: 'Advice', href: '/marketing-advice' },
    { label: 'About', href: '/about' },
    { label: 'Case studies', href: '/case-studies/wicked-logistics' },
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of service', href: '/terms' },
  ],
};

export const FASTPAY = {
  essentials: 'https://link.fastpaydirect.com/payment-link/6aa5c810ceb12d9fc1a8c8ea',
  'front-desk-ai': 'https://link.fastpaydirect.com/payment-link/6aa5c84bceb12d9fc1a8c8eb',
  'front-desk-complete': 'https://link.fastpaydirect.com/payment-link/6aa5c88132f95ae35594a494',
  'search-growth': 'https://link.fastpaydirect.com/payment-link/6aa5c8e732f95ae35594a496',
  'paid-growth': 'https://link.fastpaydirect.com/payment-link/6aa5c91a32f95ae35594a497',
  website: 'https://link.fastpaydirect.com/payment-link/6aa5c94432f95ae35594a498',
  'local-visibility': 'https://link.fastpaydirect.com/payment-link/6aa5c8b232f95ae35594a495',
} as const;

export type PlanGroup = 'front-desk' | 'marketing' | 'website' | 'complete';

export type Plan = {
  slug: string;
  group: PlanGroup;
  name: string;
  headline: string;
  kicker: string;
  price: string;
  priceNote: string;
  monthly: number | null;
  blurb: string;
  features: string[];
  benefits: string[];
  cta: string;
  paymentLink: string | null;
  term?: string;
  usageNote?: string;
  guarantee?: boolean;
  hidePrice?: boolean;
  // Link may be stored while holdCheckout is true. Call or text only until wired.
  holdCheckout?: boolean;
};

export const plans: Plan[] = [
  {
    slug: 'essentials',
    usageNote: 'Texts are billed at what they cost us. We do not add extra.',
    group: 'front-desk',
    name: 'Essentials',
    headline: 'Never miss a job because you missed a call.',
    kicker: 'Missed the call?',
    price: '$97',
    priceNote: '/month',
    monthly: 97,
    blurb: 'Never miss a job because you missed a call.',
    features: [
      'We text back when you miss a call',
      'The text comes from your business',
      'You keep the thread',
      'No chat bot',
      'No voice AI',
    ],
    benefits: [
      'The person who called you does not hang up and call the next name.',
      'The text looks like it came from you, not a stranger.',
      'The whole talk stays in your phone.',
      'This plan is text-back only. No site chat.',
      'We do not pick up the phone on this plan.',
    ],
    cta: 'Start Essentials',
    paymentLink: FASTPAY.essentials,
    term: FRONT_DESK_DAY_ONE,
  },
  {
    slug: 'front-desk-ai',
    usageNote: 'Texts and AI chat use are billed at what they cost us. We do not add extra.',
    group: 'front-desk',
    name: 'Front Desk AI',
    headline: 'We answer texts and chat and book the job while you work.',
    kicker: 'Busy on a job?',
    price: '$197',
    priceNote: '/month',
    monthly: 197,
    blurb: 'We answer texts and chat and book the job while you work.',
    features: [
      'We answer texts',
      'We answer chat on your site',
      'We book the job on your calendar',
      'You keep doing the work',
    ],
    benefits: [
      'After-hours texts still get a reply.',
      'People on your site can talk now, not wait.',
      'A yes turns into a time on the calendar.',
      'You stay on the job while we handle texts and chat.',
    ],
    cta: 'Start Front Desk AI',
    paymentLink: FASTPAY['front-desk-ai'],
    term: FRONT_DESK_DAY_ONE,
  },
  {
    slug: 'front-desk-complete',
    usageNote: 'Calls, texts, and AI use are billed at what they cost us. We do not add extra.',
    group: 'front-desk',
    name: 'Front Desk Complete',
    headline: 'We answer the phone day and night.',
    kicker: 'Need the phone picked up?',
    price: '$497',
    priceNote: '/month',
    monthly: 497,
    blurb: 'We answer the phone day and night.',
    features: [
      'AI picks up the phone day and night',
      'We book the job or send the call to you',
      'Texts and chat are covered too',
      'AI answers for your business',
    ],
    benefits: [
      'Nights and weekends still get a voice on the line.',
      'A yes becomes a time, or the call comes to you.',
      'Texts and site chat are covered the same way.',
      'The AI can send the call to your team when the caller needs you.',
    ],
    cta: 'Start Front Desk Complete',
    paymentLink: FASTPAY['front-desk-complete'],
    term: FRONT_DESK_DAY_ONE,
  },
  {
    slug: 'local-visibility',
    usageNote: 'Review texts cost extra, at what they cost us. Front Desk is sold on its own.',
    group: 'marketing',
    name: 'Local Visibility',
    headline: 'Show up when people near you search.',
    kicker: 'People near you search.',
    price: '$297',
    priceNote: '/month',
    monthly: 297,
    blurb: 'Show up when people near you search.',
    features: [
      'We fix your Google listing',
      'We post on it each month',
      'We ask for reviews after jobs',
      'We reply to reviews',
    ],
    benefits: [
      'Your listing looks open and real, not empty.',
      'People near you see that you are still at work.',
      'New reviews help the next person pick you.',
      'A reply shows you care after the job.',
    ],
    cta: 'Start Local Visibility',
    paymentLink: FASTPAY['local-visibility'],
    term: 'No setup fee. Month to month.',
  },
  {
    slug: 'search-growth',
    usageNote: 'Review texts cost extra, at what they cost us. Front Desk is sold on its own.',
    group: 'marketing',
    name: 'Search Growth',
    headline: 'More of the right people find you online.',
    kicker: 'Need more of the right people?',
    price: '$497',
    priceNote: '/month',
    monthly: 497,
    blurb: 'More of the right people find you online.',
    features: [
      'Two new or better pages each month',
      'Pages built so people can find you',
      'We keep your listing strong',
      'More of the right people see you',
    ],
    benefits: [
      'Fresh pages give people a new way to find you.',
      'You show up when someone types the job you do.',
      'We keep your Google listing up to date.',
      'The people who need that job can reach you.',
    ],
    cta: 'Start Search Growth',
    paymentLink: FASTPAY['search-growth'],
    term: 'No setup fee. Month to month.',
  },
  {
    slug: 'paid-growth',
    usageNote: '$997 setup. You pay Google or Meta for ads. Review texts cost extra, at cost. Front Desk is sold on its own.',
    group: 'marketing',
    name: 'Paid Growth',
    headline: 'A steady flow of new job leads.',
    kicker: 'Need a steady flow of jobs?',
    price: '$997',
    priceNote: '/month + $997 setup + ad spend',
    monthly: 997,
    blurb: 'A steady flow of new job leads.',
    features: [
      'A steady flow of new job leads',
      'A $997 setup to turn the ads on',
      'Google or Meta, we pick what fits',
      'You pay the ad spend on the side',
    ],
    benefits: [
      'New people who need the job see you each week.',
      'We turn the ads on the right way the first time.',
      'The ads run where your buyers actually look.',
      'Ad spend is separate. You pay the ad platforms.',
    ],
    cta: 'Start Paid Growth',
    paymentLink: FASTPAY['paid-growth'],
    term: PAID_GROWTH_SETUP_LINE,
  },
  {
    slug: 'website',
    usageNote: '$0 today. Card required before we build. After the build and review period, $97 a month with a 12-month commitment. Text alerts cost extra, at cost.',
    group: 'website',
    name: 'Website',
    headline: 'A site that turns searches into calls.',
    kicker: 'Need a site that brings you calls?',
    price: '$0',
    priceNote: 'design · $97/mo for 12 months',
    monthly: 97,
    blurb: 'A site that turns searches into calls.',
    features: [
      '$0 to build',
      '$97 a month for 12 months',
      'Works on a phone',
      'Tap to call',
      'We host it and keep it up',
    ],
    benefits: [
      'You do not pay a big bill to get a site live.',
      'A clear monthly price for a full year.',
      'People can read it on the truck, not just a desk.',
      'One tap and the phone rings.',
      'We keep it up so you do not have to.',
    ],
    cta: 'Get the site',
    paymentLink: FASTPAY.website,
    term: '$0 today. Card required. Then $97/month after the build and review period. 12-month commitment.',
  },
  {
    slug: 'dead-river-complete',
    group: 'complete',
    name: 'Dead River Complete',
    headline: 'Dead River Complete',
    kicker: 'Want the whole job done for you?',
    price: 'Flagship',
    priceNote: 'Watch the short video. Then see the price.',
    monthly: null,
    blurb: 'We get you leads. We answer when you can’t. We book the job. The full plan, run by us.',
    features: [
      'We get you leads',
      'We answer the phone when you can’t',
      'We book the job while you sleep',
      GUARANTEE_LINE,
    ],
    benefits: [
      'People who need the job see you.',
      'When they reach out, they get a reply.',
      'A yes becomes a time on the calendar.',
      'If we miss the count, we keep working for free until we get them.',
    ],
    cta: 'See if it fits',
    paymentLink: null,
    guarantee: true,
    hidePrice: true,
    term: 'Short form first. Then a short video. Then the price.',
  },
];

export const planGroups: { id: PlanGroup; title: string; lede: string }[] = [
  { id: 'front-desk', title: 'Front Desk', lede: 'Never lose a job because no one picked up.' },
  { id: 'marketing', title: 'Get found', lede: 'More of the right people find you and call.' },
  { id: 'website', title: 'Website', lede: 'A site that turns searches into calls.' },
  { id: 'complete', title: 'Dead River Complete', lede: 'The whole plan. Done for you.' },
];

export const testimonials = [
  {
    quote:
      'We got almost 90 leads in 2 months! Very easy to work with. Best part was the no pressure sales. We watched a video and had a phone call and then got everything set up in less than a week.',
    name: 'Magda Aubey',
    source: 'Google',
  },
  {
    quote:
      "They designed our company's website and changed how we receive leads. We were able to get multiple leads a day and secured several contracts.",
    name: 'Christina Hernandez',
    source: 'Google',
  },
  {
    quote:
      'They did all of our social media management, set up our website, and optimized everything. We get 5 to 6 calls and multiple emails a day for shipments.',
    name: 'Local business owner',
    source: 'Facebook',
  },
  {
    quote: 'Very satisfied with my service, got tons of leads with it.',
    name: 'Mat S.',
    source: 'Google',
  },
];

export const completeWhatIs =
  'Dead River Complete is our full done-for-you plan. Ads, website, front desk, Google, and follow-up run as one system. It has this promise: ' +
  GUARANTEE_LINE;

export const completeWhatIsVisible =
  'Dead River Complete is our full done-for-you plan. Ads, website, front desk, Google, and follow-up run as one system. See Dead River Complete for the written 30-leads promise.';

export const completeCitability = [
  'Dead River Complete is our full done-for-you plan for home service businesses. Ads, website, front desk, Google, and follow-up run as one system.',
  'The written promise is: ' + GUARANTEE_LINE,
  'A lead is a real person who calls, texts, or fills out a form. Spam, junk, vendors, job applicants, and duplicate contacts do not count. Clicks, views, and followers are not leads.',
  'The promise is only on Dead River Complete. Ad spend is separate. You pay Google or Meta. Setup rules still apply. Price comes after a short form, then a short video.',
  'Dead River Management is in El Paso, TX. Call (915) 228-3054.',
] as const;

export const completePromiseSteps = [
  'You are on Dead River Complete.',
  'The 60 days start when the whole system is live.',
  'We count real people who call, text, or fill out a form.',
  'If you get fewer than 30 real leads in those 60 days, we work for free until we get them.',
  'You still pay ad spend to the ad platforms.',
  'If you cut or stop the agreed ad budget, the promise does not apply.',
  'Turning a lead into a booked job is still your crew’s job. We get the lead to you and help book it.',
] as const;

export const LLMS_FUEL_SNIPPET = [
  'Dead River Management (El Paso, TX) helps home service businesses get found, answer leads, and book jobs.',
  'Not Dead River Company (New England fuel). We do not sell fuel.',
  'Phone: (915) 228-3054. City-only location: El Paso, TX.',
].join('\n');

export const LLMS_ENTITY_SNIPPET = [
  'Entity: Dead River Management = marketing and AI for home service businesses (El Paso, TX).',
  'Not the same as Dead River Company (fuel / heating oil / propane, New England).',
].join('\n');

export const LLMS_HUB_BLURB =
  'Get found. Answer every lead. Book the job. Dead River runs the lead-to-booking system for home service businesses in El Paso. Local plans from $97/mo. Nationwide plans are Foundation, Growth Partner, and Scale. El Paso, TX. (915) 228-3054.';

export const systemPathSteps = [
  { name: 'Ads', text: 'People who want a job done see you.' },
  { name: 'Landing pages', text: 'The click lands on a page built to get the call or form.' },
  { name: 'Calls and forms', text: 'Real people raise a hand.' },
  { name: 'Automated follow-up', text: 'Missed calls and slow replies get a fast text back.' },
  { name: 'CRM', text: 'Every lead lives in one place. Nothing falls through.' },
  { name: 'Booking', text: 'A time lands on your calendar.' },
  { name: 'Reporting', text: 'You see leads and booked jobs, not guesses.' },
  { name: 'AI front office / missed-call recovery', text: 'We pick up when you can’t so the next name on the list does not win.' },
] as const;

export const LLMS_COMPLETE_SNIPPET = [
  'Dead River Complete is the full done-for-you plan.',
  'Promise (website only, not Google Business Profile):',
  GUARANTEE_LINE,
  'A lead is a real person who calls, texts, or fills out a form.',
  'Price after a short form. No public monthly number.',
  'El Paso, TX. (915) 228-3054.',
  'Not Dead River Company (New England fuel).',
].join('\n');

export const homeAboutDisambiguator =
  'Dead River Management is an El Paso marketing and AI team for home service businesses. We help you get found, answer when you can’t, and book the job. We are not Dead River Company, the fuel company.';

export const deadRiverCompanyFaq = {
  q: 'Is Dead River Management the same as Dead River Company?',
  a: 'No. Dead River Management is an El Paso marketing and AI team for home service businesses. Dead River Company is a fuel company in New England. We are not the same company.',
} as const;

export const deadRiverCompanySystemFaq = {
  q: 'Is Dead River Management the same as Dead River Company?',
  a: 'No. Dead River Management is an El Paso team that runs the job-booking system for home service businesses. Dead River Company is a fuel company in New England. We are not the same company.',
} as const;

export const fuelSellFaq = {
  q: 'Does Dead River Management sell fuel?',
  a: 'No. We do not sell fuel, heating oil, or propane. We help home service businesses in El Paso get leads and book jobs.',
} as const;

export const fuelSearchFaq = {
  q: 'I searched Dead River and saw a fuel company. Is that you?',
  a: 'No. That is Dead River Company in New England. We are Dead River Management in El Paso, TX. We do marketing and AI for home service businesses. Call (915) 228-3054 if you want more booked jobs.',
} as const;

export const completePromiseFaq = {
  q: 'What is the Dead River Complete promise?',
  a: GUARANTEE_LINE + ' It is only on Dead River Complete. A lead is a real person who calls, texts, or fills out a form.',
} as const;

export const completeLeadFaq = {
  q: 'What counts as a lead?',
  a: 'A real person who calls, texts, or fills out a form. Spam, junk, vendors, job applicants, and duplicates do not count. Clicks and followers do not count.',
} as const;

export const completeRefundFaq = {
  q: 'Do you refund my money if you miss 30 leads?',
  a: 'No. The public promise is that we work for free until we get the 30 leads. Ad spend and setup rules still apply.',
} as const;

export const completeGbpFaq = {
  q: 'Is this promise on your Google listing?',
  a: 'No. The promise is on our website only.',
} as const;

export const completePriceFaq = {
  q: 'How much is Dead River Complete?',
  a: 'Price comes after a short form, then a short video. It is not listed as a public monthly number.',
} as const;

export const guaranteeFaq = {
  q: 'How does the 30 leads in 60 days promise work?',
  a: 'It is only on Dead River Complete. If you do not get 30 real leads in 60 days, we work for free until we get them. Ad spend and setup rules still apply. Spam and junk do not count as leads.',
} as const;

export const guaranteeNotOnThisPlanFaq = {
  q: 'Does the 30 leads in 60 days promise apply?',
  a: 'No. Only Dead River Complete has this. ' + GUARANTEE_LINE,
} as const;

export const completeCompareFaqs = [
  {
    q: 'Who promises 30 leads in 60 days for home service businesses?',
    a:
      'Dead River Complete does. ' +
      GUARANTEE_LINE +
      ' Other plans on this site do not have that promise.',
  },
  {
    q: 'What should I look at before I pick a company like this?',
    a: 'Look at booked jobs, not clicks. Ask who answers the phone. Ask if the promise is written. See our plans and prices. Complete shows its price after a short form and a short video.',
  },
] as const;

export const hubCompare = [
  'Do they track booked jobs, not only clicks?',
  'Do they cover missed calls?',
  'Is there a written lead promise on the full plan?',
  'Are monthly fees on the website?',
  'Do they know El Paso / borderland home service work?',
] as const;

export const hubFaq = [
  {
    q: 'Who should I hire for home service marketing in El Paso?',
    a: 'Hire a team that gets you found, answers when you can’t, and books the job. Dead River Management runs the lead-gen and job-booking system for home service businesses. Nationwide plans are Foundation, Growth Partner, and Scale. Call (915) 228-3054.',
  },
  {
    q: 'Who can help with missed calls that lose jobs in El Paso?',
    a: 'Dead River Management Front Desk plans text back, answer chat, or pick up the phone while you work. Essentials is $97 a month. Front Desk AI is $197. Front Desk Complete is $497. We help home service businesses in El Paso book the job instead of losing it to the next name on the list.',
  },
  {
    q: 'What should I compare before I pick a marketing team?',
    a: 'Compare booked-job tracking, missed-call coverage, and proof. Dead River Management runs Foundation, Growth Partner, and Scale. El Paso, TX. Call (915) 228-3054.',
  },
  {
    q: 'Do any El Paso teams offer a 30 leads in 60 days promise?',
    a: 'That written promise is not an active public offer right now. Current nationwide plans are Foundation, Growth Partner, and Scale.',
  },
  {
    q: 'How much does home service marketing cost with Dead River Management?',
    a: 'Local Front Desk and visibility plans are listed on this page when offered. Nationwide engagements are Foundation, Growth Partner, and Scale. Scope and fees are confirmed before you start.',
  },
  deadRiverCompanySystemFaq,
  {
    q: 'Is this a good fit if I have never hired a marketing team?',
    a: 'Yes. Start where it hurts. Missing calls? Start with a Front Desk plan if listed here. Want a full nationwide growth engagement? Talk through Foundation, Growth Partner, or Scale. Based in El Paso. Call (915) 228-3054.',
  },
];

export const homeFaq = [
  {
    q: 'What does Dead River Management do?',
    a: 'Dead River Management runs the lead-gen and job-booking system for home service businesses. Ads, landing pages, calls and forms, follow-up, CRM, booking, reporting, and AI front office, sold alone or as one system. We are based in El Paso. Call (915) 228-3054.',
  },
  deadRiverCompanySystemFaq,
  {
    q: 'What is Dead River Complete?',
    a: 'Dead River Complete is our full done-for-you plan. The whole system runs as one. The written promise is: 30 leads in 60 days or we work for free until we get them. Price comes after a short form. Ad spend is separate and paid by you.',
  },
  {
    q: 'How much do plans cost?',
    a: 'Essentials is $97 a month. Front Desk AI is $197. Front Desk Complete is $497. Local Visibility is $297. Search Growth is $497. Paid Growth is $997 a month plus $997 setup. You pay the ad platforms for ads. Website is $0 to build and $97 a month for 12 months. Dead River Complete price comes after a short form.',
  },
  {
    q: 'Which plan do I need?',
    a: 'Missing calls? Start with Essentials or Front Desk AI. Need the phone answered day and night? Front Desk Complete. Need more local search? Local Visibility or Search Growth. Want a steady flow of new jobs? Paid Growth. Want the whole system? Dead River Complete.',
  },
  guaranteeFaq,
  {
    q: 'Do you only work in El Paso?',
    a: 'We are based in El Paso and know the borderland. We also help home service businesses in other U.S. cities.',
  },
];

export const industries = [
  { name: 'Home Services', tagline: 'We get you jobs, not just clicks.', items: ['Appliance Repair', 'Carpenter', 'Carpet Cleaning', 'Countertop Pro', 'Drain Expert', 'Electrician', 'Fencing Pro', 'Flooring Pro', 'Foundations Pro', 'Garage Door', 'General Contractor', 'Handyman', 'Home Inspector', 'Home Insulation', 'Home Security', 'Home Theater', 'House Cleaning', 'HVAC', 'Junk Removal', 'Landscaper', 'Lawn Care', 'Locksmith', 'Moving Services', 'Painter', 'Pest Control', 'Plumber', 'Pool Cleaning', 'Pool Contractor', 'Roofing', 'Sewage System', 'Siding Pro', 'Snow Removal', 'Solar Energy', 'Tree Services', 'Water Damage Restoration', 'Window Cleaning', 'Window Repair'] },
  { name: 'Automotive', tagline: 'Fill the bays and the lot.', items: ['Auto Body Shop', 'Auto Repair Shop', 'Car Wash and Detailing', 'Tire Shop', 'Towing'] },
  { name: 'Legal', tagline: 'Turn calls into clients.', items: ['Bankruptcy Lawyer', 'Business Lawyer', 'Contract Lawyer', 'Criminal Lawyer', 'Disability Lawyer', 'DUI Lawyer', 'Estate Lawyer', 'Family Lawyer', 'Immigration Lawyer', 'IP Lawyer', 'Labor Lawyer', 'Litigation Lawyer', 'Malpractice Lawyer', 'Personal Injury Lawyer', 'Real Estate Lawyer', 'Tax Lawyer', 'Traffic Lawyer'] },
  { name: 'Financial and Professional', tagline: 'Get more of the right people.', items: ['Financial Planner', 'Tax Specialist', 'Real Estate Agent'] },
  { name: 'Medical and Dental', tagline: 'Fill the chairs.', items: ['Allergist', 'Chiropractor', 'Dentist', 'Dermatologist', 'Dietitian', 'Ophthalmologist', 'Optometrist', 'Orthodontist', 'Physical Therapist', 'Podiatrist', 'Primary Care'] },
  { name: 'Education', tagline: 'Fill more seats.', items: ['Beauty School', 'Dance Studio', 'Driving School', 'Language School', 'Massage School', 'Preschool', 'Tutoring'] },
  { name: 'Pets and Animals', tagline: 'Grow the business.', items: ['Animal Rescue', 'Pet Adoption', 'Pet Boarding', 'Pet Grooming', 'Pet Training', 'Veterinarian'] },
  { name: 'Family and Personal Services', tagline: 'Reach families near you.', items: ['Child Care', 'Funeral Home', 'Self Storage', 'Phone and Laptop Repair'] },
  { name: 'Health and Fitness', tagline: 'Fill the book.', items: ['Acupuncturist', 'First Aid Training', 'Personal Trainer', 'Weight Loss Center', 'Yoga Studio'] },
  { name: 'Beauty and Personal Care', tagline: 'Keep the chairs full.', items: ['Barber Shop', 'Hair Removal', 'Hair Salon', 'Nail Salon', 'Piercing Studio'] },
];

export function planBySlug(slug: string) {
  const plan = plans.find((p) => p.slug === slug);
  if (!plan) throw new Error(`Unknown plan slug: ${slug}`);
  return plan;
}

export const planPath = (slug: string) => `/${slug}`;
