# Google CRM conversion configuration

Verified in Google Ads account **571-783-6174**, September 25, 2026. The user explicitly confirmed Google's customer-data declaration and approved Every counting for the four CRM milestone actions to support GCLID, GBRAID and WBRAID.

| Conversion action | Conversion type ID | Category | Optimization | Count | Value |
| --- | --- | --- | --- | --- | --- |
| DRM - CRM Inquiry Saved | 7795065545 | Submit lead form | Primary | Every | No value |
| DRM - CRM Appointment Confirmed | 7795065548 | Book appointment | Primary | Every | No value |
| DRM - CRM Qualified Opportunity | 7795065551 | Qualified lead | Primary | Every | No value |
| DRM - CRM Customer Closed | 7795065554 | Converted lead | Primary | Every | No value |
| DRM - CRM Actual Revenue | 7795206688 | Purchase | Primary | Every | Transaction-specific; fallback zero |

All five are **Import from clicks**, with a 90-day click-through window. All five were read back as Primary / Every in the conversion-action table. Their current tracking status is **Inactive** until a connected CRM action delivers a valid conversion. Creation and configuration do not prove receipt of an event.

GHL's [Add to Google Ads documentation](https://help.gohighlevel.com/support/solutions/articles/155000003368) requires Many/Every counting for GBRAID and WBRAID. It supports custom click-ID mapping and dynamic conversion values. Its documented UI does not establish an explicit order-ID, original event-time or retry-identity mapping; those details and duplicate-delivery protection must be verified before activating the CRM workflow. Never use an estimated opportunity value as actual received revenue.

The new paused campaign **24293058610**, DRM - DemandFlow - Search - Home Services, has its responsive search ad saved with the DemandFlow URL, campaign UTM suffix and the 30-leads-in-60-days guarantee pinned in description position 1. The campaign remains paused. AI Max, text customization and final URL expansion were read back as off.

The custom goal **DRM - DemandFlow CRM Milestones** contains exactly the five Import from clicks actions above. It was saved and applied to this campaign; the saved settings read back **Campaign-specific: DRM - DemandFlow CRM Milestones**. The existing website and Google-hosted actions are not members of that custom goal. No budget, targeting, or campaign status was changed while configuring it.

The existing GHL–Stripe integration was inspected: Stripe is the default connected payment provider and successful payment transactions are visible in GHL. No payment was created or changed during this inspection.

## Published non-revenue workflows

All four workflows below are published with actual field-picker mappings `contact.drm_google_gclid`, `contact.drm_google_gbraid`, and `contact.drm_google_wbraid`. Advertising conditions exclude explicitly denied ad-storage/user-data consent and reserved `.invalid` test contacts. Re-entry and multiple-opportunity enrollment are off.

| Workflow | ID | Real trigger |
| --- | --- | --- |
| DRM — CRM Inquiry Saved Conversions | be2a3657-50cc-430e-abce-e4a5382c685a | Saved inquiry receipt changes; condition also requires receipt prefix and DemandFlow tag |
| DRM — Google Appointment Confirmed | a753ea33-5639-4d97-8bdf-ba7362c663fd | Dedicated `drm-demandflow-appointment-confirmed` tag added by confirmed DemandFlow calendar workflow |
| DRM — Google Qualified Opportunity | 10387bf0-0b2f-4eb5-b78a-d737ef30f1ef | Qualified Opportunity stage in each of the four real channel pipelines |
| DRM — Google Customer Closed | f17a39c7-de19-45cf-a9c6-882e14d3eda3 | Opportunity status changes to Won in each of the four real channel pipelines |

The appointment workflow uses a dedicated tag trigger because GHL appointment triggers can re-enter despite the re-entry setting. Its parent, **DRM — Confirmed Booking Stop Cold SMS**, only triggers on a confirmed normal DemandFlow calendar appointment; it sets the cold-SMS exclusion field, removes the Cold SMS workflow, and adds the dedicated tag. Page views never add this tag. The customer workflow sets the same exclusion field before evaluating advertising eligibility.

Native GHL Google actions restore their conversion-value input to **1** after saving an empty input and reject literal zero. The four non-revenue Google actions are configured **Don't use a value**. Actual live value handling remains unverified; do not represent the GHL input as empty. Actual revenue must use a verified successful payment amount, not estimated opportunity value.

