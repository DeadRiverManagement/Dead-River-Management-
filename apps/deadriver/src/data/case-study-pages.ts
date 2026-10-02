// Case studies rewritten in the coach's formula: hero (result, timeline,
// investment), problem, solution by phase, result + quote, how it applies, CTA.
// Slugs listed here are built by src/pages/work/[slug].astro with the
// CaseStudyPage template instead of the older essay layout.
export interface CaseStudyPage {
  slug: string;
  company: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string[];
  stats: string[];
  problem: { heading: string; paragraphs: string[]; listLead?: string; list: string[]; after?: string };
  solution: { heading: string; intro: string; goals: string[]; lead: string; phases: { title: string; items: string[] }[] };
  result: { heading: string; paragraphs: string[]; metricsLead: string; metrics: string[]; after?: string; quote: string; cite: string };
  beforeAfter?: [string, string, string][];
  cost?: { label: string; value: string; note: string }[];
  notFor?: string[];
  apply: { heading: string; paragraphs: string[]; list: string[]; cta: string; scarcity: string; button: string };
  glance: { facts: [string, string][]; did: string[]; metrics: string[] };
  /** Industry page this result belongs to, shown under the result. */
  industry?: { label: string; href: string };
  /** Short client video. Put the file under public/media/ and fill this in; the page renders the player and VideoObject schema. */
  video?: { src: string; poster: string; title: string; description: string; uploadDate: string; duration?: string };
}

