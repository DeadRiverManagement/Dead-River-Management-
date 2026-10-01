# GHL lifecycle receiver

`POST /api/ghl-lifecycle-webhook` records verified CRM milestones in the Outreach Activity object. It can dispatch the corresponding Meta event after durable storage when the explicit Meta token/mapping/enablement gates are satisfied. It can synchronize matching Instantly contacts only while `ENABLE_INSTANTLY_GHL_SYNC=true`; leave that flag disabled while Instantly activation is on hold. It never sends prospect messages, creates contacts/appointments, or turns an estimated sale value into revenue. No Google Ads delivery is implemented by this route.

## Workflow contract

### Native CRM milestone adapter

`POST /api/ghl-crm-milestone` accepts the same authenticated standard Webhook action, with `drm_schema_version=2`, `drm_mode=live` (or read-only `verify`), `drm_origin=ghl`, `drm_location_id`, `drm_contact_id`, `drm_event_type`, and the relevant object ID below. It reads dates and related IDs from the authoritative CRM object, avoiding localized workflow display dates. Do not send `drm_event_id` or `drm_occurred_at` to this adapter.

| Event | Object field | CRM timestamp |
| --- | --- | --- |
| appointment_confirmed / appointment_attended | drm_appointment_id | Appointment dateUpdated (record update time, not scheduled start time) |
| qualified_opportunity | drm_opportunity_id | Opportunity lastStageChangeAt |
| customer_closed | drm_opportunity_id | Opportunity lastStatusChangeAt |
| revenue_received | drm_transaction_id | Transaction createdAt |

The adapter verifies the contact, calendar/stage/status or successful live payment through the existing lifecycle verifier. The deterministic event ID is `ghl_<event_type>_<object_id>`; retries reuse an existing ledger timestamp. Later edits cannot rewrite an already recorded milestone. Appointment update time is the available CRM record timestamp, not a separate status-transition audit timestamp; delayed events that no longer match the required current state fail for reconciliation.

`verify` performs authenticated CRM reads and returns a value-free verification result, with zero mutations or advertising calls. Reserved `.invalid` QA contacts in `live` mode are excluded after identity/status verification. Other live events pass through the existing protected lifecycle processor, retaining separate Meta/Instantly activation controls. No payment can be fabricated from supplied amounts or an opportunity's estimated value.

September 25 read-only verification passed against a genuine existing GHL/Stripe transaction and a clearly labeled zero-value QA opportunity. All 283 automated tests and the 90-page production build passed. Actual native payment-trigger delivery remains a separate first-real-payment check.

The receiver accepts either the normalized envelope below or explicit flat `drm_*` custom-data fields from GHL's standard **Webhook** action. The observed standard action supports headers and custom data; the paid Custom Webhook action is not required. Unmapped native contact fields are ignored. Capture and verify each actual workflow payload before setting the payload-mapping verification gate.

Send the dedicated secret in the `Authorization: Bearer …` header. Keep the secret in the GHL action and Vercel environment, never in a URL, repository, contact field or note.

The JSON envelope has `schemaVersion: 1`, `mode` (`live`, `historical`, `validate`, or `test`), and `payload`. Both validation and test mode require `test: true`. Validation performs no network calls or writes. Test mode rereads an existing `.invalid`-domain contact with DND enabled, archives verified facts without contact projections or Instantly writes, and sends only through the explicitly enabled Meta test-code path.

### Standard GHL Webhook action

Set method **POST**, URL `https://www.deadrivermanagement.com/api/ghl-lifecycle-webhook`, and header **Authorization** with value **Bearer** followed by the dedicated `DRM_GHL_LIFECYCLE_WEBHOOK_SECRET`. Send JSON (`Content-Type: application/json` if the action exposes it). Never put credentials into the URL or Custom Data.

Add these Custom Data fields for the saved-inquiry workflow:

| Custom Data key | Value or actual GHL field picker selection |
| --- | --- |
| `drm_schema_version` | Literal `1` |
| `drm_mode` | Literal `live`; use `validate` for schema-only check or `test` for Meta Test Events |
| `drm_origin` | Literal `ghl` |
| `drm_event_type` | Literal `inquiry_saved` |
| `drm_location_id` | Literal `dzfd13SYs0Jg3qbvmugD` |
| `drm_contact_id` | Existing Contact ID |
| `drm_event_id` | **DRM Last inquiry event ID**, ID `po7EhiqTjzOhPQmlLLTS`, key `contact.drm_last_inquiry_event_id` |
| `drm_occurred_at` | **DRM Last inquiry time**, ID `Uy14EjoQczxZr1xwoxYf`, key `contact.drm_last_inquiry_time` |
| `drm_test` | Literal `true` only for `validate` or `test` mode |

