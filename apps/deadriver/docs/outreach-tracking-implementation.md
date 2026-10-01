# Dead River Management outreach tracking implementation

Historical implementation record from the initial setup on September 25, 2026. **For current activation, verification and deployment status, use [tracking-live-status.md](tracking-live-status.md).** The status sections below are retained as the earlier audit trail, not current completion claims. The field-ID tables and historical-import details remain reference material.

## Current state

| Area                      | Verified state                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Website attribution       | Implemented and tested; 45 real GHL contact field IDs provisioned and mapped. PR #68 has a ready Vercel preview; production publication is still pending.                  |
| Contact field test        | Live synthetic DND contact passed 38 field readbacks, source/campaign preservation, direct-return preservation and duplicate lookup. No advertising receipt was written. |
| Sales pipelines           | Separate Cold Email, Google Lead Form, Facebook Ads and Cold SMS pipelines exist.                                                                                        |
| Activity history          | GHL Outreach Activities custom object, 30 fields and Contact association exist. Unique Event ID enforcement was tested live.                                             |
| Instantly contact fields  | 27 mappings verified, including the Original source field shared with website attribution; 26 additional contact fields. All 71 unique contact fields are in DRM Attribution & Outreach. |
| Instantly live connection | Not active. This account's webhook feature requires a paid upgrade, which was declined. No Instantly webhook subscription has been configured.                           |
| GHL inbound workflow      | Draft receiving workflow exists and captured manually submitted synthetic reference data. This is not evidence of an Instantly-origin event.                             |
| History and reporting     | Historical import completed at 2026-09-25T09:17:29.844Z. Read-only verification passed: 156 contacts, 406 unique historical facts and 406 notes; 251 sent emails, 73 opens and 17 clicks. Ongoing Instantly delivery remains on hold. |
| Advertising conversions   | CRM-to-platform conversion mappings, Google Ads Primary settings and actual Meta/Google test-event receipt are not yet verified.                                         |
| New Google campaign       | A separate paused campaign exists. Final keywords, negatives and ad-copy verification remain in progress.                                                                |
| Website deployment        | PR #68, commit 0c649848ebedc34e3a9385feaa640028a5f8191b, has a successful Vercel preview. No production deployment from this work is recorded yet.                            |

No new paid platform or paid upgrade was authorized. Keep the new ad campaign paused and paid GHL workflow execution features disabled unless the user separately approves the resulting cost.

## Where to find the data

Use the Dead River Management GHL location `dzfd13SYs0Jg3qbvmugD`.

