import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';

// Any path that vercel.json redirects unconditionally is an old URL that
// still builds (so old links keep working) but should not be in the sitemap.
const redirected = new Set(
  JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
    .redirects.filter((r) => !r.missing && !r.has)
    .map((r) => r.source.replace(/\.html$/, '')),
);

// lastmod for each article comes from its front-matter date, so crawlers see
// which guides changed without us hand-editing the sitemap.
const articleDates = Object.fromEntries(
  readdirSync(new URL('./src/content/blog', import.meta.url))
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = readFileSync(new URL(`./src/content/blog/${f}`, import.meta.url), 'utf8');
      const date = src.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
      return [`/marketing-advice/${f.replace(/\.md$/, '')}`, date];
    })
    .filter(([, d]) => d),
);

export default defineConfig({
  site: 'https://www.deadrivermanagement.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  // Self-host Inter + Bricolage (latin, used weights only). Replaces the
  // render-blocking Google Fonts stylesheet that was delaying LCP.
  fonts: [
    {
      name: 'Bricolage Grotesque',
      cssVariable: '--font-display',
      provider: fontProviders.google(),
      weights: [700, 800],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Inter', 'system-ui', 'sans-serif'],
    },
    {
      name: 'Inter',
      cssVariable: '--font-body',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
  // Purchase, gated content and paid-campaign steps are not discovery URLs.
  integrations: [
    sitemap({
      serialize: (item) => {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const date = articleDates[path];
        return date ? { ...item, lastmod: new Date(date).toISOString() } : item;
      },
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '') || '/';
        const oldPlanPaths = new Set([
          '/missed-call-rescue',
          '/lead-rescue',
          '/website-rescue',
          '/local-growth',
          '/growth-engine',
          '/whole-river-plan',
          '/front-desk-essentials',
          '/el-paso-home-services-marketing',
          '/ai-receptionist-el-paso',
          '/google-ads-management-el-paso',
          '/social-media-management-el-paso',
          '/web-design-el-paso',
          '/ai-search-optimization-el-paso',
          '/google-business-profile-el-paso',
          '/local-seo-el-paso',
        ]);
        return (
          !path.startsWith('/welcome/') &&
          path !== '/onboarding' &&
          !path.startsWith('/onboarding/') &&
          path !== '/watch' &&
          path !== '/free-playbook' &&
          path !== '/flagship-offer' &&
          path !== '/404' &&
          path !== '/book/thanks' &&
          path !== '/demand-intelligence/thanks' &&
          !oldPlanPaths.has(path) &&
          !redirected.has(path)
        );
      },
    }),
  ],
});
