type CaseStudy = {
  slug: string;
  name: string;
  category: string;
  headline: string;
  intro: string;
  seoTitle: string;
  description: string;
  sections: { heading: string; paragraphs: string[] }[];
  quantified: boolean;
  logo?: { src: string; width: number; height: number };
  metrics?: { value: string; label: string }[];
  highlights: string[];
  related: { label: string; href: string }[];
  cta: { title: string; text: string };
  proof?: { src: string; width: number; height: number; alt: string; caption: string };
};

export const work: CaseStudy[] = [
  {
    slug: 'parcel-management-group',
    name: 'Parcel Management Group',
    category: 'Freight consulting · Facebook lead generation',
    headline: '49 Facebook leads in 30 days at $17.70 each.',
    intro: 'For Parcel Management Group, we connected Facebook advertising, lead capture, and automatic follow-up into one lead generation system.',
    seoTitle: 'PMG Facebook Lead Case Study',
    description: 'Parcel Management Group generated 49 Facebook leads at $17.70 per lead in 30 days. See the campaign, lead capture, and follow-up system behind the result.',
    sections: [
      {
        heading: 'A Facebook campaign with somewhere for every lead to go',
        paragraphs: [
          'Parcel Management Group is a freight consulting business. Our work brought together a Facebook ad campaign and the system behind it: a way to capture inquiries and automatically follow up when someone raised their hand.',
          'That connection matters in B2B lead generation. A prospect can show interest while the business is busy serving existing customers. The campaign opens the conversation; the follow-up gives that conversation a next step. We built those pieces together for PMG, then launched the campaign.',
        ],
      },
      {
        heading: 'The 30-day campaign results',
        paragraphs: [
          'From August 11 through September 9, 2026, Meta Ads Manager recorded 49 Facebook lead-form completions at an average cost of $17.70 per lead. One campaign generated 25 leads at $22.48 each. The other generated 24 leads at $12.72 each.',
          'Nearly the same number of inquiries came from each campaign, with a meaningful difference in cost per lead. That is useful detail when reviewing where advertising dollars are going. The screenshot shows the two campaign rows and the combined result for the same reporting window.',
        ],
      },
      {
        heading: 'Freight marketing beyond the first click',
        paragraphs: [
          'For a freight or logistics business, an inquiry is the start of a conversation about a shipping need. Lead capture and automatic follow-up give the team a way to carry that interest forward.',
          'PMG’s project brought advertising and response into the same process. The Facebook campaign created a source of new inquiries, while the lead system supplied the next step. That is the connection we look for when planning a lead generation campaign: how someone discovers the business, how they make contact, and what happens immediately afterward.',
        ],
      },
      {
        heading: 'What would 49 new inquiries look like in your pipeline?',
        paragraphs: [
          'Start with what your team would do with them. Who responds? Where does the conversation live? What happens when the prospect is interested but needs more time? Those questions help turn an advertising discussion into a practical plan. Bring us your current process, and we can look at the next opportunity together.',
        ],
      },
    ],
    quantified: true,
    logo: { src: '/images/clients/parcel-management-group.webp', width: 209, height: 240 },
    metrics: [
      { value: '49', label: 'Facebook leads' },
      { value: '$17.70', label: 'Average cost per lead' },
      { value: '30 days', label: 'Aug 11 to Sep 9, 2026' },
    ],
    highlights: ['Lead capture', 'Automatic follow-up', 'Facebook ad campaign'],
    related: [
      { label: 'Explore our lead generation and follow-up approach', href: '/solutions' },
      { label: 'See the Wicked Logistics growth story', href: '/work/wicked-logistics' },
    ],
    cta: { title: 'What happens after someone clicks your ad?', text: 'Let’s look at your campaign, your response process, and the next conversation your business could be missing.' },
    proof: {
      src: '/images/pmg-meta-ads-2026-08-11-to-2026-09-09.png',
      width: 447,
      height: 326,
      alt: 'Meta Ads Manager showing 25 leads at $22.48 per lead and 24 leads at $12.72 per lead, 49 leads total at $17.70 average.',
      caption: 'Meta Ads Manager, August 11 to September 9, 2026.',
    },
  },
  {
    slug: 'total-auto-repair',
    name: 'Total Auto Repair',
    category: 'Auto repair marketing · Business growth',
    headline: 'From roughly $20K to $100K a month.',
    intro: 'Total Auto Repair went from roughly $20K to $100K a month. That’s about five times the monthly revenue.',
    seoTitle: 'Auto Repair Marketing Case Study: Total Auto Repair',
    description: 'Total Auto Repair grew from roughly $20K to $100K in monthly revenue. Explore the result and the questions behind a stronger auto repair marketing plan.',
    sections: [
      {
        heading: 'The shop at $20K a month',
        paragraphs: [
          'Total Auto Repair started at roughly $20,000 in monthly revenue. The growth story is about the distance between that starting point and what came next.',
          'For an auto repair owner, monthly revenue is a number with immediate meaning. It connects the work coming into the shop with the business you are trying to build. Total Auto Repair’s result puts that question in concrete terms: what would it take to move beyond the level your shop is operating at today?',
        ],
      },
      {
        heading: 'The move to $100K months',
        paragraphs: [
          'Monthly revenue grew to roughly $100,000, about five times the earlier level. That is an increase of around $80,000 a month, and the reason Total Auto Repair is one of the client stories featured in DemandFlow.',
          'The comparison is simple enough to remember: $20K months became $100K months. If you run a repair shop, it is an invitation to examine your own next stage. How much work do you want coming in, which services do you want more of, and where does your current customer journey leave room to improve?',
        ],
      },
      {
        heading: 'Auto repair marketing starts with the customer journey',
        paragraphs: [
          'When we discuss auto repair lead generation with a shop owner, we look at the path from finding the business to getting a vehicle on the schedule. Can a driver quickly understand what you do? Is it easy to call or request service? Does an unanswered inquiry get another chance?',
          'Those are useful places to begin an auto repair marketing plan. Advertising, the website, response time, and follow-up all have a role. Looking at them together helps reveal whether the next opportunity is reaching more drivers or doing more with the interest already arriving.',
        ],
      },
      {
        heading: 'What is the next number for your shop?',
        paragraphs: [
          'Bring your current monthly revenue, your service area, and the repair work you want more of. We can use those details to start a focused conversation about your growth goals and the customer journey behind them. Total Auto Repair’s story is here to get that conversation started.',
        ],
      },
    ],
    quantified: true,
    logo: { src: '/images/clients/total-auto-repair.webp', width: 240, height: 220 },
    metrics: [
      { value: '~$20K', label: 'Monthly revenue before' },
      { value: '~$100K', label: 'Monthly revenue after' },
    ],
    highlights: ['Automotive repair business', 'About 5× the monthly revenue', 'From $20K months to $100K months'],
    related: [
      { label: 'See how Demand Flow works', href: '/#how' },
      { label: 'See all client results', href: '/work' },
    ],
    cta: { title: 'What would your next stage look like?', text: 'Tell us where your repair shop is today and the work you want more of. Let’s find the next opportunity.' },
  },
  {
    slug: 'gonzalez-and-sons-roofing',
    name: 'Gonzalez & Sons Roofing',
    category: 'Roofing marketing · Business growth',
    headline: 'From around 2 to 8 roofs a month.',
    intro: 'Gonzalez & Sons Roofing grew to roughly four times its monthly roof volume. Six more roofs a month changes the conversation about growth.',
    seoTitle: 'Gonzalez & Sons Roofing Results',
    description: 'Gonzalez & Sons Roofing grew from around 2 to 8 roofs per month. See the business growth result and explore your next roofing marketing opportunity.',
    sections: [
      {
        heading: 'A roofing business doing two roofs a month',
        paragraphs: [
          'Gonzalez & Sons Roofing was doing around two roofs a month. That is the starting point for this client’s growth story: a roofing business with work coming in and room for the monthly volume to grow.',
          'Roofing owners think in terms of the jobs on the calendar, the crews available, and the next estimate. A monthly roof count makes the growth question easy to picture. If your business is doing two roofs today, what would a month with eight look like?',
        ],
      },
      {
        heading: 'Four times the monthly roof volume',
        paragraphs: [
          'Gonzalez & Sons grew to around eight roofs a month. That is roughly four times the starting volume, or about six additional roofs each month. It is the result that puts this roofing company in our DemandFlow client stories.',
          'Two roofs and eight roofs describe very different months for a roofing business. For an owner considering their next move, that comparison creates a useful starting point: how much more work do you want, and what would need to happen between the first inquiry and the next job?',
        ],
      },
      {
        heading: 'Roofing lead generation needs a path to the estimate',
        paragraphs: [
          'When planning roofing marketing, we look at how a homeowner moves from interest to a conversation with the company. The offer needs to make sense, the service area needs to be clear, and requesting an estimate needs to be straightforward.',
          'The next part is the response. Who contacts the homeowner? How is the estimate arranged? What happens if the homeowner needs time to decide? Roofing lead generation, appointment setting, and estimate follow-up belong in the same discussion. Each one gives you a place to examine where the next job could come from.',
        ],
      },
      {
        heading: 'How many roofs do you want on next month’s calendar?',
        paragraphs: [
          'Start with the number your crews can handle and the areas you want to serve. Then look at the inquiries and estimates it would take to support that goal. We can walk through that with you and identify where a more connected marketing and follow-up process could help your roofing business.',
        ],
      },
    ],
    quantified: true,
    logo: { src: '/images/clients/gonzalez-and-sons-roofing.webp', width: 240, height: 179 },
    metrics: [
      { value: '~2', label: 'Roofs per month before' },
      { value: '~8', label: 'Roofs per month after' },
    ],
    highlights: ['Roofing business', 'About 4× the monthly roof volume', 'Around 6 additional roofs a month'],
    related: [
      { label: 'Book a strategy call', href: '/book' },
      { label: 'See how Demand Flow works', href: '/#how' },
    ],
    cta: { title: 'What would a fuller roofing calendar change?', text: 'Bring your service area, your crew capacity, and the jobs you want. Let’s look at the path to your next stage.' },
  },
  {
    slug: 'the-pipe-whisperers',
    name: 'The Pipe Whisperers',
    category: 'Plumbing marketing · Business growth',
    headline: 'From roughly $60K to $250K a year.',
    intro: 'The Pipe Whisperers grew to the point where the business had to expand. Annual revenue went from roughly $60,000 to $250,000.',
    seoTitle: 'Plumbing Business Growth: The Pipe Whisperers',
    description: 'The Pipe Whisperers grew from roughly $60K to $250K in annual revenue and had to expand. Explore the plumbing business growth story behind the numbers.',
    sections: [
      {
        heading: 'A plumbing business ready for its next chapter',
        paragraphs: [
          'The Pipe Whisperers was bringing in roughly $60,000 a year. What followed was growth large enough to change the size of the operation.',
          'For a plumbing owner, that is the question behind the marketing conversation. What would it look like to build a bigger business around the work you already know how to do? The Pipe Whisperers gives that question a memorable set of numbers.',
        ],
      },
      {
        heading: '$250K a year, and the need to expand',
        paragraphs: [
          'Annual revenue grew to roughly $250,000, more than four times the earlier level. The increase was around $190,000 a year. Growth reached the point where the business had to expand to support it.',
          'That expansion is what makes this story stand out. The result went beyond a larger revenue figure: the business needed room for its next stage. It is why The Pipe Whisperers is one of the plumbing business growth stories we share through DemandFlow.',
        ],
      },
      {
        heading: 'Plumbing marketing connects the first call to the next job',
        paragraphs: [
          'A practical plumbing marketing conversation starts with the work you want and the customers you can serve. Are you trying to bring in more service calls, larger projects, or work in a particular area? Those answers give the plan a direction.',
          'Then we look at the customer’s path. How do they find you? How easily can they reach someone? What happens after a missed call or an estimate that goes quiet? Plumbing lead generation and follow-up are connected parts of that journey. Reviewing both helps identify where additional demand would be useful and where an existing opportunity needs attention.',
        ],
      },
      {
        heading: 'Could your plumbing business be ready to expand?',
        paragraphs: [
          'You do not need to have the whole plan figured out before the first conversation. Bring the numbers you know, the work you want more of, and the questions you have about bringing in customers. We will look at the next move with you, including how demand fits the capacity of your business.',
        ],
      },
    ],
    quantified: true,
    logo: { src: '/images/clients/the-pipe-whisperers.webp', width: 235, height: 240 },
    metrics: [
      { value: '~$60K', label: 'Annual revenue before' },
      { value: '~$250K', label: 'Annual revenue after' },
    ],
    highlights: ['Plumbing business', 'More than 4× the annual revenue', 'Growth led to business expansion'],
    related: [
      { label: 'Book a strategy call', href: '/book' },
      { label: 'See how Demand Flow works', href: '/#how' },
    ],
    cta: { title: 'What would growth make possible for your business?', text: 'Let’s talk about your plumbing business, the customers you want to reach, and what your next stage could look like.' },
  },
  {
    slug: 'wicked-logistics',
    name: 'Wicked Logistics',
    category: 'Logistics marketing · Freight lead generation',
    headline: 'From 1–2 leads a week to 5–6 a day.',
    intro: 'One of those leads became a $1.2 million contract. For Wicked Logistics, a website, search campaigns, and connected follow-up opened the door to a much bigger conversation.',
    seoTitle: 'Freight Lead Generation Case Study: Wicked Logistics',
    description: 'Wicked Logistics went from 1–2 leads a week to 5–6 a day. One lead became a $1.2 million contract. Explore the website, campaigns, and follow-up behind it.',
    sections: [
      {
        heading: 'When a week’s inquiries became part of a single day',
        paragraphs: [
          'Wicked Logistics was receiving one or two leads a week. For a trucking and freight business looking for its next shipping customer, that meant a small number of new opportunities entering the conversation.',
          'The change was substantial: lead volume grew to five or six a day. A single day was bringing in more inquiries than the business previously saw in a week. That shift is the starting point of the Wicked Logistics growth story, but the value of one particular inquiry made it even more memorable.',
        ],
      },
      {
        heading: 'One lead. A $1.2 million contract.',
        paragraphs: [
          'One of those inbound leads turned into a contract worth $1.2 million. It is the result at the center of this case study: a new inquiry that developed into a major piece of business.',
          'For a logistics owner, that is a reason to look closely at how new shipping inquiries reach the team. The person filling out a form or starting a conversation could have a much larger need than the first message reveals. Wicked Logistics’ story shows why the path from interest to sales deserves attention.',
        ],
      },
      {
        heading: 'The logistics website and lead system behind the opportunity',
        paragraphs: [
          'Our work brought together a mobile-first website, search campaigns, and a CRM follow-up workflow. The website gave prospects a place to learn about the business and make an inquiry. Search campaigns supported freight lead generation, while the CRM connected those inquiries to a shared pipeline.',
          'Each inquiry had an owner and a next step. The pieces worked together around the sales conversation: attract interest, make contact straightforward, and give the team a process for following up. That connected approach was the foundation of the project for Wicked Logistics.',
        ],
      },
      {
        heading: 'What could your next freight inquiry be worth?',
        paragraphs: [
          'If your logistics marketing brings in a handful of inquiries, start by looking at what happens to each one. Where does it arrive? Who picks it up? How does the team keep the conversation moving? Then consider where additional demand could come from.',
          'We can review your website, your current lead sources, and your follow-up process with you. The goal is to find the next opportunity, and build a clear path for your business to pursue it.',
        ],
      },
    ],
    quantified: true,
    logo: { src: '/images/clients/wicked-logistics-transparent.webp', width: 240, height: 202 },
    metrics: [
      { value: '1–2', label: 'Leads per week before' },
      { value: '5–6', label: 'Leads per day after' },
      { value: '$1.2M', label: 'Contract from one lead' },
    ],
    highlights: ['From weekly inquiries to daily leads', '$1.2 million contract from one lead', 'Website, search campaigns, and CRM follow-up'],
    related: [
      { label: 'See PMG’s freight consulting lead generation results', href: '/work/parcel-management-group' },
      { label: 'Explore acquisition, conversion, and follow-up', href: '/solutions' },
    ],
    cta: { title: 'What could the next conversation lead to?', text: 'Let’s look at your logistics business, the shipping customers you want to reach, and the process that gets them talking to you.' },
  },
  {
    slug: 'only-fish',
    name: 'Only Fish',
    category: 'Small-business branding · Website and social launch',
    headline: 'A new business. A complete identity. One launch.',
    intro: 'Only Fish launched in May 2024 with a logo, a custom website, and a social presence built around one clear brand direction.',
    seoTitle: 'Only Fish Brand Launch Case Study',
    description: 'Only Fish launched in May 2024 with a new logo, brand identity, custom website, and social campaigns. Explore the complete small-business brand launch.',
    sections: [
      {
        heading: 'Building the brand before the first impression',
        paragraphs: [
          'Only Fish needed a complete digital identity for its May 2024 launch. Our work brought together the logo and brand identity, a custom website, and social campaigns so the business could introduce itself with a finished, consistent look.',
          'A new business has several first impressions to think about. Someone might see the logo on social media, visit the website, or hear the name from another person. The project gave Only Fish a common identity across those places, with the brand and its online presence developed together.',
        ],
      },
      {
        heading: 'Logo design and a custom website in the same direction',
        paragraphs: [
          'The logo and visual identity established the starting point for the brand. The custom website gave that identity a home online: a place where someone discovering Only Fish could get to know the business and take the next step.',
          'Bringing small-business branding and website design into the same project helps connect those experiences. The logo is part of the introduction, and the website carries the introduction further. For Only Fish, both were ready as part of the launch rather than being assembled at separate stages afterward.',
        ],
      },
      {
        heading: 'Ready for the May 2024 launch',
        paragraphs: [
          'Social campaigns completed the launch work, giving the new brand a presence beyond its website. The outcome was a coordinated starting point: a finished identity, a working custom site, and social activity ready to introduce the business.',
          'Only Fish could begin presenting itself as one business across its online touchpoints. The brand, website, and social launch were all moving in the same direction from day one.',
        ],
      },
      {
        heading: 'What does your business need before launch?',
        paragraphs: [
          'If you are starting a business, think about what someone should understand the first time they see it. What do you offer? What should they remember? Where should they go next? Those answers give logo design, website copy, and social content a shared purpose. Bring us the idea and the stage you are at, and we can discuss what belongs in your launch.',
        ],
      },
    ],
    quantified: false,
    logo: { src: '/images/clients/only-fish.webp', width: 153, height: 93 },
    highlights: ['Logo and brand identity', 'Custom website', 'May 2024 social launch'],
    related: [
      { label: 'Explore website and business growth services', href: '/solutions' },
      { label: 'Talk about a website project', href: '/book' },
    ],
    cta: { title: 'Have a business idea people should see?', text: 'Tell us what you are building. We can help you think through the brand, website, and launch that bring it to life.' },
  },
];
