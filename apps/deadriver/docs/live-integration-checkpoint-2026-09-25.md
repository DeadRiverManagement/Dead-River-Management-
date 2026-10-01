# Live integration checkpoint — September 25, 2026

## Status

Implementation is unfinished. Instantly activation is on hold at the user's request. No paid upgrade, ad activation, real prospect messages, or fabricated payment was performed during verification. Recorded zeros are not proof that no business activity exists outside the connected history.

### Later verification and configuration update

PRs 74 and 75 are deployed to production (`6ff1e36`, Vercel `9BcyscqZriVUPQsc96G7fWhv66fY`). The suite passed 284 tests. The native milestone receiver now reads authoritative appointment, opportunity and payment records, including GHL's observed `appointment` response wrapper, instead of trusting webhook-supplied dates or payment values.

The following published workflows use the authenticated `/api/ghl-crm-milestone` receiver, schema 2, live mode, real contact/entity IDs, and re-entry enabled:

| Workflow | ID | Verified trigger |
| --- | --- | --- |
| DRM — Appointment Confirmed Activity | e14c439b-2675-402d-a790-2ce5a5a9f74f | Confirmed, Contact only, Normal, DemandFlow calendar |
| DRM — Appointment Attended Activity | 03836ec3-429e-42df-84f4-69a6c1053fb9 | Showed, Contact only, Normal, DemandFlow calendar |
| DRM — Qualified Opportunity Activity | 99b74fc8-03cc-4949-a6f3-454158067574 | Qualified Opportunity stage in each of the four channel pipelines |
| DRM — Customer Closed Activity | 64a8297e-8514-4a94-b8fd-31aff398eb30 | Won status plus the real customer stage; stage and status triggers cover either update order |

Actual GHL-triggered QA appointment confirmations, attendance, qualification and won-customer actions returned HTTP 200. Attendance, qualification and customer execution details explicitly returned `reserved_test_contact`, zero mutations and zero conversions. Confirmation was also verified in production Vercel request logs. These tests prove native delivery and authoritative record matching; they deliberately do not create customer counts or advertising conversions. The reserved DND test contact had no phone. Its zero-value opportunity was restored to Closed–Not Converted/abandoned and its past test appointment marked invalid.

**DRM — CRM Actual Revenue Tracking** is now live, with the actual Payment Received transaction-ID merge field and authorization header. The server verifies successful live payment, amount, currency and contact using read-only payment access. A read-only production check passed against an existing successful payment without recording or uploading it. A genuine future Payment Received trigger remains unverified. Google revenue delivery is still unfinished; live Meta remains independently off.

An actual active Cold SMS QA enrollment reached a wait after its SMS was skipped due to DND. Setting the exclusion field to yes caused **Removed by External workflow action**, proving an active enrollment stops. Test tags were cleaned up and DND/exclusion retained.

The full lifecycle mapping, automation-review and payment-verification production gates are now deployed. Earlier references below to validation-only revenue, undeployed mappings, missing milestone workflows or unverified active SMS stopping are superseded by this update.

Meta's Lead → Event deduplication panel now explicitly recognizes Conversions API events and reports **Still Parsing Your Data**. Platform deduplication remains pending; do not mark its gate verified. Google currently directs new offline conversion connections to the Data Manager API. The user approved a dedicated service credential, Standard access only to account 571-783-6174, and secure Vercel storage. API enablement and delivery are not yet complete. No billing or ad delivery was activated.

The dedicated Google service account and production-only Vercel identity federation were subsequently created and the account's Standard Ads access verified. Google's organization policy prevented key creation; no key was created and that protection was retained. The keyless payment sender is implemented but remains disabled pending Data Manager API terms acceptance, live authentication and destination validation. The expanded suite passes **292 tests**, and the production build passes with **90 pages**. Read-only QA ledger verification returned **zero rows** for the reserved milestone test contact.

## Website deployment

PRs 70–72 are merged. Latest production code commit: `d23eb6fee30a8556bbfce88e7b928cd7c1c81675`. Vercel deployment: `AuBAbfLRRViD8W7PZcBX8R528VWL` (GitHub Vercel status success). Latest local validation: 272 tests passed and Astro production build passed. `check:growth` previously passed with 56 checked pages and zero broken links.

PR 70 preserved original paid campaign context for lifecycle records and added authenticated, value-free schema diagnostics. PR 71 fixed the actual standard GHL Webhook `customData` wrapper. PR 72 separated Meta Test Events enablement from live conversion activation; test-only enablement cannot activate live delivery.

## Verified website and inquiry path

The actual standard GHL Webhook validation returned HTTP 200, zero writes, zero conversions after fixing its native wrapper. The saved inquiry workflow then delivered an explicit Meta Test Event through production: HTTP 200, Lead accepted, zero warnings, and an immutable delivery receipt.

