# Meta CRM conversion dispatcher

`api/_lib/ad-conversions.js` is the gated server dispatcher for the existing Meta pixel **4422109568077296**. The authenticated `/api/ghl-lifecycle-webhook` route invokes it only after a verified CRM fact has been durably recorded and the explicit Meta configuration gates pass. The website inquiry handler itself does not call Meta; its saved receipt triggers the standard GHL Webhook flow. No token is committed, no live configuration is enabled by this code, and no live conversion was sent while implementing it. Live workflow mapping, platform test receipt and campaign optimization verification remain separate work.

## Verified CRM facts and event names

| CRM fact | Meta event | Required evidence |
| --- | --- | --- |
| DemandFlow inquiry saved | `Lead` | The contact has the DemandFlow tag and the exact saved `DRM Last inquiry event ID` and timestamp. The same ID goes to the browser. |
| Appointment confirmed | `Schedule` | An authoritative GHL appointment read confirms the matching contact, mapped calendar and confirmed/showed status. |
| Qualified opportunity | `QualifiedLead` | An authoritative GHL opportunity read confirms the matching contact and mapped qualified stage. |
| Customer closed | `ConvertedLead` | An authoritative GHL opportunity read confirms the matching contact, mapped customer stage and won status. |
| Revenue received | `Purchase` | An authoritative GHL payment read proves a successful live, non-test, unrefunded payment with positive amount and explicit currency/unit mapping. Its verified amount/currency must agree with the immutable activity record. |

`QualifiedLead` and `ConvertedLead` are intentional custom CRM event names in this integration. Their configuration and availability for the intended Meta campaign optimization must be verified in the account. Estimated opportunity value is never submitted as paid revenue. An attended appointment has no additional advertising event in this module.

The default `action_source` is `system_generated`: the receiver is reporting a verified CRM transition, including the confirmed inquiry receipt. An explicit direct-website invocation can provide the original submission context and use `website`; this requires the actual browser user-agent and a verified original request. A workflow server's user-agent must never be substituted. Original advertising source and campaign history remain in the structured GHL fields.

## Receiver contract

Create the dispatcher with trusted server dependencies:

```js
const dispatch = createMetaConversionDispatcher({ env, ghl, reader, ledger });
const result = await dispatch({
  event,          // normalized authenticated CRM event, not raw public form data
  activityRecord, // already persisted unique GHL activity associated to contact
  mode: 'live',
});
```

`ghl.getContact` retrieves the authoritative contact. `reader` uses the existing `createGhlLifecycleReader` interface for appointment, opportunity and transaction reads. `ledger` uses the existing `createGhlActivityLedger` interface, including `get`, `list`, `completedEffect` and `recordEffectCompletion`. The dispatcher reads the stored activity again and checks its contact, location, original event identity/time and milestone identity before sending.

The normalized event uses `origin: "ghl"`, the actual `locationId` and `contactId`, the original `occurredAt`, stable `eventId`, `eventType`, and the relevant appointment/opportunity/payment identifiers from the lifecycle contract. For `inquiry_saved`, `eventId` must exactly equal the contact's saved `drm_inquiry_<UUID>` receipt. The authenticated receiver verifies the receipt and saves its durable activity record before calling the dispatcher; a contact field alone is not that history record. The [standard Webhook mapping](ghl-lifecycle-webhook.md#standard-ghl-webhook-action) gives the exact flat Custom Data keys and real inquiry-field IDs. It uses the standard action's Authorization header and requires no paid Custom Webhook action.

Optional `consentContext` may supply explicit `analytics_allowed: false`, `globalPrivacyControl: true` or denied `ad_storage`, `ad_user_data` or `analytics_storage`. These suppress delivery and cannot grant permission over a CRM denial.

Optional `websiteContext` is for direct intake only:

```js
{
  verifiedOriginalRequest: true,
  eventSourceUrl: originalRequestUrl,
  clientUserAgent: originalBrowserUserAgent,
}
```

Only this site's HTTPS URLs are accepted; query parameters and fragments are removed. This module does not collect browser IP addresses or invent missing browser context.

## Configuration and consent

Live delivery is disabled unless `ENABLE_META_CAPI=true`. It additionally requires:

