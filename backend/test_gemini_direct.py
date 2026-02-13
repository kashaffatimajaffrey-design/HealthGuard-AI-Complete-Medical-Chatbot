import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("GEMINI_API_KEY")
print(f"🔑 API Key: {api_key[:15]}..." if api_key else "❌ No API key found")

# Configure Gemini
genai.configure(api_key=api_key)

# List available models
print("\n📋 Available models:")
models = genai.list_models()
for model in models:
    if 'generateContent' in model.supported_generation_methods:
        print(f"  • {model.name}")

# Test with the correct model for AI Studio
print("\n🧪 Testing with gemini-1.5-flash...")
model = genai.GenerativeModel('gemini-1.5-flash')

try:
    response = model.generate_content("I'm sick. What should I do?")
    print(f"✅ Success!")
    print(f"\n📝 Response:\n{response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
    