// Service pages at /services/<slug>. Each targets the nationwide search term
// and carries a short El Paso section for local searches. Proof comes only
// from src/data/case-studies.ts and our own tracked rankings (dated).

// El Paso and the surrounding areas we serve, shown on every service page.
export const elPasoAreas = [
  'El Paso',
  'Horizon City',
  'Socorro',
  'San Elizario',
  'Clint',
  'Fabens',
  'Tornillo',
  'Canutillo',
  'Anthony',
  'Vinton',
  'Montana Vista',
  'Las Cruces, NM',
];

// The offer every service page routes buyers to.
export const demandFlowOffer = {
  name: 'The Demand Flow guarantee',
  href: '/book',
  offer: '$50,000 in new revenue in 45 to 60 days',
  from: 'Or your money back, and we pay you $500 for wasting your time. Ad spend is separate.',
};

export type ServicePageData = {
  slug: string;
  name: string;
  navLabel: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  sub: string;
  intro: string;
  problemHeading: string;
  problems: [string, string][];
  builtHeading: string;
  built: [string, string][];
  proofHeading?: string;
  proof: { label: string; text: string; href: string; linkText: string }[];
  elPaso: string;
  offerLead: string;
  fit: string[];
  related: { label: string; href: string }[];
  faqs: { q: string; a: string }[];
};

const pricingFaq = {
  q: 'What does it cost?',
  a: 'It depends on your market and goals. For home services, med spas, dental, real estate, and ecommerce we have set offers with a guaranteed target, listed on each industry page. For anything else, we quote on a short call. Ad spend is always separate and paid from your own account.',
};