- `VERCEL_ENV=production` and the existing Dead River Management `GHL_LOCATION_ID`.
- `META_CAPI_ACCESS_TOKEN` in the server secret store, plus an explicitly selected supported `META_GRAPH_API_VERSION` such as the version verified during live setup. No version is silently assumed.
- `META_CAPI_EVENT_MAPPING_VERIFIED=true`, `META_CAPI_BROWSER_DEDUP_VERIFIED=true` and `GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED=true`, only after those checks are actually complete.
- The real attribution field mapping, loaded from the location-bound `src/data/ghl-attribution-fields.json` or a complete `GHL_ATTRIBUTION_FIELD_IDS` override.
- For applicable lifecycle events: `GHL_LIFECYCLE_CALENDAR_IDS`, `GHL_LIFECYCLE_STAGE_MAP`, `GHL_PAYMENT_REVENUE_MAPPING_VERIFIED`, `GHL_PAYMENT_AMOUNT_UNIT` and `GHL_PAYMENT_CURRENCY_EXPONENTS`, as described in [the lifecycle contract](ghl-lifecycle-webhook.md).

`META_PIXEL_ID` is optional, but if present must equal the existing pixel. `GHL_ANALYTICS_STORAGE_FIELD_ID` is optional and must be a real field ID if an additional analytics-consent field is configured. This module creates no consent fields.

Any stored advertising-storage or advertising-user-data denial suppresses delivery. An explicit analytics denial or Global Privacy Control also suppresses it. Empty/unknown advertising-user-data consent never sends hashed email, phone or contact ID. With an explicit stored `granted` value, email is trimmed/lowercased and SHA-256 hashed; an already international phone number is normalized to digits and hashed, with no guessed country code. External IDs are hashed and location-scoped. Stored `fbc`/`fbp` values are validated, retained exactly and never hashed or fabricated from a missing identifier. The informational cookie notice remains distinct from advertising-user-data consent.

## Deduplication, tests and failure handling

The Meta browser Lead must use the same `event_name` and `event_id` as the server Lead. Other server IDs derive from the real contact and appointment/opportunity/payment identity, so a different webhook delivery ID does not create a new platform event identity. A successful response must include `events_received: 1`, a valid `fbtrace_id` and a messages array before an effect receipt is saved in the activity history. The result reports response warning count without exposing provider messages or contact data.

An existing effect receipt suppresses a repeated delivery. The dispatcher also checks all contact receipts for the same pixel/event identity, so another GHL history row for the same real milestone cannot bypass a previous acceptance. This durable check does not rely on a platform deduplication window remaining open. A network timeout or receipt-write failure is an uncertain result; retry the same CRM fact with the same event ID. There is no hidden automatic retry. Concurrent deliveries or a lagging receipt-search index can still reach Meta before a receipt is visible and therefore rely on Meta's event-ID deduplication. This is not a claim of a globally atomic transaction spanning both systems. The module refuses event timestamps older than seven days, and never replaces the original event time with the retry time.

`mode: "test"` requires `META_CAPI_TEST_EVENT_CODE` and a clearly reserved `.invalid` contact email with DND enabled. `ENABLE_META_CAPI_TEST=true` permits this isolated test mode before the live event-mapping and browser-deduplication checks are marked verified. It cannot enable live delivery. Production location, token, unique activity ledger, consent and authoritative CRM fact checks still apply. Test codes are included only in explicit test mode. A synthetic/test record cannot enter live mode. Payment verification is never relaxed for a test. The adapter rejects historical imports, Instantly-origin events, email activity, page visits, unsubscribes and unmapped milestones as conversion triggers.

`tests/ad-conversions.test.mjs` contains 22 offline tests covering enablement, consent, inquiry receipt proof, actual milestone verification, payment units and immutable revenue consistency, custom event mapping, identity/deduplication across GHL delivery rows, test isolation, malformed/failed platform responses and partial retry behavior. All network and CRM dependencies are mocked; passing these tests is not evidence of live Meta receipt.

## API references inspected

Meta's developer documentation returned rate-limit errors during this implementation. The supported request/response structures were checked against Meta's maintained official SDK sources:

- [Server event parameters and event-ID behavior](https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/objects/serverside/server-event.js).
- [User-data parameters, including preserved fbc/fbp](https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/objects/serverside/user-data.js).
- [Normalization and SHA-256 hashing](https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/objects/serverside/utils.js).
- [Pixel event request, test code and response fields](https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/objects/serverside/event-request.js).

These establish the API shape. They do not establish that this account's token, dataset permissions, custom events or campaign goals have been configured or tested.
