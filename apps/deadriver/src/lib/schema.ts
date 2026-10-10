import { business, plans, GUARANTEE_LINE, PAID_GROWTH_SETUP_LINE } from '../data/site';

const offerFromPlan = (plan: (typeof plans)[number], position: number) => ({
  '@type': 'Offer' as const,
  position,
  name: plan.name,
  url: `${business.url}/${plan.slug}`,
  priceCurrency: 'USD',
  description: plan.guarantee || plan.hidePrice
    ? GUARANTEE_LINE
    : plan.slug === 'paid-growth'
      ? `${plan.blurb} ${PAID_GROWTH_SETUP_LINE}`
      : plan.blurb,
  ...(plan.monthly != null && !plan.hidePrice ? { price: plan.monthly.toFixed(2) } : {}),
});

/** OfferCatalog of plans. Prices come from `plans` in site.ts. Dead River Complete stays unpriced when included. */
export function planOfferCatalog(options?: { excludeSlugs?: readonly string[] }) {
  const listed = options?.excludeSlugs?.length
    ? plans.filter((plan) => !options.excludeSlugs!.includes(plan.slug))
    : plans;
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Dead River Management plans',
    numberOfItems: listed.length,
    itemListElement: listed.map((plan, i) => offerFromPlan(plan, i + 1)),
  };
}

export function faqPage(items: readonly { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** BreadcrumbList. Home item is `${business.url}/`. Every crumb has an absolute item URL. */
export function breadcrumbList(crumbs: readonly { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.path === '/' ? `${business.url}/` : `${business.url}${crumb.path}`,
    })),
  };
}

/** ItemList of name + url, same shape as the /tools and /work hubs. */
export function itemList(items: readonly { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: `${business.url}${item.path}`,
    })),
  };
}
