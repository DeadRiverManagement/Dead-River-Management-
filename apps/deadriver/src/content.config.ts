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
    /** Meta description when it must differ from the visible hero intro. */
    metaDescription: z.string().optional(),
    /** Short plain answer shown under the hero intro (authored HTML links only). */
    answer: z.string().optional(),
    answerRelated: z.string().optional(),
  }),
});

export const collections = { blog };