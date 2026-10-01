# Website attribution and confirmed inquiries

The existing Astro layouts collect campaign attribution on ordinary navigation. The visible forms, calendar and page design are unchanged. The DemandFlow submit handler sends structured attribution with the inquiry to `/api/growth-lead`.

## Stored data

`src/lib/attribution.js` retains first and latest campaign touches for 90 days in `drm_attribution_v1`. Each touch can contain Google `gclid`, `gbraid`, `wbraid`; Meta `fbclid`, `_fbc`/`_fbp` values; five UTM parameters; landing path, referrer path and original timestamp. Google and Meta clicks also have separate retained snapshots, so a later campaign does not erase the other platform's click identifier.

Only allowlisted campaign values enter this storage. URL query values such as email, phone and form answers are excluded. Direct navigation does not replace a useful campaign touch with empty values. A new campaign becomes a complete latest touch so click IDs from two different campaigns are not combined.

The existing Accept notice remains informational. It is not treated as explicit permission for advertising user data. Explicit Google consent denials and Global Privacy Control suppress attribution storage and browser conversion dispatch. An existing CRM consent denial is retained when a returning browser provides no new explicit consent decision.

## GHL fields and intake order

`ATTRIBUTION_FIELDS` in `src/lib/crm-attribution.js` defines the 45 contact fields. The verified IDs live in `src/data/ghl-attribution-fields.json` and apply only to the Dead River Management location `dzfd13SYs0Jg3qbvmugD`. The API uses the documented `customFields: [{id, fieldValue}]` contact update schema. `GHL_ATTRIBUTION_FIELD_IDS` can supply an explicit JSON mapping of logical keys to field IDs. An incomplete map or an unconfigured different location fails closed before modern form intake writes anything.

The endpoint performs these steps:

1. Match normalized email, then phone if needed. A phone associated with a different email is treated as a conflict rather than silently merging people.
2. Update the matching contact, or use GHL upsert when no match exists. Existing source, tags and DND are preserved.
3. Confirm the intended campaign tag through the additive tags API.
4. Save structured attribution and read the contact back to verify every changed field.
5. Write and verify `DRM Last inquiry event ID` and `DRM Last inquiry time` as the final inquiry receipt.
6. Add a readable, escaped note. Return success and the same event ID to the browser.

The browser creates one random inquiry UUID and retains it for retries of that form attempt. The event ID is `drm_inquiry_<UUID>`. `drm_lead_submitted` includes it as both `event_id` and `transaction_id`. The Meta browser tag must map `event_id` to its event ID, and the server version of the same Lead must use that same ID. A Google Ads conversion tag must map `transaction_id` to Transaction ID; a corresponding offline upload must use the matching order ID for the same conversion action. These fields do not activate a conversion tag or prove cross-action deduplication. The receipt field, not contact creation or the campaign tag, is the appropriate trigger for the confirmed inquiry workflow.

The last inquiry ID prevents duplicate notes on a sequential retry. It is not a global atomic event ledger. Webhook delivery and conversion processing must use the integration's durable event records and advertising platform event-ID deduplication to cover concurrent retries and delayed repeated events.

## Calendar and page behavior

The browser opens the existing `/demandflow/book` path after a confirmed inquiry save. The existing GHL calendar remains `rfaj3m31onqPQEFYhwyE`. Visiting the booking page or `/demandflow/watch` does not emit a Lead or Schedule event. Appointment conversions must come from the confirmed GHL appointment status.

Preview deployments validate the form and its handoff without writing contacts, tags or advertising conversions. Neither imported prospects nor email sends use this inquiry endpoint.

## Verification

`tests/attribution.test.mjs` covers navigation, direct returns, mixed channels, braid IDs, cookie timing, expiry, corrupt storage, consent and CRM denials, source/tag/DND preservation, real-field mapping validation, field readback failure, shared-phone conflicts, stable retry IDs and receipt ordering. The existing DemandFlow harness verifies that failed forms never dispatch conversions or redirect, and that the success event carries the returned ID.

These automated checks use synthetic API responses. Live acceptance additionally requires a clearly marked test contact, its saved structured fields, the corresponding native workflows, platform test-event receipts and the published GTM tag's event-ID mapping to be verified.

### Latest verification record

On September 25, 2026 at approximately 13:12 UTC, the current working tree passed **267 tests, 0 failures** with `npm test`. `npm run build` completed **90 pages** successfully; that build log contained no warning/error matches. This includes 22 Meta dispatcher tests and 12 standard-webhook/inquiry/Meta-wiring tests, after those changes settled. The earlier pre-wiring snapshot passed 255 tests. These commands validate repository behavior and the Astro build, not live advertising delivery.

