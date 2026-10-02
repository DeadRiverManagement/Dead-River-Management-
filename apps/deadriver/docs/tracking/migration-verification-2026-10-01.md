# Tracking verification after repository migration

Verified October 1, 2026. Website: www.deadrivermanagement.com.

## Deployment and destinations

Vercel's existing `deadrivermanagement-site` project now uses
`DeadRiverManagement/Dead-River-Management-`, root `apps/deadriver`, production
branch `claude/magical-goldberg-ijl1j4`. Production deployment
`SBSWKDRuUdaYhPzvcfka3RSiqdzp` was Ready at commit
`72893d9e0bee3f32ec83ec0909a79bf055c11a15` before these repairs.
The existing project and production secret names remain in place.

Google's public combined tag still connects Ads `AW-18438589761` and GA4
`G-5MC19Z3162`. GTM is `GTM-TPRWMXP9`; Meta pixel is `4422109568077296`.
The calendar remains `rfaj3m31onqPQEFYhwyE`.

## Repairs

- General `/book` applications use `other` instead of falsely assigning every
  business to home services. Explicit allowlisted industry parameters still
  select the appropriate industry, CRM route, and conversion classification.
- Published GTM version 7 updates the one existing saved-inquiry Meta tag and
  its trigger to cover `/demand-intelligence`, `/demo`, and `/growth-plan` as
  well as `/book` and `/demandflow`. `other` is General Business, not a specific
  industry custom conversion. All require a valid saved-inquiry receipt.
- The Meta tag suppresses repeated receipt IDs and explicit advertising
  consent denials/GPC. Calendar, thank-you, watch and homepage visits remain
  excluded from this Lead trigger.
- Both website layouts check GPC and existing explicit consent denials before
  loading marketing vendors and the visitor-identification script. This does
  not treat a contact-permission checkbox as advertising permission or change
  the site's existing consent notice.

## Evidence and limitations

- Baseline: 351 tests, 349 passed. Existing failures: client logo byte fingerprint
  and the expected destination of a retired local-SEO route. Neither is changed
  by this tracking work.
- Updated suite: 356 tests, 354 passed; the same two baseline failures remain.
  Tracking, attribution, CRM mappings, failed submission, privacy, deduplication,
  and booking handoff tests pass. Production build: 88 pages, successful.
- Downloaded published GTM version 7 and executed its compiled tag in an
  isolated VM: 63 industry/route cases passed, one Meta tag, no actual Meta
  events sent. Saved IDs are preserved; duplicate invocations fire once.
- Live empty form POST returns 400 without a success receipt; no contact created.
- Protected Google payment validation returns 200, authenticated=true,
  providerStatus=200, warningCount=0, mutations=0, conversions=0 after migration.
- Google Ads still shows all five CRM actions Primary / Every / Inactive, zero
  conversions for September 24–30. Goal groups still show misconfiguration
  diagnostics. Authentication success is not processed conversion evidence.
- Vercel retains Meta token and test settings, but no live ENABLE_META_CAPI or
  mapping/deduplication verification flags. Live CRM-to-Meta remains disabled
  pending platform-side verification. This repair does not claim otherwise.
- No real prospect contacted, real appointment created, revenue fabricated,
  ads enabled, or budgets/targeting changed.

Keep future website edits under `apps/deadriver`. Do not point this project's
root at `apps/pmg`, copy secret values into Git, or add another browser Lead tag.
Use GHL execution receipts and platform processing diagnostics to verify the
first genuine eligible inquiry, appointment, customer, and actual payment.
