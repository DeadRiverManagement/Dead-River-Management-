# DemandFlow VSL launch

Brandon approved the supplied video as-is and requested removal of motion and the pause control from the homepage trust section, followed by publication.

## Public routes
- Facebook ad destination: https://www.deadrivermanagement.com/demandflow
- Calendar after confirmed inquiry delivery: /demandflow/book
- Pre-call VSL: https://www.deadrivermanagement.com/demandflow/watch

The approved MP4 is served from the confirmed uploaded CDN URL in watch.astro, not a temporary ChatGPT URL. Uploaded file: Dead River Management — DemandFlow™ Pre-Call VSL_1080p.mp4. Original size 61,027,180 bytes; 1920x1080; H.264 video and AAC audio; duration 296.405 seconds; SHA-256 11922be46d2b9a5c32ae7e7a5eaf626e4471df3284256f9dbdd7220857867aba. No edits or transcoding were performed. The video has native playback controls, inline mobile playback, no autoplay, and a direct-open fallback. The CDN returned HTTP 206 and the correct total file size for a byte-range request.

## Booking to video
The booking page has an explicit 'Already booked? Watch the pre-call video' link. It does not report page views or lead-form submissions as appointments.

For an AUTOMATIC redirect after a confirmed booking, the existing GHL calendar rfaj3m31onqPQEFYhwyE must have its confirmation-page Redirect URL set to https://www.deadrivermanagement.com/demandflow/watch. The currently connected tools do not expose GHL calendar settings, so that external setting has NOT been changed by this commit. Do not describe it as configured or verified. The watch page can promote itself out of our own same-origin booking iframe if GHL redirects within that iframe. This is not a booking-success event and fires no Schedule conversion.

The native GHL calendar continues to manage actual availability, bookings, and confirmation messages. No reminder or marketing-text workflow was changed. No dummy production booking is required by tests.

## Verification
Use the PR and deployment status for current build verification. tests/demandflow-publish.test.mjs covers static trust removal, the approved video URL and playback behavior, the post-booking link, preservation of the supplied calendar, and sitemap exclusion. Validate real hosted playback and the preview form handoff without sending test leads to production.
