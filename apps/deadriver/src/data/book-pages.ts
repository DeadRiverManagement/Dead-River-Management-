// The /book application page. Copy for the Demand Flow guarantee offer.
// The per-industry booking pages were retired; /book is the only book page.

export type BookFaq = { q: string; a: string };

export type BookPageCopy = {
  industry: 'home-services' | 'dental' | 'med-spas' | 'real-estate' | 'ecommerce' | 'other';
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  happens: string;
  walkAway: [string, string, string];
  reassurance: string;
  whoFor: string;
  quote?: { text: string; cite: string };
  proofTitle: string;
  proof: string[];
  guarantee: string;
  investment?: string;
  faqs: BookFaq[];
  scarcity: string;
};

export const homeServicesBook: BookPageCopy = {
  industry: 'other',
  title: 'Book Your Free Strategy Call',
  description:
    'Book a free strategy call with Dead River Management. See if your business qualifies for the Demand Flow guarantee: $50,000 in new revenue in 45 to 60 days.',
  eyebrow: 'Free Demand Flow Strategy Call',
  headline:
    'We’ll help your business generate $50,000 in new revenue with our Demand Flow system in 45 to 60 days. Or your money back, and we pay you $500 for wasting your time.',
  intro:
    'We build and run the whole Demand Flow system: purchase intent data to find the people ready to buy, ads that reach only them, landing pages, instant follow-up, CRM, and booking. Miss the $50,000 and you get your service fees back, plus $500 from us. No commitment required to apply.',
  happens:
    'We’ll look at how you get customers today, pull the live demand in your market, and tell you honestly whether your business qualifies for the Demand Flow guarantee.',
  walkAway: [
    'A clear diagnosis of why your current lead flow is inconsistent',
    'A look at the purchase intent data for your market and who your ideal customer really is',
    'The exact investment and a no-pressure next step',
  ],
  reassurance: 'This is not a sales ambush. If we’re not a fit, we’ll tell you.',
  whoFor:
    'Business owners who sell a high-ticket product or service, can handle $50,000 of new work in the next two months, and want a system that brings buyers to them instead of chasing leads.',
  quote: {
    text: 'They designed our company’s website and changed how we receive leads. We were able to get multiple leads a day and secured several contracts.',
    cite: 'Christina Hernandez, Google review',
  },
  proofTitle: 'Recent results:',
  proof: [
    'Gonzalez & Sons Roofing: from 2 to 8 roofs/month',
    'The Pipe Whisperers: from roughly $60K to $250K/year',
  ],
  guarantee:
    '$50,000 in new revenue within 45 to 60 days of your Demand Flow system going live. If we miss, every service fee you paid comes back, and we pay you $500 for wasting your time. Ad spend is separate. Full terms are on our guarantee terms page and in your agreement.',
  faqs: [
    {
      q: 'What does it cost?',
      a: 'We go over the exact investment on the call, after we have looked at your market. Ad spend is paid directly to the platforms and is separate from our fees.',
    },
    {
      q: 'What if I’m not ready to start?',
      a: 'Apply anyway. We’ll tell you if it makes sense.',
    },
    {
      q: 'What if I’ve been burned by agencies before?',
      a: 'That’s exactly why we guarantee revenue, not “leads.” Miss the number and you get your money back, plus $500.',
    },
    {
      q: 'What counts toward the $50,000?',
      a: 'New revenue from customers who came in through the system we build, tracked in your CRM and confirmed against your invoices. Customers you already had do not count.',
    },
  ],
  scarcity: '',
};
