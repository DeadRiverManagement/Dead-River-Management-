import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string().default('Marketing'),
    author: z.string().default('Brandon Aubey'),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    draft: z.boolean().default(false),
    /** Document <title> when it must not append "| Dead River Management". */
    pageTitle: z.string().optional(),
    /** Visible H1 when it must differ from the document title. */
    headline: z.string().optional(),
    faqHeading: z.string().optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    /** Show legacy “prices and plans may have changed” hedge (retired ladder articles only). */
    legacyPriceNotice: z.boolean().default(false),
  }),
});

export const collections = { blog };