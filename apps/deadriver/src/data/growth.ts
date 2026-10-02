export const brand = {
  name: 'Dead River Management',
  email: 'brandon@deadrivermanagement.com',
  phone: '(915) 228-3054',
  phoneHref: 'tel:+19152283054',
  smsHref: 'sms:+19152283054',
  address: '416 N. Stanton St, Suite 120-M, El Paso, TX 79901',
  mapHref: 'https://www.google.com/maps/search/?api=1&query=416+N+Stanton+St+Suite+120-M+El+Paso+TX+79901',
  location: 'Based in El Paso, Texas · Serving businesses nationwide',
  description:
    'A growth partner for businesses ready to break through the next stage. Dead River builds and manages the infrastructure behind growth: acquisition, conversion, follow-up, retention, measurement, and strategy in one managed system. Based in Texas, working with growing businesses nationwide.',
};

export const engagements = [
  {
    slug: 'foundation',
    name: 'Foundation',
    label: 'Build the right starting point',
    phase: 'Build',
    price: '$997',
    setup: '$1,497',
    from: false,
    headline: 'Build the infrastructure your next stage of growth needs.',
    intro:
      'A focused 90-day engagement for businesses that already have demand but need stronger tracking, follow-up, conversion, and customer systems before they invest more in acquisition.',
    channels: 'Advertising not included',
    features: [
      'Growth assessment and a 90-day implementation roadmap',
      'Tracking, CRM, and opportunity pipeline connected end to end',
      'Lead capture, booking, and the core follow-up workflows',
      'Your most important conversion path improved',
      'Search foundations and a reporting baseline',
    ],
    cta: 'Book Your Free Strategy Call',
    href: '/book',
  },
  {
    slug: 'growth-partner',
    name: 'Growth Partner',
    label: 'Best for most growing businesses',
    phase: 'Grow',
    price: '$2,497',
    setup: '$1,997',
    from: false,
    headline: 'Your managed growth engine.',
    intro:
      'We identify the strongest opportunity, manage the primary acquisition strategy, improve the path from first touch to conversion, and give you the systems and visibility to keep growing.',
    channels: 'One primary acquisition channel',
    features: [
      'Everything in Foundation your business needs, managed together',
      'A managed acquisition strategy on your primary channel',
      'Campaign landing pages and ongoing conversion improvement',
      'Booking, nurture, and recovery of stalled opportunities',
      'Live reporting and a monthly strategy review',
    ],
    cta: 'Book Your Free Strategy Call',
    href: '/book',
  },
  {
    slug: 'scale',
    name: 'Scale',
    label: 'Expand what is already working',
    phase: 'Scale',
    price: '$4,497',
    setup: '$2,997',
    from: true,
    headline: 'Expand what is already working.',
    intro:
      'For businesses ready to grow across more channels, deepen conversion and retention, use more advanced audience intelligence, and work with us more closely on strategy.',
    channels: 'Two coordinated acquisition channels',
    features: [
      'Everything in Growth Partner, expanded',
      'Coordinated acquisition across a second channel',
      'Advanced segmentation, retention, and reactivation programs',
      'Deeper search visibility, including AI-driven search',
      'Broader reporting, twice-monthly strategy, and priority support',
    ],
    cta: 'Book Your Free Strategy Call',
    href: '/book',
  },
];

export const addOns = [
  {
    name: 'Additional acquisition channel',
    price: 'From $997/month',
    note: 'Setup from $497. For an agreed channel and campaign scope beyond your plan.',
  },
  {
    name: 'Additional location',
    price: 'From $297/month',
    note: 'For a second location that operates like the first.',
  },
  {
    name: 'Additional campaign landing page',
    price: 'From $497/page',
    note: 'A focused conversion page for an offer or campaign outside the included scope.',
  },
  {
    name: 'Small-business website',
    price: 'From $3,497',
    note: 'A separately scoped project. Monthly engagements do not include a full rebuild.',
  },
];

export const exclusions = [
  'Full website rebuilds',
  'Major rebrands',
  'Professional photo or video production',
  'Custom software development',
  'Complex system integrations',
  'Large-scale content production',
  'Extensive manual outbound execution',
  'Anything outside your agreed scope',
];

