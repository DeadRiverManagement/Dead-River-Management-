# Instantly ↔ TypeSafe/Jev reply classify (Stage 1)

Dead River inbound Instantly reply classifier using TypeSafe System One (Jev).

**Classify only. This tool never calls the Instantly API and never mutates Instantly** — no pause, resume, campaign, copy, lead, or webhook writes.

Sits alongside [`tools/typesafe-lead-triage/`](../typesafe-lead-triage/). Ivy Stage 1 reads stay outside this directory; they only feed normalized reply JSON in.

## Labels

`positive` | `stop` | `ooo` | `auto` | `other`

Plus `needs_human` (Noul). Escalate **positives first** when confidence ≥ `POSITIVE_CONFIDENCE_MIN` (see `reply_questions.py`). A positive below that threshold, `other`, or `needs_human` Noul ≥ `HUMAN_REVIEW_NOUL` is flagged for a human.

## Setup

```bash
cd tools/instantly-reply-classify
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export TYPESAFE_API_KEY=... # https://console.typesafe.ai/keys
```

## Commands

```bash
python classify_batch.py seed_replies.json
# writes seed_replies-classified.json (gitignored; may contain PII — do not commit)

python classify_batch.py path/to/normalized_replies.json
```

Normalized input items need: `id`, `campaign`, `from`, `subject`, `body` (or `snippet`).

Questions and the positives-first soft confidence threshold live in `reply_questions.py` (edit there only).

**Do not commit** `.venv/`, `__pycache__/`, API keys, live Instantly dumps, or classified result JSON that may contain PII. `seed_replies.json` is synthetic seed data only.

## Out of scope

Instantly API mutations, campaign pause/resume, sales reply drafts, and agent-side Ivy poll watches.
