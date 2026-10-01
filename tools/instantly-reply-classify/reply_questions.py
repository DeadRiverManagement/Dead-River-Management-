"""Instantly inbound-reply TypeSafe questions (Stage 1 classify only)."""
from typesafe_sdk import Choice, Noul

QUESTIONS = {
    "reply_class": Choice(
        instructions=(
            "Classify this inbound email reply to a Dead River Management cold outreach "
            "about Demand Flow / $50k new revenue in 45–60 days. Pick the single best label."
        ),
        criteria={
            "positive": (
                "Shows genuine interest in learning more, booking a call, discussing pricing, "
                "or evaluating the offer. Not a stop; not an auto-responder."
            ),
            "stop": (
                "Explicit unsubscribe, stop, remove me, no thanks, not interested, or similar "
                "opt-out / hard no."
            ),
            "ooo": (
                "Out-of-office or vacation auto-reply with return dates or temporary unavailability."
            ),
            "auto": (
                "Automated non-OOO response: booking redirect, ticket/helpdesk auto-ack, "
                "clinic/front-desk auto-reply, or other machine-generated message that is not "
                "a human showing interest."
            ),
            "other": (
                "Human reply that is none of the above: unclear, question without clear interest, "
                "wrong person, bounce text, or anything that needs a human look."
            ),
        },
    ),
    "needs_human": Noul(
        instructions=(
            "A human should review before any Instantly action or sales follow-up. "
            "Yes for ambiguous other, borderline positive, or anything that could be mislabeled."
        ),
    ),
}

# Escalate positives when confidence is soft
POSITIVE_CONFIDENCE_MIN = 0.45
HUMAN_REVIEW_NOUL = 0.55