The [Vercel preview](https://deadrivermanagement-site-git-codex-outreach-at-4b87fc-deadriver.vercel.app/demandflow) for [commit 0c649848](https://github.com/DeadRiverManagement/deadrivermanagement-site/commit/0c649848ebedc34e3a9385feaa640028a5f8191b) was verified Ready. In that preview, a clearly identified synthetic form submission reached `/demandflow/book`; the booking page displayed its warning that the calendar is live and a test booking must not be completed. No appointment was made. This verifies the observed preview form/handoff interface; network-event inspection and production contact delivery were not established by that browser check.

All 45 real contact-field mappings were provisioned and verified. A separate direct GHL field test read back 38 populated fields on [DND test contact BRCffKXQb0xiL9Sry0l2](https://app.gohighlevel.com/v2/location/dzfd13SYs0Jg3qbvmugD/contacts/detail/BRCffKXQb0xiL9Sry0l2), preserving source, original campaign, direct-return attribution, DND and tags, and matching the same contact on duplicate lookup. That test deliberately omitted the DemandFlow tag and inquiry receipt, and did not create messages, appointments, opportunities or revenue. It is field/API evidence, not an end-to-end production form conversion test.

### Safe production smoke procedure

A normal valid production submission writes/updates a contact and adds the DemandFlow tag before verifying attribution and saving the final receipt. Existing GHL contact/tag workflows can run from those changes. A fake email address or DND alone does not prove every workflow is suppressed, so do not use a normal production inquiry as a no-side-effect smoke test.

Use direct HTTP requests to `https://www.deadrivermanagement.com/api/growth-lead` for the following checks. No browser advertising tags run from a direct HTTP request. If an `Origin` header is supplied, use the same production origin; it must match the request host.

| Request | Expected response | What it proves |
| --- | --- | --- |
| `GET` | HTTP 405, `Allow: POST`, `{"error":"Use POST."}` | Deployed handler and static JSON field-map import load. |
| `POST` with `Content-Type: text/plain` | HTTP 415, `{"error":"Use application/json."}` | Content-type validation precedes delivery. |
| `POST` with JSON content type and malformed JSON | HTTP 400, `{"error":"Invalid request."}` | Invalid JSON never reaches CRM delivery. |
| `POST` with the synthetic body below, changing email to `invalid` and fax to an empty string | HTTP 400, `{"error":"Enter a valid email address."}` | Form validation rejects an invalid request before delivery. |
| `POST` with the exact synthetic body below and JSON content type | HTTP 200, `{"ok":true,"preview":true,"route":"validation-only"}` | The production honeypot path terminates before all CRM/webhook writes. |

```json
{
  "kind": "demandflow",
  "source": "/demandflow",
  "industry": "home-services",
  "name": "DRM Runtime Smoke",
  "company": "SYNTHETIC VALIDATION ONLY",
  "email": "drm-smoke@example.invalid",
  "phone": "+15555550101",
  "consent": true,
  "inquiryId": "7dd4ed8e-9207-4381-a0de-624a898f7033",
  "fax": "DRM_SMOKE_VALIDATION_ONLY"
}
```

Keep the nonempty `fax` value for the HTTP 200 smoke request. It is the existing honeypot stop condition, not a hidden live test override. The expected validation-only response contains no `event_id`; the DemandFlow browser handler also rejects that route for booking handoff. Do not replace it with an ordinary valid production inquiry.

All five requests were executed against the real handler **offline in production mode**, with CRM and webhook configuration present but `fetch` replaced by a failing test stub: all expected responses passed, with **zero outbound calls** and no conversion event ID. A deployment owner must still run the corresponding HTTP checks against the newly published commit and record the observed responses. These smoke paths intentionally do not prove successful live CRM delivery, browser/server advertising deduplication or advertising-platform receipt.

### Remaining integration checks

Native advertising workflows must trigger from the final inquiry receipt, not contact creation or the DemandFlow tag. A later attribution/save failure can leave an already-created contact or tag; those partial changes must not count as a confirmed inquiry conversion. Published GTM tags must use the returned event/transaction IDs, with actual Google and Meta receipt verified separately. The authenticated [lifecycle receiver](ghl-lifecycle-webhook.md) can now invoke the [Meta dispatcher](meta-capi-dispatcher.md) after verifying and durably recording the inquiry, but only with its explicit token, mapping and enablement gates satisfied. This code change does not itself configure a live workflow or prove a platform event was received. Instantly reverse synchronization remains separately gated by `ENABLE_INSTANTLY_GHL_SYNC` and can stay disabled.

The website's last-inquiry receipt handles sequential retries but is not a global atomic inquiry ledger. The conversion receiver must retain durable event history and consistent platform IDs for concurrent or delayed repeat delivery. No full successful production form submission or production advertising event is claimed by this verification record.
