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

// Areas that have their own city page.
export const areaHrefs: Record<string, string> = {
  'El Paso': '/locations/el-paso',
  'Horizon City': '/locations/horizon-city',
  Socorro: '/locations/socorro',
  'Las Cruces, NM': '/locations/las-cruces',
};

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
  blurb: string; // one line for the channel index on location and service pages
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
  // Optional long-form blocks for pages that need to be the complete answer
  // (AI search). Rendered between "what we build" and results.
  longform?: { heading: string; paragraphs: string[] }[];
  compare?: { heading: string; columns: [string, string, string]; rows: [string, string, string][] };
};

const pricingFaq = {
  q: 'What does it cost?',
  a: "It depends on your market and goals. For home services, med spas, dental, real estate, and ecommerce we've set offers with a guaranteed target, listed on each industry page. For anything else, we quote on a short call. Ad spend is always separate and paid from your own account.",
};

export const servicePages: ServicePageData[] = [
  {
    slug: 'web-design',
    blurb: 'Mobile-first sites built to get the call.',
    name: 'Web Design',
    navLabel: 'Web design',
    title: 'Web Design for Service Businesses',
    description:
      'Web design for service businesses. Mobile-first sites built to get the call, with click-to-call, forms that text you, and SEO built in. Nationwide and El Paso.',
    eyebrow: 'Web design',
    headline: 'Web Design That Gets the Call, Not Just Compliments.',
    sub: 'Mobile-first websites for service businesses, nationwide and in El Paso.',
    intro:
      'Most of your visitors are on a phone with a problem. We design and build sites that load fast, answer the question, and make calling or booking the easiest thing on the screen. Then we track which pages turn into jobs.',
    problemHeading: 'Most service websites look fine and book nothing.',
    problems: [
      ['Pretty, slow, and silent.', "A site that takes five seconds to load on a phone loses half its visitors before the headline. The ones who stay can't find the phone number."],
      ['One page for everything.', 'A plumber with one "services" paragraph can\'t rank for water heaters, drains, or repipes. Google needs a page per job, and so does the homeowner.'],
      ['Forms that go nowhere.', 'A form fill that lands in an inbox nobody checks until tomorrow is a lead you paid for and lost.'],
    ],
    builtHeading: 'Everything a site needs to turn visitors into booked work.',
    built: [
      ['Mobile first', 'Designed on a phone screen first. Fast, readable, with the number and the booking button always in reach.'],
      ['A page for every service and area', 'Each job you want and each area you serve gets its own page, written to answer the question a buyer types into Google or asks an AI assistant.'],
      ['Calls and forms that reach you', "Click-to-call on every screen, and forms that text you the second they're filled out, with follow-up if you miss them."],
      ['SEO built in', 'Titles, structure, speed, schema, and internal links done at build time, not bolted on later. Your Google Business Profile and site match.'],
      ['Proof on the page', 'Reviews, job photos, and case-study numbers placed where a buyer decides.'],
      ['Tracking to the job', 'Every call and form is recorded against the page it came from, so you know which pages book work.'],
    ],
    proofHeading: "Sites we've built",
    proof: [
      {
        label: 'Total Auto Repair',
        text: "A mobile-friendly rebuild, with Google Ads and local SEO, took the shop from about $20,000 a month to about $100,000 a month in 18 months. Sixty percent of their traffic was mobile and the old site didn't work on a phone.",
        href: '/work/total-auto-repair',
        linkText: 'Read the case study',
      },
      {
        label: 'Wicked Logistics',
        text: 'A new site and social setup took a freight company from 1 to 2 leads a week to 5 to 6 a day. One of those leads became a $1.2 million a year contract.',
        href: '/work/wicked-logistics',
        linkText: 'Read the case study',
      },
    ],
    elPaso:
      "We're based in El Paso and build websites for businesses across El Paso County, Las Cruces, and the rest of the country.",
    offerLead:
      "The website is one part of our Demand Flow system. It's where the ad click lands and where the call starts, so we build it to do that one job well.",
    fit: [
      'Your site is slow on a phone or hard to call from',
      "You've one services page where you need ten",
      'You run ads and want pages built for them',
      'You want to own your site and its content outright',
    ],
    related: [
      { label: 'Is your website on Google?', href: '/marketing-advice/is-your-website-on-google' },
      { label: 'AI content and your website', href: '/marketing-advice/ai-content-and-your-website' },
      { label: 'Website conversion review', href: '/tools/website-conversion' },
    ],
    faqs: [
      {
        q: 'How long does a website take to build?',
        a: 'Four to eight weeks for most service businesses. The first week is strategy and page planning, then design, build, copy, photos, and testing. The biggest delay is usually waiting on content from the owner, so we write the copy ourselves and only ask you to approve it.',
      },
      {
        q: 'What should a service business website include?',
        a: 'A page for each service you sell, a page for each area you serve, your phone number and a booking button on every screen, reviews and job photos, a clear price or quote path, and a form that reaches you within a minute. For trades, add a storm, emergency, or same-day page. Every page should answer one question a buyer would type into Google.',
      },
      {
        q: 'What is the difference between web design and web development?',
        a: "Web design is what the visitor sees: layout, type, colour, and the path to the call. Web development is what makes it work: the code, speed, forms, tracking, and hosting. We do both, because a beautiful site that loads slowly or drops form fills doesn't book jobs.",
      },
      {
        q: 'Is SEO included in web design?',
        a: 'The foundation is. Every site we build ships with fast load times, proper titles and headings, schema markup, a sitemap, and a page structure Google and AI assistants can read. Ongoing SEO, which means new content, links, and local listings work each month, is a separate service.',
      },
      {
        q: 'Can you redo my existing website instead of starting over?',
        a: "Often, yes. If the platform is sound we rebuild the pages, speed, and conversion path on it. If it's a slow page builder or an old template we usually rebuild from scratch, because fixing it costs more than replacing it. We tell you which on the first call.",
      },
      {
        q: 'Who owns the website when it is done?',
        a: 'You do. The domain, the hosting account, the content, and the design are yours. If you ever leave, the site goes with you. Ask every agency this question before you sign.',
      },
      {
        q: 'Does a small business still need a website?',
        a: 'Yes. Your Google Business Profile gets you found, but the website is where people check you out and decide to call. AI assistants also read your site to decide whether to recommend you. A business with no site, or a slow one, loses the buyer at the last step.',
      },
      {
        q: 'What makes a website turn visitors into calls?',
        a: 'Speed, one clear promise at the top, the phone number and booking button on every screen, a page for each service and area, real photos and reviews placed where people decide, and a form that reaches you within a minute. Everything else is decoration.',
      },
      {
        q: 'Do you build websites outside El Paso?',
        a: 'Yes. We build sites for service businesses nationwide. The process is the same anywhere.',
      },
    ],
  },
  {
    slug: 'ai-search-optimization',
    blurb: 'Get recommended by ChatGPT and Google AI.',
    name: 'AI Search Optimization',
    navLabel: 'AI search optimization',
    title: 'AI Search Optimization (AEO and GEO)',
    description:
      'AI search optimization for service businesses. Get recommended by ChatGPT, Google AI Overviews, Perplexity, and Gemini. Nationwide and in El Paso.',
    eyebrow: 'AI search optimization · AEO · GEO',
    headline: 'Get Recommended by ChatGPT, Google AI, and Perplexity.',
    sub: 'Answer engine optimization (AEO) and generative engine optimization (GEO) for service businesses, nationwide and in El Paso.',
    intro:
      'More people now ask an AI assistant "who should I call" instead of scrolling ten blue links. The assistant names two or three businesses. We make sure yours is one of them, and that the person who asked becomes a booked job.',
    problemHeading: 'AI answers are replacing the search results page.',
    problems: [
      ['The assistant names someone else.', "Ask ChatGPT for the best roofer in your city. It names three companies. If you aren't one of them, that buyer never sees you."],
      ['Your site was built for Google, not for AI.', 'AI models need plain facts, clear structure, and proof they can quote. Most service sites bury all three under slogans.'],
      ["Nobody can tell if it's working.", "Rank trackers don't watch ChatGPT. Without a way to test the real answers, you're guessing."],
    ],
    builtHeading: 'Everything an AI assistant needs to recommend you.',
    built: [
      ['Entity and listing cleanup', 'Your name, address, phone, hours, services, and service area, identical on your site, Google Business Profile, Bing, Apple, and the directories AI models read.'],
      ['Answer-first pages', "Each service page answers the question a buyer asks, in the first paragraph, with the price range, the timeline, and who it's for."],
      ['Structured data', 'Organization, LocalBusiness, Service, FAQ, Article, and Review schema on every page, validated, so models can read the facts without guessing.'],
      ['Proof the model can quote', 'Case studies with real numbers and dates, reviews with replies, and a clear guarantee. Models cite specifics, not claims.'],
      ['Citations and mentions', 'Profiles and mentions on the directories, review sites, and local press AI assistants already cite for your trade.'],
      ['Monthly answer testing', 'We ask ChatGPT, Gemini, Perplexity, and Google AI Mode the questions your buyers ask, log who gets named, and fix what blocks you.'],
    ],
    longform: [
      {
        heading: 'What AI search optimization is, in plain words',
        paragraphs: [
          "AI search optimization is the work of making your business the answer when someone asks an AI assistant for a recommendation. People call it answer engine optimization (AEO) or generative engine optimization (GEO). The names differ. The job is the same: give ChatGPT, Google AI Overviews, Google AI Mode, Perplexity, Gemini, Claude, and Copilot clear, consistent, provable facts about what you do, where you do it, and why you're a safe pick.",
          "These assistants don't rank pages the way Google does. They read a handful of trusted sources, pull out facts, and write an answer. The sources they trust for a local service business are your own site, your Google Business Profile, your reviews, the directories that list you, and anything written about you elsewhere. If those sources disagree, or say nothing specific, the assistant names a competitor who made it easier.",
        ],
      },
      {
        heading: 'How it works with the SEO you already have',
        paragraphs: [
          "AI search optimization sits on top of normal SEO. It doesn't replace it. A page still has to be indexed, fast, and clear for Google before an assistant will read it. What changes is what goes on the page: direct answers, numbers, named service areas, and structured data, instead of long introductions and vague promises.",
          'Our local SEO and SEO work handles the foundation. This service adds the layer that gets you quoted: entity cleanup, answer-first copy, schema, citable proof, mentions, and monthly testing against the real assistants.',
        ],
      },
      {
        heading: 'What you get each month',
        paragraphs: [
          'Month one is cleanup and structure: listings matched, schema added, the top service pages rewritten to answer first, and a baseline of which assistants name you today. From month two we work the list: new proof published, mentions earned, pages added for the questions buyers ask, and the same questions re-tested. You get a one-page report that shows which assistants recommend you, for which questions, and what changed.',
          'Results take time because the assistants refresh what they know on their own schedule. Most businesses see their first citations in 60 to 90 days. Listings and schema changes show up faster in Google AI Overviews than in ChatGPT.',
        ],
      },
    ],
    compare: {
      heading: 'Traditional SEO and AI search optimization, side by side',
      columns: ['What matters', 'Traditional SEO', 'AI search optimization'],
      rows: [
        ['The goal', 'Rank on page one', 'Be one of the two or three businesses the assistant names'],
        ['Where answers come from', 'Your pages, judged by links and relevance', 'Your site plus listings, reviews, directories, and press, judged by consistency and proof'],
        ['How copy is written', 'Keywords and headings', 'Direct answers, numbers, dates, and named service areas'],
        ['Structured data', 'Helpful', 'Required. Models read schema to confirm facts'],
        ['Proof', 'Nice to have', 'Case studies and reviews with specifics are what get quoted'],
        ['How you measure it', 'Rank trackers and Search Console', 'Monthly tests of the real assistants, logged by question'],
      ],
    },
    proofHeading: 'What the work looks like',
    proof: [
      {
        label: 'Our own site',
        text: "Every page carries validated Organization, Service, FAQ, and Article schema, a public llms.txt file for AI crawlers, and case studies with dated numbers. It's the same build we do for clients.",
        href: '/marketing-advice/get-ai-to-recommend-your-business',
        linkText: 'Read how to get AI to recommend your business',
      },
      {
        label: 'Gonzalez & Sons Roofing',
        text: 'A roofer that went from about 2 roofs a month to about 8 in six months. The pages, proof, and follow-up built for that result are the same raw material AI assistants cite.',
        href: '/work/gonzalez-and-sons-roofing',
        linkText: 'Read the case study',
      },
    ],
    elPaso:
      "We're based in El Paso and test the assistants from here, so El Paso and borderland businesses see exactly what a local buyer is told. The same process works for businesses in any city.",
    offerLead:
      'AI search optimization is one of the channels inside our Demand Flow system. It makes sure the buyers who ask an assistant end up on your calendar.',
    fit: [
      'You sell a service people research before they hire',
      'Your listings and site are mostly accurate and you want them airtight',
      "You've at least a few reviews and one result you can prove",
      'You want to be early, before every competitor in your trade does this',
    ],
    related: [
      { label: 'How to get AI to recommend your business', href: '/marketing-advice/get-ai-to-recommend-your-business' },
      { label: 'AI gives everyone the same SEO advice', href: '/marketing-advice/ai-gives-everyone-the-same-seo-advice' },
      { label: 'AI search for local business', href: '/marketing-advice/ai-search-for-local-business' },
      { label: 'SEO foundations checklist', href: '/tools/seo-foundations' },
    ],
    faqs: [
      {
        q: 'What is the difference between AEO, GEO, and AI SEO?',
        a: "They're three names for the same work. AEO means answer engine optimization. GEO means generative engine optimization. AI SEO is the casual term. All of them mean making your business the answer an AI assistant gives.",
      },
      {
        q: 'Which AI tools does this cover?',
        a: 'ChatGPT and ChatGPT search, Google AI Overviews and AI Mode, Gemini, Perplexity, Claude, and Microsoft Copilot. We test all of them monthly. Most buyers use ChatGPT and Google.',
      },
      {
        q: 'Do I still need regular SEO?',
        a: "Yes. An assistant won't cite a page Google can't find. We run the SEO foundation and the AI layer together, or add the AI layer to SEO you already have.",
      },
      {
        q: 'How long until an AI assistant names my business?',
        a: 'Most clients see first citations in 60 to 90 days. Google AI Overviews move faster because they draw on the live index. ChatGPT updates its knowledge of local businesses more slowly.',
      },
      {
        q: 'How do you prove it is working?',
        a: 'We ask each assistant the questions your buyers ask, from your market, every month, and log who gets named. You see the questions, the answers, and the change over time. Booked jobs from those buyers show up in your tracking like any other channel.',
      },
      {
        q: 'Can you guarantee a ChatGPT recommendation?',
        a: 'No one can promise what a model will say. What we guarantee is the Demand Flow result: $50,000 in new revenue in 45 to 60 days for accepted businesses, or service fees refunded plus $500. AI search is one of the channels we use to get there.',
      },
      {
        q: 'Do you work outside El Paso?',
        a: 'Yes. We run AI search optimization for service businesses nationwide. The process is the same in any city.',
      },
      {
        q: 'What is AI-powered marketing and how does it help a small business?',
        a: 'AI-powered marketing uses software to do the parts of marketing that used to need a person on a phone or in a spreadsheet: answering calls after hours, texting back missed calls, following up quotes, writing first drafts, and spotting which ads to pause. For a small business it means no lead waits until morning and no quote is forgotten. We run it as part of the system, not as a product on its own.',
      },
      {
        q: 'Can AI do my SEO for me?',
        a: "AI can draft pages, suggest keywords, and write schema, and we use it for all three. It can't earn reviews, fix your listings, build real links, or decide what is true about your business. Pages written by AI with nothing specific in them don't get cited. The work is still the work; AI makes it faster.",
      },
      {
        q: 'Does AI SEO really work?',
        a: "Yes, when it means making your business easy for AI assistants to find, read, and trust. Businesses with complete listings, structured data, direct answers, and real proof get named in ChatGPT and Google AI answers. Businesses that just publish more AI-written text don't.",
      },
      {
        q: 'How do I measure ROI from AI search optimization?',
        a: "Three ways. Ask the assistants your buyers' questions each month and log whether you're named. Track referral traffic from chatgpt.com, perplexity.ai, and Google AI in your analytics. And ask every new lead how they found you. Then count booked jobs from those sources against what you spent.",
      },
      pricingFaq,
    ],
  },
  {
    slug: 'facebook-ads',
    blurb: 'Meta ads that book jobs, not likes.',
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
      ['Boosted posts and likes.', "Likes and reach look good in a report. They don't put a job on the calendar."],
      ['Lead forms nobody works.', 'A lead comes in at 7pm, nobody answers until tomorrow, and they already booked someone else.'],
      ['No idea what a customer costs.', "Without tracking from ad to booked job, you can't tell which campaign is paying for itself."],
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
    proofHeading: "Facebook ads we've run",
    proof: [
      {
        label: 'Parcel Management Group',
        text: "49 Facebook lead-form leads in 30 days at $17.70 each (August 11 to September 9, 2026), with every lead followed up automatically.",
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
      "We're based in El Paso and run Facebook and Instagram ads for businesses across El Paso County and the borderland, and for businesses across the country.",
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
      {
        q: 'What is a Facebook lead form?',
        a: 'A Facebook lead form opens inside the Facebook or Instagram app when someone taps your ad, with their name and phone already filled in. It gets more leads at a lower cost than sending people to a website, but the leads cool fast. Parcel Management Group got 49 lead-form leads in 30 days at $17.70 each, with every one followed up automatically.',
      },
      {
        q: 'How much should a local business spend on Facebook ads?',
        a: "Enough to get 30 to 50 leads a month, so the campaign has data to improve on. For most home service businesses that's $750 to $2,000 a month in ad spend, on top of management. Start with one offer and one audience, then add budget to what books jobs. Ad spend is paid from your own account.",
      },
      {
        q: 'How do Facebook ads work?',
        a: 'You write an ad, pick an area, and set a daily budget. Meta shows the ad in the Facebook and Instagram feeds of people likely to respond, and you pay per click or per thousand views. The lead fills a form or lands on your page, and your job is to answer within minutes. Meta finds the people. The ad and the follow-up do the selling.',
      },
      {
        q: 'Do Facebook ads work for contractors?',
        a: 'Yes, for the right jobs. Emergency work comes from Google, where people search. Planned work like water heaters, roof replacements, system upgrades, and remodels comes from Facebook ads aimed at the right homes. The Pipe Whisperers grew from about $60,000 a year to about $250,000 with Facebook ads as one of their channels.',
      },
      {
        q: 'Are Facebook ads worth it for a small business?',
        a: "They're worth it when every lead gets a reply in minutes and cost per booked job is tracked. A freight client got 49 leads in 30 days at $17.70 each with automatic follow-up. They aren't worth it when leads sit in an inbox until tomorrow. The ads are cheap. The missed follow-up is what costs you.",
      },
      pricingFaq,
    ],
  },
  {
    slug: 'google-ads',
    blurb: 'Search ads for people ready to hire.',
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
      ['Account audit or rebuild', "We start with what you've: what books work, what burns budget, and what to cut."],
      ['High-intent campaigns', 'Keywords and campaigns aimed at people searching for your services right now.'],
      ['Ad copy', 'Written for the job the searcher wants, not a generic pitch.'],
      ['Landing pages', 'One page per service, built for calls and form fills.'],
      ['Call and form tracking', 'Every call and form traced to the campaign and keyword that drove it.'],
      ['Weekly optimization', 'Budget moved toward what books, every week. The ad account is yours.'],
    ],
    proofHeading: "Google Ads we've run",
    proof: [
      {
        label: 'Gonzalez & Sons Roofing',
        text: 'We rebuilt their Google Ads account, created storm-damage landing pages, set up follow-up for no-shows, and tracked every estimate from click to signed contract. They went from 2 roofs a month to 8, with 8 contracts signed from 23 qualified estimates.',
        href: '/work/gonzalez-and-sons-roofing',
        linkText: 'Read the case study',
      },
    ],
    elPaso:
      "We're based in El Paso and run Google Ads for businesses across El Paso County and the borderland, and for businesses across the country.",
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
        a: "Google Ads bring calls as soon as they're live. SEO takes longer and keeps paying off. Most businesses start with ads and build SEO underneath them.",
      },
      {
        q: 'Do you work outside El Paso?',
        a: 'Yes. We run Google Ads for businesses nationwide.',
      },
      {
        q: 'What is Google Ads?',
        a: 'Google Ads is the paid listing at the top of a Google search. You pay each time someone clicks. For a service business, it means showing up for "AC repair near me" the minute someone types it, without waiting months for SEO. It\'s the fastest way to book jobs, and the fastest way to waste money if nobody tracks what each click became.',
      },
      {
        q: 'Is Google Ads worth it for a local service business?',
        a: "Yes, when the campaign targets the jobs you want, in the area you serve, and every call is tracked to a booked job. Gonzalez & Sons Roofing went from 2 to 8 roofs a month with Google Ads as the lead channel. It isn't worth it if calls go to voicemail or the budget runs on broad keywords across the whole city.",
      },
      {
        q: 'How do you measure Google Ads?',
        a: 'Cost per booked job, not cost per click. Every call and form from an ad is recorded with the keyword and campaign it came from, then matched to whether it became a job. You see spend, calls, booked jobs, and cost per job on one report every month.',
      },
      {
        q: 'Is $10 a day enough for Google Ads?',
        a: 'Enough to learn, not enough to grow. In most service markets a click costs $5 to $40, so $10 a day buys a handful of clicks and one or two calls a week. Use it to find which searches book jobs, then raise the budget on those. Most of our clients start at $25 to $100 a day.',
      },
      {
        q: 'How does the Google Ads daily budget work?',
        a: 'Google can spend up to twice your daily budget on a busy day, but never more than about 30 times it in a month. Set the daily number at your monthly budget divided by 30. Then watch cost per booked job, not spend.',
      },
      {
        q: 'Can Google Ads target zip codes?',
        a: "Yes. You can target cities, zip codes, or a radius around your shop, and exclude areas you don't serve. Set it to where your crews actually go. That stops you paying for clicks from a town you'll never drive to.",
      },
      {
        q: 'How long does it take for Google Ads to work?',
        a: 'Calls can come the first day the ads are approved. The first two to four weeks are for finding which searches and ads book jobs, so costs fall over that time. Gonzalez & Sons Roofing went from 2 to 8 roofs a month over six months with Google Ads as the lead channel.',
      },
      pricingFaq,
    ],
  },
  {
    slug: 'google-local-services-ads',
    blurb: 'Google Guaranteed leads, paid per lead.',
    name: 'Google Local Services Ads',
    navLabel: 'Local Services Ads',
    title: 'Google Local Services Ads (LSA)',
    description:
      'Google Local Services Ads management. Google Guaranteed or Screened badge, pay per lead, fast answer times. Nationwide and in El Paso.',
    eyebrow: 'Google Local Services Ads',
    headline: 'Google Local Services Ads That Put You at the Very Top.',
    sub: 'Local Services Ads (LSA) management, from Google Guaranteed and Google Screened setup to answering every lead. Nationwide and in El Paso.',
    intro:
      "Local Services Ads sit above everything else on Google, with a badge that tells searchers you're checked and trusted. You pay per lead, not per click. We get you verified, set the profile up to win, and make sure every lead gets answered.",
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
      "We're based in El Paso and run Local Services Ads for businesses across El Paso County and the borderland, and for businesses across the country.",
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
      {
        q: 'How do Local Services Ads decide who shows first?',
        a: "Google ranks Local Services Ads on review count and rating, how fast you answer calls and messages, your hours, your distance from the searcher, and how many leads you've paused or disputed. Answering every call and asking every customer for a review are the two biggest levers. Budget matters less than responsiveness.",
      },
      {
        q: 'How much do Google Local Services Ads cost?',
        a: "You pay per lead, not per click. Lead prices vary by trade and city, from about $15 for a cleaning lead to $50 or more for roofing or HVAC. You set a weekly budget and can dispute leads that were spam or outside your area. There's no fee for the Google Guaranteed badge itself.",
      },
      {
        q: 'How do I get the Google Guaranteed badge?',
        a: 'Apply through Local Services Ads, pass a background check for the business and its owners, and submit your licence and insurance. Approval usually takes one to three weeks. Once approved, the green badge shows on your ad and Google backs the work up to a set amount.',
      },
      {
        q: 'Is Google Guaranteed the same as Local Services Ads?',
        a: 'Google Guaranteed is the badge. Local Services Ads is the ad program that carries it. Home service businesses get Google Guaranteed, and professional services like lawyers get Google Screened. Both run through the same Local Services Ads account.',
      },
      {
        q: 'Is Google Guaranteed going away?',
        a: 'No. Google keeps changing the rules for Local Services Ads, such as how leads are charged and which trades qualify, but the program and the badge are active and growing in 2026. Check the current requirements for your trade before you apply.',
      },
      pricingFaq,
    ],
  },
  {
    slug: 'seo',
    blurb: 'Rank for the searches that bring work.',
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
      ['Rankings for words nobody buys from.', "Page 1 for a term that never brings a call isn't a win."],
      ["A site Google can't read.", 'Slow pages, missing structure, and thin service pages keep good businesses buried.'],
      ['Invisible in AI answers.', "More people ask ChatGPT and Google’s AI who to call. If your site doesn't answer clearly, you aren't in the answer."],
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
      "We're based in El Paso and do SEO for businesses across El Paso County and the borderland, and for businesses across the country.",
    offerLead:
      'SEO backs up the paid work inside our Demand Flow system, so the buyers we reach can find and trust you.',
    fit: [
      'Customers search for your services online',
      "You want leads that don't stop when ad spend does",
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
        a: "We build pages with clear, citable answers and the structured data AI tools read. It's part of our SEO work, not an extra.",
      },
      {
        q: 'What is the difference between SEO and local SEO?',
        a: 'SEO gets your website found in regular search results. Local SEO gets your business into the Google map results and your Google Business Profile. Most service businesses need both.',
      },
      {
        q: 'Do you work outside El Paso?',
        a: 'Yes. We do SEO for businesses nationwide.',
      },
      {
        q: 'What is SEO?',
        a: 'SEO, search engine optimization, is the work of making your website show up when someone searches Google for what you sell. It covers the words on your pages, how fast the site loads, how it\'s structured, and how many trusted sites link to it. For a service business, SEO means ranking for "roof repair" or "emergency plumber" plus your city, without paying per click.',
      },
      {
        q: 'Is SEO still worth it in 2026 with AI search?',
        a: 'Yes, and it matters more. AI Overviews, ChatGPT, and Perplexity pull their answers from pages that already rank and from listings that are complete. A site with no SEO is invisible to both. What changed is the writing: pages now need to answer the question directly, with numbers and named service areas, so a model can quote them.',
      },
      {
        q: 'Is SEO dead now that AI answers questions?',
        a: "No. Fewer clicks go to page one than before, but the businesses AI assistants recommend are the ones with strong, well-structured pages, consistent listings, and real reviews. That's SEO. What is dead is thin content written for keywords. Pages have to earn a citation now, not just a ranking.",
      },
      {
        q: 'What does an SEO agency actually do each month?',
        a: 'Research what your buyers search, fix technical problems that block Google, write or rewrite pages to answer those searches, earn links and mentions from trusted sites, keep your Google Business Profile and listings consistent, and report rankings, traffic, and booked jobs. If a report shows only rankings and no jobs, ask why.',
      },
      {
        q: 'How do you measure whether SEO is working?',
        a: 'By calls, forms, and booked jobs from organic search, tracked by page. Rankings and traffic are leading signs. Google Search Console shows which searches bring people in, Google Analytics shows what they do, and call tracking shows who booked. We report all three next to each other every month.',
      },
      {
        q: 'How much does SEO cost for a small business per month?',
        a: 'Most agencies charge $500 to $5,000 a month for SEO, depending on how competitive your market is and how much content and link work it takes. Local service businesses usually sit at the lower end. We include SEO inside the Demand Flow system and quote it on its own on a short call. Whatever you pay, measure it by calls and booked jobs from search, not rankings.',
      },
      {
        q: 'Do SEO companies really work?',
        a: 'The good ones do, and you can tell them apart in one question: show me calls and booked jobs from organic search for a client in my trade. An SEO company that reports only rankings and traffic is hiding the number that matters. Total Auto Repair went from about $20,000 to about $100,000 a month with SEO as one of three channels.',
      },
      {
        q: 'How does SEO work on Google?',
        a: 'Google reads your pages, works out what each one is about, and ranks it against every other page on that topic. It favours pages that answer the search directly, load fast, are linked from trusted sites, and belong to a business with consistent listings and real reviews. SEO is the work of giving Google all of those signals on purpose.',
      },
      pricingFaq,
    ],
  },
  {
    slug: 'local-seo',
    blurb: 'Google Business Profile and the map pack.',
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
      ['A half-finished profile.', "Wrong categories, missing services, and no photos tell Google you aren't the best answer."],
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
      "We're based in El Paso and do local SEO for businesses across El Paso County and the borderland, and for businesses across the country.",
    offerLead:
      'Local SEO backs up the paid work inside our Demand Flow system, so the buyers we reach can find and trust you.',
    fit: [
      'Customers find you on Google Maps or search “near me”',
      "You've or can set up a Google Business Profile",
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
      {
        q: 'What is local SEO?',
        a: 'Local SEO is the work of showing up in the Google map pack and in "near me" searches for your area. It\'s driven by your Google Business Profile, your reviews, your name, address, and phone number being identical everywhere, and pages on your site for each area you serve. For a service business, local SEO is usually the highest-return marketing there\'s.',
      },
      {
        q: 'What is a Google Business Profile and why does it matter?',
        a: "A Google Business Profile is the free listing that shows your business on Google Maps and in the map pack with your hours, phone, reviews, and photos. It's the single biggest factor in local search. Most profiles we audit are half built: wrong category, empty service area, no photos, no replies to reviews. Fixing those usually moves rankings within weeks.",
      },
      {
        q: 'How do I rank higher on Google Maps?',
        a: 'Google ranks the map pack on relevance, distance, and prominence. Set the right primary category and every service you offer, fill in your service areas, keep your name, address, and phone identical on every directory, earn reviews steadily and reply to all of them, add photos monthly, post weekly, and build pages on your site for each area. Do all seven and keep doing them.',
      },
      {
        q: 'How much does local SEO cost?',
        a: 'Most agencies charge $300 to $1,500 a month for local SEO, and Google Business Profile management alone runs $125 to $400 a month. We include local SEO inside the Demand Flow system and quote it on its own on a short call. Whatever you pay, measure it by calls from Maps and booked jobs, not by rankings.',
      },
      {
        q: 'Is it worth paying for local SEO?',
        a: "For a service business, yes. A map pack call is someone nearby who needs the job now and didn't cost a click. The Pipe Whisperers went from about $60,000 a year to about $250,000 with local SEO as one of three channels. It isn't worth paying for if the agency can't show you calls from Maps in your reporting.",
      },
      {
        q: 'Why do citations and links matter for local SEO?',
        a: "Citations are listings of your name, address, and phone on directories like Yelp, Bing, Apple, and the BBB. When they all match, Google trusts the business exists where it says. Links from local sites, suppliers, and trade associations add prominence. Together they're the trust layer under the map pack.",
      },
      {
        q: 'Does a Google Business Profile cost money?',
        a: 'No. A Google Business Profile is free, and so is showing up on Google Maps. What costs money is the work to rank it: categories, photos, posts, reviews, listings, and pages on your site. Anyone who tries to charge you for the profile itself is selling you something else.',
      },
      {
        q: 'How long does a Google Business Profile take to show up?',
        a: 'A new profile usually appears on Maps within a few days of verification. Verification itself can take a day by phone or email, or one to two weeks by postcard. Ranking in the map pack for real searches takes longer, typically one to three months of steady work.',
      },
      {
        q: 'Does local SEO still work?',
        a: 'Yes. It works better than ever because AI assistants and Google AI Overviews pull their local recommendations from the same signals: a complete profile, consistent listings, and real reviews. A map pack call is a nearby customer who needs the job now and cost you nothing per click.',
      },
      {
        q: 'How do you do local SEO for multiple locations?',
        a: 'Each location gets its own Google Business Profile, its own page on your website with its address and areas, its own reviews, and its own listings. Never share one profile across locations. Total Auto Repair opened a second location on exactly this setup.',
      },
      pricingFaq,
    ],
  },
  {
    slug: 'cold-email',
    blurb: 'B2B outreach that lands meetings.',
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
      "We're based in El Paso and run cold email for businesses here and across the country. Cold email isn't tied to a location, so we target buyers wherever they're.",
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
      {
        q: 'What is cold email?',
        a: "Cold email is a short, personal email to a business that hasn't heard from you, asking for a reply or a meeting. It works for B2B services when the list is accurate, the sending domains are warmed up, and the message is about the reader's problem, not your company. It's sent from separate domains so your main email stays safe.",
      },
      {
        q: 'How many cold emails does it take to get a meeting?',
        a: 'Roughly 100 to 300 emails per booked meeting for a well-targeted B2B campaign, depending on the offer and list. Reply rates of 2 to 5 percent are normal. The number falls as the list and message improve, which is why the first month is testing and the second month is scaling.',
      },
      {
        q: 'Do cold emails go to spam?',
        a: "They do when they're sent from your main domain, in bulk, with links and attachments, to a bad list. We send from separate warmed-up domains, keep each message short and plain, verify every address, and cap volume per inbox. Done that way, most cold email lands in the inbox.",
      },
      {
        q: 'How long should a cold email be?',
        a: 'Under 100 words. Three or four short sentences: why them, the problem you solve, one line of proof, and a one-question ask. The reader decides in five seconds on a phone. Long emails get skimmed and deleted.',
      },
      {
        q: 'How many cold emails can I send a day?',
        a: 'About 20 to 40 per inbox per day without hurting deliverability. To send more, add more inboxes and domains rather than pushing one harder. A campaign of 1,000 emails a day typically runs across 30 or more inboxes.',
      },
      {
        q: 'Is cold email dead in 2026?',
        a: 'No, but lazy cold email is. Spam filters are stricter and buyers delete anything generic. What still works is a clean list, a specific message about the reader, separate sending domains, and fast follow-up on every reply. Reply rates of 2 to 5 percent are normal for a well-run campaign.',
      },
      pricingFaq,
    ],
  },
];
