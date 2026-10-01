# Dead River growth website — launch notes

This branch is the rebuilt marketing site (Foundation / Growth Partner / Scale,
industry pages, Growth Plan, free tools, Demand Intelligence, case studies,
onboarding, policies). It has been through a plain-English copy pass and a
design pass and is ready to merge to `main` when Brandon approves. Merging to
`main` deploys it to production on Vercel.

## What changed from the preview build

- The review-only banner, the site-wide `noindex` header and meta tag, the
  `robots.txt` block, and the production build guard are gone. The site is
  indexable.
- The preview Content-Security-Policy header is gone: it blocked the Google
  Ads tag, Google Tag Manager, the Meta pixel, and the Datamoon script that
  the rest of the site already loads. The Growth layout now loads the same
  tags as `src/layouts/Base.astro`.
- `POST /api/growth-lead` delivers in production. It creates or updates the
  contact in GoHighLevel using the same `GHL_PIT` and `GHL_LOCATION_ID`
  secrets as `/api/lead.js`, tags it `website-lead` and `growth-<kind>`, and
  adds a note with the goals, Growth Plan scores, and priority. An optional
  signed webhook (`ENABLE_GROWTH_INTAKE`, `GROWTH_LEAD_WEBHOOK`,
  `GROWTH_WEBHOOK_SECRET`) can run alongside it. Preview deployments still
  validate without sending anything.
- The cookie dialog and the browser "activity signals" feature were removed.
  Sales priority now comes only from the Growth Plan answers.
- Policies (privacy, terms, cookies, text messages, results and claims, lead
  guarantee, industry notes) are written as final plain-language pages. They
  describe what the site actually does. Have a lawyer read them before or
  soon after launch.
- All copy was rewritten for a general reader: "ads on one platform" instead
  of "primary acquisition channel", "follow-up" instead of "nurture",
  "customer list (CRM)", "repeat business" instead of "retention", and so on.
- Type sizes were raised across the site (body 17px, controls 14–15px) and
  decorative numbering was removed where the items are not a sequence.

## Still to decide (not blockers for launch)

- Demand Intelligence pricing is "on request" until it is set.
- The story section uses an illustrative planning image; swap in real
  team or client photography when it exists.
- Roughly 100 older "<industry> marketing El Paso" pages still use the old
  `Base.astro` layout and header. They redirect nowhere and keep working, but
  they look like the previous site. Re-templating them is a separate job.
- Client logos and testimonials appear only as typed names until written
  approval exists.

## Checks

```
npm run build
node --test tests/*.test.mjs
node scripts/check-growth.mjs
```