export const caseStudyPages: CaseStudyPage[] = [
  {
    slug: 'total-auto-repair',
    industry: { label: 'Marketing for auto repair shops', href: '/industries/auto-repair' },
    company: 'Total Auto Repair',
    seoTitle: 'Auto Repair: $20K to $100K/Month',
    description:
      'See how we helped Total Auto Repair grow from $20K to $100K/month in 18 months using local SEO, Google Ads, and conversion optimization. Full breakdown inside.',
    eyebrow: 'Auto repair marketing · Business growth',
    headline: 'From $20,000/month to $100,000/month in 18 months.',
    intro: [
      'Total Auto Repair was stuck at roughly $20K/month in revenue with inconsistent customer flow and no clear growth plan. We rebuilt their website, launched Google Ads, optimized their Google Business Profile, and set up automated systems to capture and convert more leads.',
      '18 months later, they’re consistently hitting $100K/month and have expanded to a second location.',
    ],
    stats: [
      '$20K/month → $100K/month (5x growth)',
      'Timeline: 18 months',
      'Investment: $2,500/month (ads + management)',
    ],
    problem: {
      heading: 'The shop at $20K/month: Inconsistent work, no growth plan.',
      paragraphs: [
        'When Total Auto Repair came to us, they were doing roughly $20,000/month in revenue. Some months were better, some were worse, but there was no predictable system for bringing in new customers.',
      ],
      listLead: 'Their challenges:',
      list: [
        'Website wasn’t mobile-friendly (60% of traffic was mobile)',
        'Google Business Profile wasn’t optimized (they weren’t showing up in "near me" searches)',
        'No paid advertising (relying 100% on word-of-mouth and drive-by traffic)',
        'No follow-up system (leads would call, get a quote, and disappear)',
        'No email marketing (no way to bring back past customers)',
      ],
      after:
        'The owner knew they could handle more work, but they didn’t know how to get it consistently.',
    },
    solution: {
      heading: 'What we did: Local SEO, Google Ads, and conversion optimization.',
      intro: 'We built a complete auto repair marketing system focused on three things:',
      goals: [
        'Get found by more local drivers',
        'Convert more website visitors into calls and appointments',
        'Bring back past customers for repeat business',
      ],
      lead: 'Here’s exactly what we did:',
      phases: [
        {
          title: 'Month 1-2: Foundation',
          items: [
            'Rebuilt website for mobile conversions (click-to-call buttons, easy appointment booking)',
            'Optimized Google Business Profile (photos, hours, services, Q&A)',
            'Set up call tracking to measure which marketing channels were working',
            'Created automated review request system (text + email after service)',
          ],
        },
        {
          title: 'Month 3-6: Paid advertising',
          items: [
            'Launched Google Ads targeting "auto repair near me," "oil change near me," "brake repair [city]"',
            'Started with $1,000/month ad budget, scaled to $1,500/month as results improved',
            'A/B tested ad copy and landing pages to improve cost per lead',
            'Set up conversion tracking to measure calls, form fills, and appointments',
          ],
        },
        {
          title: 'Month 7-12: Optimization & scale',
          items: [
            'Increased ad budget to $2,000/month based on positive ROI',
            'Launched email marketing to past customers (oil change reminders, seasonal maintenance)',
            'Added SMS follow-up for leads who didn’t book (recovered 15-20% of lost leads)',
            'Expanded service pages on website (targeting more specific repair keywords)',
          ],
        },
        {
          title: 'Month 13-18: Expansion',
          items: [
            'Opened second location',
            'Replicated marketing system for new location',
            'Scaled ad budget to $2,500/month across both locations',
            'Consistently hitting $100K/month in combined revenue',
          ],
        },
      ],
    },
    result: {
      heading: '$20K/month to $100K/month: 5x revenue growth in 18 months.',
      paragraphs: [
        'Total Auto Repair went from $20,000/month to $100,000/month in 18 months, a 5x increase in revenue.',
      ],
      metricsLead: 'Key metrics:',
      metrics: [
        'Monthly revenue: $20K → $100K (5x growth)',
        'Monthly ad spend: $0 → $2,500',
        'Return on ad spend: 8-10x (for every $1 spent on ads, they made $8-10 in revenue)',
        'Google Business Profile views: 2,000/month → 12,000/month',
        'Website traffic: 500/month → 4,500/month',
        'Average Google review rating: 3.8 stars → 4.7 stars (150+ reviews)',
      ],
      after:
        'They also expanded to a second location and hired 3 additional technicians to handle the increased workload.',
      quote:
        'Dead River Management didn’t just get us more customers. They helped us build a real business. We went from hoping the phone would ring to turning down work because we’re booked out two weeks. That’s a problem I’m happy to have.',
      cite: 'Travis Miller, Owner, Total Auto Repair',
    },
    beforeAfter: [
      ['Monthly Revenue', '$20K', '$100K'],
      ['Website Traffic', '500/month', '4,500/month'],
      ['Google Profile Views', '2,000/month', '12,000/month'],
      ['Google Rating', '3.8 stars', '4.7 stars'],
      ['Ad Spend', '$0', '$2,500/month'],
      ['Return on Ad Spend', 'N/A', '8-10x'],
    ],
    cost: [
      { label: 'Total Investment Over 18 Months', value: '$45,000', note: '$2,500/month × 18 months' },
      { label: 'Revenue Increase', value: '$80,000/month', note: '$100K − $20K' },
      { label: 'ROI', value: '32x', note: '$80K/month × 18 months = $1.44M revenue increase ÷ $45K investment' },
    ],
    notFor: [
      'You’re doing less than $15K/month (not enough volume to scale profitably)',
      'You can’t invest $2,000-$3,000/month in ads + management',
      'You’re already maxed out on capacity (you need room to grow)',
      'You’re not willing to commit to at least 6 months (results take time)',
    ],
    apply: {
      heading: 'Could we replicate this for your auto repair shop?',
      paragraphs: [
        'Total Auto Repair’s result is specific to their market, their services, and their starting point. But the system we built for them works for any auto repair shop that:',
      ],
      list: [
        'Is doing $15K-$50K/month and wants to scale',
        'Has capacity to handle more work',
        'Is willing to invest $2,000-$3,000/month in ads + management',
        'Wants predictable, consistent customer flow (not just word-of-mouth)',
      ],
      cta: 'If that sounds like you, book a free strategy call. We’ll audit your current marketing, identify the biggest bottleneck, and show you exactly how we’d replicate this system for your shop.',
      scarcity:
        'We only take on 3 new auto repair clients per quarter. If you’re serious about scaling, don’t wait.',
      button: 'Book Your Free Strategy Call Now',
    },
    glance: {
      facts: [
        ['Industry', 'Automotive repair'],
        ['Timeline', '18 months'],
        ['Investment', '$2,500/month (ads + management)'],
        ['Result', '$20K/month → $100K/month (5x growth)'],
      ],
      did: [
        'Rebuilt website for mobile conversions',
        'Optimized Google Business Profile',
        'Launched Google Ads ($1K → $2.5K/month)',
        'Set up automated review requests',
        'Created email marketing for past customers',
        'Added SMS follow-up for lost leads',
      ],
      metrics: [
        '5x revenue growth',
        '8-10x return on ad spend',
        '6x increase in website traffic',
        '4.7-star Google rating (150+ reviews)',
      ],
    },
  },
  {
    slug: 'the-pipe-whisperers',
    industry: { label: 'Marketing for plumbers', href: '/industries/plumbing' },
    company: 'The Pipe Whisperers',
    seoTitle: '$60K to $250K/Year Plumbing Growth',
    description:
      'The Pipe Whisperers grew from $60K to $250K/year in 24 months with local SEO, Google Ads, and automated follow-up. Full breakdown.',
    eyebrow: 'Plumbing marketing · Business growth',
    headline: 'From $60,000/year to $250,000/year in 24 months.',
    intro: [
      'The Pipe Whisperers was stuck at roughly $60K/year in revenue with no consistent lead flow and no system for following up with estimates. We rebuilt their website, launched Google Ads, optimized their Google Business Profile, and set up automated systems to capture and convert more leads.',
      '24 months later, they’re consistently hitting $250K/year and have hired 2 additional plumbers to handle the increased workload.',
    ],
    stats: [
      '$60K/year → $250K/year (4x growth)',
      'Timeline: 24 months',
      'Investment: $2,000/month (ads + management)',
    ],
    problem: {
      heading: 'The business at $60K/year: Inconsistent leads, no follow-up system.',
      paragraphs: [
        'When The Pipe Whisperers came to us, they were doing roughly $60,000/year in revenue. Owner Arron was doing most of the work himself, and leads were coming in sporadically through word-of-mouth and the occasional Google search.',
      ],
      listLead: 'Their challenges:',
      list: [
        'Website wasn’t mobile-friendly (70% of traffic was mobile)',
        'Google Business Profile wasn’t optimized (they weren’t showing up in "plumber near me" searches)',
        'No paid advertising (100% reliant on word-of-mouth and organic search)',
        'No follow-up system (estimates would go out and never get followed up on)',
        'No email or SMS marketing (no way to stay in touch with past customers)',
      ],
      after:
        'Arron knew he could handle more work, but he didn’t have a predictable system for bringing in new customers.',
    },
    solution: {
      heading: 'What we did: Local SEO, Google Ads, and automated follow-up.',
      intro: 'We built a complete plumbing marketing system focused on three things:',
      goals: [
        'Get found by more local homeowners',
        'Convert more website visitors into calls and estimates',
        'Follow up with estimates that didn’t close immediately',
      ],
      lead: 'Here’s exactly what we did:',
      phases: [
        {
          title: 'Month 1-3: Foundation',
          items: [
            'Rebuilt website for mobile conversions (click-to-call buttons, easy contact forms)',
            'Optimized Google Business Profile (photos, hours, services, Q&A)',
            'Set up call tracking to measure which marketing channels were working',
            'Created automated review request system (text + email after service)',
          ],
        },
        {
          title: 'Month 4-9: Paid advertising',
          items: [
            'Launched Google Ads targeting "plumber near me," "emergency plumber [city]," "water heater repair"',
            'Started with $800/month ad budget, scaled to $1,200/month as results improved',
            'A/B tested ad copy and landing pages to improve cost per lead',
            'Set up conversion tracking to measure calls, form fills, and estimate requests',
          ],
        },
        {
          title: 'Month 10-18: Optimization & automation',
          items: [
            'Increased ad budget to $1,500/month based on positive ROI',
            'Added SMS follow-up for estimates that didn’t close (recovered 20-25% of lost estimates)',
            'Launched email marketing to past customers (seasonal maintenance reminders, special offers)',
            'Expanded service pages on website (targeting more specific plumbing keywords)',
          ],
        },
        {
          title: 'Month 19-24: Scale & hiring',
          items: [
            'Hired 2 additional plumbers to handle increased workload',
            'Scaled ad budget to $1,500/month',
            'Consistently hitting $250K/year in revenue',
            'Arron transitioned from doing all the work himself to managing the team',
          ],
        },
      ],
    },
    result: {
      heading: '$60K/year to $250K/year: 4x revenue growth in 24 months.',
      paragraphs: [
        'The Pipe Whisperers went from $60,000/year to $250,000/year in 24 months, a 4x increase in revenue.',
      ],
      metricsLead: 'Key metrics:',
      metrics: [
        'Annual revenue: $60K → $250K (4x growth)',
        'Monthly ad spend: $0 → $1,500',
        'Return on ad spend: 6-8x (for every $1 spent on ads, they made $6-8 in revenue)',
        'Google Business Profile views: 1,500/month → 8,000/month',
        'Website traffic: 400/month → 2,000/month',
        'Average Google review rating: 4.2 stars → 4.8 stars (120+ reviews)',
      ],
      after:
        'They also hired 2 additional plumbers and Arron transitioned from doing all the work himself to managing the team.',
      quote:
        'We went from barely surviving to turning down work. I used to pray for the phone to ring. Now I have more leads than I can handle. Dead River Management didn’t just help us grow, they helped us build a real business.',
      cite: 'Arron, Owner, The Pipe Whisperers',
    },
    beforeAfter: [
      ['Annual Revenue', '$60K', '$250K'],
      ['Website Traffic', '400/month', '2,000/month'],
      ['Google Profile Views', '1,500/month', '8,000/month'],
      ['Google Rating', '4.2 stars', '4.8 stars'],
      ['Ad Spend', '$0', '$1,500/month'],
      ['Return on Ad Spend', 'N/A', '6-8x'],
    ],
    notFor: [
      'You’re doing less than $50K/year (not enough volume to scale profitably)',
      'You can’t invest $1,500-$2,500/month in ads + management',
      'You’re already maxed out on capacity and can’t hire',
      'You’re not willing to commit to at least 6 months (results take time)',
    ],
    apply: {
      heading: 'Could we replicate this for your plumbing business?',
      paragraphs: [
        'The Pipe Whisperers’ result is specific to their market, their services, and their starting point. But the system we built for them works for any plumbing business that:',
      ],
      list: [
        'Is doing $50K-$150K/year and wants to scale',
        'Has capacity to handle more work (or is willing to hire)',
        'Is willing to invest $1,500-$2,500/month in ads + management',
        'Wants predictable, consistent lead flow (not just word-of-mouth)',
      ],
      cta: 'If that sounds like you, book a free strategy call. We’ll audit your current marketing, identify the biggest bottleneck, and show you exactly how we’d replicate this system for your plumbing business.',
      scarcity:
        'We only take on 3 new plumbing clients per quarter. If you’re serious about scaling, don’t wait.',
      button: 'Book Your Free Strategy Call Now',
    },
    glance: {
      facts: [
        ['Industry', 'Plumbing'],
        ['Timeline', '24 months'],
        ['Investment', '$2,000/month (ads + management)'],
        ['Result', '$60K/year → $250K/year (4x growth)'],
      ],
      did: [
        'Rebuilt website for mobile conversions',
        'Optimized Google Business Profile',
        'Launched Google Ads ($800 → $1,500/month)',
        'Set up automated review requests',
        'Created SMS follow-up for estimates',
        'Added email marketing for past customers',
      ],
      metrics: [
        '4x revenue growth',
        '6-8x return on ad spend',
        '5x increase in website traffic',
        '4.8-star Google rating (120+ reviews)',
        'Hired 2 additional plumbers',
      ],
    },
  },
  {
    slug: 'gonzalez-and-sons-roofing',
    industry: { label: 'Marketing for roofers', href: '/industries/roofing' },
    company: 'Gonzalez & Sons Roofing',
    seoTitle: '2 to 8 Roofs/Month in 6 Months',
    description:
      'Gonzalez & Sons Roofing grew from 2 to 8 roofs/month ($50K to $200K/month) in 6 months with Google Ads, storm pages, and follow-up.',
    eyebrow: 'Roofing marketing · Business growth',
    headline:
      'From 2 roofs/month to 8 roofs/month. $50,000/month to $200,000/month in 6 months.',
    intro: [
      'Gonzalez & Sons Roofing was stuck at 2 roofs/month ($50K/month revenue) with inconsistent lead flow and no system for following up with estimates. We rebuilt their Google Ads account, created storm-damage landing pages, set up automated follow-up for no-shows, and tracked every estimate from click to signed contract.',
      '6 months later, they’re consistently closing 8 roofs/month ($200K/month revenue), 4x the volume and $150,000 more every month.',
    ],
    stats: [
      '2 roofs/month → 8 roofs/month (4x growth)',
      '$50K/month → $200K/month (4x revenue growth)',
      'Timeline: 6 months',
      'Investment: $3,500/month (ads + management)',
    ],
    problem: {
      heading: 'The business at 2 roofs/month: Inconsistent leads, no follow-up system.',
      paragraphs: [
        'When Gonzalez & Sons Roofing came to us, they were doing 2 roofs/month ($50,000/month revenue). Leads were coming in sporadically through word-of-mouth and the occasional Google search, but there was no predictable system for bringing in qualified estimates.',
      ],
      listLead: 'Their challenges:',
      list: [
        'Google Ads account was poorly structured (wasting budget on unqualified clicks)',
        'No storm-damage landing pages (missing out on high-intent homeowners after storms)',
        'No follow-up system for estimates (homeowners would get a quote and disappear)',
        'No tracking from click to signed contract (couldn’t tell which marketing channels were working)',
        'No automated review requests (missing out on social proof)',
      ],
      after:
        'The owner knew they could handle more work, but they didn’t have a system for bringing in qualified estimates consistently.',
    },
    solution: {
      heading:
        'What we did: Google Ads rebuild, storm-damage landing pages, and automated follow-up.',
      intro: 'We built a complete roofing marketing system focused on three things:',
      goals: [
        'Get more qualified estimate requests from homeowners actively looking for roofing services',
        'Convert more estimate requests into signed contracts',
        'Follow up with estimates that didn’t close immediately',
      ],
      lead: 'Here’s exactly what we did:',
      phases: [
        {
          title: 'Month 1-2: Foundation & Google Ads rebuild',
          items: [
            'Rebuilt Google Ads account from scratch (better targeting, better ad copy, better landing pages)',
            'Created storm-damage landing pages (targeting homeowners after hail, wind, and storm events)',
            'Set up call tracking and conversion tracking to measure which ads were driving estimates',
            'Created automated review request system (text + email after job completion)',
            'Launched Google Ads targeting "roof repair near me," "storm damage roof repair," "roof replacement [city]"',
            'Started with $2,500/month ad budget',
          ],
        },
        {
          title: 'Month 3-4: Optimization & scale',
          items: [
            'Scaled ad budget to $3,500/month based on positive ROI',
            'A/B tested ad copy and landing pages to improve cost per estimate',
            'Added automated SMS follow-up for estimates that didn’t close (recovered 20-25% of lost estimates)',
            'Set up conversion tracking to measure estimates, appointments, and signed contracts',
          ],
        },
        {
          title: 'Month 5-6: Consistency & results',
          items: [
            'Consistently closing 8 roofs/month ($200K/month revenue)',
            '35% close rate (8 contracts signed from 23 qualified estimates)',
            'Average job: $25,000',
            '$150,000 more revenue every month',
            'Hired 2 additional crews to handle increased workload',
          ],
        },
      ],
    },
    result: {
      heading: '2 roofs/month to 8 roofs/month: 4x growth in just 6 months.',
      paragraphs: [
        'Gonzalez & Sons Roofing went from 2 roofs/month ($50K/month) to 8 roofs/month ($200K/month) in just 6 months, a 4x increase in volume and revenue.',
      ],
      metricsLead: 'Key metrics:',
      metrics: [
        'Monthly roof volume: 2 → 8 (4x growth)',
        'Monthly revenue: $50K → $200K (4x growth)',
        'Monthly ad spend: $0 → $3,500',
        'Return on ad spend: 7-9x (for every $1 spent on ads, they made $7-9 in revenue)',
        'Close rate: 35% (8 contracts signed from 23 qualified estimates)',
        'Average job: $25,000',
        'Revenue increase: $150,000/month',
      ],
      after: 'They also hired 2 additional crews to handle the increased workload.',
      quote:
        'We used to pray for leads. Now we have more than we can handle. Dead River Management didn’t just help us grow, they helped us build a real business.',
      cite: 'Gonzalez, Owner, Gonzalez & Sons Roofing',
    },
    beforeAfter: [
      ['Roofs per Month', '2', '8'],
      ['Monthly Revenue', '$50K', '$200K'],
      ['Ad Spend', '$0', '$3,500/month'],
      ['Return on Ad Spend', 'N/A', '7-9x'],
    ],
    cost: [
      { label: 'Total Investment Over 6 Months', value: '$21,000', note: '$3,500/month × 6 months' },
      { label: 'Revenue Increase', value: '$150,000/month', note: '$200K − $50K' },
      { label: 'ROI', value: '43x', note: '$150K/month × 6 months = $900K revenue increase ÷ $21K investment' },
    ],
    notFor: [
      'You’re doing less than 1 roof/month (not enough volume to scale profitably)',
      'You can’t invest $3,000-$5,000/month in ads + management',
      'You’re already maxed out on capacity and can’t hire',
      'You’re not willing to commit to at least 3-6 months (results take time)',
    ],
    apply: {
      heading: 'Could we replicate this for your roofing business?',
      paragraphs: [
        'Gonzalez & Sons Roofing’s result is specific to their market, their services, and their starting point. But the system we built for them works for any roofing business that:',
      ],
      list: [
        'Is doing 1-5 roofs/month and wants to scale',
        'Has capacity to handle more work (or is willing to hire additional crews)',
        'Is willing to invest $3,000-$5,000/month in ads + management',
        'Wants predictable, consistent estimate flow (not just word-of-mouth)',
      ],
      cta: 'If that sounds like you, book a free strategy call. We’ll audit your current marketing, identify the biggest bottleneck, and show you exactly how we’d replicate this system for your roofing business.',
      scarcity:
        'We only take on 3 new roofing clients per quarter. If you’re serious about scaling, don’t wait.',
      button: 'Book Your Free Strategy Call Now',
    },
    glance: {
      facts: [
        ['Industry', 'Roofing'],
        ['Timeline', '6 months'],
        ['Investment', '$3,500/month (ads + management)'],
        ['Result', '2 roofs/month → 8 roofs/month (4x growth)'],
        ['Revenue', '$50K/month → $200K/month (4x growth)'],
      ],
      did: [
        'Rebuilt Google Ads account',
        'Created storm-damage landing pages',
        'Set up automated follow-up for no-shows',
        'Tracked every estimate from click to signed contract',
        'Set up automated review requests',
      ],
      metrics: [
        '4x roof volume growth in 6 months',
        '4x revenue growth ($150K/month increase)',
        '35% close rate (8 contracts from 23 qualified estimates)',
        'Average job: $25,000',
        '7-9x return on ad spend',
      ],
    },
  },
  {
    slug: 'wicked-logistics',
    company: 'Wicked Logistics',
    seoTitle: '5-6 Leads/Day + $1.2M Contract',
    description:
      'See how we helped Wicked Logistics grow from 1-2 leads/week to 5-6 leads/day in 3 months. One lead became a $1.2M/year shipping contract. Full breakdown inside.',
    eyebrow: 'Logistics marketing · Freight lead generation',
    headline:
      'From 1-2 leads/week to 5-6 leads/day in 3 months. One lead became a $1.2 million contract.',
    intro: [
      'Wicked Logistics was stuck at 1-2 inbound leads per week with no predictable system for bringing in new shipping customers. We rebuilt their lead generation engine with new ads, a landing page built to capture shipping inquiries, and follow-up that gets every lead a response fast.',
      '3 months later, they’re getting 5-6 leads per day, and one of those leads became a $1.2 million/year shipping contract.',
    ],
    stats: [
      '1-2 leads/week → 5-6 leads/day (25x growth)',
      'Timeline: 3 months',
      'Result: $1.2M/year shipping contract from one lead',
      'Location: El Paso, TX',
    ],
    problem: {
      heading:
        'The business at 1-2 leads/week: No predictable lead flow, no follow-up system.',
      paragraphs: [
        'When Wicked Logistics came to us, they were getting 1-2 inbound leads per week. For a trucking and freight business, that meant very few new opportunities entering the pipeline.',
      ],
      listLead: 'Their challenges:',
      list: [
        'Website wasn’t mobile-friendly (most freight inquiries happen on mobile)',
        'No Google Ads or search campaigns (100% reliant on word-of-mouth and referrals)',
        'No landing page optimized for shipping inquiries (generic contact form, no clear CTA)',
        'No CRM or follow-up workflow (leads would come in and get lost)',
        'No fast response system (leads would wait days for a response)',
      ],
      after:
        'The owner knew they could handle more work, but they didn’t have a system for bringing in qualified shipping inquiries consistently.',
    },
    solution: {
      heading: 'What we did: Mobile-first website, Google Ads, and automated follow-up.',
      intro: 'We built a complete freight lead generation system focused on three things:',
      goals: [
        'Get more qualified shipping inquiries from businesses actively looking for freight services',
        'Convert more website visitors into quote requests',
        'Follow up with every lead fast (within 1 hour)',
      ],
      lead: 'Here’s exactly what we did:',
      phases: [
        {
          title: 'Month 1: Foundation & website rebuild',
          items: [
            'Rebuilt website for mobile conversions (click-to-call buttons, easy quote request forms)',
            'Created dedicated landing page for freight quotes (optimized for shipping inquiries)',
            'Set up call tracking and conversion tracking to measure which ads were driving leads',
            'Set up CRM follow-up workflow (every lead gets assigned to a sales rep immediately)',
            'Created automated fast response system (text + email within 1 hour of inquiry)',
          ],
        },
        {
          title: 'Month 2: Paid advertising launch',
          items: [
            'Launched Google Ads targeting "freight shipping El Paso," "trucking services Texas," "LTL shipping quotes"',
            'Started with $1,500/month ad budget, scaled to $2,500/month as results improved',
            'A/B tested ad copy and landing pages to improve cost per lead',
            'Set up conversion tracking to measure quote requests, calls, and signed contracts',
          ],
        },
        {
          title: 'Month 3: Optimization & results',
          items: [
            'Consistently getting 5-6 leads/day (vs. 1-2 leads/week before)',
            'One lead became a $1.2M/year shipping contract',
            'Average response time: <1 hour (vs. days before)',
            'CRM workflow ensures no lead gets lost',
          ],
        },
      ],
    },
    result: {
      heading:
        '1-2 leads/week to 5-6 leads/day: 25x growth in 3 months. One lead = $1.2M contract.',
      paragraphs: [
        'Wicked Logistics went from 1-2 leads/week to 5-6 leads/day in just 3 months, a 25x increase in lead volume.',
      ],
      metricsLead: 'Key metrics:',
      metrics: [
        'Lead volume: 1-2/week → 5-6/day (25x growth)',
        'Timeline: 3 months',
        'Monthly ad spend: $0 → $2,500',
        'Average response time: Days → <1 hour',
        'Result: $1.2M/year shipping contract from one lead',
      ],
      after: 'The $1.2M contract alone paid for the entire marketing investment 160x over.',
      quote:
        'Dead River turned our website into a lead generation machine. We went from hoping the phone would ring to getting 5-6 qualified inquiries every single day. And one of those leads became a $1.2 million contract. That’s life-changing.',
      cite: 'JR, Owner, Wicked Logistics',
    },
    beforeAfter: [
      ['Lead Volume', '1-2/week', '5-6/day'],
      ['Average Response Time', 'Days', '<1 hour'],
      ['Ad Spend', '$0', '$2,500/month'],
      ['Largest Contract From One Lead', 'N/A', '$1.2M/year'],
    ],
    cost: [
      { label: 'Total Investment Over 3 Months', value: '$7,500', note: '$2,500/month × 3 months' },
      { label: 'Value of $1.2M Contract', value: '$1,200,000/year', note: 'One inbound lead' },
      { label: 'ROI', value: '160x', note: '$1.2M ÷ $7,500 investment' },
    ],
    notFor: [
      'You’re getting less than 1 lead/week (not enough volume to scale profitably)',
      'You can’t invest $2,000-$3,000/month in ads + management',
      'You’re already maxed out on capacity and can’t take on more contracts',
      'You’re not willing to commit to at least 3 months (results take time)',
    ],
    apply: {
      heading: 'Could we replicate this for your freight or logistics business?',
      paragraphs: [
        'Wicked Logistics’ result is specific to their market, their services, and their starting point. But the system we built for them works for any trucking or freight business that:',
      ],
      list: [
        'Is getting 1-10 leads/week and wants to scale',
        'Has capacity to handle more shipping contracts',
        'Is willing to invest $2,000-$3,000/month in ads + management',
        'Wants predictable, consistent lead flow (not just word-of-mouth)',
      ],
      cta: 'If that sounds like you, book a free strategy call. We’ll audit your current marketing, identify the biggest bottleneck, and show you exactly how we’d replicate this system for your freight business.',
      scarcity:
        'We only take on 3 new freight/logistics clients per quarter. If you’re serious about scaling, don’t wait.',
      button: 'Book Your Free Strategy Call Now',
    },
    glance: {
      facts: [
        ['Industry', 'Trucking & Freight'],
        ['Location', 'El Paso, TX'],
        ['Timeline', '3 months'],
        ['Investment', '$2,500/month (ads + management)'],
        ['Result', '1-2 leads/week → 5-6 leads/day (25x growth)'],
      ],
      did: [
        'Rebuilt website (mobile-first, optimized for shipping inquiries)',
        'Created landing page for freight quotes',
        'Launched Google Ads (search campaigns)',
        'Set up CRM follow-up workflow',
        'Automated fast response system (every lead gets a response within 1 hour)',
      ],
      metrics: [
        '25x lead volume growth',
        '5-6 leads/day since October 2025',
        '$1.2M/year shipping contract from one lead',
        'Average response time: <1 hour',
      ],
    },
  },
];
