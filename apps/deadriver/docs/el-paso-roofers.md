# El Paso roofing campaign

Landing page: `/el-paso-roofers`. A sales landing page with “Book a free consultation” calls to action and a consultation-request form. Uses the current Growth design system, logo, fonts, analytics, privacy notice, and existing `/api/growth-lead` integration. The campaign layout has a reduced header and footer; other pages keep their existing navigation. Submitting requests a consultation; it does not book an unconfirmed appointment.

The 1,400-person figure is the corrected seven-day campaign snapshot supplied by the site owner, not a live counter. The page labels it as the snapshot featured in the ad. Refresh this figure and the ad together when the audience changes. The supplied screenshot-2067-enhanced.png is included unaltered: 1.4K estimated matching contacts for roof repair, roof replacement, roof damage, and roofing topics in El Paso, Texas, with a seven-day lookback. Its caption and alternative text describe these filters. No reporting dates have been invented.

## Form and CRM

- Fields: name, roofing company, email, optional callback phone, required response consent, and a honeypot.
- Uses existing server-only `GHL_PIT` and `GHL_LOCATION_ID`. No additional credentials or environment variables are required.
- Validated source `/el-paso-roofers`, kind `strategy`, and industry `home-services` select the server-owned `elpaso-roofer` campaign tag and routing.
- Upserts the contact without a tags field, preserving existing tags, then calls the additive contact-tags endpoint with exactly `elpaso-roofer`.
- Success requires both a contact ID and a successful tags response containing `elpaso-roofer`. A webhook success cannot hide a failed CRM/tag operation.
- Adds a contact note with the campaign, source, request, and the five allowlisted UTM parameters, when present. Free-form client tags and routing are ignored.
- This change does not create an email/SMS workflow. Existing GHL automations triggered by this tag remain controlled in GHL.
- Preview and development requests validate only; they never write to the CRM or webhook. The new page clearly displays that distinction.
- The Meta Lead event fires only after confirmed production success; analytics payloads exclude contact information.

## Validation

Run `npm test`, `npm run build`, and `npm run check:growth`. Review `/el-paso-roofers` at desktop and phone widths, required-field validation, preview success, and delivery-failure retry. CRM integration tests use stubbed HTTP responses and synthetic contact data.
