import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { CANONICAL_ORIGIN } from './src/data/canonical.ts';

export default defineConfig({
  site: CANONICAL_ORIGIN,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  build: { format: 'directory' },
});