Replaying the same event returned `already_received`, `conversionSent:false`; GHL retained one activity and one effect receipt. This establishes sequential webhook duplicate suppression, not browser/server platform deduplication or concurrent delivery guarantees.

A live website form test used the pre-existing reserved `.invalid` QA contact with DND and a reserved fictional phone number. Campaign navigation was DemandFlow with test UTM parameters → home → clean DemandFlow URL → form. GHL updated the same contact, retained its original source and original campaign, and stored the later `DRM_INTEGRATION_TEST` campaign. DND remained true. The form redirected to the existing booking page.

Meta Test Events displayed the browser Lead with receipt `drm_inquiry_74029bf6-39be-4747-bccd-35ed029072d6`. GHL's automatically triggered workflow accepted the server test Lead with the same underlying receipt; trace `AXlc6HsmHwRO0-3kz8qrYzS`, zero warnings. Booking-page and watch-page visits displayed PageView without another Lead or Schedule in the observed test session. No appointment was booked.

Server Test Events acceptance is proven through Meta's API response and durable receipt. Meta's UI has not yet displayed the server counterpart or explicit deduplication status. Live Meta CAPI therefore remains disabled. The browser/server deduplication gate is not marked verified.

## Workflows

- **DRM — Saved Inquiry Activity and Meta**, `048b8b98-65a1-47a0-af15-c740f989d146`: published, saved-inquiry receipt changed trigger, re-entry on. Standard authenticated Webhook verifies exact CRM receipt/time/tag before recording activity. After isolated test verification, changed to `drm_mode=live`, `drm_test=false`. Inquiry history is enabled; live Meta is independently disabled. No source, stage, prospect message, or Instantly mutation.
- **DRM — CRM Actual Revenue Tracking**, `9484473f-ffc9-43d2-a03a-69b6ac625e89`: published, successful Payment Received trigger, still validation only. Actual trigger transaction ID and timestamp serialization remain unverified. Does not yet write revenue or send advertising conversions.
- **DRM — Confirmed Booking Stop Cold SMS**, `084063e2-a535-4bc6-9746-100fc51ddd8d`: published; confirmed DemandFlow calendar event sets `DRM Exclude from cold SMS=yes`, removes Cold SMS enrollment, and adds both `drm-stop-cold-prospecting` and `drm-demandflow-appointment-confirmed`. The dedicated booking tag triggers the Google child workflow without GHL's appointment-trigger re-entry exception. QA actions and contact readback passed. Actual interruption of an active sender still needs verification.
- **DRM — Enforce Cold Email SMS Exclusion**, `8e8d70a6-41e4-4d08-8dd7-290565bf079d`: published, re-entry on; exclusion field changes to yes remove the existing Cold SMS enrollment. QA action executed. Guarded removal requests for 156 imported cold-email contacts were accepted, zero errors; this does not imply 156 active overlaps existed.
- **DRM — CRM Inquiry Saved Conversions**, `be2a3657-50cc-430e-abce-e4a5382c685a`: published with actual click-field mappings, saved-receipt/tag requirement, consent guards and reserved-test email exclusion. Re-entry and multiple-opportunity enrollment off. Actual execution logs show the QA contact took the None/exclusion branch and finished; repeat enrollment was skipped. No Google conversion action ran for the QA contact.
- **DRM — Google Appointment Confirmed**, `a753ea33-5639-4d97-8bdf-ba7362c663fd`: published, triggered only when `drm-demandflow-appointment-confirmed` is added by the confirmed-calendar workflow. Correct Google conversion action and actual click fields. Re-entry and multiple-opportunity enrollment off. QA handoff automatically entered through the tag trigger, took the None/exclusion branch, and finished. A repeated API enrollment was explicitly skipped. No actual appointment or Google conversion was fabricated.
- **DRM — Google Qualified Opportunity**, `10387bf0-0b2f-4eb5-b78a-d737ef30f1ef`: published, four real pipeline triggers filtered to Qualified Opportunity, correct Google conversion action, actual GCLID/GBRAID/WBRAID fields, consent-denial and reserved-test exclusions. Re-entry and multiple-opportunity enrollment off, saved and verified. Actual execution logs show the QA contact took the None/exclusion branch and finished; repeat enrollment was skipped. No Google conversion action ran for the QA contact.
- **DRM — Google Customer Closed**, `f17a39c7-de19-45cf-a9c6-882e14d3eda3`: published, four real pipeline triggers requiring status to change to Won. Sets `DRM Exclude from cold SMS=yes` before the advertising condition, then maps eligible contacts to `DRM - CRM Customer Closed`; actual click-ID mappings and exclusions retained. Re-entry and multiple-opportunity enrollment off. QA exclusion branch and repeated enrollment suppression verified in actual GHL logs; the repeat explicitly reported that the contact cannot be added again. A second reserved DND QA contact verified the new suppression-field action and source preservation. Estimated opportunity value is not mapped as revenue.

