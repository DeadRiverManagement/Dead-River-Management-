# DRM site → monorepo Vercel env map (names only)

**Names only. Never commit or paste secret values.**

Monorepo copy of the 2026-10-01 env/secret **names** inventory. Facts below match that inventory. This file does not change Vercel, DNS, or production.

## `.env.example` is not in this commit

Phase A import places the site under `apps/deadriver/` with names-only `apps/deadriver/.env.example`.

## Access note (Phase A vs this inventory)

- Phase A import done inline (site zipball → `apps/deadriver/`). Cloud App site access no longer required for this tree.

## Source of truth today

| Surface | Finding |
|---|---|
| Vercel project `deadrivermanagement-site` (`prj_muUzDvNh04xM6p9YNBf6L6Es4DfG`, team `deadriver`) | **37** unique keys (below) |
| Vercel `deadriver-preview` | **0** envs |
| Vercel project for monorepo name | **none** (no `Dead-River-Management-` project) |
| GitHub Actions workflows site | **0** |
| GitHub Actions workflows monorepo | **0** |
| Site `.github/` | **absent** |
| Site `.env.example` | **absent** |
| Site tree env-related blobs | `astro.config.mjs`, `middleware.js`, `vercel.json` only (no committed secrets) |

## Phase B 1:1 map (recommended)

**Preferred (identity map — no secret copy):** Keep Vercel project `deadrivermanagement-site`. At cutover only change git connection → `Dead-River-Management-` + **Root Directory** `apps/deadriver` + Production Branch = monorepo default (`claude/magical-goldberg-ijl1j4`). All 37 keys stay on the same project → **1:1 = same names, same targets, same values (untouched).**

**Alt (new Vercel project):** Create project linked to monorepo; copy each of the 37 keys 1:1 (name→same name; preserve production vs preview targets). Then move domains — higher risk; not preferred.

### Map table (source → destination)

| Source (Vercel site project) | Dest (Phase B preferred) | Dest (alt new project) |
|---|---|---|
| each of 37 keys below | same key on same project | same key name on new project under Root `apps/deadriver` |

## Vercel keys (37)

| Key | Targets | Type |
|---|---|---|
| `CRON_SECRET` | production | sensitive |
| `DRM_GHL_LIFECYCLE_WEBHOOK_SECRET` | production | sensitive |
| `DRM_OUTREACH_WEBHOOK_SECRET` | production | sensitive |
| `ENABLE_GHL_LIFECYCLE_SYNC` | production | encrypted |
| `ENABLE_GOOGLE_PAYMENT_CONVERSIONS` | production | encrypted |
| `ENABLE_INSTANTLY_GHL_SYNC` | production | encrypted |
| `ENABLE_INSTANTLY_RECOVERY` | production | encrypted |
| `ENABLE_META_CAPI_TEST` | production | encrypted |
| `GHL_ACTIVITY_ASSOCIATION_ID` | production | encrypted |
| `GHL_ACTIVITY_CONTACT_IS_FIRST` | production | encrypted |
| `GHL_ACTIVITY_SCHEMA_KEY` | production | encrypted |
| `GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED` | production | encrypted |
| `GHL_COLD_EMAIL_INTERESTED_STAGE_ID` | production | encrypted |
| `GHL_COLD_EMAIL_PIPELINE_ID` | production | encrypted |
| `GHL_COLD_EMAIL_PRIOR_STAGE_IDS` | production | encrypted |
| `GHL_CONTACT_DEDUPLICATION_VERIFIED` | production | encrypted |
| `GHL_LIFECYCLE_CALENDAR_IDS` | production | encrypted |
| `GHL_LIFECYCLE_PAYLOAD_MAPPING_VERIFIED` | production | encrypted |
| `GHL_LIFECYCLE_STAGE_MAP` | production | encrypted |
| `GHL_LOCATION_ID` | preview, production | sensitive |
| `GHL_OPPORTUNITY_DEDUPLICATION_VERIFIED` | production | encrypted |
| `GHL_OUTREACH_AUTOMATIONS_REVIEWED` | production | encrypted |
| `GHL_OUTREACH_FIELD_IDS` | production | encrypted |
| `GHL_OUTREACH_PIT` | production | sensitive |
| `GHL_PAYMENT_AMOUNT_UNIT` | production | encrypted |
| `GHL_PAYMENT_CURRENCY_EXPONENTS` | production | encrypted |
| `GHL_PAYMENT_REVENUE_MAPPING_VERIFIED` | production | encrypted |
| `GHL_PIT` | preview, production | sensitive |
| `GOOGLE_PAYMENT_DESTINATION_VERIFIED` | production | encrypted |
| `INSTANTLY_API_KEY` | production | sensitive |
| `INSTANTLY_CAMPAIGN_IDS` | production | encrypted |
| `INSTANTLY_LIVE_ACTIVATED_AT` | production | encrypted |
| `INSTANTLY_WORKSPACE_ID` | production | encrypted |
| `META_CAPI_ACCESS_TOKEN` | production | sensitive |
| `META_CAPI_TEST_EVENT_CODE` | production | encrypted |
| `META_GRAPH_API_VERSION` | production | encrypted |
| `STRIPE_WEBHOOK_SECRET` | production | sensitive |

### Sensitive subset (treat as secrets)

`CRON_SECRET`, `DRM_GHL_LIFECYCLE_WEBHOOK_SECRET`, `DRM_OUTREACH_WEBHOOK_SECRET`, `GHL_LOCATION_ID`, `GHL_OUTREACH_PIT`, `GHL_PIT`, `INSTANTLY_API_KEY`, `META_CAPI_ACCESS_TOKEN`, `STRIPE_WEBHOOK_SECRET`

