// Post-payment / Harper-email onboarding. Not linked from nav, sitemap, or llms.txt.
// Shared field names are Casey's GHL create map (Rowan). Do not rename them.
// Extra keys are plan-specific and only appear on that plan's form and note.

export const ONBOARDING_INBOX = 'onboarding@deadrivermanagement.com';

export type OnboardingFieldType = 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select';

export type OnboardingField = {
  name: string;
  label: string;
  type: OnboardingFieldType;
  required?: boolean;
  help?: string;
  /** Recommended-range helper shown under the field (Core 3 ad budget). */
  helper?: string;
  placeholder?: string;
  autocomplete?: string;
  rows?: number;
  pair?: string;
  options?: { value: string; label: string }[];
};

export type OnboardingSection = {
  legend: string;
  fields: OnboardingField[];
};

export type OnboardingPlan = {
  slug: string;
  name: string;
  stripeProduct: string;
  title: string;
  description: string;
  lede: string;
  extras: OnboardingSection[];
  /** Nationwide forms omit the El Paso address default used on Offer v1. */
  addressPlaceholder?: string;
  addressHelp?: string;
};

export const CORE3_SLUGS = ['foundation', 'growth-partner', 'scale'] as const;

export const CORE3_PRICES = {
  foundation: 'price_1UHpijRtJXKDYNEJfnEM7HqW',
  'growth-partner': 'price_1UHpl0RtJXKDYNEJjEaguvcR',
  scale: 'price_1UHpm1RtJXKDYNEJrO5pJTh5',
} as const;

export const CORE3_AD_BUDGET_RANGES = {
  foundation: '$1,500–$3,000/mo',
  'growth-partner': '$3,000–$7,500/mo',
  scale: '$7,500+/mo',
} as const;

const NATIONWIDE_ADDRESS = {
  addressPlaceholder: 'City, State',
  addressHelp:
    'City and state is enough. Use the address customers should see, anywhere you serve. Do not use a home street.',
} as const;

function core3AdBudgetExtras(range: string): OnboardingSection[] {
  return [
    {
      legend: 'Monthly ad budget',
      fields: [
        {
          name: 'monthly_ad_budget',
          label: 'Monthly ad budget',
          type: 'text',
          required: true,
          help: 'What you can spend on ads each month. You pay Google or Meta for the ads.',
          helper: `Recommended range: ${range}. A recommended starting point, not a requirement.`,
        },
      ],
    },
  ];
}

