# deadrivermanagement.com

Astro static site for Dead River Management. Hosted on Vercel; every push to `main` deploys automatically.

## Where things live
- `src/data/site.ts` – business facts, nav, plans, testimonials
- `src/data/seo.ts` – page titles + meta descriptions (monthly SEO routine edits these)
- `src/data/industries.json` – the 100 industry pages: trade names, El Paso search numbers, national target keywords, trade-specific copy
- `src/pages/[industry].astro` – one template that renders every `/<trade>-marketing-el-paso` route from industries.json
- `src/pagehtml/*.html` – the approved redesign markup for the homepage, plans, the six plan pages, services and the seven service pages. Edit copy here. The `*.script.js` next to each one is that page's animation.
- `src/pages/*.astro` – thin wrappers around the markup above, plus about, watch, advice, case studies, privacy, terms
- `src/layouts/Base.astro` – head, nav, sticky Call/Text bar, footer, and the site-wide script (reveals, nav hide-on-scroll, lead forms)
- `src/styles/global.css` – the design system (dark/copper, Bricolage Grotesque + Inter). One file; plan pages add a small `<style is:global>` block each
- `src/content/blog/*.md` – blog posts under /marketing-advice (monthly routine adds here)
- `api/lead.js` – the free-video forms post here; it upserts the contact in the CRM
- `api/onboard.js` – the post-payment onboarding forms post here
- `api/stripe/onboarding.js` – Stripe webhook for Offer v1 paid-signup alerts
- `vercel.json` – headers and the redirects for the retired plan URLs
- `public/images/` – committed brand lockup (`logo.png`, header renditions) and founder photos

## Local
    npm install
    npm run dev

## Optional env (Vercel → Settings → Environment Variables)
- `PUBLIC_LEAD_WEBHOOK` – GoHighLevel inbound webhook URL; turns the "free video" forms on.

## Stripe onboard webhook (production)
Paste this URL into Stripe Dashboard → Workbench → Webhooks as the destination:

`https://www.deadrivermanagement.com/api/stripe/onboarding`

Listen for `customer.subscription.created`, `customer.subscription.updated`, `invoice.paid`, `invoice.payment_succeeded`, and `checkout.session.completed`. After Stripe shows the signing secret, add it in Vercel (Production) and redeploy if the deploy predates the secret.

Required (server-only, no `PUBLIC_` prefix):
- `STRIPE_WEBHOOK_SECRET` – the `whsec_…` signing secret from that destination

Optional:
- `STRIPE_SECRET_KEY` – restricted key preferred; fills in customer email / product ids and stamps the subscription so retries stay idempotent
- `GHL_PIT` / `GHL_LOCATION_ID` – already used by the lead and onboard forms; also the durable ledger for this webhook

This webhook does not send email. Harper sends Email-1 via Gmail. A new paid signup is a Vercel log plus a GHL contact note.