### Preview-target keys (only 2)

`GHL_LOCATION_ID`, `GHL_PIT` — also on production. Preview smoke for GHL-touching routes needs these; most other keys are production-only (preview APIs intentionally 409 for some legacy paths).

## Code-referenced names NOT in Vercel 37 (gaps)

From site API libs (names only; may be optional / unset / elsewhere):

| Name | Notes |
|---|---|
| `STRIPE_SECRET_KEY` | Optional enrich/stamp in `api/stripe/onboarding.js` — **not** in Vercel list |
| `STRIPE_RESTRICTED_KEY` | Alt to secret key — **not** in Vercel list |
| `GHL_ATTRIBUTION_FIELD_IDS` | Optional override; code falls back to committed JSON |
| `ENABLE_GHL_LIFECYCLE_HISTORY_IMPORT` | Gate for historical import |
| `GHL_HISTORICAL_IMPORT_SAFE` | Gate for historical import |
| Google Ads payment auth | Uses **Vercel OIDC** + GCP WIF (`@vercel/oidc` / workload identity) — **no** long-lived Google JSON key in Vercel (by design) |

## Ownership — do NOT collapse

| Step / surface | Owner | Notes |
|---|---|---|
| Monorepo `.claude/`, OmniRoute, `ANTHROPIC_API_KEY`, graphify | **Claude** | Stays Claude; not part of site Vercel env move |
| Site Astro/API code under future `apps/deadriver/` | **Reed** (codes) / Rowan routes / Quinn SEO ships when assigned | Cursor/Grok bot lane |
| Phase A import PR into `apps/deadriver/` | **Reed** (inline) | Tree + names-only `.env.example` in this PR. |
| Names-only env map doc in monorepo | **Reed** | This file. No values. |
| Vercel env values reside / Phase B Root Directory + git retarget | **Brandon OK via Marlow**; Rowan coordinates; **do not** flip without Phase B OK | Prefer keep same Vercel project |
| Prod DNS / domain moves | **Brandon OK** — none in this ask | No flip now |
| Instantly Stage 1 classify (separate) | Ivy read / Reed code / Rowan route | Unrelated to Vercel secret copy. See [`tools/instantly-reply-classify/`](../../tools/instantly-reply-classify/) (classify only; no Instantly API mutations). |
| Paid ads spend / Meta-Google changes | Kai lane; Brandon OK | Unrelated |

## Out of scope / no action this pass

- No prod/DNS flip
- No Vercel Root Directory change yet
- No secret values copied or printed
- Claude monorepo tooling secrets untouched
- Phase A site import is this PR

## Future `apps/deadriver/.env.example` — names-only placeholders

Commented list for the file that lands with the Phase A import. Every line is a name with an empty value. Do not fill these in git.

```bash
# apps/deadriver/.env.example
# Names only. Never commit values.
# Lands with Phase A import — not added while apps/deadriver is absent.

# --- Vercel keys (37) ---
# CRON_SECRET=
# DRM_GHL_LIFECYCLE_WEBHOOK_SECRET=
# DRM_OUTREACH_WEBHOOK_SECRET=
# ENABLE_GHL_LIFECYCLE_SYNC=
# ENABLE_GOOGLE_PAYMENT_CONVERSIONS=
# ENABLE_INSTANTLY_GHL_SYNC=
# ENABLE_INSTANTLY_RECOVERY=
# ENABLE_META_CAPI_TEST=
# GHL_ACTIVITY_ASSOCIATION_ID=
# GHL_ACTIVITY_CONTACT_IS_FIRST=
# GHL_ACTIVITY_SCHEMA_KEY=
# GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED=
# GHL_COLD_EMAIL_INTERESTED_STAGE_ID=
# GHL_COLD_EMAIL_PIPELINE_ID=
# GHL_COLD_EMAIL_PRIOR_STAGE_IDS=
# GHL_CONTACT_DEDUPLICATION_VERIFIED=
# GHL_LIFECYCLE_CALENDAR_IDS=
# GHL_LIFECYCLE_PAYLOAD_MAPPING_VERIFIED=
# GHL_LIFECYCLE_STAGE_MAP=
# GHL_LOCATION_ID=
# GHL_OPPORTUNITY_DEDUPLICATION_VERIFIED=
# GHL_OUTREACH_AUTOMATIONS_REVIEWED=
# GHL_OUTREACH_FIELD_IDS=
# GHL_OUTREACH_PIT=
# GHL_PAYMENT_AMOUNT_UNIT=
# GHL_PAYMENT_CURRENCY_EXPONENTS=
# GHL_PAYMENT_REVENUE_MAPPING_VERIFIED=
# GHL_PIT=
# GOOGLE_PAYMENT_DESTINATION_VERIFIED=
# INSTANTLY_API_KEY=
# INSTANTLY_CAMPAIGN_IDS=
# INSTANTLY_LIVE_ACTIVATED_AT=
# INSTANTLY_WORKSPACE_ID=
# META_CAPI_ACCESS_TOKEN=
# META_CAPI_TEST_EVENT_CODE=
# META_GRAPH_API_VERSION=
# STRIPE_WEBHOOK_SECRET=

# --- Code-gap names (referenced in site code, not in the Vercel 37) ---
# STRIPE_SECRET_KEY=
# STRIPE_RESTRICTED_KEY=
# GHL_ATTRIBUTION_FIELD_IDS=
# ENABLE_GHL_LIFECYCLE_HISTORY_IMPORT=
# GHL_HISTORICAL_IMPORT_SAFE=
```
