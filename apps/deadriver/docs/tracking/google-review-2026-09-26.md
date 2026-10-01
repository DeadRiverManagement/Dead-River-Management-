# Google Ads tracking review — September 26, 2026

Account: 571-783-6174. All ads remained paused; budgets, targeting, bidding,
keywords and creatives were not changed.

## Live changes

- Published GHL workflow **DRM — CRM Inquiry Saved Conversions**
  (`be2a3657-50cc-430e-abce-e4a5382c685a`) no longer requires the obsolete
  `demandflow-home-services` tag. That condition excluded the newer dental,
  real-estate, ecommerce and med-spas saved inquiries. The saved receipt,
  advertising storage/user-data consent and reserved test-email guards remain.
  Reloaded the workflow and verified the change persisted.
- Google action **Whole River Lead Submitted** (`7754294113`) changed from
  Primary to Secondary, preserving its history while keeping the legacy browser
  signal out of default bidding. The five CRM actions remain Primary/Every.
- Production Google/Meta/GTM and branded visitor script loading is now restricted
  to deadrivermanagement.com and www.deadrivermanagement.com. Preview/local hosts
  cannot send production tag traffic. Existing production loaders are preserved.

## Verified settings

The paused Search campaign `24293058610` uses custom goal **DRM - DemandFlow CRM
Milestones**, containing exactly Inquiry Saved, Appointment Confirmed, Qualified
Opportunity, Customer Closed and Actual Revenue. AI Max, text customization and
final URL expansion remain off. Budget remains $20/day.

The confirmed-booking SMS exclusion workflow triggers only on confirmed status
in the existing Demand Flow calendar and adds `drm-demandflow-appointment-confirmed`.
That exact tag triggers the Google appointment workflow. Qualification triggers
match the actual qualified stage IDs in all four channel pipelines; customer
triggers require Won status. Custom GCLID, GBRAID and WBRAID mappings were inspected.

Google Data Manager reports that the Google tag IS sending data. Its two warnings
are suggested preview-domain configuration and adding another administrator.
The suggested domains were five Vercel preview/deployment hosts. They were not
added as cross-domain destinations; no administrator permissions were changed.
GA4 is already linked (one account link).

Production payment validation re-run returned HTTP 200, authenticated true,
providerStatus 200, warningCount 0, mutations 0, conversions 0.
Evidence: ignored local google-payment-recheck-20260926.json.

## Remaining evidence and launch work

Google's main conversions table still lists all five CRM import actions as Inactive.
The connection banner is not by itself proof of a broken native API sender:
HighLevel's documented setup explicitly allows skipping the data-source connection.
The production inquiry workflow history contains only the reserved test contact,
with no genuine executed Google conversion. The earlier isolated synthetic upload
was rejected because its GCLID was not a real Google click identifier.

No accepted/attributed CRM milestone or actual revenue conversion is claimed.
A genuine Google-attributed inquiry and subsequent real milestone are still needed
to verify the native sender and Google processing. No synthetic conversion, sale,
prospect message or payment was created during this review.

The paused Search ad still advertises the OLD 30 leads/60 days offer and currently
targets the United States. It must be reviewed against the new offer and intended
market before any future launch. This tracking update does not authorize activation.

339 automated tests and the 103-page production build passed, including runtime
tests that production hosts load each tag once and preview/local/lookalike hosts
load none. These tests do not establish Google's receipt of a CRM conversion.

References:
- https://help.gohighlevel.com/support/solutions/articles/48001220947-how-to-set-up-google-ad-conversion-actions
- https://help.gohighlevel.com/support/solutions/articles/155000003368