Use the UI field picker rather than typing an unverified merge expression. The native standard action was verified on September 25, 2026 to deliver these fields inside a `customData` object. The handler accepts that observed wrapper as well as explicit flat keys, rejects conflicting root/nested mappings, and rejects unresolved merge values. The first actual inquiry delivery established this shape through authenticated schema-only diagnostics.

Trigger this workflow when **DRM Last inquiry event ID** changes to a nonempty `drm_inquiry_…` receipt, with tag **demandflow-home-services**. The website writes that receipt only after contact attribution and tags were confirmed. Do not trigger the inquiry workflow from contact creation, contact import, email activity, or the tag alone. The receiver rereads and verifies the exact receipt ID/time and tag before appending a durable `inquiry_saved` activity. The same `drm_inquiry_<UUID>` is used for Meta Lead and the browser event.

Other milestone workflows use the same common Custom Data keys, changing `drm_event_type` and mapping the original transition's stable ID/time. Add `drm_appointment_id` and `drm_calendar_id` for appointments; `drm_opportunity_id`, `drm_pipeline_id`, and `drm_pipeline_stage_id` for qualification/customer changes; or `drm_transaction_id` for paid revenue. Their IDs must come from the actual triggering GHL object, not a display label. A retry must preserve its original ID/time. The authoritative CRM reads below still apply.

Every payload requires:

| Property | Meaning |
| --- | --- |
| `eventId` | Stable identity of the original CRM transition; retain it across retries |
| `eventType` | One of the supported types below |
| `origin` | `ghl` for a genuine CRM milestone; `instantly` only for a synchronization echo |
| `locationId` | Real GHL sub-account ID |
| `contactId` | Existing GHL contact ID |
| `occurredAt` | Original transition time in ISO 8601 with timezone; not delivery time |

Additional fields and verification:

| Event type | Additional IDs | Required server evidence |
| --- | --- | --- |
| `inquiry_saved` | Saved `drm_inquiry_<UUID>` receipt ID/time | Contact has the exact structured inquiry receipt and DemandFlow tag; a durable activity is created before any Meta call |
| `appointment_confirmed` | `appointmentId`, `calendarId` | Appointment belongs to this contact and an allowlisted calendar; status `confirmed` or `showed` |
| `appointment_attended` | `appointmentId`, `calendarId` | Same identity checks; status `showed` |
| `qualified_opportunity` | `opportunityId`, `pipelineId`, `pipelineStageId` | Existing opportunity belongs to the contact and is in a configured qualification stage |
| `customer_closed` | `opportunityId`, `pipelineId`, `pipelineStageId` | Existing opportunity is in a configured won stage with status `won` |
| `revenue_received` | `transactionId` | Matching GHL payment transaction is live, successful, not a test, with verified amount and currency |
| `lead_unsubscribed` | None | Existing contact's email DND status is active |

The receiver ignores supplied email, source, campaign, amount and currency values. It reads those facts from the CRM and existing activity history. Opportunity `monetaryValue` does not become received revenue.

Calendar visits and `/demandflow/watch` visits have no accepted event type. Instantly-origin echoes are acknowledged without creating a CRM milestone or writing a status back.

## Required environment configuration

- `DRM_GHL_LIFECYCLE_WEBHOOK_SECRET`: dedicated secret of at least 32 characters.
- `ENABLE_GHL_LIFECYCLE_SYNC=true` and `VERCEL_ENV=production`.
- `GHL_OUTREACH_PIT` (or existing `GHL_PIT`) and `GHL_LOCATION_ID`.
- Existing complete `GHL_OUTREACH_FIELD_IDS` mapping.
- `GHL_ACTIVITY_SCHEMA_KEY`, `GHL_ACTIVITY_ASSOCIATION_ID`, and actual `GHL_ACTIVITY_CONTACT_IS_FIRST` order.
- `GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED=true` after the real duplicate-insert test.
- `GHL_LIFECYCLE_PAYLOAD_MAPPING_VERIFIED=true` after testing the actual normalized GHL actions.
- `GHL_OUTREACH_AUTOMATIONS_REVIEWED=true` after checking that projection updates and tags cannot enroll or message prospects unexpectedly.
- `GHL_LIFECYCLE_CALENDAR_IDS`: JSON array of permitted calendar IDs.
- `GHL_LIFECYCLE_STAGE_MAP`: JSON object keyed by each real pipeline ID, with `qualifiedStageIds` and `wonStageIds` arrays of real stage IDs.

For `inquiry_saved` alone, the location-bound attribution mapping replaces outreach projection/stage/calendar configuration: it needs the token, location, ledger association/schema, unique-field and payload-mapping gates above. It does not require an Instantly key, outreach field mapping, or opportunity/calendar settings. It creates immutable history only and never updates contact source, fields, tags, or pipeline stages.

Set `ENABLE_INSTANTLY_GHL_SYNC=true` and supply `INSTANTLY_API_KEY` only when activating the existing reverse synchronization. Without that explicit enablement, lifecycle recording/Meta delivery can run while Instantly remains untouched. The response reports `instantly_sync_disabled` for otherwise applicable reverse milestones.

