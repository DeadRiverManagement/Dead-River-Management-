# TypeSafe lead triage (lab)

Dead River inbound-lead ICP / intent / routing experiments using TypeSafe System One (Jev).

## Setup

```bash
cd tools/typesafe-lead-triage
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export TYPESAFE_API_KEY=... # https://console.typesafe.ai/keys
```

## Commands

```bash
python smoke_test.py          # quick API sanity check
python lead_experiment.py     # 8 sample leads → policy decisions
```

Questions and thresholds live in `lead_questions.py` (edit there only).

**Do not commit** `.venv/`, `__pycache__/`, API keys, or result dumps that might contain secrets.

This is a lab — not wired to GHL / Meta / site forms yet.
