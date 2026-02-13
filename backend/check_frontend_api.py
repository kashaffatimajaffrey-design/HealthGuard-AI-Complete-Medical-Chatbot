import requests
import json

# Test different possible endpoints
base_url = "http://localhost:8000"
endpoints = [
    "/api/chat",
    "/chat", 
    "/api/v1/chat",
    "/api/chat/message",
    "/api/gemini/chat"
]

test_message = {
    "message": "I'm sick",
    "patient_id": "test_user"
}

print("🔍 Testing API endpoints...\n")

for endpoint in endpoints:
    url = f"{base_url}{endpoint}"
    try:
        print(f"Testing: {url}")
        response = requests.post(url, json=test_message, timeout=2)
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Working! Response: {data.get('response', '')[:50]}...")
        else:
            print(f"  ❌ Failed: {response.text[:100]}")
    except Exception as e:
        print(f"  ❌ Error: {type(e).__name__}")
    print()