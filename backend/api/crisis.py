"""
Deterministic crisis routing.

This module runs BEFORE the language model on every inbound message, on every
channel. When it matches, the model is never called and the caller returns a
fixed, reviewed response.

Design notes, because the reasoning matters more than the code here:

* A generated response is the wrong artifact when someone is in danger. Model
  output is non-deterministic and cannot be signed off by a clinician ahead of
  time. The strings in EMERGENCY_GUIDANCE can be.
* Matching is deliberately biased toward false positives. Showing a crisis card
  to someone who was speaking figuratively is a mild annoyance; missing a real
  disclosure is not. There is no negation handling ("I don't want to kill
  myself" still matches) and that is intentional, not an oversight.
* Matching is on word boundaries, not substrings, so that "therapist" does not
  match "rapist" and "assessment" does not match "ass". Substring matching on
  crisis terms produces exactly the kind of absurd false positive that erodes
  trust in the whole feature.

Scope limits a reviewer should know about:

* The phone numbers below are US-only. A real deployment needs to resolve
  resources from the patient's locale before this is fit for use outside the US.
* This is keyword matching. It will not catch obfuscation, misspellings, or
  indirect disclosure. It is a floor, not a substitute for human escalation.
"""

import re
from typing import Dict, List, NamedTuple, Optional

__all__ = ["CrisisMatch", "check_crisis", "build_crisis_response", "CRISIS_CATEGORIES"]


class CrisisMatch(NamedTuple):
    category: str
    matched_terms: List[str]


# Ordered by triage priority: the first category to match wins, so that an
# active self-harm disclosure is not routed as a generic medical emergency.
CRISIS_CATEGORIES: Dict[str, List[str]] = {
    "self_harm": [
        "kill myself", "killing myself", "end my life", "ending my life",
        "take my own life", "taking my own life", "suicide", "suicidal",
        "want to die", "wanna die", "wish i was dead", "wish i were dead",
        "better off dead", "no reason to live", "nothing to live for",
        "hurt myself", "hurting myself", "harm myself", "harming myself",
        "cut myself", "cutting myself", "self harm", "self-harm",
    ],
    "overdose": [
        "overdose", "overdosed", "od'd", "took too many pills",
        "took all my pills", "swallowed pills", "poisoned myself",
    ],
    "violence": [
        "kill him", "kill her", "kill them", "kill someone",
        "hurt someone", "hurt somebody", "shoot up",
        "being abused", "he hits me", "she hits me", "they hit me",
        "beating me", "raped", "sexual assault",
    ],
    "medical_emergency": [
        "chest pain", "crushing chest", "can't breathe", "cant breathe",
        "cannot breathe", "not breathing", "stopped breathing",
        "unconscious", "unresponsive", "passed out and", "having a stroke",
        # Stroke wording varies a lot in practice ("face drooping", "face is
        # drooping", "his face drooped"), so match the distinctive single words
        # rather than trying to enumerate every phrasing.
        "drooping", "drooped", "slurred", "slurring",
        "having a heart attack",
        "heart attack", "anaphylaxis", "anaphylactic", "throat closing",
        "bleeding heavily", "won't stop bleeding", "wont stop bleeding",
        "coughing up blood", "seizure that won't stop",
    ],
}

# Precompiled word-boundary patterns. \b on both ends of the whole phrase; the
# phrase's own internal spaces are allowed to be any run of whitespace so that
# "kill   myself" across a line break still matches.
_COMPILED: Dict[str, List[tuple]] = {
    category: [
        (term, re.compile(r"\b" + r"\s+".join(re.escape(w) for w in term.split()) + r"\b"))
        for term in terms
    ]
    for category, terms in CRISIS_CATEGORIES.items()
}


def check_crisis(text: Optional[str]) -> Optional[CrisisMatch]:
    """Return a CrisisMatch if the text discloses a crisis, else None.

    Runs on raw user input before any model call. Cheap enough (a few dozen
    precompiled regexes) to sit in the hot path of every request.
    """
    if not text:
        return None

    lowered = text.lower()
    for category, patterns in _COMPILED.items():
        hits = [term for term, pattern in patterns if pattern.search(lowered)]
        if hits:
            return CrisisMatch(category=category, matched_terms=hits)
    return None


_LIFELINE = (
    "📞 **Call or text 988** — Suicide & Crisis Lifeline (US), 24/7, free.\n"
    "💬 **Text HOME to 741741** — Crisis Text Line.\n"
    "🚨 **Call 911** if you are in immediate danger."
)

EMERGENCY_GUIDANCE: Dict[str, str] = {
    "self_harm": (
        "I'm glad you told me. I'm not able to help with this the way you "
        "deserve, but people who can are available right now.\n\n"
        f"{_LIFELINE}\n\n"
        "If you are not safe on your own right now, please get to your nearest "
        "emergency room or ask someone you trust to stay with you until you can."
    ),
    "overdose": (
        "This needs immediate medical help — please do not wait to see how you feel.\n\n"
        "🚨 **Call 911 now** (US), or your local emergency number.\n"
        "☎️ **Poison Control: 1-800-222-1222** — 24/7, free, and they will talk you through it.\n\n"
        "Do not try to make yourself vomit unless a professional tells you to. "
        "If you can, stay on the line with someone and keep the bottle or packaging nearby."
    ),
    "violence": (
        "Your safety comes first here.\n\n"
        "🚨 **Call 911** if you are in danger right now.\n"
        "📞 **1-800-799-7233** — National Domestic Violence Hotline (US), 24/7.\n"
        "📞 **1-800-656-4673** — RAINN National Sexual Assault Hotline (US), 24/7.\n\n"
        "If it is not safe to speak, you can text START to 88788."
    ),
    "medical_emergency": (
        "This may be a medical emergency. Please stop reading and get help now.\n\n"
        "🚨 **Call 911** (US) or your local emergency number.\n\n"
        "Do not drive yourself. If you are alone, unlock your door and stay on "
        "the phone with the dispatcher — they will tell you what to do next."
    ),
}

QUICK_REPLIES: Dict[str, List[str]] = {
    "self_harm": ["🚨 Call 988", "💬 Text a counselor", "Find a safe place", "Talk to a person"],
    "overdose": ["🚨 Call 911", "☎️ Poison Control", "Talk to a person"],
    "violence": ["🚨 Call 911", "📞 Domestic violence hotline", "Talk to a person"],
    "medical_emergency": ["🚨 Call 911", "Find nearest ER", "Talk to a person"],
}


def build_crisis_response(match: CrisisMatch) -> Dict[str, object]:
    """Build the fixed response payload for a matched crisis.

    Returns the same shape the model path returns, so callers can substitute it
    without special-casing their response construction.
    """
    return {
        "content": EMERGENCY_GUIDANCE[match.category],
        "quick_replies": QUICK_REPLIES[match.category],
        "widget": "emergency",
        "crisis_category": match.category,
        "matched_terms": match.matched_terms,
        "model_bypassed": True,
    }
