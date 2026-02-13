import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"🔑 API Key: {api_key[:15]}...")

# Test different endpoints
endpoints = [
    f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}",
    f"https://generativelanguage.googleapis.com/v1/models?key={api_key}",
    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}",
]

for i, endpoint in enumerate(endpoints):
    print(f"\n📡 Test {i+1}: {endpoint[:60]}...")
    try:
        if 'generateContent' in endpoint:
            # POST request for generation
            data = {
                "contents": [{
                    "parts": [{"text": "Say 'OK'"}]
                }]
            }
            response = requests.post(endpoint, json=data)
        else:
            # GET request for listing models
            response = requests.get(endpoint)
            
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ Success!")
            if 'models' in response.text:
                data = response.json()
                print(f"   📋 Available models:")
                for model in data.get('models', [])[:5]:
                    print(f"      • {model.get('name')}")
        else:
            print(f"   ❌ Error: {response.text[:100]}")
    except Exception as e:
        print(f"   ❌ Exception: {e}")