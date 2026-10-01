# GA4 saved inquiries — 2026-09-26

Property: Dead River Management - Website (553737154), stream 15757395238,
measurement ID G-5MC19Z3162. The existing AW-18438589761 Google tag already
routes to this Analytics destination. No second pageview configuration was added.

## Live Analytics settings

- Event-scoped custom dimension **Industry**, parameter `industry`.
- **generate_lead** registered as a key event, once per event, no default monetary value.
- Existing **whole_river_lead** rule corrected from `page_view` + URL containing
  `/watch` to `event_name equals drm_legacy_inquiry_saved`, copying parameters.
  It remains the legacy form's key event; the modern forms only send generate_lead.
- No new Analytics conversion was imported into Google Ads; CRM conversion actions
  and campaign goals were not changed by this update.

## Website behavior

Modern forms emit generate_lead only with a saved-inquiry receipt, to the specified
GA4 destination. Parameters include industry, event_id and an allowlisted lead_type;
no contact details or invented revenue values. Duplicate receipt emissions in the
same page are suppressed. GPC and explicit analytics denial prevent the event.
Existing server analytics_allowed gates remain in effect.

Industries: home-services, dental, real-estate, ecommerce, med-spas and other.
In Analytics Explore, use event name generate_lead and the Industry dimension,
with event count and session campaign/source dimensions to compare inquiries.
The Industry dimension applies to new collected data, not old historical events.

Roofing and diagnostic forms now retain attribution and stable inquiry IDs, check
successful responses, exclude previews, and use server receipts for tracking.
Legacy form markers require an explicit new-contact success response. Legacy Ads
conversions now include transaction_id and honor explicit ad consent/GPC denial.
Direct watch-page visits cannot generate the legacy event.

Removed the duplicate app.datamoon.com header loader from both layouts; retained
the branded app.deadrivermanagement.com loader. Both fetched scripts had identical
SHA256 4807a5d111f0e4630611c8c60779e193b53e0807c2ec1a1b85ec4f3d80081006.

## Validation and limits

335 automated tests passed; production build passed. Tests cover saved receipts,
industry allowlisting, no PII forwarding, duplicate suppression, preview/failure,
consent/GPC, legacy direct/copied/replayed markers, roofing attribution and receipts,
and one visitor tracker per layout. These tests do not establish live GA4 receipt.
At configuration time generate_lead displayed No stream data detected; a genuine
saved inquiry still needs receiver-side verification. Existing Google CRM diagnostic
issues and disabled Meta server conversion gates are separate unresolved work.
No ads, budgets, targeting, payment settings, or page copy changed.
