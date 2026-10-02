# Backlink strategy for deadrivermanagement.com

Date: 2026-10-02. Owner: Brandon Aubey. Review monthly.

## Where we stand

- DataForSEO Labs shows one ranked organic keyword for the domain and zero AI Overview citations (see `seo-team/outputs/deadrivermanagement-com/04-geo-audit.md`).
- Competitors that rank for "marketing agency el paso" and "local seo el paso": agims.com, monsterlinkmarketing.com, venpro.solutions. Monster Link Marketing already holds a verified ChatGPT citation for the AI search optimization query.
- Dead River is a service-area business with no public street address. Never enter a made-up address on any directory. Use the service-area setup where a directory offers one and skip the ones that demand a street address.

Goal for the first 90 days: 25 to 40 referring domains that a buyer or an AI assistant would trust, with correct name, phone, and website on every one. No paid links, no link farms, no reciprocal link schemes.

## Linkable assets we already have

Point every outreach ask at one of these. They are worth citing on their own.

| Asset | URL | Who links to it |
| --- | --- | --- |
| Free calculators (lead response, ad budget, campaign ROI, CAC, revenue goal, website conversion) | `/tools/*` | Trade blogs, software roundups, business coaches, local news "resources" lists |
| Marketing advice guides (19 plain-language how-to posts) | `/marketing-advice/*` | Trade associations, supplier newsletters, Reddit and Facebook groups, other agencies' "further reading" |
| Client case studies | `/work/*` | The clients themselves, trade press, chamber features |
| Demand Flow guarantee page | `/` | Agency directories, "best of" lists |
| Demand Intelligence product page | `/demand-intelligence` | Software directories, martech roundups |

## Tier 1: citations and profiles (weeks 1 to 2)

Free, fast, and they fix the trust problem first. Match the NAP block in `seo-team/outputs/deadrivermanagement-com/07-local-seo.md` exactly.

1. Bing Places for Business
2. Apple Business Connect
3. Facebook Business Page (confirm NAP matches)
4. LinkedIn Company Page (link to `/company` and the latest guide in the About section)
5. Better Business Bureau, El Paso
6. El Paso Chamber of Commerce member listing
7. Clutch.co agency profile, then ask three clients for reviews there
8. UpCity
9. DesignRush
10. GoodFirms
11. Yelp for Business (service area, no address)
12. Nextdoor for Business
13. Alignable
14. Yellow Pages
15. Foursquare and Manta

Done when: every profile shows the same name, phone, and `https://www.deadrivermanagement.com`, and GBP service area lists the El Paso suburbs plus Las Cruces.

## Tier 2: client and partner links (weeks 2 to 6)

These are the easiest earned links we will ever get.

- Ask each case-study client to link their site to their `/work/` page. Offer a short "As featured" badge or one line of copy they can paste. Start with Gonzalez & Sons Roofing, The Pipe Whisperers, Total Auto Repair, Wicked Logistics, Parcel Management Group, and Only Fish.
- Ask every active client to add Dead River to a "partners" or "built by" footer line, linked to the matching service page.
- Suppliers and vendors we pay (CRM, call tracking, hosting, print): most run a partner or agency directory. Submit to each.
- Local business groups Brandon already belongs to: ask for a member spotlight that links to a guide.

Done when: at least six client or partner domains link to us.

## Tier 3: content outreach (weeks 3 to 12, ongoing)

One ask per week. Each ask offers something, never just "please link to us."

- **Trade associations and supplier blogs** in roofing, plumbing, HVAC, electrical, and auto repair. Pitch the matching guide (for example, the plumber Facebook Ads guide to a plumbing supply newsletter) or offer a new 600-word piece written for them that links back once.
- **Local press and podcasts.** El Paso Inc., KTSM, KFOX, El Paso Matters business desk, and El Paso business podcasts. Pitch the Gonzalez & Sons result (two roofs a month to eight) as a local small-business story, and offer Brandon as a guest on home-service marketing.
- **Calculator roundups.** Search "free lead response calculator", "ad budget calculator for contractors", "best free marketing calculators small business". Email every page that lists tools and ask them to add ours. Our tools are free and have no email gate, which most listed ones do not.
- **Helping journalists.** Sign up for Qwoted, Featured.com, and Help a B2B Writer. Answer two requests a week on local marketing, Google Ads for contractors, and AI search. Each accepted quote links to `/company`.
- **Guest posts.** Target two a month on sites that already rank for our keywords but do not compete (software blogs, coaching sites, contractor forums). Topics come from the keyword refresh in `seo-team/outputs/deadrivermanagement-com/runs/2026-10/01-keyword-refresh.md`. Link once to a guide, never to a service page from a guest post.
- **Broken link replacement.** Run competitor backlinks through Ahrefs or Semrush once the DataForSEO credentials work. Where a competitor's linked page is dead, pitch the matching guide as the replacement.

## AI citation layer

Links that AI assistants read are the ones that move the needle for AEO.

- Keep `/llms.txt` and the FAQ schema on every guide current. Already live.
- Get Dead River named on Clutch, GoodFirms, and UpCity "top agencies in El Paso" lists. These are the pages ChatGPT and Perplexity cite today for our queries.
- Publish one Reddit answer a week in r/smallbusiness, r/Plumbing, r/Roofing, r/HVAC, r/Entrepreneur that solves the question and links the guide only when it directly helps. Reddit is a top citation source for AI answers.
- Add a "Mentioned by" or "Press" block to `/company` once we have three mentions. It gives AI models an entity record to confirm.

## Rules

- Never buy links. Never trade links. Never use a private blog network.
- Anchor text should be the brand name or the article title, not an exact-match keyword.
- Every link points to the canonical `https://www.deadrivermanagement.com/...` URL, no `http`, no trailing slash, no UTM for SEO links.
- Log every placement in `seo-team/outputs/deadrivermanagement-com/11-rank-tracker.md` with date, domain, target URL, and anchor.

## Monthly scoreboard

| Metric | Source | Target by day 90 |
| --- | --- | --- |
| Referring domains | Search Console "Links" report, Ahrefs or Semrush | 25 to 40 |
| Clean citations (NAP exact match) | Manual check of Tier 1 list | 15 of 15 |
| Client and partner links | Tier 2 list | 6 or more |
| Press or podcast mentions | Manual log | 3 |
| Ranked organic keywords | DataForSEO Labs | 50 or more |
| AI citations for brand or core queries | DataForSEO `ai_opt_llm_ment_search` | 3 or more |
