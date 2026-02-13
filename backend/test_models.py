import os
from google import genai
from dotenv import load_dotenv

# Load environment
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"🔑 API Key: {api_key[:15]}...")

# Initialize client
client = genai.Client(api_key=api_key)

print("\n📋 Testing available models...")

# Try different model name formats
models_to_test = [
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro",
    "models/gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
]

for model_name in models_to_test:
    try:
        print(f"\n🤔 Testing: {model_name}")
        response = client.models.generate_content(
            model=model_name,
            contents="Say 'OK' if you can hear me"
        )
        print(f"✅ SUCCESS! Response: {response.text[:50]}")
    except Exception as e:
        print(f"❌ Failed: {str(e)[:80]}")