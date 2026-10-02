import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog posts live in src/content/blog/<slug>.md
 * The monthly SEO run adds new files here. Frontmatter is the contract.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(70),
    description: z.string().max(170),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Root-relative path under /public, e.g. /images/blog/my-post.webp */
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    /** Primary target keyword this post was written for. */
    keyword: z.string().optional(),
    /** Secondary keywords / fan-out queries covered. */
    keywords: z.array(z.string()).default([]),
    category: z.string().default('Ship Tips'),
    author: z.string().default('Parcel Management Group'),
    /** FAQ block rendered at the end of the post and emitted as FAQPage schema. */
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
