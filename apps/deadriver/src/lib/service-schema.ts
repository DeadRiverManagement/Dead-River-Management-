import { business } from '../data/site';
import { faqPage } from './schema';

type ServiceOffer = {
  name: string;
  url: string;
  price?: string;
};

/** Service + FAQ + breadcrumb schema. City-level only. New plan names. */
export function serviceSchema(opts: {
  path: string;
  name: string;
  serviceType: string;
  description: string;
  offer: ServiceOffer;
  faqs: readonly { q: string; a: string }[];
  crumb: string;
}) {
  const url = `${business.url}${opts.path}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: opts.name,
      serviceType: opts.serviceType,
      url,
      description: opts.description,
      provider: { '@id': `${business.url}/#organization` },
      areaServed: [{ '@type': 'City', name: 'El Paso' }, { '@type': 'Country', name: 'US' }],
      audience: { '@type': 'BusinessAudience', name: 'Home service businesses' },
      offers: {
        '@type': 'Offer',
        name: opts.offer.name,
        url: `${business.url}${opts.offer.url}`,
        priceCurrency: 'USD',
        description: opts.description,
        ...(opts.offer.price ? { price: opts.offer.price } : {}),
      },
    },
    faqPage(opts.faqs),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${business.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${business.url}/services` },
        { '@type': 'ListItem', position: 3, name: opts.crumb, item: url },
      ],
    },
  ];
}
