"""Cheap experiment: sample inbound leads → TypeSafe judgments + policy."""
import json
from typesafe_sdk import TypeSafeClient
from lead_questions import QUESTIONS, decide

LEADS = [
    {
        "id": "L1",
        "label_guess": "good HS",
        "name": "Mike Torres",
        "business": "Torres Roofing LLC",
        "niche_hint": "roofing",
        "city": "El Paso, TX",
        "source": "meta_lead_ad",
        "message": "We need more estimate requests. Doing about 40k/mo in ads already. Can you hit the 50k revenue thing?",
    },
    {
        "id": "L2",
        "label_guess": "tire-kicker",
        "name": "Alex",
        "business": "side hustle",
        "niche_hint": "unknown",
        "city": "",
        "source": "website_chat",
        "message": "How much does marketing cost? Just curious for now.",
    },
    {
        "id": "L3",
        "label_guess": "fuel confusion",
        "name": "Pat Riley",
        "business": "",
        "niche_hint": "",
        "city": "Bangor, ME",
        "source": "organic",
        "message": "Do you deliver heating oil this week? My tank is low.",
    },
    {
        "id": "L4",
        "label_guess": "dental fit",
        "name": "Dr. Chen",
        "business": "Desert Smile Dental",
        "niche_hint": "dental",
        "city": "Phoenix, AZ",
        "source": "google",
        "message": "Looking for patient growth. Want to talk this week about Demand Flow.",
    },
    {
        "id": "L5",
        "label_guess": "vendor pitch",
        "name": "Sam",
        "business": "LinkBoost SEO",
        "niche_hint": "agency",
        "city": "Remote",
        "source": "contact_form",
        "message": "We sell guest posts. Interested in a partnership for Dead River?",
    },
    {
        "id": "L6",
        "label_guess": "ambiguous RE",
        "name": "Jordan Lee",
        "business": "Lee Team Realty",
        "niche_hint": "real estate",
        "city": "Austin, TX",
        "source": "referral",
        "message": "Might need help with leads next quarter. Not sure on budget yet.",
    },
    {
        "id": "L7",
        "label_guess": "ecommerce maybe",
        "name": "Chris",
        "business": "TrailKit Co",
        "niche_hint": "ecommerce",
        "city": "Denver, CO",
        "source": "linkedin",
        "message": "DTC outdoor gear brand. Want more paid acquisition. Ready to start a pilot.",
    },
    {
        "id": "L8",
        "label_guess": "job seeker",
        "name": "Taylor",
        "business": "",
        "niche_hint": "",
        "city": "El Paso",
        "source": "contact_form",
        "message": "Saw your growth. Are you hiring media buyers? Attaching resume.",
    },
]

rows = []
with TypeSafeClient() as client:
    for lead in LEADS:
        resp = client.system_one(state=lead, questions=QUESTIONS)
        a = resp.answers
        action, reason = decide(a)
        row = {
            "id": lead["id"],
            "label_guess": lead["label_guess"],
            "niche": a["niche"].choice,
            "niche_conf": round(a["niche"].confidence, 2),
            "accepted": round(a["accepted_candidate"].noul, 2),
            "intent_score": a["purchase_intent"].score,
            "spam": round(a["is_spam_or_junk"].noul, 2),
            "route_choice": a["route"].choice,
            "route_conf": round(a["route"].confidence, 2),
            "policy": action,
            "why": reason,
            "model": resp.model,
            "tokens_in": resp.usage.input_tokens if resp.usage else None,
            "tokens_out": resp.usage.output_tokens if resp.usage else None,
        }
        rows.append(row)
        print(
            f"{row['id']} [{lead['label_guess']}] → policy={row['policy']} "
            f"(route={row['route_choice']}@{row['route_conf']}, "
            f"niche={row['niche']}, accept={row['accepted']}, "
            f"intent={row['intent_score']}, spam={row['spam']}) — {row['why']}"
        )

out = "/workspace/typesafe-setup/lead_experiment_results.json"
with open(out, "w") as f:
    json.dump(rows, f, indent=2)
print("wrote", out)