export const servicePages: ServicePageData[] = [
  {
    slug: 'facebook-ads',
    name: 'Facebook Ads',
    navLabel: 'Facebook ads',
    title: 'Facebook Ads for Service Businesses',
    description:
      'Facebook and Instagram ads that book customers. Lead forms and fast follow-up for local service businesses. Nationwide and in El Paso.',
    eyebrow: 'Facebook ads management',
    headline: 'Facebook Ads Management That Books Customers. Not Just Likes.',
    sub: 'Facebook and Instagram (Meta) ads management for service businesses, nationwide and in El Paso.',
    intro:
      'We write, build, and run your Facebook and Instagram campaigns, then catch every lead with fast follow-up. The money you spend turns into booked work, not a list of names nobody called.',
    problemHeading: 'Most Facebook ads get attention. Not customers.',
    problems: [
      ['Boosted posts and likes.', 'Likes and reach look good in a report. They do not put a job on the calendar.'],
      ['Lead forms nobody works.', 'A lead comes in at 7pm, nobody answers until tomorrow, and they already booked someone else.'],
      ['No idea what a customer costs.', 'Without tracking from ad to booked job, you cannot tell which campaign is paying for itself.'],
    ],
    builtHeading: 'Everything it takes to turn ads into booked work.',
    built: [
      ['Strategy and targeting', 'Audiences built around your service area and the jobs you want more of.'],
      ['Ads written and designed', 'We write, design, and manage the ads. You approve before anything goes live.'],
      ['Lead forms and landing pages', 'Built to collect real customers with one clear next step.'],
      ['Fast follow-up', 'Every new lead gets a quick text and email reply, and follow-up until they book or say no.'],
      ['Tracking you can trust', 'Cost per lead and cost per booked job, from ad to calendar. The ad account is yours.'],
      ['Posting, if you want it', 'Need organic posts too? We can run your Facebook and Instagram posting alongside the ads.'],
    ],
    proofHeading: 'Facebook ads we have run',
    proof: [
      {
        label: 'Parcel Management Group',
        text: '49 Facebook lead-form leads in 30 days at $17.70 each (August 11 to September 9, 2026), with every inquiry followed up automatically.',
        href: '/work/parcel-management-group',
        linkText: 'Read the case study',
      },
      {
        label: 'The Pipe Whisperers',
        text: 'Facebook ads aimed at homeowners with water heaters over 15 years old, emergency landing pages, and text follow-up for after-hours calls. Roughly $60,000 a year in revenue became roughly $250,000.',
        href: '/work/the-pipe-whisperers',
        linkText: 'Read the case study',
      },
    ],
    elPaso:
      'We are based in El Paso and run Facebook and Instagram ads for businesses across El Paso County and the borderland, and for businesses across the country.',
    offerLead:
      'Facebook ads are one of the channels inside our Demand Flow system, aimed at the people purchase intent data says are ready to buy.',
    fit: [
      'You sell a service people buy from someone local',
      'You can answer new leads fast',
      'You want booked work, not likes and reach',
      'You can fund ad spend on top of our fee',
    ],
    related: [
      { label: 'Do Facebook ads work for plumbers?', href: '/marketing-advice/facebook-ads-for-plumbers' },
      { label: 'Ad budget calculator', href: '/tools/ad-budget' },
      { label: 'Cost per customer calculator', href: '/tools/customer-acquisition-cost' },
    ],
    faqs: [
      {
        q: 'Is it Facebook ads or Meta ads?',
        a: 'Same thing. Meta owns Facebook and Instagram, and one ad account runs both. We place your ads wherever they perform best.',
      },
      {
        q: 'Is ad spend included?',
        a: 'No. Ad spend is paid straight to Meta from your own ad account, so you see every dollar. Our fee covers building and running the campaigns and the follow-up.',
      },
      {
        q: 'Do I need to make the ads?',
        a: 'No. We write, design, and manage the ads, the forms, and the landing pages. We only need a quick approval before anything goes live, plus any job photos you want us to use.',
      },
      {
        q: 'How fast do leads come in?',
        a: 'Ads start running as soon as Meta approves them. The first few weeks are for testing audiences and offers, and we adjust every week from there.',
      },
      {
        q: 'Do you manage social media posting?',
        a: 'Usually alongside ads rather than on its own. If you want organic Facebook and Instagram posts as well, we can add them.',
      },
      {
        q: 'Do you work outside El Paso?',
        a: 'Yes. We run Facebook ads for businesses nationwide.',
      },
      pricingFaq,
    ],
  },
  {
    slug: 'google-ads',
    name: 'Google Ads',
    navLabel: 'Google Ads',
    title: 'Google Ads and PPC Management',
    description:
      'Google Ads management for service businesses. Landing pages and call tracking tied to booked jobs, not clicks. Nationwide and in El Paso.',
    eyebrow: 'Google Ads management',
    headline: 'Google Ads Management That Turns Searches Into Booked Jobs.',
    sub: 'Google Ads and PPC management services for service businesses, nationwide and in El Paso.',
    intro:
      'People searching Google are already looking for what you sell. We build and run the campaigns, send the clicks to pages built to convert, and track every call and form back to the ad that drove it.',
    problemHeading: 'Most Google Ads accounts leak money.',
    problems: [
      ['Budget burned on the wrong clicks.', 'Broad keywords pull in people who were never going to buy, and you pay for every click.'],
      ['Clicks sent to the home page.', 'A searcher who wanted one service lands on a page about everything and leaves.'],
      ['No link from ad to job.', 'If nobody can say which ad booked which job, nobody can say what to cut.'],
    ],
    builtHeading: 'Everything it takes to make search ads pay.',
    built: [
      ['Account audit or rebuild', 'We start with what you have: what books work, what burns budget, and what to cut.'],
      ['High-intent campaigns', 'Keywords and campaigns aimed at people searching for your services right now.'],
      ['Ad copy', 'Written for the job the searcher wants, not a generic pitch.'],
      ['Landing pages', 'One page per service, built for calls and form fills.'],
      ['Call and form tracking', 'Every call and form traced to the campaign and keyword that drove it.'],
      ['Weekly optimization', 'Budget moved toward what books, every week. The ad account is yours.'],
    ],
    proofHeading: 'Google Ads we have run',
    proof: [
      {
        label: 'Gonzalez & Sons Roofing',
        text: 'We rebuilt their Google Ads account, created storm-damage landing pages, set up follow-up for no-shows, and tracked every estimate from click to signed contract. They went from 2 roofs a month to 8, with 8 contracts signed from 23 qualified estimates.',
        href: '/work/gonzalez-and-sons-roofing',
        linkText: 'Read the case study',
      },
    ],
    elPaso:
      'We are based in El Paso and run Google Ads for businesses across El Paso County and the borderland, and for businesses across the country.',
    offerLead:
      'Google Ads are one of the channels inside our Demand Flow system, aimed at the people purchase intent data says are ready to buy.',
    fit: [
      'People already search Google for what you sell',
      'You can answer calls and forms fast',
      'You want every dollar traced to booked work',
      'You can fund ad spend on top of our fee',
    ],
    related: [
      { label: 'Campaign ROI calculator', href: '/tools/campaign-roi' },
      { label: 'Ad budget calculator', href: '/tools/ad-budget' },
      { label: 'Search ad preview tool', href: '/tools/search-preview' },
      { label: 'Google Local Services Ads', href: '/services/google-local-services-ads' },
    ],
    faqs: [
      {
        q: 'Is ad spend included?',
        a: 'No. Ad spend is paid straight to Google from your own ad account, so you see every dollar. Our fee covers building and running the campaigns.',
      },
      {
        q: 'What if I already run Google Ads?',
        a: 'Good. We audit the account first and show you which campaigns book work, which just burn budget, and where leads slip through before anyone calls back.',
      },
      {
        q: 'How much should I spend on ads?',
        a: 'It depends on your market, your competition, and how much work you can take on. We recommend a starting budget on the call, and our ad budget calculator gives you a first estimate.',
      },
      {
        q: 'What about Local Services Ads?',
        a: 'Local Services Ads are the Google Guaranteed and Google Screened ads at the very top of the page, and you pay per lead instead of per click. We run them too, often alongside search ads.',
      },
      {
        q: 'Should I do Google Ads or SEO?',
        a: 'Google Ads bring calls as soon as they are live. SEO takes longer and keeps paying off. Most businesses start with ads and build SEO underneath them.',
      },
      {
        q: 'Do you work outside El Paso?',
        a: 'Yes. We run Google Ads for businesses nationwide.',
      },
      pricingFaq,
    ],
  },
  {
    slug: 'google-local-services-ads',
    name: 'Google Local Services Ads',
    navLabel: 'Local Services Ads',
    title: 'Google Local Services Ads (LSA)',
    description:
      'Google Local Services Ads management. Google Guaranteed or Screened badge, pay per lead, fast answer times. Nationwide and in El Paso.',
    eyebrow: 'Google Local Services Ads',
    headline: 'Google Local Services Ads That Put You at the Very Top.',
    sub: 'Local Services Ads (LSA) management, from Google Guaranteed and Google Screened setup to answering every lead. Nationwide and in El Paso.',
    intro:
      'Local Services Ads sit above everything else on Google, with a badge that tells searchers you are checked and trusted. You pay per lead, not per click. We get you verified, set the profile up to win, and make sure every lead gets answered.',
    problemHeading: 'Most Local Services Ads profiles lose leads they already paid for.',
    problems: [
      ['Stuck in verification.', 'Background checks, licenses, and insurance paperwork stall, and the ads never go live.'],
      ['Leads that go unanswered.', 'Google ranks you on how fast you respond. Missed calls and slow replies push you down and cost you the job.'],
      ['Paying for bad leads.', 'Wrong service, wrong area, or spam. Google lets you dispute them, but only if someone does.'],
    ],
    builtHeading: 'Everything it takes to win with Local Services Ads.',
    built: [
      ['Verification support', 'We walk you through the Google Guaranteed or Google Screened checks so the ads can go live.'],
      ['Profile setup', 'Service types, service areas, hours, and photos set up the way Local Services Ads rank.'],
      ['Budget and bidding', 'Weekly budget and bid settings aimed at the jobs you want more of.'],
      ['Fast response', 'Every lead answered quickly, because response time affects your ranking.'],
      ['Review requests', 'Reviews feed your Local Services Ads ranking, so we ask after every job.'],
      ['Lead disputes', 'We flag invalid leads so you can get credited for them.'],
    ],
    proof: [],
    elPaso:
      'We are based in El Paso and run Local Services Ads for businesses across El Paso County and the borderland, and for businesses across the country.',
    offerLead:
      'Local Services Ads can run inside our Demand Flow system alongside the intent-targeted channels.',
    fit: [
      'Your trade or profession is eligible for Local Services Ads',
      'You can pass Google’s background and license checks',
      'You can answer calls and messages fast',
      'You want to pay per lead, not per click',
    ],
    related: [
      { label: 'Lead response calculator', href: '/tools/lead-response' },
      { label: 'Google Ads management', href: '/services/google-ads' },
      { label: 'Local SEO services', href: '/services/local-seo' },
    ],
    faqs: [
      {
        q: 'What are Google Local Services Ads?',
        a: 'Ads at the very top of Google search for local services, with a Google Guaranteed or Google Screened badge. You pay for leads, not clicks, and customers can call or message you straight from the ad.',
      },
      {
        q: 'What is the difference between Google Guaranteed and Google Screened?',
        a: 'Google Guaranteed is for home service trades. Google Screened is for professional services. Both mean Google has checked the business. Which one you get depends on your category.',
      },
      {
        q: 'Is my business eligible?',
        a: 'Eligibility depends on your category and location. Many home service trades qualify, and some professional services do too. We check yours on the call.',
      },
      {
        q: 'How is it different from regular Google Ads?',
        a: 'Search ads charge per click and show below Local Services Ads. Local Services Ads charge per lead and show a trust badge. Many businesses run both.',
      },
      {
        q: 'Is ad spend included?',
        a: 'No. You pay Google directly for the leads, from your own account. Our fee covers setup, management, and making sure every lead gets answered.',
      },
      {
        q: 'Do you work outside El Paso?',
        a: 'Yes. We run Local Services Ads for businesses nationwide.',
      },
      pricingFaq,
    ],
  },
  {
    slug: 'seo',
    name: 'SEO',
    navLabel: 'SEO',
    title: 'SEO Services That Bring Customers',
    description:
      'SEO that reports leads, not vanity rankings. Technical fixes, service pages, and AI search readiness for small businesses. Nationwide and El Paso.',
    eyebrow: 'SEO services',
    headline: 'SEO Services That Get You Found. And Called.',
    sub: 'Search engine optimization for service businesses, nationwide and in El Paso. Built for Google and for AI search.',
    intro:
      'We fix what stops Google from understanding your site, build the pages your customers are searching for, and make your business easy for AI answers like ChatGPT and Google’s AI Overviews to cite.',
    problemHeading: 'Most SEO reports rankings. Not customers.',
    problems: [
      ['Rankings for words nobody buys from.', 'Page 1 for a term that never brings a call is not a win.'],
      ['A site Google cannot read.', 'Slow pages, missing structure, and thin service pages keep good businesses buried.'],
      ['Invisible in AI answers.', 'More people ask ChatGPT and Google’s AI who to call. If your site does not answer clearly, you are not in the answer.'],
    ],
    builtHeading: 'Everything it takes to be found by buyers.',
    built: [
      ['Technical fixes', 'Speed, indexing, and structured data so search engines understand what you do and where.'],
      ['Service and location pages', 'A page for each service and area your customers search for.'],
      ['Content that answers buyers', 'Pricing, comparisons, and how-to answers that match what people actually search.'],
      ['AI search readiness', 'Clear, citable answers so AI tools can recommend your business.'],
      ['Internal linking', 'Pages that point to each other so authority flows to the ones that make money.'],
      ['Monthly reporting', 'Rankings, traffic, and leads, in plain English.'],
    ],
    proofHeading: 'SEO we practice on ourselves',
    proof: [
      {
        label: 'Our own site',
        text: 'Our pricing article ranks #5 in El Paso for “marketing agency cost el paso”, ahead of an agency that has been around since 2012 (live search from El Paso, September 2026).',
        href: '/marketing-advice/el-paso-home-services-marketing-agency',
        linkText: 'Read the article',
      },
    ],
    elPaso:
      'We are based in El Paso and do SEO for businesses across El Paso County and the borderland, and for businesses across the country.',
    offerLead:
      'SEO backs up the paid work inside our Demand Flow system, so the buyers we reach can find and trust you.',
    fit: [
      'Customers search for your services online',
      'You want leads that do not stop when ad spend does',
      'You can give it months, not weeks',
      'You want reports in leads, not just rankings',
    ],
    related: [
      { label: 'SEO foundations checker', href: '/tools/seo-foundations' },
      { label: 'Show up when people ask AI who to call', href: '/marketing-advice/ai-search-for-local-business' },
      { label: 'Local SEO and Google Maps', href: '/services/local-seo' },
    ],
    faqs: [
      {
        q: 'How long does SEO take?',
        a: 'Months, not weeks. Technical fixes can help quickly, while new pages and content build over time. We report progress every month so you can see it moving.',
      },
      {
        q: 'Can you guarantee rankings?',
        a: 'No one can honestly guarantee a ranking, because Google controls it. What we can do is tie the work to leads and show you what is changing every month.',
      },
      {
        q: 'What about AI search like ChatGPT?',
        a: 'We build pages with clear, citable answers and the structured data AI tools read. It is part of our SEO work, not an extra.',
      },
      {
        q: 'What is the difference between SEO and local SEO?',
        a: 'SEO gets your website found in regular search results. Local SEO gets your business into the Google map results and your Google Business Profile. Most service businesses need both.',
      },
      {
        q: 'Do you work outside El Paso?',
        a: 'Yes. We do SEO for businesses nationwide.',
      },
      pricingFaq,
    ],
  },
  {
    slug: 'local-seo',
    name: 'Local SEO',
    navLabel: 'Local SEO',
    title: 'Local SEO & Google Business Profile',
    description:
      'Local SEO and Google Business Profile optimization that brings map calls. Reviews, listings, and local pages. Nationwide and in El Paso.',
    eyebrow: 'Local SEO',
    headline: 'Local SEO Services That Put You in the Map Results.',
    sub: 'Google Business Profile and local search for service businesses, nationwide and in El Paso.',
    intro:
      'When someone nearby searches for what you do, the map results get the calls. We optimize your Google Business Profile, set up a steady review system, and make your website back it up.',
    problemHeading: 'Most local businesses are invisible on the map.',
    problems: [
      ['A half-finished profile.', 'Wrong categories, missing services, and no photos tell Google you are not the best answer.'],
      ['Too few reviews.', 'Nearby buyers compare star ratings and review counts before they call anyone.'],
      ['Listings that disagree.', 'Different names, phone numbers, or hours across the web make Google trust you less.'],
    ],
    builtHeading: 'Everything it takes to win the local search.',
    built: [
      ['Google Business Profile optimization', 'Categories, services, photos, and posts set up the way Google ranks them.'],
      ['Review system', 'A simple request after every job, within Google’s rules, so reviews keep coming.'],
      ['Listings cleanup', 'Your name, phone, and hours consistent across the directories that matter.'],
      ['Local pages', 'Pages for the areas you serve, linked to your profile.'],
      ['Service-area setup', 'No storefront? We set your profile up to show your service area instead of an address.'],
      ['Call tracking', 'Calls and clicks from your profile tracked, so you see what the map brings in.'],
    ],
    proofHeading: 'Local SEO we practice on ourselves',
    proof: [
      {
        label: 'Our own profile',
        text: 'We rank #5 in El Paso for “google business profile optimization el paso” (live search from El Paso, September 2026), as a service-area business with no storefront.',
        href: '/locations/el-paso',
        linkText: 'See our El Paso page',
      },
    ],
    elPaso:
      'We are based in El Paso and do local SEO for businesses across El Paso County and the borderland, and for businesses across the country.',
    offerLead:
      'Local SEO backs up the paid work inside our Demand Flow system, so the buyers we reach can find and trust you.',
    fit: [
      'Customers find you on Google Maps or search “near me”',
      'You have or can set up a Google Business Profile',
      'You can ask customers for reviews after each job',
      'Storefront or service area, both work',
    ],
    related: [
      { label: 'SEO foundations checker', href: '/tools/seo-foundations' },
      { label: 'Lead response calculator', href: '/tools/lead-response' },
      { label: 'SEO for your website', href: '/services/seo' },
    ],
    faqs: [
      {
        q: 'I do not have a storefront. Can I still rank on the map?',
        a: 'Yes. Service-area businesses can hide their address and show the areas they serve instead. We set that up and optimize around it.',
      },
      {
        q: 'Can you get me more reviews?',
        a: 'We set up a system that asks every customer for a review after the job, within Google’s rules. We never buy or fake reviews.',
      },
      {
        q: 'How long does local SEO take?',
        a: 'Profile fixes can help within weeks. Reviews and local pages build over months. We report calls and rankings every month.',
      },
      {
        q: 'Do you work outside El Paso?',
        a: 'Yes. We do local SEO for businesses in cities nationwide.',
      },
      pricingFaq,
    ],
  },
  {
    slug: 'cold-email',
    name: 'Cold Email',
    navLabel: 'Cold email',
    title: 'Cold Email for B2B Lead Generation',
    description:
      'Cold email for B2B lead generation. Targeted lists, inbox setup, copy, and follow-up sequences that book sales calls. Nationwide.',
    eyebrow: 'Cold email marketing',
    headline: 'Cold Email That Books Sales Calls.',
    sub: 'Cold email marketing and B2B lead generation for businesses that sell to other businesses, nationwide and in El Paso.',
    intro:
      'We find the right companies and decision-makers, set up sending so your emails land in the inbox, write short emails people answer, and follow up until they book or say no. Replies turn into calls on your calendar.',
    problemHeading: 'Most cold email never gets read.',
    problems: [
      ['Straight to spam.', 'Blasting from your main domain with no warm-up burns your sender reputation and your inbox.'],
      ['The wrong list.', 'Scraped, outdated contacts mean bounces, complaints, and nobody who can say yes.'],
      ['Emails about you.', 'Long pitches about your company get deleted. Short emails about their problem get replies.'],
    ],
    builtHeading: 'Everything it takes to turn cold email into booked calls.',
    built: [
      ['Targeted lists', 'Companies and decision-makers that fit your best customers, with verified emails.'],
      ['Inbox setup', 'Separate sending domains and mailboxes, warmed up, so your main domain stays protected.'],
      ['Copy that gets replies', 'Short, specific emails written for each audience. You approve before anything sends.'],
      ['Follow-up sequences', 'A few well-timed follow-ups, because most replies come after the first email.'],
      ['Reply handling', 'Interested replies routed to you fast, with a link to book a call.'],
      ['Compliance and reporting', 'Opt-outs honored, CAN-SPAM basics covered, and reporting on replies and booked calls.'],
    ],
    proof: [],
    elPaso:
      'We are based in El Paso and run cold email for businesses here and across the country. Cold email is not tied to a location, so we target buyers wherever they are.',
    offerLead:
      'Cold email can run inside our Demand Flow system, sent to the businesses purchase intent data says are in the market.',
    fit: [
      'You sell to other businesses',
      'You know who your best customers are',
      'A new client is worth enough to justify outreach',
      'You or your team can take sales calls',
    ],
    related: [
      { label: 'Demand Intelligence: find buyers showing intent', href: '/demand-intelligence' },
      { label: 'Cost per customer calculator', href: '/tools/customer-acquisition-cost' },
      { label: 'Revenue goal calculator', href: '/tools/revenue-goal' },
    ],
    faqs: [
      {
        q: 'Is cold email legal?',
        a: 'Yes, for business outreach in the U.S., when you follow CAN-SPAM: honest subject lines, a real business address, and an easy way to opt out that you honor. We build all of that in.',
      },
      {
        q: 'Will it hurt my email domain?',
        a: 'Not the way we set it up. We send from separate domains and mailboxes, warmed up first, so your main business email is never at risk.',
      },
      {
        q: 'Who writes the emails?',
        a: 'We do. You approve every sequence before it sends.',
      },
      {
        q: 'How fast does it work?',
        a: 'New sending inboxes need a few weeks of warm-up before full volume. After that, we test and adjust the list and copy every week.',
      },
      {
        q: 'Do you do cold email for local businesses?',
        a: 'Cold email works best when you sell to other businesses. If you sell to homeowners, Facebook ads and Local Services Ads are usually a better fit.',
      },
      pricingFaq,
    ],
  },
];