export const industries = [
  {
    slug: 'home-services',
    name: 'Home Services',
    eyebrow: 'From first call to booked job',
    title: 'Keep your crews busy. Make every inquiry count.',
    intro:
      'A stronger pipeline for HVAC, plumbing, roofing, electrical, and the other trades that keep homes running, wherever in the country you operate.',
    problem: 'The work is good. The pipeline is unpredictable.',
    pain: [
      'Missed calls become someone else’s jobs.',
      'Estimates go quiet without a follow-up system.',
      'Ad reports show clicks while the calendar stays uneven.',
    ],
    outcome:
      'We connect demand, fast response, and estimate follow-up so more of the opportunities you already pay for become booked work.',
    acquisition:
      'Growth Partner manages your primary acquisition channel, chosen around your trade, service area, seasonality, and job economics. Scale coordinates a second.',
    conversion:
      'Missed-call recovery, booking, new-lead nurture, and estimate follow-up. Scale adds database reactivation and deeper segmentation.',
    metrics: [
      'Qualified inquiries',
      'Booked estimates',
      'Cost per booked job',
      'Revenue, where attributable',
    ],
    addons: [
      'Additional service areas',
      'Seasonal campaigns',
      'Additional acquisition channels',
    ],
    note: 'Job value, service area, and crew capacity shape the plan. Home-services businesses that qualify can be offered a separate 30-leads-in-60-days package with written terms. It is not automatically part of any tier.',
  },
  {
    slug: 'med-spas',
    name: 'Med Spas',
    eyebrow: 'Turn interest into appointments',
    title: 'A fuller appointment book. A stronger patient journey.',
    intro:
      'Acquisition, consultation booking, and thoughtful follow-up brought together around the treatments that matter most to your practice.',
    problem: 'More inquiries do not always mean more appointments.',
    pain: [
      'New inquiries cool off before the team replies.',
      'Promotions attract interest without the right patient fit.',
      'Past patients rarely hear from you at the right moment.',
    ],
    outcome:
      'We build a considered path from treatment interest to consultation, with clear reporting on bookings and attendance.',
    acquisition:
      'One primary acquisition channel in Growth Partner, chosen for your treatment mix. Scale coordinates two.',
    conversion:
      'Consultation nurture, reminders, and reactivation. Scale adds segmented campaigns by treatment and opportunity, using approved data and workflows.',
    metrics: [
      'Consultation inquiries',
      'Booked consultations',
      'Attendance rate',
      'Cost per booked consultation',
    ],
    addons: [
      'Treatment launch campaigns',
      'Additional locations',
      'Advanced lifecycle campaigns',
    ],
    note: 'We do not promise a volume of bookings or any treatment outcome. Medical claims, consent, patient privacy, and creative approvals are reviewed with your practice. Please do not submit patient information through this site.',
  },
  {
    slug: 'dental',
    name: 'Dental',
    eyebrow: 'Healthy practices need healthy pipelines',
    title: 'Reach the right patients. Fill the right appointments.',
    intro:
      'A connected strategy for general dentistry and high-value procedures, built around the capacity and priorities of your practice.',
    problem: 'A lead only matters when the patient takes the next step.',
    pain: [
      'Procedure inquiries disappear between the form and the front desk.',
      'Recall opportunities sit in a disconnected database.',
      'Marketing spend is hard to connect to scheduled visits.',
    ],
    outcome:
      'Your front desk gets a clearer pipeline, and prospective patients get a simpler path to a consultation.',
    acquisition:
      'Growth Partner manages one primary acquisition channel based on your procedure mix and patient economics. Scale adds a second.',
    conversion:
      'Booking, inquiry follow-up, and recall reactivation. Scale adds deeper segmentation by procedure and opportunity with approved data controls.',
    metrics: [
      'Qualified inquiries',
      'Scheduled consultations',
      'Attendance rate',
      'Cost per scheduled visit',
    ],
    addons: [
      'Procedure-specific funnels',
      'Multi-location reporting',
      'Advanced recall workflows',
    ],
    note: 'We do not promise a volume of patients or any clinical outcome. Patient data handling, advertising claims, and practice-specific requirements are confirmed before activation. Please do not submit patient information here.',
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    eyebrow: 'Stay relevant until they are ready',
    title: 'Build a pipeline that works beyond the first inquiry.',
    intro:
      'For agents, teams, and brokerages that need a consistent system for reaching buyers and sellers and nurturing the next conversation, in any market.',
    problem: 'The next transaction rarely happens on the first touch.',
    pain: [
      'Lead sources feed different tools with no clear ownership.',
      'Long-term prospects fall out of follow-up.',
      'New inquiries and ready-to-act opportunities look the same.',
    ],
    outcome:
      'We organize the pipeline, nurture each relationship, and help your team focus on the conversations that are ready to happen.',
    acquisition:
      'One primary acquisition channel in Growth Partner. Two coordinated channels at Scale, with additional channels scoped separately.',
    conversion:
      'Full inquiry-to-appointment nurture and long-term follow-up in Growth Partner. Scale adds database reactivation, deeper segmentation, and outbound workflow support.',
    metrics: [
      'Qualified conversations',
      'Appointments set',
      'Pipeline progression',
      'Attributable transactions',
    ],
    addons: [
      'Team routing',
      'Brokerage reporting',
      'Additional market campaigns',
    ],
    note: 'We do not promise transactions or commission income. Fair-housing advertising rules, targeting limits, licensing, and disclosure requirements are reviewed for every campaign. Extensive manual outbound is scoped separately.',
  },
  {
    slug: 'ecommerce',
    name: 'Ecommerce',
    eyebrow: 'Acquire well. Convert better. Keep customers.',
    title: 'More than the next purchase. A better growth engine.',
    intro:
      'Paid acquisition, conversion improvements, and email and SMS retention working together around your store’s real margins.',
    problem: 'Buying more traffic cannot fix a leaky customer journey.',
    pain: [
      'Acquisition costs rise faster than contribution margin.',
      'Product pages and checkout lose high-intent shoppers.',
      'Repeat revenue gets treated as an afterthought.',
    ],
    outcome:
      'We connect paid acquisition with conversion and retention, measured against revenue and acquisition economics rather than traffic alone.',
    acquisition:
      'Growth Partner includes one primary acquisition channel, often Meta. Scale starts with two. Channel selection follows the brand, not a fixed formula.',
    conversion:
      'Store and purchase tracking in Foundation. Growth Partner adds ongoing conversion work and the core welcome, abandoned-cart, and post-purchase flows. Scale deepens lifecycle campaigns and segmentation.',
    metrics: [
      'Revenue and contribution',
      'Customer acquisition cost',
      'Return on ad spend',
      'Conversion and repeat purchase',
    ],
    addons: [
      'Higher-production creative',
      'Additional acquisition channels',
      'Advanced lifecycle campaigns',
    ],
    note: 'Best suited to brands with proven sales, viable margins, and budget to learn. Management is a fixed retainer; ad spend is separate. Material increases in spend or complexity call for a scope review.',
  },
];

