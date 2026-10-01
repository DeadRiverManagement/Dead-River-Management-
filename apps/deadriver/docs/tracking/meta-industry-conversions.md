# Meta industry inquiry tracking

Configured September 26, 2026 for Dead River Management ad account
`1511879113740285`, existing pixel `4422109568077296`.

## Published browser tag

GTM container `GTM-TPRWMXP9`, live version **6**. One existing tag was updated,
not duplicated: **Meta - Industry Lead (saved inquiry)** (tag 4).
**DLV - DRM Industry** (variable 7) reads data-layer field `industry`, version 2,
without a default. Existing **DLV - DRM Event ID** and the saved-inquiry trigger
remain in use. Version 5 saved the variable and tag name; version 6 contains the
verified industry-aware HTML in `meta-saved-inquiry.html`.

The tag accepts only saved `drm_lead_submitted` events on `/book` or
`/demandflow`, requires the saved inquiry receipt, and sends one `Lead` with the
existing receipt as `eventID`. It sends the allowlisted industry as `industry`
and a readable industry category. Unknown or missing industries are excluded.
Calendar, thank-you and watch page visits do not trigger it.

## Custom conversions

Every conversion uses this pixel, event **Lead**, and an exact event-parameter
rule. These rules do not use page views or assign invented monetary values.

| Name | `industry` equals | Conversion ID |
| --- | --- | --- |
| DRM - Home Services - Saved Inquiry | home-services | 1072169722398246 |
| DRM - Dental - Saved Inquiry | dental | 1767917980922079 |
| DRM - Real Estate - Saved Inquiry | real-estate | 4150542495243709 |
| DRM - E-commerce - Saved Inquiry | ecommerce | 1661973815519954 |
| DRM - Med Spas - Saved Inquiry | med-spas | 1627515848995857 |

Use the matching conversion as the optimization goal when preparing each
industry's campaign. These are business owners inquiring about DRM's agency
services, not patient, treatment, credit or other sensitive consumer records.

## Campaign status and limits

The sole existing Home Service campaign is off. Its published Demand Flow ad
set `120249847687370352` has a locked generic Lead selector. A replacement
**Home Services - Saved Inquiry - Paused Replacement** was prepared as a draft
with its switch off, using conversion `1072169722398246`:
ad set `120249861902270352`. It duplicates the existing four ads and settings,
with all duplication recommendations deselected. No budgets, targeting or
creative were edited. The original was not deleted or switched on.

The replacement is NOT published. Review its inherited ads against the new
offer before using it; select the replacement rather than running both ad sets.
No other industry campaigns existed during this check, so none were invented.

Meta initially reports all five new rules inactive / never received event.
Creation and local tests do not establish receipt of a genuine conversion.
The replacement similarly warns that its custom conversion is inactive.
The existing server-side CAPI enablement/deduplication gates were not changed;
this change does not claim to complete server-side industry milestone tracking
or clear prior Google/Meta diagnostics.

## Validation

Automated tests cover all five labels, event IDs, excluded routes and unknown
industries. A separate check downloaded the actual published GTM version 6,
executed its compiled tag in an isolated VM, and confirmed the same behavior
with one tag. No Meta events, real prospects, appointments or payments were
created by those tests. Await an eligible saved inquiry and verify the matching
rule in Events Manager before calling platform receipt verified.