Actual execution logs for all four workflows show reserved DND QA contacts took the None/exclusion branch and finished without executing Google conversion actions. Repeat enrollments were skipped. The appointment child also entered automatically through its dedicated tag trigger; the updated booking/customer actions preserved QA source and set SMS exclusion. No genuine calendar appointment, sale, payment or Google conversion was fabricated.

This is a once-per-contact workflow enrollment guard, not a per-event provider idempotency guarantee. An initial enrollment that fails an advertising condition still consumes the enrollment. Future bookings/deals for the same contact are not independently counted by these workflows. Do not bulk-enroll historical contacts or manually retry a Google action after an uncertain provider response. Provider receipt, native action retry behavior and interruption of an active sender remain unverified.

Google shows the import actions inactive and no associated Data Manager connections. The existing GHL action uses the Google Ads API integration; no additional Data Manager connector was created. A legitimate click-associated CRM event is still required to verify receipt. The revenue workflow remains validation-only pending an actual Payment Received payload.

The user explicitly approved `payments/transactions.readonly`; it was added to **DRM Outreach Tracking**, preserving its 17 existing scopes and token. Read-only API verification returned HTTP 200, 13 transactions, and three sampled live/succeeded Stripe payments linked to contacts. Each sampled GHL USD amount matched Stripe's amount received divided by 100, verifying **major currency units** for these USD records.

The real v3 transaction-by-ID response was a single-element array with lowercase `usd`, `liveMode: true`, and `markAsTest: false`. The reader now handles that shape, rejects empty/multiple results, and normalizes currency case. A read-only verification against the actual associated contact passed; no CRM history, payment, or advertising conversion was created. All 268 automated tests passed, including the new array/currency regression and ambiguous/mismatched transaction rejection checks. Workflow delivery and production revenue activation remain separate unfinished steps.
# Payment delivery through Data Manager API

The separate server sender in `api/_lib/google-payment-conversions.js` owns only **DRM - CRM Actual Revenue**, action `7795206688`, Google Ads account `5717836174`. The four native GHL non-revenue actions retain their existing ownership. No second uploader is added for those milestones.

The sender remains disabled until `ENABLE_GOOGLE_PAYMENT_CONVERSIONS=true` and `GOOGLE_PAYMENT_DESTINATION_VERIFIED=true` are deliberately configured after API access and validation. It also requires the existing production payment and unique-ledger verification gates. A deployment alone does not enable it.

It reads the real successful GHL payment, compares its original timestamp, amount and currency to the immutable activity, uses retained GCLID/GBRAID/WBRAID, respects stored consent denial, and sends no contact PII. Historical imports, reserved test records, failed/refunded payments and contacts without Google click identifiers do not upload. The transaction ID combines the location and real payment ID, so uncertain retries retain the same Google identity. Durable submission receipts suppress sequential duplicates. An ingestion `requestId` means submitted for asynchronous processing, not attributed; check Google's request-status diagnostics and Ads reporting before claiming receipt/attribution.

Google Cloud project **Dead River OS** (`dead-river-os`, number `387905439802`) now has:

- Service account **DRM CRM Payment Conversions**, `drm-crm-payment-conversions@dead-river-os.iam.gserviceaccount.com`, Service Usage Consumer project role and Standard access only to Ads account `5717836174`.
- Workload pool `drm-vercel-production`, provider `drm-vercel`, issuer `https://oidc.vercel.com/deadriver`, audience `https://vercel.com/deadriver`.
- Both the provider condition and service-account impersonation grant restrict the subject to `owner:deadriver:project:deadrivermanagement-site:environment:production`. Preview deployments and other projects are excluded.

The organization blocks downloadable service-account keys. This protection was retained. Vercel OIDC uses short-lived credentials instead; no private key was created or stored. Data Manager API enablement is pending the user's required Google API terms acceptance. Live authentication, API validation and provider receipt remain unverified. Do not set either sender enablement gate based only on passing unit tests.

References: [Google Data Manager setup](https://developers.google.com/data-manager/api/devguides/quickstart/set-up-access), [offline event requirements](https://developers.google.com/data-manager/api/devguides/events/google-ads/offline/send-events), [ingestion API](https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest), [Vercel keyless GCP connection](https://vercel.com/docs/oidc/gcp).
