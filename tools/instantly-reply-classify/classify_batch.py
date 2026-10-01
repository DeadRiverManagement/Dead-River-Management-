#!/usr/bin/env python3
"""Classify Instantly inbound replies with TypeSafe/Jev. Stage 1 — no Instantly mutations."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from typesafe_sdk import TypeSafeClient

from reply_questions import HUMAN_REVIEW_NOUL, POSITIVE_CONFIDENCE_MIN, QUESTIONS


def classify_one(client: TypeSafeClient, reply: dict) -> dict:
    state = {
        "campaign": reply.get("campaign") or "",
        "from": reply.get("from") or "",
        "subject": reply.get("subject") or "",
        "body": reply.get("body") or reply.get("snippet") or "",
    }
    response = client.system_one(state=state, questions=QUESTIONS)
    rc = response.answers["reply_class"]
    human = response.answers["needs_human"]
    label = rc.choice
    escalate_positive = label == "positive" and rc.confidence >= POSITIVE_CONFIDENCE_MIN
    flag_human = human.noul >= HUMAN_REVIEW_NOUL or (
        label == "positive" and rc.confidence < POSITIVE_CONFIDENCE_MIN
    ) or label == "other"
    return {
        "id": reply.get("id"),
        "campaign": state["campaign"],
        "from": state["from"],
        "label": label,
        "confidence": round(rc.confidence, 4),
        "probabilities": {k: round(v, 4) for k, v in rc.probabilities.items()},
        "needs_human_noul": round(human.noul, 4),
        "escalate_positive": escalate_positive,
        "flag_human": flag_human,
        "model": response.model,
        "usage": {
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
        },
    }


def main() -> int:
    path = Path(sys.argv[1] if len(sys.argv) > 1 else "seed_replies.json")
    replies = json.loads(path.read_text())
    out = []
    with TypeSafeClient() as client:
        for reply in replies:
            out.append(classify_one(client, reply))
    positives = [r for r in out if r["escalate_positive"]]
    summary = {
        "source": str(path),
        "count": len(out),
        "by_label": {},
        "positives": positives,
        "results": out,
    }
    for r in out:
        summary["by_label"][r["label"]] = summary["by_label"].get(r["label"], 0) + 1
    out_path = path.with_name(path.stem + "-classified.json")
    out_path.write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps({"wrote": str(out_path), "by_label": summary["by_label"], "positives": len(positives)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
