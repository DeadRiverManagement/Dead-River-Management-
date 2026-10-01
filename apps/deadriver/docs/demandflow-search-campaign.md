# DemandFlow paused Search campaign specification

Updated September 25, 2026. Campaign **24293058610** was created and verified **paused** by the main implementation session in Google Ads account **571-783-6174**. This document distinguishes observed account settings from entry items still requiring save/read-back verification.

## Scope and evidence

The offer targets home-service business owners seeking help generating and converting inquiries. The landing page is https://www.deadrivermanagement.com/demandflow. The approved promise is **30 leads in 60 days or we work for free until we get them.** Eligibility and the written program terms apply. The ads do not promise sales, booked jobs, a refund, free advertising spend, or results for every applicant.

Repository sources: `src/pages/demandflow.astro`, `src/data/site.ts`, and `docs/case-study-keyword-research.md`. The business is based in El Paso and serves the borderland and other U.S. cities; this does not establish the account's current advertising geography. Copy the verified existing offer's geographic targets and exclusions, language, location-presence option, schedule, and relevant audience settings. Do not substitute the business address for campaign targeting.

Current first-party industry pages validate the vocabulary and business-owner intent of home-service marketing, contractor marketing, and trade-specific lead generation:

- [Scorpion home services](https://www.scorpion.co/home-services/)
- [Hook Agency contractor marketing](https://hookagency.com/contractor-marketing/)
- [Hook Agency HVAC marketing](https://hookagency.com/hvac-marketing/)
- [Hook Agency plumbing marketing](https://hookagency.com/plumbing-marketing/)

### Actual account Keyword Planner evidence

The main implementation session inspected Keyword Planner plan **1440128948** on September 25, 2026: **United States**, **Google**, **Last 12 months**. Planner displayed **All languages** with that control disabled; this differs from the campaign's verified **English** targeting. The UI did not supply a precise start/end date in the captured evidence. These are Planner historical estimates, not campaign results or traffic forecasts. Bid ranges are top-of-page estimates, not promised CPCs or settings to apply.

| Keyword | Average monthly searches | Competition | Low top-of-page bid (USD) | High top-of-page bid (USD) |
| --- | ---: | --- | ---: | ---: |
| contractor lead generation | 320 | Medium | $11.56 | $45.01 |
| contractor marketing agency | 590 | Medium | $10.00 | $30.00 |
| home service lead generation | 90 | Low | $8.51 | $24.88 |
| home services marketing agency | 590 | Low | $8.46 | $54.76 |
| hvac lead generation | 880 | Medium | $16.11 | $71.01 |
| hvac marketing agency | 880 | Medium | $14.41 | $92.36 |
| plumbing lead generation | 140 | Medium | $22.35 | $75.00 |
| plumbing marketing agency | 720 | Low | $12.94 | $75.00 |
| roofing lead generation | 1,300 | Medium | $14.42 | $47.92 |
| roofing marketing agency | 590 | Medium | $17.99 | $39.62 |

The list uses business-owner intent from these ten measured phrases. Each phrase is entered once as exact match and once as phrase match. Google's recommendations were not accepted. No search-volume claim is inferred for unmeasured terms.

## Campaign settings

| Setting | Value |
| --- | --- |
| Campaign ID | `24293058610` |
| Suggested name | DRM - DemandFlow - Search - Home Services; verify actual saved display name |
| Saved status | **Paused**; verify campaign, ads, and keywords after save |
| Campaign type | Search, standard keyword ad groups |
| Destination | `https://www.deadrivermanagement.com/demandflow` |
| AI Max | Off |
| Search-term matching expansion | Off; no broad-match keywords |
| Text customization / automatically created text | Off |
| Final URL expansion | Off |
| Networks | Google Search; leave Display and Search Partners off for this new campaign |
| Geography/language | **Verified:** United States, Presence, English, copied from the reference offer campaign |
| Schedule | Retain copied reference schedule; separately verify in final read-back |
| Budget | **Verified:** $20/day for the new paused campaign; no existing campaign budget changed |
| Bidding | **Verified:** Maximize conversions; no AI Max |
| Ad group | **Verified:** single `DemandFlow - Home Services` ad group |
| Active keyword definitions | **Verified:** 20 exact/phrase entries: 18 added plus 2 copied; 3 old copied keywords paused |
| Conversion goals | The verified CRM goals from the tracking implementation; no page-visit or watch-page goal |
| Auto-tagging | Retain/verify on so Google click IDs reach the landing page |
| Display paths | `demandflow` / `home-services` |

Suggested final URL suffix, using only supported ValueTrack identifiers:

```text
utm_source=google&utm_medium=cpc&utm_campaign=drm_demandflow_search_{campaignid}&utm_content={adgroupid}_{creative}&utm_term={keyword}
```

Do not replace or strip auto-tagged click IDs. The static campaign label plus numeric ID distinguishes this campaign in GHL without assuming an unsupported `{campaignname}` parameter.

## Keyword entry list

The account currently uses one Home Services ad group containing all 20 entries below. The following headings organize the entry list by trade; they do not claim separate ad groups were created.

### Home Services

```text
[home service lead generation]
"home service lead generation"
[home services marketing agency]
"home services marketing agency"
[contractor lead generation]
"contractor lead generation"
[contractor marketing agency]
"contractor marketing agency"
```

### Roofing

```text
[roofing lead generation]
"roofing lead generation"
[roofing marketing agency]
"roofing marketing agency"
```

### Plumbing

```text
[plumbing lead generation]
"plumbing lead generation"
[plumbing marketing agency]
"plumbing marketing agency"
```

### HVAC

```text
[hvac lead generation]
"hvac lead generation"
[hvac marketing agency]
"hvac marketing agency"
```

## Campaign negative keywords

Enter these **44** quoted phrases as campaign-level negative phrase matches. Save and verify their presence before reporting them implemented. Negative keywords do not automatically cover all close variants, so singular/plural employment and education forms are included where useful.

```text
"marketing jobs"
"marketing job"
"job openings"
"job opening"
"career"
"careers"
"salary"
"salaries"
"internship"
"internships"
"resume"
"course"
"courses"
"certification"
"certifications"
"college"
"university"
"degree"
"tutorial"
"tutorials"
"definition"
"meaning"
"pdf"
"ppt"
"template"
"templates"
"free software"
"free download"
"emergency plumber"
"plumber near me"
"roof repair near me"
"roof replacement cost"
"hvac repair near me"
"ac repair near me"
"furnace repair near me"
"drain cleaning near me"
"plumbing supplies"
"roofing materials"
"hvac parts"
"heating oil"
"fuel delivery"
"dead river company"
"dead river oil"
"dead river propane"
```

Do not add standalone negatives `free`, `jobs`, `repair`, `near me`, `cost`, or `price`: they could suppress legitimate business-owner searches or searches related to the actual promise. Do not automatically exclude competitors without search-term evidence.

## Responsive search ad copy

All headlines below fit Google's 30-character limit. For the existing single Home Services ad group use the 11 common headlines; the three trade headlines remain optional. Save and verify the responsive search ad before reporting this copy implemented.

| Headline | Characters |
| --- | ---: |
| Home Service Lead Generation | 28 |
| Home Services Marketing | 23 |
| Marketing For Contractors | 25 |
| DemandFlow By Dead River | 24 |
| 30 Leads In 60 Days | 19 |
| See If You Qualify | 18 |
| Book A Free Consultation | 24 |
| Build Demand For Your Business | 30 |
| Capture And Follow Up | 21 |
| Grow The Jobs You Want | 22 |
| Dead River Management | 21 |
| Roofing Lead Generation | 23 |
| Plumbing Lead Generation | 24 |
| HVAC Lead Generation | 20 |

Descriptions all fit the 90-character limit:

1. **30 leads in 60 days or we work for free until we get them. Eligibility and terms apply.** (87)
2. For home service business owners. Build demand, capture inquiries and follow up. (80)
3. See if your business qualifies for DemandFlow. Book a free consultation today. (78)
4. Connect campaigns, lead capture and follow-up around the jobs you want to grow. (79)

Pin description 1 to description position 1 so the complete promise and qualification appear together. Other descriptions can rotate. No automated text, dynamic keyword insertion, invented statistics, client names, prices, or unqualified guarantee claims are included.

## References for settings and entry formats

- [Keyword Planner](https://support.google.com/google-ads/answer/7337243?hl=en): actual account geography, keyword statistics, and forecasts.
- [Keyword matching](https://support.google.com/google-ads/answer/14996023?hl=en): exact/phrase meanings and overlap.
- [Negative keywords](https://support.google.com/google-ads/answer/2453972?hl=en): negative matching and variants.
- [Responsive search ads](https://support.google.com/google-ads/answer/7684791?hl=en): character limits and pinning behavior.
- [ValueTrack parameters](https://support.google.com/google-ads/answer/6305348?hl=en): supported tracking macros.
- [Text customization](https://support.google.com/google-ads/answer/11259373?hl=en): text customization is part of AI Max; leave off.
- [Final URL expansion in Search](https://support.google.com/google-ads/answer/16230205?hl=en): expansion settings; leave off.

## Save-time verification record

Confirmed by the main implementation session: campaign `24293058610` exists paused; United States Presence and English targeting; $20/day; Maximize conversions; no AI Max; one Home Services ad group; 20 exact/phrase keyword entries and 3 old keywords paused. Pending final read-back in this record: all 44 campaign negatives, saved RSA text/pinning, disabled text customization and URL expansion, network selection, auto-tagging, and the final CRM conversion goals. Existing campaigns' budgets and targeting are outside this edit.
