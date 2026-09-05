"""End-to-end checks that crisis input never reaches the model, on both channels.

Run from the repo root:  python3 tests/test_endpoints.py
Requires the backend dependencies (pip install -r requirements.txt) plus httpx.
Runs the app in mock mode - no Gemini key needed and no real API call is made.
"""
import sys, os
from pathlib import Path

_BACKEND = Path(__file__).resolve().parent.parent / "backend"
os.chdir(_BACKEND)
sys.path.insert(0, str(_BACKEND))
# Force mock mode: no key, so no real Gemini call leaves the machine.
os.environ.pop("GEMINI_API_KEY", None)

from fastapi.testclient import TestClient
from main import app

c = TestClient(app)
fails = []

def check(label, cond, extra=""):
    print(("  PASS  " if cond else "  FAIL  ") + label + (f"  {extra}" if extra and not cond else ""))
    if not cond: fails.append(label)

print("\n-- crisis message on REST chat --")
r = c.post("/api/chat", json={"message": "I want to kill myself", "patient_id": "p1"})
check("200 OK", r.status_code == 200, r.text[:200])
b = r.json()
check("model bypassed", b.get("metadata", {}).get("model_bypassed") is True, str(b.get("metadata")))
check("category = self_harm", b.get("metadata", {}).get("crisis_category") == "self_harm")
check("no model attributed", b.get("metadata", {}).get("ai_model") is None)
check("988 in response", "988" in b["response"])
check("emergency widget", b.get("widget") == "emergency")
check("metadata now survives serialization", "metadata" in b and b["metadata"] is not None)
print("  response begins:", repr(b["response"][:80]))

print("\n-- ordinary message still reaches the model path --")
r2 = c.post("/api/chat", json={"message": "I have a mild headache", "patient_id": "p1"})
check("200 OK", r2.status_code == 200, r2.text[:200])
b2 = r2.json()
check("not flagged as crisis", b2.get("metadata", {}).get("model_bypassed") is None)
check("model path attributed", b2.get("metadata", {}).get("ai_model") is not None)
check("conversation_id present", bool(b2.get("conversation_id")))
check("quick_replies present", bool(b2.get("quick_replies")))

print("\n-- crisis on the VOICE webhook (same module) --")
r3 = c.post("/webhooks/retell/real", json={"call_id": "call_1", "transcript": "I took all my pills an hour ago"})
check("200 OK", r3.status_code == 200, r3.text[:300])
b3 = r3.json()
flat = str(b3)
check("routed as crisis", "crisis" in flat and "overdose" in flat, flat[:300])
check("poison control in guidance", "1-800-222-1222" in flat)

print("\n-- ordinary voice transcript unaffected --")
r4 = c.post("/webhooks/retell/real", json={"call_id": "call_2", "transcript": "I need to refill my prescription"})
check("200 OK", r4.status_code == 200, r4.text[:200])
check("not crisis", "overdose" not in str(r4.json()))

print()
if fails:
    print(f"FAILED: {len(fails)}"); sys.exit(1)
print("End-to-end smoke test passed.")
