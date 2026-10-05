import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { CANONICAL_ORIGIN } from '../data/canonical';

const STATIC_PATHS = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/about/', changefreq: 'yearly', priority: 0.6 },
  { path: '/services/', changefreq: 'monthly', priority: 0.8 },
  { path: '/how-freight-quoting-works/', changefreq: 'monthly', priority: 0.7 },
  { path: '/freight-broker-vs-carrier/', changefreq: 'monthly', priority: 0.7 },
  { path: '/what-is-a-freight-broker/', changefreq: 'monthly', priority: 0.7 },
  { path: '/what-is-ltl-shipping/', changefreq: 'monthly', priority: 0.7 },
  { path: '/ltl-vs-ftl/', changefreq: 'monthly', priority: 0.7 },
  { path: '/ltl-freight-quote/', changefreq: 'monthly', priority: 0.7 },
  { path: '/what-is-freight-class/', changefreq: 'monthly', priority: 0.7 },
  { path: '/what-is-a-bill-of-lading/', changefreq: 'monthly', priority: 0.7 },
  { path: '/accessorial-charges/', changefreq: 'monthly', priority: 0.7 },
  { path: '/what-is-a-freight-forwarder/', changefreq: 'monthly', priority: 0.7 },
  { path: '/what-is-ftl/', changefreq: 'monthly', priority: 0.7 },
  { path: '/what-is-fob/', changefreq: 'monthly', priority: 0.7 },
  { path: '/what-is-cross-docking/', changefreq: 'monthly', priority: 0.7 },
  { path: '/blog/', changefreq: 'weekly', priority: 0.7 },
  { path: '/privacy/', changefreq: 'yearly', priority: 0.3 },
  { path: '/terms/', changefreq: 'yearly', priority: 0.3 },
] as const;

function iso(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: number): string {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    '  </url>',
  ].join('\n');
}

export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.origin ?? CANONICAL_ORIGIN).replace(/\/$/, '');
  const generated = new Date().toISOString();
  const entries: string[] = [];

  for (const route of STATIC_PATHS) {
    entries.push(urlEntry(`${origin}${route.path}`, generated, route.changefreq, route.priority));
  }

  const posts = await getCollection('blog', ({ data }) => !data.draft);
  for (const post of posts) {
    const lastmod = iso(post.data.updatedDate ?? post.data.pubDate);
    entries.push(urlEntry(`${origin}/blog/${post.id}/`, lastmod, 'monthly', 0.6));
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
