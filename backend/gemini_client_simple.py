import os
import google.generativeai as genai
from typing import Dict, Any
import asyncio
from dotenv import load_dotenv

load_dotenv()

class SimpleGeminiClient:
    """Simple working Gemini client for AI Studio keys"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.mock_mode = True
        
        if not self.api_key or self.api_key == "YOUR_REAL_API_KEY_HERE":
            print("❌ No valid API key found")
            return
            
        try:
            print(f"🔑 Configuring Gemini with AI Studio key...")
            genai.configure(api_key=self.api_key)
            
            # AI Studio keys work with these models
            # Try gemini-1.5-flash first (fastest)
            model_names = [
                'gemini-1.5-flash',      # Fast model for AI Studio
                'gemini-1.5-pro',        # Pro model
                'gemini-pro',             # Legacy
            ]
            
            self.model = None
            for model_name in model_names:
                try:
                    print(f"🤖 Testing {model_name}...")
                    test_model = genai.GenerativeModel(model_name)
                    # Quick test
                    test_response = test_model.generate_content("Hello")
                    if test_response.text:
                        self.model = test_model
                        print(f"✅ Success with {model_name}")
                        self.mock_mode = False
                        break
                except Exception as e:
                    print(f"  ❌ {model_name} failed: {str(e)[:50]}")
                    
            if self.mock_mode:
                print("⚠️ All models failed, using mock mode")
                
        except Exception as e:
            print(f"❌ Setup error: {e}")
    
    async def generate_response(self, message: str, context: Dict[str, Any] = None):
        """Generate AI response"""
        
        if self.mock_mode or not self.model:
            # Mock response for "im sick"
            if "sick" in message.lower():
                return {
                    "content": """I understand you're feeling sick. Here's some guidance:

🤒 Common Steps:
• Rest and stay hydrated
• Monitor your temperature
• Note your symptoms

🏥 When to see a doctor:
• Fever over 103°F (39.4°C)
• Severe pain
• Difficulty breathing
• Symptoms lasting > 3 days

Would you like to:
1. Schedule an appointment
2. Speak with a nurse
3. Get symptom-specific advice""",
                    "sources": ["HealthGuard AI"],
                    "confidence": 0.95,
                    "model_used": "Mock",
                    "is_mock": True
                }
            
            return {
                "content": f"I understand: '{message}'. How can I help with your healthcare needs?",
                "sources": ["HealthGuard AI"],
                "confidence": 0.95,
                "model_used": "Mock",
                "is_mock": True
            }
        
        try:
            # Real Gemini call
            prompt = f"""You are HealthGuard AI, a healthcare assistant.
Patient: {message}

Provide helpful medical guidance. Be professional and caring."""
            
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            
            return {
                "content": response.text,
                "sources": ["Google Gemini AI"],
                "confidence": 0.95,
                "model_used": "Gemini",
                "is_mock": False
            }
            
        except Exception as e:
            print(f"❌ API error: {e}")
            return {
                "content": "I'm here to help with your health concerns. Could you tell me more about your symptoms?",
                "sources": ["HealthGuard AI"],
                "confidence": 0.85,
                "model_used": "Fallback",
                "is_mock": True
            }

# Test it
if __name__ == "__main__":
    import asyncio
    
    async def test():
        client = SimpleGeminiClient()
        print("\n🧪 Testing with 'I'm sick'...")
        result = await client.generate_response("I'm sick")
        print(f"\n📝 Response:\n{result['content']}")
        print(f"\n📊 Mode: {'REAL' if not result['is_mock'] else 'MOCK'}")
    
    asyncio.run(test())