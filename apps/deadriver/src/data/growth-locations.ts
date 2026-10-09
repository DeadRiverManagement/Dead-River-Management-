// Publish only researched, useful entries. A new location needs real local
// context, real coverage, and honest proof before it gets a page.
// City pages carry the full set below. The El Paso entry keeps the shorter
// shape it launched with; the template renders whichever fields exist.
export type CityPage = {
  slug: string;
  name: string;
  region: string;
  intro: string;
  areas: string[];
  context: string;
  priorities: string[];
  proof: string;
  title?: string; // <= 36 chars; the layout appends " | Dead River Management"
  description?: string; // <= 160
  eyebrow?: string;
  headline?: string;
  about?: { heading: string; paragraphs: string[] };
  services?: { name: string; href: string; blurb: string }[];
  demand?: { heading: string; lead: string; items: string[]; note: string };
  nearby?: { label: string; href: string }[];
  faq?: { q: string; a: string }[];
  zip?: string;
  state?: string; // "TX" or "NM" for schema
};

export const locations: CityPage[] = [
  {
    slug: 'el-paso',
    name: 'El Paso',
    region: 'Texas',
    intro:
      "We're based in El Paso and work with businesses across the borderland and beyond.",
    areas: [
      'Westside',
      'Eastside',
      'Northeast',
      'Lower Valley',
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
    ],
    context:
      'A service business needs ads and follow-up that match where its crews actually go. A practice needs a plan that fits its schedule and its most valuable treatments. An online store needs sales and repeat-order reporting, not a local lead count.',
    priorities: [
      "Decide exactly which areas you serve, so ad money isn't spent where you can't deliver.",
      'Keep your business listings, contact details, and website consistent everywhere.',
      "Track which leads turn into bookings or sales, wherever the data allows.",
    ],
    proof:
      "Our published client work includes freight consulting and logistics. We don't claim those results as a benchmark for every local business.",
    nearby: [
      { label: 'Horizon City', href: '/locations/horizon-city' },
      { label: 'Socorro', href: '/locations/socorro' },
      { label: 'Las Cruces', href: '/locations/las-cruces' },
    ],
  },
  {
    slug: 'horizon-city',
    name: 'Horizon City',
    region: 'Texas',
    state: 'TX',
    zip: '79928',
    title: 'Horizon City Marketing Agency',
    description:
      'Marketing agency for Horizon City, TX. Web design, local SEO, Google Ads, Facebook ads, and AI search that book jobs. Based 20 minutes away in El Paso.',
    eyebrow: 'Horizon City, Texas · El Paso County',
    headline: 'Marketing for Horizon City businesses that books the job.',
    intro:
      "Horizon City is one of the fastest-growing cities in El Paso County, and the businesses that serve it are growing with it. We're the El Paso marketing agency twenty minutes up the road, and we build the web design, local SEO, Google Ads, Facebook ads, and follow-up that turn Horizon City searches into booked work.",
    areas: ['Horizon City', 'Eastlake', 'Far East El Paso', 'Montana Vista', 'Socorro', 'Clint', 'Fabens', 'Tornillo', 'San Elizario'],
    context:
      'A Horizon City service business competes with every East El Paso company that drives out Horizon Boulevard. Winning here means showing up for "near me" searches from the 79928 zip code, on Google Maps, and in the AI answers people ask before they call.',
    priorities: [
      'List Horizon City, Eastlake, and the far East side as named service areas on your Google Business Profile, not just El Paso.',
      'Give the Horizon City work its own page on your website, with the subdivisions you serve and real job photos from them.',
      'Track which calls come from Horizon City searches so ad money follows the jobs, not the clicks.',
    ],
    proof:
      'Gonzalez & Sons Roofing went from about 2 roofs a month to about 8 with Google Ads, storm pages, and follow-up. The Pipe Whisperers went from about $60,000 a year to about $250,000. Both serve East El Paso and Horizon City homes.',
    about: {
      heading: 'Why Horizon City marketing is its own job',
      paragraphs: [
        "Horizon City sits east of El Paso along Horizon Boulevard and Interstate 10, and most of it was built in the last twenty years. That means newer homes, young families, a lot of first-time homeowners, and a steady stream of searches for a plumber, a roofer, an HVAC company, a landscaper, a dentist, or a mechanic who will actually come out to 79928. Google treats Horizon City as its own place. A Google Business Profile that only lists El Paso often doesn't show in the Horizon City map pack at all.",
        "The digital marketing agencies in El Paso mostly treat Horizon City as a line in a service-area list. We treat it as a market. Local SEO for Horizon City means your profile, your website, and your citations all name the city. Google Ads for Horizon City means a campaign with its own radius and its own budget, so a click from Eastlake isn't competing with a click from the Westside. Web design for a Horizon City business means a page a homeowner on Darrington Road recognises as hers.",
        "We're based in El Paso, about twenty minutes away. Our team drives the same roads your crews do, and the same system we run for El Paso businesses, from the Demand Flow guarantee to AI search optimization, runs for Horizon City businesses with the targeting moved east.",
      ],
    },
    services: [
      { name: 'Web design', href: '/services/seo', blurb: 'A mobile-first Horizon City website with a page for each service, click-to-call, and a form that texts you.' },
      { name: 'Local SEO and Google Business Profile', href: '/services/local-seo', blurb: 'Rank in the Horizon City map pack and for "near me" searches from the 79928 zip code.' },
      { name: 'Google Ads', href: '/services/google-ads', blurb: 'Search ads with a Horizon City radius, their own budget, and call tracking to the booked job.' },
      { name: 'Facebook and Instagram ads', href: '/services/facebook-ads', blurb: 'Ads aimed at Horizon City and Eastlake households for the jobs you want more of.' },
      { name: 'Google Local Services Ads', href: '/services/google-local-services-ads', blurb: 'Google Guaranteed listings for Horizon City trades, paid per lead, not per click.' },
      { name: 'AI search optimization', href: '/services/ai-search-optimization', blurb: 'Be the business ChatGPT and Google AI name when someone asks for a Horizon City recommendation.' },
    ],
    demand: {
      heading: 'What people in the area are searching for',
      lead: 'El Paso County search demand each month, from Google keyword data pulled for our El Paso SEO work. Horizon City is a growing share of each one.',
      items: ['Plumbers: about 2,900 searches', 'HVAC: about 1,300', 'Roofing: about 1,000', 'Electricians: about 880', 'Landscaping: about 1,900', 'Pest control: about 1,600'],
      note: "Figures are El Paso, Texas search volume from Google Ads data (2026). Google doesn't report Horizon City on its own.",
    },
    nearby: [
      { label: 'El Paso', href: '/locations/el-paso' },
      { label: 'Socorro', href: '/locations/socorro' },
      { label: 'Las Cruces', href: '/locations/las-cruces' },
    ],
    faq: [
      { q: "Do you've an office in Horizon City?", a: 'No. Our office is at 416 N. Stanton St in downtown El Paso, about twenty minutes west on I-10. We meet Horizon City clients at their shop, on a call, or at our office.' },
      { q: 'Is Horizon City marketing different from El Paso marketing?', a: "The system is the same. The targeting isn't. Horizon City needs its own named service area on Google, its own ad radius and budget, and a page on your site that names the city, or you show up in El Paso results and miss the Horizon City map pack." },
      { q: 'Which Horizon City businesses do you work with?', a: "Home service trades first: roofing, plumbing, HVAC, electrical, landscaping, pest control, and auto repair. Also dental, med spa, and other local businesses that book appointments. See the industry pages for the trades we've published results in." },
      { q: 'What does marketing cost for a Horizon City business?', a: 'Our public offer is Demand Flow: $50,000 in new revenue in 45 to 60 days for accepted businesses, or service fees refunded plus $500. Ad spend is separate and paid from your own account. Single services are quoted on a short call.' },
      { q: 'Do you also cover Socorro, Clint, and the far East side?', a: 'Yes. Most Horizon City businesses serve Eastlake, Montana Vista, Socorro, Clint, Fabens, and Tornillo too. We set the service areas and ad radius to match where your crews actually go.' },
    ],
  },
  {
    slug: 'socorro',
    name: 'Socorro',
    region: 'Texas',
    state: 'TX',
    zip: '79927',
    title: 'Socorro TX Marketing Agency',
    description:
      'Marketing agency for Socorro, TX and the Lower Valley. Web design, local SEO, Google Ads, Facebook ads, and AI search that book jobs. Based in El Paso.',
    eyebrow: 'Socorro, Texas · Lower Valley',
    headline: 'Marketing for Socorro and Lower Valley businesses that books the job.',
    intro:
      "Socorro runs along the Rio Grande south-east of El Paso, from the Ysleta line out to San Elizario. The businesses here serve the whole Lower Valley. We're the El Paso marketing agency that builds the web design, local SEO, Google Ads, Facebook ads, and follow-up that turn Socorro and Lower Valley searches into booked work.",
    areas: ['Socorro', 'Lower Valley', 'Mission Valley', 'Ysleta', 'San Elizario', 'Clint', 'Horizon City', 'Fabens', 'Tornillo'],
    context:
      'A Socorro business is found by people searching from the 79927 zip code and from the Lower Valley neighbourhoods around it. Showing up means a Google Business Profile that names Socorro, a website that names the Lower Valley, and ads that stop at the city limits you actually serve.',
    priorities: [
      'Name Socorro, Ysleta, San Elizario, and Clint as service areas on your Google Business Profile.',
      'Put a Lower Valley page on your website with the neighbourhoods you serve and photos of real jobs there.',
      'Run Spanish and English ad copy where your customers search in both.',
    ],
    proof:
      'The Pipe Whisperers, an El Paso plumber serving the valley, went from about $60,000 a year to about $250,000 in 24 months with local SEO, Google Ads, emergency pages, and text follow-up. Total Auto Repair went from about $20,000 a month to about $100,000.',
    about: {
      heading: 'Why Socorro marketing is its own job',
      paragraphs: [
        "Socorro is one of the oldest communities in Texas, built around the Socorro Mission and the farm roads of the Mission Valley, and today it's a city of its own inside El Paso County with its own zip code, its own map pack, and its own buyers. A plumber, roofer, HVAC company, auto shop, or landscaper based on Socorro Road or Americas Avenue serves the whole Lower Valley, from Ysleta to San Elizario, and a lot of that work is bilingual.",
        'Local SEO for Socorro starts with the Google Business Profile. Most profiles we audit list El Paso only, so they never appear when someone in 79927 searches "plumber near me". Naming Socorro and the Lower Valley neighbourhoods as service areas, matching the name and phone number on every directory, and earning reviews from Socorro customers is what moves the map pack. Web design for a Socorro business means a mobile-first site with a Lower Valley page, Spanish where your customers use it, and click-to-call on every screen.',
        "Google Ads and Facebook ads for Socorro get their own radius and budget, so a click from the valley isn't competing with the Westside. Our office is in downtown El Paso, about twenty-five minutes up Loop 375, and the Demand Flow system we run across El Paso County runs here with the targeting moved south.",
      ],
    },
    services: [
      { name: 'Web design', href: '/services/seo', blurb: 'A mobile-first site for a Socorro business, with a Lower Valley page, Spanish where it helps, and click-to-call.' },
      { name: 'Local SEO and Google Business Profile', href: '/services/local-seo', blurb: 'Rank in the Socorro map pack and for "near me" searches from the 79927 zip code.' },
      { name: 'Google Ads', href: '/services/google-ads', blurb: 'Search ads with a Lower Valley radius and call tracking to the booked job.' },
      { name: 'Facebook and Instagram ads', href: '/services/facebook-ads', blurb: 'Ads aimed at Socorro and Lower Valley households, in English and Spanish, for the jobs you want.' },
      { name: 'Google Local Services Ads', href: '/services/google-local-services-ads', blurb: 'Google Guaranteed listings for Socorro trades, paid per lead.' },
      { name: 'AI search optimization', href: '/services/ai-search-optimization', blurb: 'Be the business ChatGPT and Google AI name for a Socorro or Lower Valley recommendation.' },
    ],
    demand: {
      heading: 'What people in the area are searching for',
      lead: 'El Paso County search demand each month, from Google keyword data pulled for our El Paso SEO work. The Lower Valley is part of every number.',
      items: ['Plumbers: about 2,900 searches', 'HVAC: about 1,300', 'Roofing: about 1,000', 'Electricians: about 880', 'Landscaping: about 1,900', 'Handyman: about 480'],
      note: "Figures are El Paso, Texas search volume from Google Ads data (2026). Google doesn't report Socorro on its own.",
    },
    nearby: [
      { label: 'El Paso', href: '/locations/el-paso' },
      { label: 'Horizon City', href: '/locations/horizon-city' },
      { label: 'Las Cruces', href: '/locations/las-cruces' },
    ],
    faq: [
      { q: "Do you've an office in Socorro?", a: 'No. Our office is at 416 N. Stanton St in downtown El Paso, about twenty-five minutes away. We meet Socorro clients at their shop, on a call, or at our office.' },
      { q: 'Can you run ads and pages in Spanish?', a: 'Yes. Many Lower Valley customers search in Spanish or in both languages. We write Spanish ad copy and Spanish service pages where your customers use them, and we track each language separately.' },
      { q: 'Which Socorro businesses do you work with?', a: "Home service trades first: plumbing, roofing, HVAC, electrical, landscaping, and auto repair. Also dental, med spa, and other local businesses that book appointments. See the industry pages for the trades we've published results in." },
      { q: 'What does marketing cost for a Socorro business?', a: 'Our public offer is Demand Flow: $50,000 in new revenue in 45 to 60 days for accepted businesses, or service fees refunded plus $500. Ad spend is separate. Single services are quoted on a short call.' },
      { q: 'Do you cover San Elizario, Clint, and Fabens too?', a: 'Yes. A Socorro business usually serves the whole Lower Valley. We set the service areas and ad radius to match where your crews actually go.' },
    ],
  },
  {
    slug: 'las-cruces',
    name: 'Las Cruces',
    region: 'New Mexico',
    state: 'NM',
    zip: '88001',
    title: 'Las Cruces Marketing Agency',
    description:
      'Marketing agency for Las Cruces, NM. Web design, local SEO, Google Ads, Facebook ads, and AI search that book jobs. Based 45 minutes away in El Paso.',
    eyebrow: 'Las Cruces, New Mexico · Doña Ana County',
    headline: 'Marketing for Las Cruces businesses that books the job.',
    intro:
      'Las Cruces is the second-largest city in New Mexico, forty-five minutes up Interstate 10 from our El Paso office, and its businesses serve a market of their own: Las Cruces, Mesilla, Anthony, Sunland Park, and the rest of Doña Ana County. We build the web design, local SEO, Google Ads, Facebook ads, and follow-up that turn Las Cruces searches into booked work.',
    areas: ['Las Cruces', 'Mesilla', 'Mesilla Park', 'University Park', 'Anthony, NM', 'Sunland Park', 'Santa Teresa', 'Chaparral', 'Hatch'],
    context:
      'Las Cruces is its own market, not an El Paso suburb. It has its own map pack, its own area code, its own directories, and buyers who search "Las Cruces" and "near me" from the 88001, 88005, 88011, and 88012 zip codes. Winning here means a presence built for Las Cruces, not an El Paso page with the city name swapped in.',
    priorities: [
      'Build a Las Cruces Google Business Profile with Doña Ana County service areas, or set a Las Cruces service area on an existing one, and keep the name and 575 number identical everywhere.',
      'Give Las Cruces its own pages, ad campaigns, and budget, separate from any El Paso work, so each market gets reported on its own.',
      'Track calls and forms by city so you know what Las Cruces work actually costs to book.',
    ],
    proof:
      "Our published results are El Paso businesses: a roofer that went from about 2 roofs a month to about 8, a plumber that went from about $60,000 a year to about $250,000, and an auto shop that went from about $20,000 a month to about $100,000. The same system runs in Las Cruces. We don't claim those numbers as a Las Cruces benchmark.",
    about: {
      heading: 'Why Las Cruces marketing is its own job',
      paragraphs: [
        'Las Cruces is the seat of Doña Ana County, home to New Mexico State University, and the hub for the Mesilla Valley. A Las Cruces plumber, roofer, HVAC company, auto shop, landscaper, dentist, or med spa competes in a Las Cruces search result, with Las Cruces competitors, for buyers who type "Las Cruces" or search "near me" from across town. El Paso rankings don\'t carry over. A Google Business Profile, a website, and citations that name Las Cruces are the starting point.',
        'Local SEO for Las Cruces means the profile categories and service areas are set for Doña Ana County, the name and phone number match on every directory, reviews come from Las Cruces customers, and the website has real Las Cruces pages: the services you offer, the neighbourhoods you cover from Mesilla to the East Mesa, and photos of jobs done there. Web design for a Las Cruces business is mobile-first, fast, and built to get a call or a booking from a phone.',
        "Google Ads and Facebook ads for Las Cruces run as their own campaigns with their own budget and reporting, so you know what a Las Cruces job costs to book. Our office is in downtown El Paso, forty-five minutes down I-10, and we're in Las Cruces often. The Demand Flow system we run across the borderland, and AI search optimization that gets you named by ChatGPT and Google AI for a Las Cruces recommendation, run here the same way.",
      ],
    },
    services: [
      { name: 'Web design', href: '/services/seo', blurb: 'A mobile-first Las Cruces website with a page for each service and each part of the Mesilla Valley you serve.' },
      { name: 'Local SEO and Google Business Profile', href: '/services/local-seo', blurb: 'Rank in the Las Cruces map pack and for "near me" searches across Doña Ana County.' },
      { name: 'Google Ads', href: '/services/google-ads', blurb: 'Search ads with a Las Cruces radius, their own budget, and call tracking to the booked job.' },
      { name: 'Facebook and Instagram ads', href: '/services/facebook-ads', blurb: 'Ads aimed at Las Cruces, Mesilla, and East Mesa households for the jobs you want more of.' },
      { name: 'Google Local Services Ads', href: '/services/google-local-services-ads', blurb: 'Google Guaranteed listings for Las Cruces trades, paid per lead, not per click.' },
      { name: 'AI search optimization', href: '/services/ai-search-optimization', blurb: 'Be the business ChatGPT and Google AI name when someone asks for a Las Cruces recommendation.' },
    ],
    demand: {
      heading: 'What we know about Las Cruces demand',
      lead: "We haven't pulled Las Cruces keyword volumes yet, so we won't quote numbers we don't have. For scale, the El Paso figures we track each month:",
      items: ['Plumbers: about 2,900 searches', 'HVAC: about 1,300', 'Roofing: about 1,000', 'Electricians: about 880'],
      note: 'El Paso, Texas search volume from Google Ads data (2026). Las Cruces volumes are pulled in the first week of any Las Cruces engagement.',
    },
    nearby: [
      { label: 'El Paso', href: '/locations/el-paso' },
      { label: 'Horizon City', href: '/locations/horizon-city' },
      { label: 'Socorro', href: '/locations/socorro' },
    ],
    faq: [
      { q: "Do you've an office in Las Cruces?", a: 'No. Our office is at 416 N. Stanton St in downtown El Paso, forty-five minutes down I-10. We meet Las Cruces clients at their business, on a call, or at our office.' },
      { q: 'Does my El Paso ranking help in Las Cruces?', a: 'Not much. Google treats Las Cruces as its own market with its own map pack. You need a Google Business Profile service area, pages, citations, and reviews that name Las Cruces. We build that separately and report it separately.' },
      { q: 'Which Las Cruces businesses do you work with?', a: "Home service trades first: plumbing, roofing, HVAC, electrical, landscaping, and auto repair. Also dental, med spa, and other local businesses that book appointments. See the industry pages for the trades we've published results in." },
      { q: 'What does marketing cost for a Las Cruces business?', a: 'Our public offer is Demand Flow: $50,000 in new revenue in 45 to 60 days for accepted businesses, or service fees refunded plus $500. Ad spend is separate and paid from your own account. Single services are quoted on a short call.' },
      { q: 'Do you cover Mesilla, Anthony, Sunland Park, and Santa Teresa?', a: 'Yes. A Las Cruces business usually serves the Mesilla Valley and the southern county down to the state line. We set the service areas and ad radius to match where your crews go.' },
    ],
  },
];