Native GHL Google actions default the conversion-value input to 1 and reject a literal zero. The four non-revenue Google conversion actions are configured not to use value; their live value handling is not yet verified. The actual-revenue action must use a verified successful payment amount.

## Meta access and configuration

Existing pixel `4422109568077296`, existing DRM app, and existing Conversions API System User were used. User explicitly approved the pixel assignment, app Develop access and ads_management scope. Token is a production-only Vercel secret; no credential is committed. A direct TestEvent and subsequent inquiry test Leads were accepted.

Production has inquiry ledger configuration, verified native payload wrapper gate, Graph API v26.0, account Test Events code and `ENABLE_META_CAPI_TEST=true`. `ENABLE_META_CAPI`, its live mapping/deduplication gates, and Instantly live enablement remain absent/off.

The complete 27-field outreach mapping, DemandFlow calendar ID, and the four real pipeline qualified/won stage mappings were freshly read from GHL and saved as production Vercel Config variables. Verified payment amount unit `major` and USD exponent 2 were saved. These five additional variables await the next deployment and do not enable payment or other milestone processing on their own. Full lifecycle automation-review/payment gates remain unset.

## Google Ads

Five CRM conversion actions are Primary, Every count, and included in the custom CRM milestone goal on the new paused DemandFlow Search campaign. Campaign remains paused, AI Max off, and no existing budget or targeting was changed. Native Google delivery has not been verified with a legitimate advertising click. Do not upload synthetic click IDs or invented revenue as live conversions. Actual-revenue workflow delivery and legitimate Google receipt remain unfinished.

September 25 readback reconfirmed all five actions as Primary/Every and the Qualified Opportunity action as **Don't use a value**. Google currently reports the import actions inactive and no associated data-source connections; GHL uses the supported Google Ads API workflow action rather than a separate Data Manager connector. Receipt of a legitimate eligible CRM conversion remains unverified. The four non-revenue workflows are now published; revenue delivery is unfinished. Their native guard counts the first workflow enrollment per contact (including an enrollment that fails the advertising condition), not every later appointment or deal. Do not bulk-enroll historical contacts into these conversion workflows or manually rerun advertising actions after an uncertain provider result.

## Meta campaign optimization readback

Meta account `1511879113740285`, active **Home Services** campaign, **DemandFlow** ad set `120249806356740352`: conversion location **Website and calls**, performance goal **Maximize number of conversions**, dataset/pixel **Dead River Management**, conversion event **Lead**, highest-volume bidding. Existing $25/day campaign budget, targeting, value adjustments and delivery state were only inspected. No changes or recommendation acceptance were needed. This verifies current Lead optimization, not live CRM CAPI milestone delivery.

## GHL reporting

Dashboard **DRM - Outreach to Revenue**, `6ab67279ddc9aeb5d2a2fc2a`, now has 12 saved widgets:

- Instantly emails sent — to date: 251.
- Instantly unique prospects contacted — to date: 155.
- Attributed payments recorded — USD, to date: sum of ledger Actual Revenue filtered to USD; currently 0, not all GHL payments.
- Instantly prospects with replies — to date: unique contacts with reply count > 0, currently 0.
- Instantly interested prospects — to date: interested flag yes, currently 0.
- Prospects with confirmed appointments recorded — to date: count > 0, currently 0.
- Prospects with attended appointments recorded — to date: count > 0, currently 0.
- Customers won recorded — to date: count > 0, currently 0.
- Instantly bounced prospects recorded — to date: preserved flag yes, currently 0.
- Instantly unsubscribed prospects recorded — to date: preserved flag yes, currently 1.
- Campaign activity, milestones and actual revenue: seven visible columns, all-time range, activity rows only, 408 rows including 406 imported facts and 2 clearly labeled QA inquiries. Delivery receipts are excluded. Original event time is shown; table sorting remains CRM creation time descending.

The additional **Cold Email — current opportunities by stage** chart groups actual Cold Email pipeline opportunities by Stage, with a Till date override. It currently reports no data; imported email prospects were not artificially turned into opportunities. Other channel pipeline boards remain available in Opportunities.

Saved object view **DRM - Campaign Activity** and each contact's associated **DRM Outreach Activities** retain detailed immutable history. The dashboard and report do not imply that pending live integrations are complete.

## Remaining work

Finish immutable CRM appointment/attendance/qualification/customer workflow payload mappings and safe enablement; authoritative payment-trigger sample and actual-revenue delivery; legitimate Google conversion receipt; Meta browser/server platform deduplication; remaining event/stopping tests. Meta campaign optimization was verified. Instantly activation remains on hold until explicit account readiness. Historical Instantly import is already complete and must not be repeated or resent.