export const ONBOARDING_PLANS: Record<string, OnboardingPlan> = {
  essentials: {
    slug: 'essentials',
    name: 'Essentials',
    stripeProduct: 'prod_VFTgb1v4pBInDc',
    title: 'Essentials onboarding',
    description: 'Tell us how to turn on your missed-call text-back.',
    lede:
      'You paid for Essentials. This form tells us which phone to watch and who gets a text when a job is booked. We use it to turn on missed-call text-back.',
    extras: [
      {
        legend: 'The business phone',
        fields: [
          {
            name: 'phone_provisioning',
            label: 'New number or port',
            type: 'select',
            required: true,
            help: 'A new number we set up, or port the one customers already call.',
            options: [
              { value: 'new', label: 'New number' },
              { value: 'port required', label: 'Port required' },
            ],
          },
        ],
      },
      {
        legend: 'Who gets booked-job texts',
        fields: [
          {
            name: 'booking_notify_name',
            label: 'Name',
            type: 'text',
            required: true,
            autocomplete: 'name',
          },
          {
            name: 'booking_notify_phone',
            label: 'Phone',
            type: 'tel',
            required: true,
            autocomplete: 'tel',
            pair: 'notify',
            help: 'We text this number when a job is booked.',
          },
          {
            name: 'booking_notify_email',
            label: 'Email',
            type: 'email',
            autocomplete: 'email',
            pair: 'notify',
            help: 'Leave blank and we use your contact email.',
          },
        ],
      },
      {
        legend: 'Hours and notes',
        fields: [
          {
            name: 'preferred_timezone',
            label: 'Timezone',
            type: 'text',
            placeholder: 'America/Denver',
            help: 'Optional. El Paso is America/Denver.',
          },
          {
            name: 'business_hours_notes',
            label: 'Business hours',
            type: 'textarea',
            rows: 2,
          },
          {
            name: 'after_hours_notes',
            label: 'After hours',
            type: 'textarea',
            rows: 2,
            help: 'What to do when a call comes in after you close. Optional.',
          },
          {
            name: 'phone_system_notes',
            label: 'Phone system',
            type: 'textarea',
            rows: 2,
            help: 'Carrier, forwarding, or anything we should know. Optional.',
          },
          {
            name: 'google_calendar_email',
            label: 'Google Calendar email',
            type: 'email',
            autocomplete: 'email',
            help: 'Optional. Where booked jobs should land.',
          },
        ],
      },
    ],
  },
  'front-desk-ai': {
    slug: 'front-desk-ai',
    name: 'Front Desk AI',
    stripeProduct: 'prod_VFTiCN04jgFhu6',
    title: 'Front Desk AI onboarding',
    description: 'Tell us how to handle texts and which calendar to book into.',
    lede:
      'You paid for Front Desk AI. This form tells us how to set up texts, which calendar to book, and what to do after hours.',
    extras: [
      {
        legend: 'Texts, calendar, and after hours',
        fields: [
          {
            name: 'sms_setup_prefs',
            label: 'SMS setup',
            type: 'textarea',
            required: true,
            rows: 3,
            help: 'New number, your number, or not sure yet. How texts should look to customers.',
          },
          {
            name: 'calendar_for_bookings',
            label: 'Calendar for bookings',
            type: 'text',
            required: true,
            autocomplete: 'email',
            help: 'The calendar booked jobs should land on. An email is fine.',
          },
          {
            name: 'after_hours_booking_rules',
            label: 'After-hours booking rules',
            type: 'textarea',
            rows: 3,
            help: 'Can we book after you close, or only take a message? Optional.',
          },
        ],
      },
    ],
  },
  'front-desk-complete': {
    slug: 'front-desk-complete',
    name: 'Front Desk Complete',
    stripeProduct: 'prod_VFTjGZxJrsl54f',
    title: 'Front Desk Complete onboarding',
    description: 'Tell us how to answer the phone, when to book, and when to send the call to you.',
    lede:
      'You paid for Front Desk Complete. This form tells us how to forward calls, which calendar to book, and when to send the call to you.',
    extras: [
      {
        legend: 'Calls, calendar, and rules',
        fields: [
          {
            name: 'call_forwarding_notes',
            label: 'Call forwarding',
            type: 'textarea',
            required: true,
            rows: 3,
            help: 'Where the phone should go if we need to send the call to you.',
          },
          {
            name: 'calendar_for_bookings',
            label: 'Calendar for bookings',
            type: 'text',
            required: true,
            autocomplete: 'email',
            help: 'The calendar booked jobs should land on. An email is fine.',
          },
          {
            name: 'book_vs_transfer_rules',
            label: 'Book or send the call',
            type: 'textarea',
            required: true,
            rows: 3,
            help: 'When we book the job, and when we send the call to you.',
          },
          {
            name: 'after_hours_emergency_rules',
            label: 'After hours and emergencies',
            type: 'textarea',
            rows: 3,
            help: 'What counts as an emergency after you close. Optional.',
          },
        ],
      },
    ],
  },
  'local-visibility': {
    slug: 'local-visibility',
    name: 'Local Visibility',
    stripeProduct: 'prod_VFTk31wYRBJjBr',
    title: 'Local Visibility onboarding',
    description: 'Tell us how to reach your Google listing and where to ask for reviews.',
    lede:
      'You paid for Local Visibility. This form tells us how to reach your Google listing and how you want review requests to go out.',
    extras: [
      {
        legend: 'Google listing and reviews',
        fields: [
          {
            name: 'gbp_link_or_access_notes',
            label: 'Google Business Profile',
            type: 'textarea',
            required: true,
            rows: 3,
            help: 'A link to the listing, or how we get access. We do not need the password here.',
          },
          {
            name: 'review_request_source',
            label: 'Review-request source',
            type: 'text',
            required: true,
            help: 'How you want us to ask for reviews. Text after a job, email, or something else.',
          },
        ],
      },
    ],
  },
  'search-growth': {
    slug: 'search-growth',
    name: 'Search Growth',
    stripeProduct: 'prod_VFTk7NuZqeANdK',
    title: 'Search Growth onboarding',
    description: 'Tell us who owns hosting, which jobs to write about, and which pages must stay.',
    lede:
      'You paid for Search Growth. This form tells us who owns hosting and DNS, which jobs to write about, and which pages must stay.',
    extras: [
      {
        legend: 'Site, listing, and pages',
        fields: [
          {
            name: 'hosting_dns_owner',
            label: 'Who owns hosting and DNS',
            type: 'text',
            required: true,
            help: 'You, a web person, or not sure yet.',
          },
          {
            name: 'top_services',
            label: 'Top services',
            type: 'textarea',
            required: true,
            rows: 3,
            help: 'The jobs you want more of.',
          },
          {
            name: 'gbp_access_notes',
            label: 'Google Business Profile access',
            type: 'textarea',
            required: true,
            rows: 2,
            help: 'A link to the listing, or how we get access. We do not need the password here.',
          },
          {
            name: 'pages_that_must_stay',
            label: 'Pages that must stay',
            type: 'textarea',
            rows: 3,
            help: 'Pages we must not change or take down. Optional.',
          },
        ],
      },
    ],
  },
  'paid-growth': {
    slug: 'paid-growth',
    name: 'Paid Growth',
    stripeProduct: 'prod_VFTltGdSBJ0bCw',
    title: 'Paid Growth onboarding',
    description: 'Tell us how to reach the ads accounts, the monthly ad budget, and when to kick off.',
    lede:
      'You paid for Paid Growth. This form tells us how to reach the ads accounts, the monthly ad budget, and when Brandon can start.',
    extras: [
      {
        legend: 'Ads and kickoff',
        fields: [
          {
            name: 'ads_access_notes',
            label: 'Meta and Google ads access',
            type: 'textarea',
            required: true,
            rows: 3,
            help: 'How we get into the ads accounts. We do not need the password here.',
          },
          {
            name: 'monthly_ad_budget',
            label: 'Monthly ad budget',
            type: 'text',
            required: true,
            help: 'What you can spend on ads each month. You pay Google or Meta for the ads.',
          },
          {
            name: 'brandon_kickoff_availability',
            label: 'When Brandon can kick off',
            type: 'textarea',
            required: true,
            rows: 2,
            help: 'Days and times that work for a start call.',
          },
        ],
      },
    ],
  },
  website: {
    slug: 'website',
    name: 'Website',
    stripeProduct: 'prod_VFTmWFkteZzzzL',
    title: 'Website onboarding',
    description: 'Tell us about your brand, the domain, and who approves the design.',
    lede:
      'You paid for the Website plan. This form tells us about the brand, the domain, and who says yes on the design.',
    extras: [
      {
        legend: 'Brand, domain, and approval',
        fields: [
          {
            name: 'logo_brand_photos_notes',
            label: 'Logo, brand, and photos',
            type: 'textarea',
            rows: 3,
            help: 'Where the logo and photos live, or if we need to collect them. Optional.',
          },
          {
            name: 'domain_status',
            label: 'Domain status',
            type: 'select',
            required: true,
            options: [
              { value: 'We have a domain', label: 'We have a domain' },
              { value: 'We need a domain', label: 'We need a domain' },
              { value: 'Not sure', label: 'Not sure' },
            ],
          },
          {
            name: 'design_approval_contact',
            label: 'Who approves the design',
            type: 'text',
            required: true,
            autocomplete: 'name',
            help: 'Name and how to reach them.',
          },
        ],
      },
    ],
  },
  'dead-river-complete': {
    slug: 'dead-river-complete',
    name: 'Dead River Complete',
    stripeProduct: 'prod_VFTnbwnV5zp9Xh',
    title: 'Dead River Complete onboarding',
    description: 'Tell us how to start building the system after payment.',
    lede:
      'You paid for Dead River Complete. This form is the post-pay setup, not the public purchase form. It tells us the calendar, listing and ads access, the first 60 days of ad budget, and when Brandon can start.',
    extras: [
      {
        legend: 'Calendar, access, budget, and kickoff',
        fields: [
          {
            name: 'calendar_for_bookings',
            label: 'Calendar for bookings',
            type: 'text',
            required: true,
            autocomplete: 'email',
            help: 'The calendar booked jobs should land on. An email is fine.',
          },
          {
            name: 'gbp_ads_access_notes',
            label: 'Google listing and ads access',
            type: 'textarea',
            required: true,
            rows: 3,
            help: 'How we reach the Google listing and the ads accounts. We do not need passwords here.',
          },
          {
            name: 'ad_budget_60_days',
            label: 'Ad budget for the first 60 days',
            type: 'text',
            required: true,
            help: 'What you can spend on ads in the first 60 days. You pay Google or Meta for the ads.',
          },
          {
            name: 'brandon_kickoff_times',
            label: 'When Brandon can kick off',
            type: 'textarea',
            required: true,
            rows: 2,
            help: 'Days and times that work for a start call.',
          },
        ],
      },
    ],
  },
  foundation: {
    slug: 'foundation',
    name: 'Foundation',
    stripeProduct: CORE3_PRICES.foundation,
    title: 'Foundation',
    description:
      'Tell us how to start Foundation setup and your monthly ad budget. Available to businesses nationwide.',
    lede:
      'You paid for Foundation. This form tells us who you are, the business the public sees, and what you can spend on ads each month. We work with growing businesses nationwide.',
    extras: core3AdBudgetExtras(CORE3_AD_BUDGET_RANGES.foundation),
    ...NATIONWIDE_ADDRESS,
  },
  'growth-partner': {
    slug: 'growth-partner',
    name: 'Growth Partner',
    stripeProduct: CORE3_PRICES['growth-partner'],
    title: 'Growth Partner',
    description:
      'Tell us how to start Growth Partner setup and your monthly ad budget. Available to businesses nationwide.',
    lede:
      'You paid for Growth Partner. This form tells us who you are, the business the public sees, and what you can spend on ads each month. We work with growing businesses nationwide.',
    extras: core3AdBudgetExtras(CORE3_AD_BUDGET_RANGES['growth-partner']),
    ...NATIONWIDE_ADDRESS,
  },
  scale: {
    slug: 'scale',
    name: 'Scale',
    stripeProduct: CORE3_PRICES.scale,
    title: 'Scale',
    description:
      'Tell us how to start Scale setup and your monthly ad budget. Available to businesses nationwide.',
    lede:
      'You paid for Scale. This form tells us who you are, the business the public sees, and what you can spend on ads each month. We work with growing businesses nationwide.',
    extras: core3AdBudgetExtras(CORE3_AD_BUDGET_RANGES.scale),
    ...NATIONWIDE_ADDRESS,
  },
};

export const ONBOARDING_SLUGS = Object.keys(ONBOARDING_PLANS);

export function onboardingPlan(slug: string): OnboardingPlan | undefined {
  return ONBOARDING_PLANS[slug];
}
