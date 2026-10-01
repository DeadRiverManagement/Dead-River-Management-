"""Single place for lead-triage TypeSafe questions + thresholds (review here)."""
from typesafe_sdk import Choice, Noul, Score

QUESTIONS = {
    "niche": Choice(
        instructions="Which business niche best matches this inbound lead",
        criteria={
            "home_services": "HVAC, plumbing, roofing, landscaping, remodeling, or similar trades",
            "dental_medspa": "Dental, med spa, or similar local clinical / aesthetic practice",
            "real_estate": "Real estate agent, team, or brokerage",
            "ecommerce": "Online store or DTC brand",
            "other_or_unknown": "Does not fit the niches above, or niche is unclear",
        },
    ),
    "accepted_candidate": Noul(
        instructions=(
            "This is likely an owner or decision-maker at a real operating business "
            "(home services, dental/med spa, real estate, or ecommerce) that Dead River "
            "could evaluate for Demand Flow. Treat clear operators asking about growth "
            "or Demand Flow as yes even if budget is incomplete. Treat tire-kickers, "
            "job seekers, vendor pitches, and fuel/propane delivery requests as no."
        ),
    ),
    "purchase_intent": Score(
        instructions="How ready this lead appears to buy growth / lead-gen services",
        criteria=[
            "Browsing or vague interest only",
            "Exploring options, not urgent",
            "Ready to talk with sales soon",
            "Ready to buy or start soon",
        ],
    ),
    "is_spam_or_junk": Noul(
        instructions=(
            "Mark yes only for clear junk: bot/spam form garbage, job/resume applications, "
            "agencies or vendors pitching their own services to Dead River, empty nonsense, "
            "or someone asking for heating oil / propane / fuel delivery (wrong company). "
            "Legitimate business owners asking about marketing, leads, or Demand Flow are NOT junk, "
            "even if short or from Meta/Google."
        ),
    ),
    "route": Choice(
        instructions="Best next handling for this lead given Dead River Demand Flow sales",
        criteria={
            "book_call": "Strong enough to push straight to book a sales call",
            "nurture": "Possible fit but not ready; nurture sequence",
            "decline": "Clear no-fit or junk; decline politely",
            "human_review": "Ambiguous; a human should decide",
        },
    ),
}

SPAM_DECLINE = 0.75
ACCEPT_LOW = 0.35
ACCEPT_MID_HIGH = 0.55
ROUTE_CONFIDENCE_MIN = 0.40


def decide(answers):
    spam = answers["is_spam_or_junk"].noul
    accept = answers["accepted_candidate"].noul
    route = answers["route"]
    if spam >= SPAM_DECLINE:
        return "decline", "high spam/junk"
    if answers["niche"].choice == "other_or_unknown" and accept < ACCEPT_LOW:
        return "decline", "unknown niche + low acceptance"
    # High acceptance + clear book_call: trust the choice even if confidence is soft
    # (confidence = distribution concentration, not "is this a good lead")
    if accept >= ACCEPT_MID_HIGH and route.choice == "book_call":
        return "book_call", "high accept + book_call"
    if ACCEPT_LOW <= accept < ACCEPT_MID_HIGH:
        return "human_review", "mid acceptance"
    if route.confidence < ROUTE_CONFIDENCE_MIN:
        return "human_review", "low route confidence"
    return route.choice, "follow route choice"
