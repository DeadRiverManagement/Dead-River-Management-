// Wave B advice hub. Titles, metas, H1s, CTAs, FAQ, and card copy are locked.
import { faqPage } from '../lib/schema';

export const SITE = 'https://www.deadrivermanagement.com';
export const PUBLISHED = '2026-09-27';
export const CTA_LABEL = 'Book Your Free Strategy Call';
export const CTA_HREF = '/book';

export const hub = {
  path: '/advice',
  title: 'Advice for Growing Local Businesses | Dead River Management',
  description:
    'Practical guides on lead response, hiring help, and booked jobs—not vanity traffic. Free strategy call when you’re ready.',
  h1: 'Advice you can use this week',
  eyebrow: 'Advice',
  intro:
    'Most “marketing advice” talks about more leads. These guides talk about what actually fills the calendar: how fast you answer, what to demand after a bad agency, and how to stop paying for traffic that never becomes work. Read one, then book a free strategy call if you want a second set of eyes.',
  ctaHeadline: 'Ready for a clear next step?',
  ctaBody:
    'Book a free strategy call. We’ll look at where jobs are leaking and whether a guarantee fits.',
} as const;

export const leadResponse = {
  path: '/advice/lead-response-time',
  title: 'Speed-to-Lead Is the Real Cost | Dead River Management',
  description:
    'If you wait hours to call back, you paid for someone else’s job. See what speed-to-lead does to booked appointments—and what to fix first.',
  h1: 'How fast you answer is the real cost of a lead',
  cardTitle: 'How Fast You Answer Is the Real Cost of a Lead',
  dek: 'Speed-to-lead beats another ad dollar when the phone already rings.',
  eyebrow: 'Advice · Lead response',
  lede: 'A lead that waits is usually a lead you lost. The ad didn’t fail. The follow-up did. Speed-to-lead—how fast a real person answers or calls back—is often cheaper to fix than buying more clicks.',
  ctaHeadline: 'Want a second set of eyes on your intake?',
  ctaBody:
    'Book a free strategy call. We’ll look at where leads stall and what would change booked appointments first.',
  faq: [
    {
      q: 'How fast should we call a new lead back?',
      a: 'Treat minutes as the bar. Same-day is usually too late for emergency and urgent home service, and it is weak for most high-intent forms.',
    },
    {
      q: 'Does an auto-text count as responding?',
      a: 'Only as a bridge. The clock stops when a person who can book the job actually connects.',
    },
    {
      q: 'We’re small—can we really answer that fast?',
      a: 'Yes, with a backup plan for when you’re on a job. The backup is the fix, not a bigger ad budget.',
    },
    {
      q: 'Should we pause ads until response time improves?',
      a: 'If you routinely miss or delay, pause or cut spend until the phone process holds. Paying for ignored leads is the expensive option.',
    },
  ],
} as const;

export const afterAgency = {
  path: '/advice/after-a-bad-agency',
  title: 'What to Ask After a Bad Agency | Dead River Management',
  description:
    'Got reports, not jobs? Use this question list before you hire again—so the next partner sells booked work, not vanity metrics.',
  h1: 'What to ask after a marketing agency burned you',
  cardTitle: 'What to Ask After a Marketing Agency Burned You',
  dek: 'A short list that separates operators from pitch decks.',
  eyebrow: 'Advice · Hiring help',
  lede: 'If the last agency sent dashboards and you still had a quiet calendar, the problem was the offer—not your “tough market.” Before you hire again, ask questions that only an operator can answer.',
  ctaHeadline: 'Interview us the same way',
  ctaBody:
    'Book a free strategy call. Bring what failed last time. We’ll say plainly whether we can help—or not.',
  faq: [
    {
      q: 'We got leads but no jobs. Was the agency bad?',
      a: 'Often the handoff was bad—slow response, weak qualifying, or “leads” that were never bookable. Fix the definition of a result before you buy another channel.',
    },
    {
      q: 'Should we sue or leave a review first?',
      a: 'This guide is about hiring next, not legal advice. Document promises vs delivery, then use that file in the next vendor interview.',
    },
    {
      q: 'Is a guarantee a gimmick?',
      a: 'A clear guarantee with written definitions can be useful. A vague “we’ll get you leads” promise with no show-up standard usually isn’t.',
    },
    {
      q: 'What’s the first call with a new partner for?',
      a: 'Diagnosis. If they can’t talk about your phone, follow-up, and calendar, they’re not ready to take your budget.',
    },
  ],
} as const;

/** Card order is locked: speed-to-lead, then hiring after a bad agency. */
export const adviceCards = [leadResponse, afterAgency] as const;

const crumb = (name: string, path: string, position: number) => ({
  '@type': 'ListItem',
  position,
  name,
  item: path === '/' ? `${SITE}/` : `${SITE}${path}`,
});

export function hubSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: hub.title,
      description: hub.description,
      url: `${SITE}${hub.path}`,
      isPartOf: { '@id': `${SITE}/#website` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: adviceCards.length,
        itemListElement: adviceCards.map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: post.cardTitle,
          url: `${SITE}${post.path}`,
          description: post.dek,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [crumb('Home', '/', 1), crumb('Advice', hub.path, 2)],
    },
  ];
}

export function postSchema(post: typeof leadResponse | typeof afterAgency) {
  const url = `${SITE}${post.path}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': ['BlogPosting', 'Article'],
      headline: post.h1,
      description: post.description,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      mainEntityOfPage: url,
      url,
      image: `${SITE}/images/og/demand-flow.png`,
      author: {
        '@type': 'Organization',
        name: 'Dead River Management',
        url: SITE,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Dead River Management',
        url: SITE,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE}/images/logo.png`,
        },
      },
    },
    faqPage([...post.faq]),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        crumb('Home', '/', 1),
        crumb('Advice', hub.path, 2),
        crumb(post.cardTitle, post.path, 3),
      ],
    },
  ];
}
