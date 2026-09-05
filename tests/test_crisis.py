"""Tests for the deterministic crisis router.

Runs with plain `python3 tests/test_crisis.py` — no app dependencies needed,
which is the point: the safety-critical path should be verifiable without
standing up FastAPI or holding a Gemini key.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend" / "api"))

from crisis import check_crisis, build_crisis_response, EMERGENCY_GUIDANCE, CRISIS_CATEGORIES

FAILURES = []


def expect(label, condition):
    if condition:
        print(f"  PASS  {label}")
    else:
        print(f"  FAIL  {label}")
        FAILURES.append(label)


print("\n-- must match (a miss here is the failure mode that matters) --")
MUST_MATCH = [
    ("I want to kill myself", "self_harm"),
    ("i dont want to be here anymore, im suicidal", "self_harm"),
    ("Honestly I just want to die", "self_harm"),
    ("I've been cutting myself again", "self_harm"),
    ("everyone would be better off dead without me", "self_harm"),
    ("I think I overdosed on my meds", "overdose"),
    ("i took all my pills about an hour ago", "overdose"),
    ("my husband keeps beating me", "violence"),
    ("I was raped last night", "violence"),
    ("I have crushing chest pain going down my arm", "medical_emergency"),
    ("my dad's face is drooping and his speech is slurred", "medical_emergency"),
    ("her face drooped on one side", "medical_emergency"),
    ("he's slurring his words and can't lift his arm", "medical_emergency"),
    ("I can't breathe and my throat is closing", "medical_emergency"),
    ("KILL MYSELF", "self_harm"),
    ("i want to\nkill    myself", "self_harm"),
]
for text, expected in MUST_MATCH:
    m = check_crisis(text)
    expect(f"{expected:18} <- {text[:44]!r}", m is not None and m.category == expected)

print("\n-- must NOT match (false positives erode trust in the whole feature) --")
MUST_NOT_MATCH = [
    "I need to find a therapist",
    "Can you help me book an appointment?",
    "I have a mild headache and a runny nose",
    "My assessment came back normal",
    "I'm classic type 2 diabetic",
    "What are the side effects of my blood pressure pills?",
    "I'd like to refill my prescription",
    "The pain in my knee is annoying",
]
for text in MUST_NOT_MATCH:
    expect(f"clean       <- {text[:44]!r}", check_crisis(text) is None)

print("\n-- triage priority: self-harm wins over co-occurring terms --")
m = check_crisis("I want to kill myself, my chest pain is unbearable")
expect("self_harm outranks medical_emergency", m is not None and m.category == "self_harm")

print("\n-- response payload is complete for every category --")
for category in CRISIS_CATEGORIES:
    guidance = EMERGENCY_GUIDANCE.get(category, "")
    expect(f"{category:18} has guidance", bool(guidance.strip()))
    expect(f"{category:18} names a phone number", any(n in guidance for n in ("911", "988", "1-800", "741741", "88788")))

from crisis import CrisisMatch
payload = build_crisis_response(CrisisMatch("self_harm", ["kill myself"]))
expect("payload flags model_bypassed", payload["model_bypassed"] is True)
expect("payload carries emergency widget", payload["widget"] == "emergency")
expect("payload has quick replies", len(payload["quick_replies"]) > 0)

print("\n-- empty / None input is safe --")
expect("None returns None", check_crisis(None) is None)
expect("empty string returns None", check_crisis("") is None)

print()
if FAILURES:
    print(f"FAILED: {len(FAILURES)} check(s)")
    sys.exit(1)
print("All crisis router checks passed.")
