# TypeSafe lab (Dead River)

Local TypeSafe System One experiments for Dead River lead triage and smoke tests.

## Setup

```bash
cd tools/typesafe
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export TYPESAFE_API_KEY=...   # env-only; never commit
python smoke_test.py
python lead_experiment.py
```

`TYPESAFE_API_KEY` stays environment-only. Do not commit `.venv/`, `__pycache__/`, or `results/` (may contain run output).

Keys: https://console.typesafe.ai/keys  
Docs: https://docs.typesafe.ai/introduction/quickstart

## Files

- `smoke_test.py` — quickstart ticket triage
- `lead_questions.py` — Demand Flow lead-triage questions + policy thresholds
- `lead_experiment.py` — sample inbound leads → judgments + policy
- `requirements.txt` — `typesafe-sdk`