- On a contact, open **DRM Attribution & Outreach** in its custom fields to see `DRM Original source`, original/latest UTM fields, Google/Meta click IDs, and the Instantly campaign fields. All 71 unique contact fields are organized there. Search the exact field names in [GHL Custom Fields](https://app.gohighlevel.com/v2/location/dzfd13SYs0Jg3qbvmugD/settings/fields?tab=field); field names and IDs below remain the authoritative mapping.
- In Opportunities, select the pipeline for the acquisition channel. The current stage describes the sales position; the source and campaign fields retain where the person came from.
- Open the **Outreach Activities** custom object and select **DRM - Campaign Activity**, saved view ID `UhLAqHaJui9B4swNtsuC`. This live GHL view has 16 readable columns, filters `record_kind = activity` to exclude processing receipts, and sorts original event time (`occurred_at`) newest first. Filter Campaign ID or Campaign Name to inspect a particular campaign. Its Contact association links each contact's underlying history; imported/received time remains separate from original event time.
- The contact's `DRM Outreach latest activity` fields are summaries, not replacements for that history. The imported sent-email totals come from unique message records. Open/click totals also use the dated cumulative snapshots described below, without counting overlapping snapshots twice. Readable historical activity is available in contact notes.
- The existing DemandFlow calendar remains `rfaj3m31onqPQEFYhwyE`. Booking-page and watch-page views are not confirmed appointments.

The question “which campaign brought this person in, what happened next, and did they become a customer?” is answered by the original/latest campaign fields, the associated activity records, the pipeline opportunity, and a verified payment record. The available Instantly history is now populated and verified. Ongoing Instantly delivery and CRM-to-advertising conversion activation remain pending; this import does not establish appointment, customer or revenue totals for the business.

## Video step 1 — store the click ID

The website change retains Google `gclid`, `gbraid`, `wbraid`; Meta `fbclid`, `fbc`, `fbp`; five UTMs; landing/referrer paths and timestamps. It survives ordinary navigation for up to 90 days. Form answers and unrelated query values do not enter attribution storage.

Original and latest campaign touches are separate. Direct returns do not clear a useful campaign. A later channel receives its own complete touch, while the latest Google and Meta identifiers also remain available independently. Existing CRM source, tags and DND are preserved.

The existing informational cookie notice is unchanged. Its Accept button is not treated as an explicit advertising-user-data grant. Explicit consent denials and Global Privacy Control suppress the new attribution storage and conversion dispatch. Unknown consent from another browser cannot overwrite a recorded CRM denial.

The runtime mapping is [ghl-attribution-fields.json](../src/data/ghl-attribution-fields.json), verified at **2026-09-25T05:42:16.895Z**. It is used only for the exact location above. An explicit `GHL_ATTRIBUTION_FIELD_IDS` environment mapping can override it; incomplete or mismatched mappings fail closed.

See [website-attribution.md](website-attribution.md) for the intake implementation and test coverage.

## Video step 2 — map CRM milestones

The intake code matches the contact, confirms the additive campaign tag, saves structured attribution, and reads those fields back. Only then does it write the final `DRM Last inquiry event ID` receipt. A confirmed-inquiry conversion workflow should watch `contact.drm_last_inquiry_event_id`, not contact creation, importing a prospect, sending an email or merely adding a campaign tag.

The browser receives that same ID and includes it as `drm_lead_submitted.event_id` and `transaction_id`. The Meta browser event ID and the server version of the corresponding Lead must both use it. A Google Ads tag must map `transaction_id` to Transaction ID, with the matching order ID on a corresponding offline upload to the same conversion action. This does not establish deduplication across different Google conversion actions. The live GTM/server mappings remain activation checks, not completed claims. The transaction-ID alias was added after the preview commit recorded below and still needs publication.

| Real milestone        | Required evidence and intended mapping                                                                    | Current status                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Inquiry saved         | Verified CRM contact, attribution and tag, followed by inquiry receipt; Lead/inquiry conversion           | Website receipt code tested; advertising connection not yet verified      |
| Appointment confirmed | Actual appointment in the existing calendar with confirmed status; booking/Schedule conversion            | Calendar preserved; live advertising mapping not verified                 |
| Qualified opportunity | Explicit Qualified Opportunity stage in the correct pipeline; qualified-lead conversion                   | Stages exist; live advertising mapping not verified                       |
| Customer closed       | Actual opportunity marked won in the correct customer stage; customer conversion                          | Stages exist; live advertising mapping not verified                       |
| Revenue received      | Unique, successful, non-test payment transaction and verified currency/value; purchase/revenue conversion | Receiver validation code exists; live payment and ad mapping not verified |

Opportunity estimated value is not treated as actual received revenue. No customer revenue was fabricated in testing. [ghl-lifecycle-webhook.md](ghl-lifecycle-webhook.md) describes the normalized contract, verification gates and stopping behavior that still require live workflow configuration.

## Video step 3 — Primary and campaign goals

Google Ads CRM conversion actions have not yet been confirmed as Primary, and the relevant campaign goal selections have not yet been verified. Meta's corresponding server-event and optimization settings also remain to be verified. No claim is made that either advertising platform has received a new test conversion from this work.

The separately authorized campaign is **DRM - DemandFlow - Search - Home Services**, ID **24293058610**, in Google Ads account **571-783-6174**. It was created as a paused copy with U.S. presence targeting, English and a $20/day configured budget. It remains paused. Keyword, negative-keyword, ad-copy, AI Max-off and final conversion-goal verification must be completed before any launch decision.

The offer remains **30 leads in 60 days or we work for free until we do**. [demandflow-search-campaign.md](demandflow-search-campaign.md) contains the research and entry specification; it is not a substitute for saved-account verification. Existing campaign budgets and targeting are outside the new-campaign changes.

## Separate channel pipelines

| Pipeline         | Actual pipeline ID     | Stages | Change                                                          |
| ---------------- | ---------------------- | ------ | --------------------------------------------------------------- |
| Cold Email       | `QwvJmNYE6T9hR4mKWbQy` | 11     | Existing pipeline retained; attended and qualified stages added |
| Google Lead Form | `EVRg6ogpGiMFAIwYYiMd` | 11     | Existing pipeline retained; attended and qualified stages added |
| Facebook Ads     | `KUjicyH22lRub4RA2mgc` | 11     | Existing pipeline retained; attended and qualified stages added |
| Cold SMS         | `eVSSCeGu6yOKHuD4dlR2` | 10     | Created for cold SMS                                            |

The existing stage labels and opportunity histories were retained. These are the available milestone stages; their presence alone does not prove an advertising conversion workflow is active.

| Pipeline         | Booking stage         | Attendance stage     | Qualification stage   | Customer stage |
| ---------------- | --------------------- | -------------------- | --------------------- | -------------- |
| Cold Email       | Meeting Scheduled     | Appointment Attended | Qualified Opportunity | New Client     |
| Google Lead Form | Meeting Scheduled     | Appointment Attended | Qualified Opportunity | New Client     |
| Facebook Ads     | Meeting Scheduled     | Appointment Attended | Qualified Opportunity | New Client     |
| Cold SMS         | Appointment Confirmed | Appointment Attended | Qualified Opportunity | Customer Won   |

## Instantly connection and current blocker

**DRM — Instantly Activity Inbound** is draft workflow **021fc29e-0aab-45bc-b9bb-e7bc92edbc26** in [GHL Workflows](https://app.gohighlevel.com/v2/location/dzfd13SYs0Jg3qbvmugD/automation/workflows). Its Inbound Webhook trigger captured manually posted synthetic examples only. No receiving URL is included in this repository document.

The intended path is Instantly's supported webhook → the GHL inbound receiver → the authenticated existing-site processing endpoint → the matching contact, immutable activity record and appropriate pipeline update. The repository provides `/api/instantly-webhook` and `/api/ghl-lifecycle-webhook`; they are not a live connection until deployed and their verification gates are satisfied.

Instantly currently requires a paid plan upgrade to enable this account's webhooks. The user declined that upgrade, and Instantly activation remains on hold. No subscription was added and no extra paid connector was introduced. The supported API history import completed successfully; that completed archival work does not activate or demonstrate live webhook delivery.

The adapter code handles supported sent/open/click/reply/automatic-reply, intent/status, bounce, unsubscribe, completion, meeting/customer and custom-label events. Live availability must be established from this account's actual payloads. Code support and a synthetic example do not prove a provider event was delivered.

Original source is retained for an existing contact. Imported prospects or sent emails do not create advertising Lead conversions or automatically qualify an opportunity. The assigned outreach channel and cold-SMS exclusion fields support the cross-channel exclusion rule. Existing SMS workflows must also enforce the exclusion and remove active enrollments; a tag or label alone is not proof that a sequence stopped.

Bookings, attendance, customers and unsubscribes require supported Instantly stopping/status actions and readback verification. The code separates synchronization origin and stable event identity to avoid echo loops, but real sequence stopping has not yet been verified against an Instantly record.

## Historical import and reporting verification

The import of the available three-campaign archive completed at **2026-09-25T09:17:29.844Z**. Subsequent read-only verification matched **156 of 156 contacts**, found **406 of 406 unique historical activity records**, and confirmed **one readable note for each of those 406 records**, with no verification failures. The records comprise **251 individual sent emails** and **155 lead-state snapshots**. Original event timestamps and campaign identities were verified; the available sends span September 18–24, 2026.

There are **155 unique prospects with sent-email history**, rather than 156 contacted prospects. Of the 156 contact identities, 154 have both messages and a current lead snapshot, one has messages without a current lead snapshot, and one has a lead snapshot without available messages. The latter belongs to the test campaign. An imported prospect is not counted as contacted merely because a contact or snapshot exists.

| Archive campaign group | Historical records | Prospects contacted | Emails sent | Opens from dated snapshots | Clicks from dated snapshots | Replies supplied |
| ---------------------- | ------------------ | ------------------- | ----------- | -------------------------- | --------------------------- | ---------------- |
| Test campaign          | 1 snapshot         | 0                   | 0           | 0                          | 0                           | 0                |
| Pilot                  | 339                | 122                 | 218         | 69                         | 17                          | 0                |
| Pilot B                | 66                 | 33                  | 33          | 4                          | 0                           | 0                |
| **Verified total**     | **406**            | **155**             | **251**     | **73**                     | **17**                      | **0**            |

All 251 available individual message events were sent emails. The API supplied no reply or automatic-reply messages, historical webhook deliveries, custom labels, sequence variants or conversation URLs in this archive. Sender inbox, provider lead/message IDs and sequence step were available on the sent records. The open/click counts came from cumulative lead snapshots with original last-open/last-click times; a complete sequence of individual historical open/click events was not supplied. The contact projections use those snapshots as a baseline, reconcile overlapping individual events through the recorded time, and add only later distinct events. Repeated snapshots are not added together.

Instantly's separate campaign analytics reported **74 opens and one bounce**, while the available contact snapshots support 73 opens and the archive supplied no individual bounce event. These sources are retained as separate evidence. Missing per-contact bounce history does not mean zero bounces, and the unmatched aggregate must not be assigned to a person or given an invented timestamp. The successful blocklist read returned no entries; it did not verify permission to write a suppression or prove sequence stopping.

The saved baseline covered **41 contacts already present before the bulk import resumed**. Read-only comparisons confirmed their existing tags, DND settings, existing source/attribution and unrelated fields, opportunity stages/statuses and values were preserved. The full cohort's campaign/lead memberships, counters, historical flags, readable notes, assigned cold-email channel and cold-SMS exclusion fields also passed verification. Historical processing added no tags, sent no messages, changed no opportunities, made no Instantly mutations and emitted no advertising conversions. No appointment, customer or revenue event was inferred from prospecting history.

The private source archive, preservation baseline and verification results are retained in the ignored local directory `.local-tools/instantly-history-2026-09-25T06-35-08-728Z`; they contain contact information and must not be committed or published. `import-result.json` records completion and `import-verification.json` records the read-only result. The live **DRM - Campaign Activity** view and contact fields/notes are the places to inspect this imported history in GHL. They are not an ongoing synchronization feed while Instantly activation is on hold.

## Field reference

### Website attribution — 45 contact fields

| Exact GHL name                    | Mapping key             | Actual field ID        |
| --------------------------------- | ----------------------- | ---------------------- |
| DRM Original utm source           | `first_utm_source`      | `lswlPM1xx3FRKORXyySY` |
| DRM Original utm medium           | `first_utm_medium`      | `y8AmGdaLqFd872BSK896` |
| DRM Original utm campaign         | `first_utm_campaign`    | `xU4EOk9E3KDCpD94C3w2` |
| DRM Original utm content          | `first_utm_content`     | `aIQQUCKWywzYQXm0qHFS` |
| DRM Original utm term             | `first_utm_term`        | `zVjYyxPUw4GX2QNDfxTO` |
| DRM Original gclid                | `first_gclid`           | `gr4wKDRdZpTRDQS3scxL` |
| DRM Original gbraid               | `first_gbraid`          | `D50FrU9vepgRQY35prw6` |
| DRM Original wbraid               | `first_wbraid`          | `b8KrqJlPSmyV3FyebzTX` |
| DRM Original fbclid               | `first_fbclid`          | `53BqJFsJWkQBTlIIaxWB` |
| DRM Original fbc                  | `first_fbc`             | `ZV3NfvbLFbZO1NudmriE` |
| DRM Original fbp                  | `first_fbp`             | `oFgRhe6kLVlheJhYAHc9` |
| DRM Original landing page         | `first_landing_page`    | `P1QGOwpWtpEO34XMa5Os` |
| DRM Original referrer             | `first_referrer`        | `K0G9WdRpSvqyL8JpM6nR` |
| DRM Original occurred at          | `first_occurred_at`     | `w1qF2lmi1XIWjMjHOCGr` |
| DRM Latest utm source             | `latest_utm_source`     | `ExgFRMj4x7Vl4H9VZVRY` |
| DRM Latest utm medium             | `latest_utm_medium`     | `6aRNz9faBxJQJ8KiosDv` |
| DRM Latest utm campaign           | `latest_utm_campaign`   | `XUPLQGacyKvp3qEMLqe9` |
| DRM Latest utm content            | `latest_utm_content`    | `VsYqk55KeUEFG4k4UCXF` |
| DRM Latest utm term               | `latest_utm_term`       | `ZEVV4OLROuptQ5mK6IfN` |
| DRM Latest gclid                  | `latest_gclid`          | `ER3tPppTI2so8JWZfeas` |
| DRM Latest gbraid                 | `latest_gbraid`         | `JVpA8763QVyOiIk9hycr` |
| DRM Latest wbraid                 | `latest_wbraid`         | `8PeA4LOtNdwujuVPFsZW` |
| DRM Latest fbclid                 | `latest_fbclid`         | `pNUKSlWx2w2hjFQ2o3nI` |
| DRM Latest fbc                    | `latest_fbc`            | `88GaK0SXeI0mBpdQgziB` |
| DRM Latest fbp                    | `latest_fbp`            | `y3oW97rb2yiwZYUjZnSr` |
| DRM Latest landing page           | `latest_landing_page`   | `s7f8e4ZWtta1X8OqQxam` |
| DRM Latest referrer               | `latest_referrer`       | `itw4NSMPoiUxuba6obnB` |
| DRM Latest occurred at            | `latest_occurred_at`    | `KX0XTsnr5lvLiiav1YSP` |
| DRM Original source               | `original_source`       | `XnSbkXE1Q0fREx8vk4gR` |
| DRM Latest source                 | `latest_source`         | `NZXdbD6Ymzt27p2tEhH6` |
| DRM Google GCLID                  | `gclid`                 | `s1EK3aOStSUSbvpuKCIP` |
| DRM Google GBRAID                 | `gbraid`                | `X42HrRt5VdBRmA5AqsTz` |
| DRM Google WBRAID                 | `wbraid`                | `DTS1uoGgSMGnvziW0qIY` |
| DRM Google click time             | `google_click_at`       | `ILEEESfMnMn93rEfeFUZ` |
| DRM Google landing page           | `google_landing_page`   | `aoyCB6NqP3JgV0Hau6fE` |
| DRM Meta FBCLID                   | `fbclid`                | `vgdO4SCdrGHCIN98YlDL` |
| DRM Meta FBC                      | `fbc`                   | `IWSJwkHgfH0UsE1jhsZ7` |
| DRM Meta FBP                      | `fbp`                   | `6NftgT4gqZ2k8FLSkYdQ` |
| DRM Meta click time               | `meta_click_at`         | `xriXPAqi2aBbueAETyNo` |
| DRM Meta landing page             | `meta_landing_page`     | `6kkbE8yF0lz4ThEvlAjQ` |
| DRM Advertising storage consent   | `ad_storage`            | `SAalPUMgpfZRyNDTRwqi` |
| DRM Advertising user data consent | `ad_user_data`          | `dSmjKyHKKgVmXNUsV90a` |
| DRM Cookie notice status          | `cookie_notice`         | `jEWR8NYdFWceporOraRn` |
| DRM Last inquiry event ID         | `last_inquiry_event_id` | `po7EhiqTjzOhPQmlLLTS` |
| DRM Last inquiry time             | `last_inquiry_at`       | `Uy14EjoQczxZr1xwoxYf` |

All 45 are Contact text fields. The field IDs, rather than guessed field names, are sent using the supported `customFields: [{id, fieldValue}]` API shape.

### Outreach — 26 additional contact fields

The outreach map has 27 entries because it reuses `DRM Original source` from the table above. Its remaining 26 fields are:

| Exact GHL name                          | Mapping key                      | Actual field ID        |
| --------------------------------------- | -------------------------------- | ---------------------- |
| DRM Instantly original campaign ID      | `instantly_first_campaign_id`    | `0dOYILw0UtKDqTDBjwKR` |
| DRM Instantly original campaign name    | `instantly_first_campaign_name`  | `jXreKHxvZ243n5tcRyxY` |
| DRM Instantly latest campaign ID        | `instantly_latest_campaign_id`   | `TPnaLjl0C0xwGiUE670x` |
| DRM Instantly latest campaign name      | `instantly_latest_campaign_name` | `GWSssoXpRcBkVKXTNqN5` |
| DRM Instantly campaign IDs              | `instantly_campaign_ids`         | `lQluN3SnvYoOKzN5fueJ` |
| DRM Instantly lead IDs                  | `instantly_lead_ids`             | `OTfRQMcj82uTxE7zx27R` |
| DRM Instantly sender inbox              | `instantly_sender_inbox`         | `JrXdNvA693VaO7riKpEq` |
| DRM Outreach latest activity            | `outreach_latest_activity`       | `oWH6zdPzbxX0uDTrSxK5` |
| DRM Outreach latest activity time       | `outreach_latest_at`             | `Zq2VaZPGe43Tdqo7Y2fp` |
| DRM Instantly latest status             | `instantly_latest_status`        | `RXuM28e1UzpImoQnVi3p` |
| DRM Instantly emails sent               | `instantly_emails_sent`          | `DHBx2TgbJxdPjQeCdbJU` |
| DRM Instantly email opens               | `instantly_opens`                | `JF6KsLx7iuxQpm4rItEa` |
| DRM Instantly link clicks               | `instantly_clicks`               | `FqcHI8zveFhUelUGQCzb` |
| DRM Instantly replies                   | `instantly_replies`              | `GSh2GTMENbtnGCJqLdNp` |
| DRM Instantly automatic replies         | `instantly_automatic_replies`    | `iP7p5jiJCBFkVhdIs2r6` |
| DRM Instantly interested                | `instantly_interested`           | `NvPVJxjgcbKq5R5uBOBb` |
| DRM Instantly bounced                   | `instantly_bounced`              | `z2nR2QWY3JF21kJvntbY` |
| DRM Instantly unsubscribed              | `instantly_unsubscribed`         | `fxi5UZTyGjIuscWjM61r` |
| DRM Outreach appointments booked        | `outreach_appointments_booked`   | `3K3Bc0megIXNtThemHbj` |
| DRM Outreach appointments attended      | `outreach_appointments_attended` | `WMf1EnmaowhYeKSv2xlE` |
| DRM Outreach customers won              | `outreach_customers_won`         | `PpnnxSQvzPJcaUcgQ2iv` |
| DRM Outreach actual revenue by currency | `outreach_revenue_by_currency`   | `kigKVRWqdEvtIYCMKnPT` |
| DRM Assigned outreach channel           | `outreach_channel`               | `R4kb65OErKkxralYbD93` |
| DRM Exclude from cold SMS               | `exclude_cold_sms`               | `kq85kQf4Y7Y7RGlcTO4U` |
| DRM Sync origin                         | `sync_origin`                    | `V4kGNuHXKFsUhiDS0fyU` |
| DRM Last synchronized event ID          | `last_synced_event_id`           | `hnenJtHbKEw1OjYomUUg` |

Read-only verification confirmed that the imported cohort's contact counters total 251 sent emails, 73 opens, 17 clicks and zero supplied replies. These are verified historical-cohort totals with the source limitations above; ongoing delivery is not active, and these fields must not be presented as complete current business totals.

### Outreach Activities — 30 object fields

- Object key: `custom_objects.drm_outreach_activity`; schema ID: `6ab5fc38830904c4be922718`.
- Contact association: `6ab5ffcd6c1d246694731e47` (`drm_outreach_activity_contact`). The verified API order is Contact first.
- Unique primary field: Event ID. Searchable fields are Event ID, GHL Contact ID and Campaign ID.

| Exact GHL name                  | Property key       | Actual field ID        |
| ------------------------------- | ------------------ | ---------------------- |
| Event ID                        | `event_id`         | `r8GYfAcnr2ZSRYmko8tC` |
| Record Kind                     | `record_kind`      | `8Je4sLichedXSMPgkuEY` |
| Event Scope                     | `event_scope`      | `1CMp78kvL1WXiWEQ7m3N` |
| Source Event ID                 | `source_event_id`  | `DdYkxaBJOwUbweugSY4c` |
| Activity Source                 | `source`           | `EyLUwfZzmc4Nj0wSruvY` |
| Source Workspace ID             | `workspace_id`     | `HrpLo59kzXmBK9zgLRjW` |
| GHL Contact ID                  | `contact_id`       | `lUNaCL2T5yezdu7OUeaj` |
| Campaign ID                     | `campaign_id`      | `unMBUcSu50qMpUOc4rBf` |
| Campaign Name                   | `campaign_name`    | `xeMA7ut6ayXw2zYz1DVN` |
| Source Lead ID                  | `lead_id`          | `lhiupjeVTinwgPDbMHqY` |
| Lead Email                      | `lead_email`       | `uOcyr6aV1Al1xhqMhc5v` |
| Sender Inbox                    | `sender_inbox`     | `ZTyE4Lm7cJqeUf8uKtmD` |
| Event Type                      | `event_type`       | `uo7ybVaS5tcJnrb2wsmG` |
| Original Event Time (UTC)       | `occurred_at`      | `sxc2Erqn18A2GyFr2XTS` |
| Imported or Received Time (UTC) | `received_at`      | `tcasdS7Rc0v8Ndjfv9Uo` |
| Historical Import               | `historical`       | `lzFqvqC42WPtnYfNiCnL` |
| Sequence Step                   | `sequence_step`    | `7pQjNbzpknjJzuzb1PSi` |
| Sequence Variant                | `sequence_variant` | `WTNfIpS1wcfi2WRyVIjz` |
| Source Message ID               | `message_id`       | `WqJyB6emVH3zQkRKl8W0` |
| Reply Text                      | `reply_text`       | `76JGjkKodVq7wwjlpBVl` |
| Conversation URL                | `conversation_url` | `SKKBoDr5OKRzVQCdopqT` |
| Custom Label                    | `custom_label`     | `3siKo3tN4ng3vMowVCZL` |
| GHL Appointment ID              | `appointment_id`   | `4JyUoOjwofJwc5mWEyl8` |
| GHL Opportunity ID              | `opportunity_id`   | `rnUbWcM3bhmcNH38jSUX` |
| Revenue Transaction ID          | `transaction_id`   | `gZdCK8ExXCyXrC8vsiVt` |
| Actual Revenue                  | `revenue_value`    | `Znio7W50aJxGrrieDf2k` |
| Revenue Currency                | `currency`         | `EmyTHD7dVd35I1kb7UlR` |
| Actual Revenue Verified         | `revenue_verified` | `mIJJuOrKpn4ARxSeSy1W` |
| Parent Event ID                 | `parent_event_id`  | `89PESyEVjKq64SujhfOW` |
| Completed Effect Reference      | `effect_reference` | `HpmKi3TwaHU2PlZjBC2Y` |

Original event time, campaign identity, reply content and historical-import status are separate properties. Completion receipts are audit records; they are not counted as new campaign activity. The unique event ID prevents duplicate ledger entries, while external actions still require idempotency or reconciliation after a partial failure.

## Verified tests and limits

| Check                        | Evidence                                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Automated tests              | 230 passed, 0 failed in the last complete suite run                                                                                                                                         |
| Website attribution subset   | 48 tests passed, including failed-form behavior, navigation, consent, identity preservation and receipt ordering                                                                            |
| Astro production build       | 90 pages built; sandbox Google-font downloads logged access warnings                                                                                                                        |
| Local API and JSON import    | Executed successfully on Node 24.15.0 in simulated production tests; Astro requires Node ≥22.12                                                                                             |
| Vercel server build          | Vercel reported success for PR #68 commit 0c649848ebedc34e3a9385feaa640028a5f8191b; the preview is Ready. Deployed API invocation remains to be verified.                                     |
| Live contact fields          | 38 fields read back on the [clearly marked DND test contact](https://app.gohighlevel.com/v2/location/dzfd13SYs0Jg3qbvmugD/contacts/detail/BRCffKXQb0xiL9Sry0l2) at 2026-09-25T06:27:20.611Z |
| Live contact identity/source | Same contact ID matched on duplicate lookup; source, original campaign, direct-return attribution, DND and tags preserved                                                                   |
| Live activity uniqueness     | Repeated identical synthetic inserts were rejected; exactly one labeled test record remained                                                                                                |
| Historical import completeness | 156/156 contacts, 406/406 unique historical facts and 406 readable notes verified after completion at 2026-09-25T09:17:29.844Z; no failures                                                |
| Historical contact counters | 155 unique contacted prospects; contact totals of 251 sent emails, 73 snapshot-supported opens, 17 clicks and zero supplied replies                                                        |
| Historical preservation     | Baseline comparisons passed for all 41 pre-existing contacts: tags, DND, source/attribution, unrelated fields and opportunity stages/statuses/values preserved                               |
| GHL reporting view          | Live Outreach Activities view **DRM - Campaign Activity**, ID `UhLAqHaJui9B4swNtsuC`; activity-only filter, 16 readable columns, original event time descending                              |
| Actual provider webhook      | Not verified; the GHL reference examples were submitted manually                                                                                                                            |
| Platform test conversions    | No newly received Google Ads or Meta test event verified                                                                                                                                    |
| Revenue test                 | No actual or fabricated customer revenue created                                                                                                                                            |

The synthetic contact test deliberately did not write the final advertising receipt, the DemandFlow tag, messages, appointments or opportunities. The activity uniqueness test created no prospect/contact and no revenue. Browser success events and server deduplication still require the deployed GTM/conversion configuration to be checked together.

## Maintenance and remaining activation

1. Keep API credentials and webhook authentication values in the configured secret stores. Never put them in a contact note, URL or committed file. Only field IDs and configuration metadata belong in the repository.
2. Preserve the field IDs and the location binding. Moving a field between GHL folders does not require an API mapping change; deleting/recreating it does.
3. Keep Event ID unique in Outreach Activities. Treat original timestamps and campaign identity as immutable. Repair incomplete associations or projections from the ledger instead of incrementing counters again.
4. Inspect failed workflow executions and endpoint responses. Historical imports must keep their historical flag and must not replay prospecting, booking or advertising actions.
5. Complete and verify the actual CRM milestone mappings, browser/server event IDs, Google Primary settings and Meta settings before declaring the video setup complete.
6. Respect the declined Instantly upgrade. Do not represent live webhooks as available on the current plan or enable a paid workaround without cost approval.
7. After live mappings are ready, publish the tested website through the existing GitHub/Vercel process, verify the deployed API/runtime, and record the commit and deployment references here.
8. Keep the new Search campaign paused while its keyword, negative, creative, AI Max and conversion-goal checks remain unfinished. Launching it would incur advertising spend and needs cost authorization.

**Preview commit:** [0c649848ebedc34e3a9385feaa640028a5f8191b](https://github.com/DeadRiverManagement/deadrivermanagement-site/commit/0c649848ebedc34e3a9385feaa640028a5f8191b), in [PR #68](https://github.com/DeadRiverManagement/deadrivermanagement-site/pull/68). **Vercel preview:** [Ready deployment FGmVLKERupVN32LdbfDGvnuPF4U1](https://vercel.com/deadriver/deadrivermanagement-site/FGmVLKERupVN32LdbfDGvnuPF4U1), with the [preview website](https://deadrivermanagement-site-git-codex-outreach-at-4b87fc-deadriver.vercel.app). This proves the Vercel deployment completed, but not a deployed API invocation or production publication. **Production deployment:** pending.