Meta requires the separate configuration in [the Meta dispatcher guide](meta-capi-dispatcher.md), including `ENABLE_META_CAPI=true`. Missing enabled Meta credentials/mapping fails before CRM writes. Disabled Meta does not send. Test mode also requires `META_CAPI_TEST_EVENT_CODE`; it never relaxes receipt, appointment, stage, payment or consent verification. Historical facts and Instantly-origin echoes never dispatch advertising events.

Live revenue additionally requires `GHL_PAYMENT_REVENUE_MAPPING_VERIFIED=true` and `GHL_PAYMENT_AMOUNT_UNIT` set to the verified `major` or `minor` unit. Minor units require `GHL_PAYMENT_CURRENCY_EXPONENTS`, for example a verified USD exponent of 2. Do not infer units from the amount. The GHL token needs read access to payment transactions as well as contacts, calendar events and opportunities.

Historical processing requires both `ENABLE_GHL_LIFECYCLE_HISTORY_IMPORT=true` and `GHL_HISTORICAL_IMPORT_SAFE=true`. Historical records remain historical on later duplicate delivery and cannot replay Instantly stopping/status actions or advertising conversions through this receiver.

## Synchronization and reporting

When Instantly synchronization is enabled, an actual booking maps to meeting booked, attendance to meeting completed, and a won customer to the closed status. Email unsubscribe is preserved through the workspace blocklist. Every stopping action reads back the blocklist; a label alone is not treated as a stopping mechanism. Matching uses the existing contact's exact email and does not create a new Instantly lead.

The original CRM source stays intact. Where an Instantly history exists, lifecycle records retain its first known Instantly campaign for campaign reporting. That relationship is separate from the original cross-channel source on the contact. Contacts without Instantly history receive general appointment/customer/revenue projections without being reclassified as cold email.

Totals are recomputed from unique immutable ledger events. Appointments use their actual appointment IDs, and revenue uses unique verified transaction identities. Tags `drm-stop-cold-prospecting` and `drm-exclude-cold-sms`, plus the structured SMS exclusion field, are inputs to the reviewed GHL suppression workflow. That workflow must separately remove any active cold-SMS enrollment; the receiver does not claim that a tag itself stops a sequence.

## Practical limits

- Completion receipts are audit evidence, not distributed locks. Projections may need reconciliation after concurrent writes; the immutable ledger remains authoritative.
- A past stage transition cannot be verified from a record that has already moved to another stage. Such a delivery fails for reconciliation rather than inventing history.
- Refunded transactions need a separate reconciliation process. They are rejected here rather than being counted as new revenue or silently treated as an unrefunded payment.
- A failed or unverifiable dependency returns a retryable non-2xx response. Configure the GHL sending action's retry/error path and inspect failed executions.
- Unit tests cover contract and mocked API behavior; live workflow receipt and platform-side stopping still require identified test records.
- A saved inquiry workflow must process while its receipt is still the contact's current receipt. A later distinct inquiry can replace those current fields; delayed older delivery then fails verification rather than attributing it to the later submission.
- Native Webhook retries/error handling must be configured and verified; the route does not assume GHL automatically retries every failure. Meta rejection retains the immutable CRM activity and returns a generic non-2xx response for explicit repair/retry.
- `tests/ghl-webhook-meta.test.mjs` verifies flat standard-action mapping, authorization, durable inquiry receipt, default-off delivery, Meta deduplication/retries, consent, history/test isolation, and leaving Instantly disabled. No live platform events are created by these tests.

## Live activity-object evidence

The activity object was provisioned and checked through API version `v3` on September 25, 2026 UTC. Its unique Event ID prevented repeated identical synthetic inserts, with exactly one labeled `integration_test` record retained. No contacts, messages, appointments, customers or revenue were created by this uniqueness test.

- Object: `custom_objects.drm_outreach_activity` (`6ab5fc38830904c4be922718`).
- Association: `6ab5ffcd6c1d246694731e47`; GHL returns Contact as the first object, so `GHL_ACTIVITY_CONTACT_IS_FIRST=true`.
- Fields: 30, including the unique primary field.
- Searchable fields: `event_id`, `contact_id`, `campaign_id`; GHL enforces a maximum of three.
- GHL search queries are limited to 75 characters; the helper uses the bare event digest and then exact-matches returned IDs.
- Empty text properties are omitted on GHL read-back; the helper normalizes absent optional identity values for safe duplicate recovery.
- Test record: `6ab5fff6d74d62eff5b03b31`, explicitly labeled “DRM INTEGRATION TEST - UNIQUE EVENT ID - NO PROSPECT”.

This verifies the ledger's uniqueness setup. It does not assert that lifecycle workflows, advertising conversions, or a production deployment are already enabled.