export const demandIntelligence = {
  name: 'Dead River Demand Intelligence',
  price: 'Talk through scope',
  period: '',
  terms: 'Scope and fees are confirmed on a demo.',
  summary:
    'Understand where demand is forming across both business and consumer markets. Identify people and businesses showing relevant purchase-intent signals, build higher-opportunity B2B and B2C audiences, and give sales and marketing teams a better place to start.',
};

export const toolCatalog = [
  {
    slug: 'campaign-roi',
    name: 'Campaign ROI Calculator',
    category: 'Calculators',
    description: 'See the contribution left after a campaign pays for itself.',
    time: '2 min',
    type: 'roi',
  },
  {
    slug: 'customer-acquisition-cost',
    name: 'Customer Acquisition Cost',
    category: 'Calculators',
    description: 'Understand the true cost of winning each new customer.',
    time: '1 min',
    type: 'cac',
  },
  {
    slug: 'revenue-goal',
    name: 'Revenue Goal Planner',
    category: 'Calculators',
    description: 'Work backward from a revenue goal to the leads you need.',
    time: '2 min',
    type: 'revenue',
  },
  {
    slug: 'ad-budget',
    name: 'Ad Budget Planner',
    category: 'Calculators',
    description: 'Connect customer targets, close rate, and media budget.',
    time: '2 min',
    type: 'budget',
  },
  {
    slug: 'lead-response',
    name: 'Lead Response Scorecard',
    category: 'Diagnostics',
    description: 'Find the gaps between a new inquiry and a useful reply.',
    time: '2 min',
    type: 'response',
  },
  {
    slug: 'growth-readiness',
    name: 'Growth Readiness Check',
    category: 'Diagnostics',
    description: 'See whether your systems are ready for more demand.',
    time: '2 min',
    type: 'readiness',
  },
  {
    slug: 'website-conversion',
    name: 'Website Conversion Review',
    category: 'Diagnostics',
    description: 'Assess the path from first visit to next step.',
    time: '3 min',
    type: 'conversion',
  },
  {
    slug: 'seo-foundations',
    name: 'SEO Foundations Checklist',
    category: 'Search & website',
    description: 'Review the essentials that help your site get found.',
    time: '3 min',
    type: 'seo',
  },
  {
    slug: 'search-preview',
    name: 'Search Snippet Preview',
    category: 'Search & website',
    description:
      'Write a clearer page title and description and preview it in Google.',
    time: '2 min',
    type: 'meta',
  },
  {
    slug: 'campaign-url',
    name: 'Campaign URL Builder',
    category: 'Search & website',
    description:
      'Build consistent tracking links so every campaign is measurable.',
    time: '1 min',
    type: 'utm',
  },
];
