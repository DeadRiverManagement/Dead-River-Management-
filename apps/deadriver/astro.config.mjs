import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// Any path that vercel.json redirects unconditionally is an old URL that
// still builds (so old links keep working) but should not be in the sitemap.
const redirected = new Set(
  JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
    .redirects.filter((r) => !r.missing && !r.has)
    .map((r) => r.source.replace(/\.html$/, '')),
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
