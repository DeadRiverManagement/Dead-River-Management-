// Locked FAQ copy for the 2026-10-08 tools and work ship.
// Visible FAQ text and FAQPage JSON-LD must use these strings exactly.

export type FaqItem = { q: string; a: string };

const noEmail: FaqItem = {
  q: 'Do these tools require an email?',
  a: 'No. Every Dead River Management tool on this site is free to use with no email required.',
};

export const toolFaqs: Record<string, readonly FaqItem[]> = {
  'ad-budget': [
    {
      q: 'What does the Ad Budget Planner do?',
      a: 'It connects customer targets, close rate, and media spend so you can plan an ad budget that matches the revenue you want.',
    },
    {
      q: 'Who is this planner for?',
      a: 'Growing businesses nationwide that need a clear media spend target before they buy ads.',
    },
    noEmail,
  ],
  'campaign-roi': [
    {
      q: 'What does the Campaign ROI Calculator show?',
      a: 'It shows the contribution left after a campaign pays for itself so you can judge whether the campaign is worth running.',
    },
    {
      q: 'Who is this calculator for?',
      a: 'Growing businesses nationwide that need a simple ROI check before or after a paid campaign.',
    },
    noEmail,
  ],
  'campaign-url': [
    {
      q: 'What does the Campaign URL Builder create?',
      a: 'It creates consistent tracking links so every campaign stays measurable across ads and landing pages.',
    },
    {
      q: 'Who is this builder for?',
      a: 'Teams that need clean campaign URLs without guessing UTM parameters by hand.',
    },
    noEmail,
  ],
  'customer-acquisition-cost': [
    {
      q: 'What does the CAC calculator measure?',
      a: 'It helps you understand the true cost of winning each new customer from your marketing spend.',
    },
    {
      q: 'Who is this calculator for?',
      a: 'Growing businesses nationwide that need a clear customer acquisition cost number.',
    },
    noEmail,
  ],
  'growth-readiness': [
    {
      q: 'What does the Growth Readiness Check evaluate?',
      a: 'It checks whether your systems can handle more demand before you scale spend.',
    },
    {
      q: 'Who is this check for?',
      a: 'Businesses that want to know if operations can keep up before they buy more traffic.',
    },
    noEmail,
  ],
  'lead-response': [
    {
      q: 'What does the Lead Response Scorecard find?',
      a: 'It finds gaps between a new inquiry and a useful reply so you can tighten follow-up speed.',
    },
    {
      q: 'Who is this scorecard for?',
      a: 'Growing businesses nationwide that lose leads to slow or unclear responses.',
    },
    noEmail,
  ],
  'revenue-goal': [
    {
      q: 'What does the Revenue Goal Planner do?',
      a: 'It works backward from a revenue target to the leads you need so the goal is tied to a real pipeline number.',
    },
    {
      q: 'Who is this planner for?',
      a: 'Businesses nationwide that want a lead target that matches a revenue goal.',
    },
    noEmail,
  ],
  'search-preview': [
    {
      q: 'What does the Search Snippet Preview show?',
      a: 'It lets you write a clearer page title and meta description and see how it may appear in Google.',
    },
    {
      q: 'Who is this preview for?',
      a: 'Anyone updating page titles or metas who wants a quick search-result check before publishing.',
    },
    noEmail,
  ],
  'seo-foundations': [
    {
      q: 'What does the SEO Foundations Checklist cover?',
      a: 'It reviews the essentials that help your site get found so you can spot missing basics.',
    },
    {
      q: 'Who is this checklist for?',
      a: 'Growing businesses nationwide that need a practical SEO foundations pass.',
    },
    noEmail,
  ],
  'website-conversion': [
    {
      q: 'What does the Website Conversion Review assess?',
      a: 'It assesses the path from first visit to next step so you can find friction on the site.',
    },
    {
      q: 'Who is this review for?',
      a: 'Growing businesses nationwide that need a clearer path from visit to inquiry or sale.',
    },
    noEmail,
  ],
};

export const workHubFaqs: readonly FaqItem[] = [
  {
    q: 'What kind of results are on this page?',
    a: 'Real client outcomes Dead River Management helped deliver, including Total Auto Repair going from $20K to $100K months, The Pipe Whisperers from $60K to $250K a year, and Wicked Logistics reaching 5-6 leads a day.',
  },
  {
    q: 'Are these guaranteed outcomes for every business?',
    a: 'No. These are case studies for specific clients. Demand Flow for accepted businesses targets $50,000 in new revenue in 45-60 days, or service fees refunded plus $500; ad spend is not refunded.',
  },
  {
    q: 'Can I see the full story for each client?',
    a: 'Yes. Each card links to a dedicated case study page with the before-and-after numbers for that business.',
  },
];

const moreResults: FaqItem = {
  q: 'Where can I see more client results?',
  a: 'See all case studies at https://www.deadrivermanagement.com/work',
};

export const caseStudyFaqs: Record<string, readonly FaqItem[]> = {
  'total-auto-repair': [
    {
      q: 'What result did Total Auto Repair see?',
      a: 'Total Auto Repair went from $20,000 a month to $100,000 a month in 18 months with Dead River Management.',
    },
    {
      q: 'What kind of business is this case study about?',
      a: 'An auto repair shop that needed more consistent demand and higher monthly revenue.',
    },
    moreResults,
  ],
  'the-pipe-whisperers': [
    {
      q: 'What result did The Pipe Whisperers see?',
      a: 'The Pipe Whisperers went from $60,000 a year to $250,000 a year in 24 months with Dead River Management.',
    },
    {
      q: 'What kind of business is this case study about?',
      a: 'A plumbing business that needed stronger demand and higher annual revenue.',
    },
    moreResults,
  ],
  'gonzalez-and-sons-roofing': [
    {
      q: 'What result did Gonzalez & Sons Roofing see?',
      a: 'Gonzalez & Sons Roofing went from 2 roofs a month to 8 roofs a month, and from about $50,000 a month to $200,000 a month in revenue with Dead River Management.',
    },
    {
      q: 'What kind of business is this case study about?',
      a: 'A roofing company that needed more installed jobs per month and higher monthly revenue.',
    },
    moreResults,
  ],
  'wicked-logistics': [
    {
      q: 'What result did Wicked Logistics see?',
      a: 'Wicked Logistics went from 1-2 leads a week to 5-6 leads a day in 3 months with Dead River Management. One lead became a $1.2M/year shipping contract.',
    },
    {
      q: 'What kind of business is this case study about?',
      a: 'A logistics company that needed a much higher daily lead volume.',
    },
    moreResults,
  ],
  'parcel-management-group': [
    {
      q: 'What result did Parcel Management Group see?',
      a: 'Parcel Management Group generated 49 Facebook leads in 30 days at $17.70 each with Dead River Management.',
    },
    {
      q: 'What kind of business is this case study about?',
      a: 'A freight and parcel management business that needed affordable paid social leads.',
    },
    moreResults,
  ],
  'only-fish': [
    {
      q: 'What did Dead River Management deliver for Only Fish?',
      a: 'A complete identity and launch for a new business, covering brand and go-to-market in one push.',
    },
    {
      q: 'Is Only Fish a Demand Flow revenue case study?',
      a: 'No. This case study is about identity and launch, not the $50,000 in 45-60 days Demand Flow guarantee.',
    },
    moreResults,
  ],
};
