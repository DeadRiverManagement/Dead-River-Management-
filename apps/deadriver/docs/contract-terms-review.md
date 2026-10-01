# Confirmed contract terms — publication record

Status: OWNER AUTHORIZED WEBSITE PUBLICATION on September 10, 2026. The owner explicitly requested that the prepared changes go live. This authorization is not evidence of legal review, and no claims of enforceability are made. Publishing website copy does not establish amendment or acceptance of existing signed customer agreements.

Baseline: main at 50cb8756593c77b7cc9768d91f2927b61dd95c21.

## Owner-confirmed rules used in this draft

| Subject | Rule |
| --- | --- |
| Flagship | The Whole River. No public dollar price. |
| 12-month plans | Website Rescue and The Whole River only. Other plans remain month to month. |
| Whole River signing payment | One-time setup fee equal to agreed monthly management fee, plus first monthly payment. |
| Setup refund | Setup fee is nonrefundable, including an eligible guarantee claim. |
| Ordinary Whole River early cancellation | Remaining contract balance owed. Collection timing is not invented. |
| Guarantee remedy | If eligible and fewer than 30 leads in the first 60 days, refund management fees for that period and permit cancellation without the remaining contract balance. |
| Guarantee window | Fixed first 60 days; no pause or extension. |
| Advertising condition | Maintain budget agreed before launch. Cutting/stopping it in the window forfeits both guarantee remedies. |
| Advertising spend | Separate and nonrefundable. |
| Lead channels | Incoming call, text, or completed lead form from a real person through the system. |

The existing claim sheet v2 records spam, vendors/sales pitches, job applicants and duplicate contacts as exclusions. This draft carries those exclusions forward; they are not new confirmations from the latest yes/no exchange.

## Open legal and operational follow-ups — do not infer these answers

- Confirm the exact clock-start event and how the date is recorded. This draft retains the existing whole-system-go-live trigger; the latest confirmation established first 60 days, not a new trigger.
- Define cancellation notice, method, and the timing of collecting the remaining Whole River balance.
- Define Website Rescue's early-cancellation/payment mechanics separately. The owner confirmed its 12-month term, not identical cancellation charges or a setup fee.
- Confirm Website Rescue's existing public $0-build/$97-month pricing and billing timing against its checkout/agreement. This draft preserves that price; it does not invent a new upfront fee.
- Confirm the guarantee request/refund process and whether response-time conditions apply. The former undefined timely-response condition is not presented as an additional guarantee disqualifier in this draft. Client follow-up responsibilities remain.
- Confirm treatment of platform outages, agency-caused campaign stoppages, and budget measurement before finalizing the agreed-budget clause.
- Confirm website ownership, transfer scope, third-party subscriptions, and unpaid-balance handling before rewriting ownership clauses.
- The website now says Last updated: September 10, 2026, the publication-authorization date. Existing-customer transition and effective dates in signed agreements still require owner/legal attention. Nothing is backdated to June 28.
- Legal review has not been confirmed. Obtain review of the remaining-balance obligation, setup-fee treatment, refund process and complete Terms of Service; the owner requested website publication with this outstanding.
- Check payment links, signed agreements, walkthrough audio/on-screen text and follow-up messages for consistency. None was changed or submitted to in this pass.

## Implementation boundaries

Copy and matching FAQ/Offer descriptions change together in the raw HTML/Astro split. Homepage, plans, Website Rescue, web design, The Whole River, shared FAQs, industry-template contract FAQ, metadata and llms.txt are included. The queued website-cost blog gets the term disclosure without changing its draft flag or release date.

No prices, other plan terms, credentials, testimonials, client results, design assets, APIs, form behavior, payment links, tracking, cookie gates, redirects or deployment configuration are changed.

The /terms draft label was removed after the owner explicitly requested publication. No commercial term was changed as part of that release-label cleanup.

## Validation

Vercel reported a successful build for the initial draft commit dfc653c4aa784d0df6b84365f482a0456dc0552d. This does not establish regression execution, legal approval or production availability. The final release must also pass Vercel after the publication-label cleanup.

Run the existing Astro build, then `node scripts/check-contract-terms.mjs`. The regression check covers all built JSON-LD and the amended FAQs, keeps Whole River unpriced in public schema, checks the fixed window and setup disclosure, and verifies Website Rescue no longer promises cancel-at-will.

The source mirror used for local validation omitted binary public assets. Local Astro compilation can validate markup and routes but does not establish media playback, visual QA, a successful Vercel prebuild, live tracking or an end-to-end form submission.

Disclosure rationale: material guarantee limitations belong near the guarantee, not only in a separate legal page. Reference: [FTC Advertising FAQs for Small Business](https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business). This is an implementation principle, not a legal opinion.
