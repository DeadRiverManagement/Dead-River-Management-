// Industry pages at /industries/<slug>. One per trade we have real proof for
// (or, for HVAC, a clearly labelled neighbouring result). Copy for the scene
// and the quote comes from the same trade research as industries.json.
export type IndustryPage = {
  slug: string;
  name: string; // "Roofing"
  trade: string; // "roofers"
  biz: string; // "roofing company"
  title: string; // <= 36 chars; layout appends " | Dead River Management"
  description: string; // <= 160
  headline: string;
  intro: string;
  scene: string;
  quote: string;
  problems: [string, string][];
  built: [string, string][];
  proof: { label: string; text: string; href: string; linkText: string; note?: string };
  caseStudySlug?: string;
  tools: { label: string; href: string }[];
  guides: { label: string; href: string }[];
  faqs: { q: string; a: string }[];
};

const follow = (what: string): [string, string] => [
  'Follow-up that closes the quote',
  `${what} Every quote gets a text the same day, a call the next, and a reminder a week out, until they book or say no.`,
];
const tracking: [string, string] = [
  'Tracking by booked job',
  'Every call, form, and text is recorded against the channel it came from. You see cost per booked job, not cost per click.',
];

export const industryPages: IndustryPage[] = [
  {
    slug: 'roofing',
    name: 'Roofing',
    trade: 'roofers',
    biz: 'roofing company',
    title: 'Roofing Marketing That Books Jobs',
    description:
      'Marketing for roofers that books inspections, not clicks. Storm pages, Google Ads, Local Services Ads, reviews, and follow-up. Nationwide and in El Paso.',
    headline: 'Marketing for roofers that books the inspection.',
    intro:
      'A roof is a $10,000 to $30,000 decision made in a hurry, often with an insurance adjuster in the middle. We build the pages, ads, listings, and follow-up that get the call, book the inspection, and keep the job from going to whoever answered faster.',
    scene:
      'You are on a roof, nail gun going, phone in the truck. The homeowner with water coming through the ceiling leaves no voicemail and calls the next roofer.',
    quote:
      'You inspected and sent the estimate for the replacement. They said they were waiting on the insurance adjuster. Nobody followed up, and the roof went to whoever did.',
    problems: [
      ['Storm leads go to the fastest phone.', 'After a storm, every roofer in town is buying the same clicks. The one who answers in minutes and books the inspection wins the week.'],
      ['Estimates die in the insurance wait.', 'The homeowner is waiting on an adjuster. Two weeks pass. Without follow-up, the signed contract goes to the roofer who checked in.'],
      ['Nobody can prove which ad paid for the roof.', 'A $25,000 job came from somewhere. If you cannot trace it, you cannot spend more where it works.'],
    ],
    built: [
      ['Pages for each job you want', 'Roof repair, roof replacement, storm damage, inspections, and commercial, each with your service areas, a gallery, and a free-inspection form that texts you.'],
      ['Google Ads and Local Services Ads', '"Roof repair near me" the morning after a storm is the click that books an inspection the same day. We run search ads and Google Guaranteed listings, and we pause them when your calendar is full.'],
      ['Google Business Profile', 'Categories set to Roofing contractor and Roof repair, photos of finished roofs, posts after every storm, and a review ask after every job.'],
      ['Phones answered after hours', 'A missed-call text goes out in under a minute and offers two inspection times. An AI receptionist trained on roofing questions can book the slot when nobody can pick up.'],
      follow('Roofing quotes close on the third touch, not the first.'),
      tracking,
    ],
    proof: {
      label: 'Gonzalez & Sons Roofing',
      text: 'From about 2 roofs a month to about 8 in six months, at around $25,000 a job, with Google Ads, storm pages, and follow-up. Investment: $3,500 a month including ads.',
      href: '/work/gonzalez-and-sons-roofing',
      linkText: 'Read the roofing case study',
    },
    caseStudySlug: 'gonzalez-and-sons-roofing',
    tools: [
      { label: 'Lead response scorecard', href: '/tools/lead-response' },
      { label: 'Ad budget planner', href: '/tools/ad-budget' },
      { label: 'Campaign ROI calculator', href: '/tools/campaign-roi' },
    ],
    guides: [
      { label: 'Which trades are easiest to rank on Google', href: '/marketing-advice/which-trades-are-easiest-to-rank-on-google' },
      { label: 'Get a review after every job', href: '/marketing-advice/get-a-review-after-every-job' },
      { label: 'How fast you answer is the real cost of a lead', href: '/marketing-advice/lead-response-time' },
    ],
    faqs: [
      { q: 'Do you handle storm season differently?', a: 'Yes. We keep storm damage pages and ads ready, raise budgets the day a storm hits, and route every call to someone who can book an inspection within the hour. When the calendar fills, we pull spend back.' },
      { q: 'Can you help with insurance claim jobs?', a: 'We cannot do the claim, but we can keep the homeowner warm through it. Follow-up texts and calls during the adjuster wait are where most roofing contracts are won or lost.' },
      { q: 'What does it cost?', a: 'Roofing is a Demand Flow trade: $50,000 in new revenue in 45 to 60 days for accepted companies, or service fees refunded plus $500. Ad spend is separate and paid from your own account. Gonzalez & Sons invested about $3,500 a month including ads.' },
      { q: 'Do you work with roofers outside El Paso?', a: 'Yes. The same system runs for roofers nationwide. We adjust service areas, storm patterns, and ad budgets to your market.' },
      { q: 'How fast will I see roofs on the calendar?', a: 'Ads and the phone system go live in the first two weeks. Gonzalez & Sons went from 2 to 8 roofs a month over six months. Your first booked inspections usually come inside the first month.' },
      { q: 'Do you work with residential and commercial roofers?', a: 'Yes. Residential roofing, which is mostly storm and replacement work, runs on Google Ads, Local Services Ads, and fast follow-up. Commercial roofing is a longer sale, so it adds cold email to property managers, case studies, and a slower nurture. We build the system to match the mix of work you want.' },
      { q: 'What should a roofing website include?', a: 'A page for each service (roof repair, roof replacement, storm damage, inspections, commercial), a page for each area you serve, a free-inspection form that texts you, a gallery of finished roofs, reviews, your licence and insurance, and the phone number on every screen. Add a storm page you can switch on the day a storm hits.' },
      { q: 'How do roofing companies get leads?', a: 'Four ways that work: Google Ads and Local Services Ads for people searching right now, a Google Business Profile that ranks in the map pack, storm pages and Facebook ads for replacement work, and follow-up that stays on every estimate through the insurance wait. Door knocking and bought leads work until the first storm, when everyone has them.' },
      { q: 'How much do roofing leads cost?', a: 'Bought leads from marketplaces run $50 to $300 each and are shared with other roofers. Leads from your own ads usually cost $40 to $150 and are yours alone. Gonzalez & Sons invested about $3,500 a month, ads included, for about 8 roofs a month, which is roughly $440 per booked roof at around $25,000 a job.' },
      { q: 'Are roofing leads worth buying?', a: 'Rarely. Marketplace leads are sold to three to five roofers at once, so you are racing on price. The same money spent on your own ads, profile, and follow-up brings leads that only you have. Buy leads only to fill a gap while your own system ramps up.' },
    ],
  },
  {
    slug: 'plumbing',
    name: 'Plumbing',
    trade: 'plumbers',
    biz: 'plumbing company',
    title: 'Plumber Marketing That Books Jobs',
    description:
      'Marketing for plumbers that books the 9 PM call. Emergency pages, Google and Facebook ads, reviews, and text follow-up. Nationwide and in El Paso.',
    headline: 'Marketing for plumbers that books the 9 PM call.',
    intro:
      'A burst pipe does not wait for business hours, and neither does the homeowner. We build the emergency pages, ads, listings, and after-hours phone system that get the call, book the job, and follow up on every water heater quote until it closes.',
    scene:
      'You are under a house, hands full. The phone rings, goes to voicemail, and the caller is already dialing the next plumber. That is a job, gone in twenty seconds.',
    quote:
      'You priced the water heater. They said they would think about it. Nobody called back, so they went with whoever did. Follow-up is not pushy. It is how the quote closes.',
    problems: [
      ['The emergency call goes to voicemail.', 'An "emergency plumber" search at 11 PM is the most expensive click in the trade. If nobody picks up, you paid for the lead and someone else got the job.'],
      ['Water heater quotes drift away.', 'A $2,500 replacement quote gets a "let me think about it." Without a follow-up text and a call, that job goes to the next plumber who asks.'],
      ['Ads bring calls you cannot track.', 'Google, Facebook, and the Local Services Ads all ring the same phone. Without call tracking you cannot tell which one is paying for itself.'],
    ],
    built: [
      ['Pages for the work you want', 'Water heaters, repipes, drain cleaning, slab leaks, and emergency service, each with your service areas, click-to-call on every screen, and a form that texts you the second it is filled out.'],
      ['Google Ads, Local Services Ads, and Facebook', 'Search ads for emergencies, Google Guaranteed listings for trust, and Facebook ads aimed at homeowners with water heaters over 15 years old.'],
      ['Google Business Profile', 'Categories set to Plumber, Water heater repair, and Drain cleaning, service areas filled in, posts every week, and a review ask after every job.'],
      ['Phones answered at 11 PM', 'A missed-call text in under a minute, and an AI receptionist trained on plumbing questions that can book a time when the crew is under a house.'],
      follow('Plumbing quotes close on the follow-up, not the visit.'),
      tracking,
    ],
    proof: {
      label: 'The Pipe Whisperers',
      text: 'From about $60,000 a year to about $250,000 in 24 months with local SEO, Google Ads, Facebook ads aimed at old water heaters, emergency pages, and text follow-up. Investment: $2,000 a month including ads.',
      href: '/work/the-pipe-whisperers',
      linkText: 'Read the plumbing case study',
    },
    caseStudySlug: 'the-pipe-whisperers',
    tools: [
      { label: 'Lead response scorecard', href: '/tools/lead-response' },
      { label: 'Cost per customer calculator', href: '/tools/customer-acquisition-cost' },
      { label: 'Ad budget planner', href: '/tools/ad-budget' },
    ],
    guides: [
      { label: 'Do Facebook ads work for plumbers?', href: '/marketing-advice/facebook-ads-for-plumbers' },
      { label: 'Get a review after every job', href: '/marketing-advice/get-a-review-after-every-job' },
      { label: 'What an AI receptionist costs', href: '/marketing-advice/ai-receptionist-cost' },
    ],
    faqs: [
      { q: 'Can you really answer after-hours calls?', a: 'Yes. A missed-call text goes out in under a minute. If you want, an AI receptionist trained on plumbing questions picks up, quotes your after-hours rate, and books the first slot. You decide what it can and cannot say.' },
      { q: 'Do Facebook ads work for plumbers?', a: 'For the right job, yes. Emergency work comes from Google. Water heater replacements, repipes, and maintenance plans come from Facebook ads aimed at the right homes, with fast follow-up. The Pipe Whisperers grew on both.' },
      { q: 'What does it cost?', a: 'Plumbing is a Demand Flow trade: $50,000 in new revenue in 45 to 60 days for accepted companies, or service fees refunded plus $500. Ad spend is separate. The Pipe Whisperers invested about $2,000 a month including ads.' },
      { q: 'Do you work with plumbers outside El Paso?', a: 'Yes. We run the same system for plumbers nationwide and adjust service areas and budgets to your market.' },
      { q: 'How soon do calls start?', a: 'Ads and the phone system go live in the first two weeks. Emergency search ads bring calls almost immediately. Water heater campaigns build over the first one to two months.' },
      { q: 'Do you work with residential and commercial plumbers?', a: 'Yes. Residential plumbing runs on emergency search ads, Local Services Ads, and after-hours phone handling. Commercial plumbing adds cold email to property managers and contractors, and a slower follow-up for maintenance contracts. We set the system up for whichever mix you want more of.' },
      { q: 'What should a plumbing website include?', a: 'A page for each service (water heaters, drain cleaning, repipes, slab leaks, emergency service), a page for each area you serve, click-to-call on every screen, a form that texts you the second it is filled out, your after-hours rate, reviews, and your licence number. Spanish pages where your customers use them.' },
      { q: 'How do I get more plumbing leads?', a: 'Answer every call, including after hours. Rank your Google Business Profile for your city. Run search ads for emergency work and Facebook ads for water heaters and repipes. Then text and call every quote until it books. The Pipe Whisperers grew from about $60,000 a year to about $250,000 doing exactly that.' },
      { q: 'How much do plumbing leads cost?', a: 'Bought leads from marketplaces run $25 to $150 each and are shared. Leads from your own Google and Facebook ads usually cost $20 to $80 and are yours alone. The Pipe Whisperers invested about $2,000 a month including ads. Judge any lead by what it costs per booked job, not per name.' },
      { q: 'What is the best way to get plumbing leads online?', a: 'The map pack first, because a Maps call is free and the person needs you now. Then Google Local Services Ads for the Google Guaranteed badge. Then search ads for emergencies and Facebook ads for planned work. All of it fails if the phone goes to voicemail, so fix the phone first.' },
    ],
  },
  {
    slug: 'hvac',
    name: 'HVAC',
    trade: 'HVAC companies',
    biz: 'HVAC company',
    title: 'HVAC Marketing That Books Jobs',
    description:
      'Marketing for HVAC companies that books the July call. Service pages, Google Ads, maintenance plans, reviews, and follow-up. Nationwide and in El Paso.',
    headline: 'Marketing for HVAC companies that books the July call.',
    intro:
      'When the AC quits at 4 PM in July, the family calls the first company that answers. We build the pages, ads, listings, and phone system that make that company yours, then follow up on every replacement quote until it closes.',
    scene:
      'You are on a roof unit at 105 degrees, phone in the truck. The family whose AC just quit is not leaving a voicemail. They are calling the next HVAC company.',
    quote:
      'You quoted the new system. They said they would get the old one through one more summer. Nobody followed up, and when it finally died, they called whoever answered.',
    problems: [
      ['Summer calls go to whoever answers.', '"AC repair near me" in July is the most expensive click in the trade and the one that books before you hang up. A missed call is a lost job and a wasted click.'],
      ['Replacement quotes wait a year.', 'A $12,000 system quote gets "one more summer." Without follow-up, that install goes to the company that called when it finally failed.'],
      ['Winter is quiet because nobody planned for it.', 'Maintenance plans and heating work fill the slow months, but only if they were sold in the busy ones.'],
    ],
    built: [
      ['Pages for each service', 'AC repair, AC replacement, heating, maintenance plans, ductwork, and mini-splits, each with your service areas, financing, and click-to-call on every screen.'],
      ['Google Ads and Local Services Ads', 'Search ads that scale up in heat waves and scale down when the schedule is full. Google Guaranteed listings for the trust badge.'],
      ['Google Business Profile', 'Categories set to HVAC contractor, Air conditioning repair service, and Heating contractor, photos of installs, weekly posts, and a review ask after every job.'],
      ['Phones answered during the rush', 'A missed-call text in under a minute, and an AI receptionist trained on HVAC questions: repair versus replace, same-day availability, SEER ratings, financing, and after-hours rates.'],
      follow('System replacements close months after the first quote.'),
      tracking,
    ],
    proof: {
      label: 'The Pipe Whisperers',
      text: 'We have not published an HVAC case study yet. The closest is a plumbing company with the same emergency-call pattern: about $60,000 a year to about $250,000 in 24 months with emergency pages, Google Ads, and text follow-up.',
      href: '/work/the-pipe-whisperers',
      linkText: 'Read the plumbing case study',
      note: 'Plumbing result, shown as the nearest trade. Not an HVAC benchmark.',
    },
    tools: [
      { label: 'Lead response scorecard', href: '/tools/lead-response' },
      { label: 'Revenue goal planner', href: '/tools/revenue-goal' },
      { label: 'Ad budget planner', href: '/tools/ad-budget' },
    ],
    guides: [
      { label: 'Five habits for a year-round busy season', href: '/marketing-advice/five-habits-for-a-year-round-busy-season' },
      { label: 'Rank higher on Google Maps checklist', href: '/marketing-advice/rank-higher-on-google-maps-checklist' },
      { label: 'The Google Ads fix that stops wasted spend', href: '/marketing-advice/google-ads-form-that-stops-wasted-spend' },
    ],
    faqs: [
      { q: 'How do you handle the summer rush and the winter lull?', a: 'Ad budgets rise with the temperature and fall when the schedule is full. Maintenance plans and heating pages are sold during the busy months so winter has work booked in advance.' },
      { q: 'Can you follow up on replacement quotes for months?', a: 'Yes. A replacement quote gets a text the same day, a call the next week, and a check-in each month until the homeowner decides. When the old system fails, you are the company that stayed in touch.' },
      { q: 'What does it cost?', a: 'HVAC is a Demand Flow trade: $50,000 in new revenue in 45 to 60 days for accepted companies, or service fees refunded plus $500. Ad spend is separate and paid from your own account.' },
      { q: 'Do you work with HVAC companies outside El Paso?', a: 'Yes. We run the same system nationwide. Service areas, seasons, and budgets are set to your market.' },
      { q: 'Do you have HVAC results?', a: 'Not published yet. Our nearest result is a plumbing company with the same emergency-call business, shown above and labelled as such. We do not claim it as an HVAC benchmark.' },
      { q: 'Do you work with residential and commercial HVAC companies?', a: 'Yes. Residential HVAC runs on seasonal search ads, Local Services Ads, maintenance plans, and long follow-up on replacement quotes. Commercial HVAC adds cold email to property managers and facilities teams and a slower nurture for service contracts. We build for whichever side you want to grow.' },
      { q: 'What should an HVAC website include?', a: 'A page for each service (AC repair, AC replacement, heating, maintenance plans, ductwork, mini-splits), a page for each area you serve, financing options, same-day availability, click-to-call on every screen, a form that texts you, reviews, and your licence. Add a heat-wave page with a same-day promise you can switch on in summer.' },
      { q: 'How do HVAC companies get leads?', a: 'Search ads and Local Services Ads for the summer and winter rush, a Google Business Profile that ranks for AC repair and heating in your city, maintenance plans sold to every customer, and long follow-up on replacement quotes. The company that stays in touch for a year gets the install when the old system finally fails.' },
      { q: 'How much do HVAC leads cost?', a: 'Bought repair leads run $50 to $150 and replacement leads $100 to $300 or more, shared with other contractors. Leads from your own ads usually cost $40 to $120 and are yours alone. Measure cost per booked job, not per lead, and expect it to drop in peak season when demand is highest.' },
      { q: 'How do I get commercial HVAC leads?', a: 'Commercial is a longer sale to property managers, facilities teams, and general contractors. It runs on cold email, case studies, maintenance contracts, and a slower follow-up over months. Search ads still catch commercial emergencies. We set up residential and commercial as separate campaigns with separate reporting.' },
    ],
  },
  {
    slug: 'auto-repair',
    name: 'Auto repair',
    trade: 'auto repair shops',
    biz: 'auto repair shop',
    title: 'Auto Repair Shop Marketing',
    description:
      'Marketing for auto repair shops that fills the bays. Service pages, Google Ads, reviews, and reminders that bring customers back. Nationwide and in El Paso.',
    headline: 'Marketing for auto repair shops that fills the bays.',
    intro:
      '"Mechanic near me" is a driver with a problem today and a car for years. We build the pages, ads, listings, and follow-up that get that first visit, then bring the customer back for every oil change and brake job after it.',
    scene:
      'You are under a car, phone in the office ringing out. The driver with a check engine light and a road trip Friday leaves no voicemail and calls the next shop.',
    quote:
      'You diagnosed it and quoted the repair. They said they would think about it. Nobody followed up, and the repair went to whoever did, or the car got traded in.',
    problems: [
      ['Drive-by traffic is not a plan.', 'Word of mouth and a sign on the street give you some months and starve you in others. Growth needs a channel you control.'],
      ['Quotes leave without booking.', 'A $900 repair quote walks out the door with "let me think about it." Without a follow-up text, the car goes to another shop or gets traded in.'],
      ['Past customers forget you.', 'Every car in your system needs an oil change, brakes, and tires on a schedule. If nobody reminds them, they go wherever is closest that day.'],
    ],
    built: [
      ['Pages for each service', 'Diagnostics, brakes, AC, engine and transmission, oil changes, and inspections, plus the makes you service, your hours, and online scheduling.'],
      ['Google Ads', 'Search ads for "mechanic near me" and the repairs you want more of, within the miles people will actually drive, tracked to the booked visit.'],
      ['Google Business Profile', 'Categories set to Auto repair shop, Mechanic, and Brake shop, photos of the bays, weekly posts, and a review ask after every visit.'],
      ['Phones answered from under the car', 'A missed-call text in under a minute, and an AI receptionist trained on repair questions: diagnostic fees, timelines, loaners, warranties, and which makes you service.'],
      follow('A repair quote that leaves the shop needs a text that evening.'),
      ['Reminders that bring cars back', 'Oil change, brake, and inspection reminders by text and email, timed to each car. Past customers are the cheapest work you will ever book.'],
    ],
    proof: {
      label: 'Total Auto Repair',
      text: 'From about $20,000 a month to about $100,000 a month in 18 months with local SEO, Google Ads, a mobile site, and follow-up, then a second location. Investment: $2,500 a month including ads.',
      href: '/work/total-auto-repair',
      linkText: 'Read the auto repair case study',
    },
    caseStudySlug: 'total-auto-repair',
    tools: [
      { label: 'Revenue goal planner', href: '/tools/revenue-goal' },
      { label: 'Cost per customer calculator', href: '/tools/customer-acquisition-cost' },
      { label: 'Website conversion review', href: '/tools/website-conversion' },
    ],
    guides: [
      { label: 'Why businesses stay stuck for years', href: '/marketing-advice/why-businesses-stay-stuck-for-years' },
      { label: 'Get a review after every job', href: '/marketing-advice/get-a-review-after-every-job' },
      { label: 'Google Business Profile categories', href: '/marketing-advice/google-business-profile-categories' },
    ],
    faqs: [
      { q: 'Do you do the reminders for past customers?', a: 'Yes. Every car gets oil change, brake, and inspection reminders by text and email on its own schedule. Total Auto Repair rebuilt its month on repeat visits before the ads scaled.' },
      { q: 'Will ads bring the right kind of work?', a: 'We target the repairs you want more of and the makes you service, within the distance drivers will travel. You approve the list before anything runs.' },
      { q: 'What does it cost?', a: 'Auto repair is a Demand Flow trade: $50,000 in new revenue in 45 to 60 days for accepted shops, or service fees refunded plus $500. Ad spend is separate. Total Auto Repair invested about $2,500 a month including ads.' },
      { q: 'Do you work with shops outside El Paso?', a: 'Yes. The same system runs for shops nationwide.' },
      { q: 'How long did Total Auto Repair take?', a: 'Eighteen months from about $20,000 a month to about $100,000 a month. The first new customers came in the first month. The second location came after.' },
      { q: 'Do you work with independent shops and multi-location shops?', a: 'Yes. A single shop runs on Google Ads for "mechanic near me", a strong Google Business Profile, reviews, and reminders that bring cars back. A second or third location gets its own profile, its own pages, and its own ad budget so each one is measured on its own. Total Auto Repair opened its second location on this system.' },
      { q: 'What should an auto repair website include?', a: 'A page for each service (diagnostics, brakes, AC, engine and transmission, oil changes, inspections), the makes you service, hours, online scheduling, click-to-call on every screen, reviews, photos of the bays, warranty terms, and whether you offer loaners. Every page should answer the question a driver asks before choosing a shop.' },
      { q: 'How do I market an auto repair shop?', a: 'Rank your Google Business Profile for mechanic and auto repair in your city, run search ads for the repairs you want more of, ask every customer for a review, and send oil change and brake reminders so cars come back. Total Auto Repair went from about $20,000 a month to about $100,000 on that system.' },
      { q: 'How do I make my auto repair shop more profitable?', a: 'Fill the bays with the jobs that pay best, not just the most cars. Follow up every quote that leaves without booking. Bring past customers back with reminders, because repeat work costs almost nothing to win. Then track which marketing brings which jobs and stop paying for the rest.' },
      { q: 'Are auto repair shops profitable?', a: 'Yes, when the bays stay full and the shop sells the full repair instead of just the diagnosis. Marketing decides the first part. Follow-up and reminders decide the second. Total Auto Repair opened a second location once the system was running.' },
    ],
  },
];
