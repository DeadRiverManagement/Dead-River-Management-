# Monthly SEO + blog routine

A scheduled Claude Code routine runs on the 1st of each month. This file is
the playbook it follows; edit it to change what the routine does.

## What it does each month

1. **SEO review of `src/data/seo.ts`**
   - Every route in `src/pages/` (and every non-draft post in `src/content/blog/`)
     should have a unique title (~60 chars max) and description (~155 chars max).
   - Titles lead with the service + "El Paso" where the page is a local service
     page; plan pages lead with the plan name and price.
   - Fix duplicates, missing routes, truncation, and stale prices. Prices come
     from `src/data/site.ts`, never from memory.
   - Do not touch layouts or components; the routine only edits data and content.

2. **One new blog post in `src/content/blog/<slug>.md`**
   - Frontmatter: `title`, `description`, `date` (YYYY-MM-DD, the run date),
     `category` (e.g. "AI Search", "Local SEO", "Ads", "Websites", "Follow-up").
   - 900 to 1,400 words, written for El Paso home service business owners
     (plumbers, HVAC, roofers, electricians, landscapers, cleaners).
   - Match the voice of the existing posts: plain English, concrete examples,
     no fluff, one clear takeaway per section, short paragraphs.
   - Tie the topic to a real plan or service page and link to it with a
     relative URL (for example `/missed-call-rescue`). Do not invent prices,
     stats, or client names; use only facts in `src/data/site.ts`.
   - Pick a topic not already covered by an existing post. Rotate through:
     missed-call text-back, Google Business Profile, local SEO, AI search (AEO),
     Meta ads for home services, Google Ads, website conversion, review
     generation, CRM follow-up, seasonal demand in El Paso.

3. **Verify**
   - `npm ci && npm run build` must pass.
   - Confirm `dist/<page>.html` titles match `seo.ts`, and the new post shows
     up in `dist/marketing-advice/` and `dist/llms.txt`.

4. **Deliver**
   - Branch `seo/YYYY-MM` from `main`, one commit, push, open a PR to `main`
     titled `SEO + blog: <Month YYYY>` with a short summary of title changes
     and the new post. Vercel deploys production when the PR is merged.
   - Never push directly to `main`.
