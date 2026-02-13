import os
from google import genai
from typing import Dict, Any
import asyncio
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

class GeminiClient:
    """New Gemini client using google.genai package"""
    
    def __init__(self):
        self.mock_mode = True
        api_key = os.getenv("GEMINI_API_KEY")
        
        print(f"\n{'='*60}")
        print("🚀 Initializing New Gemini Client...")
        print(f"🔑 API Key: {'✅ Found' if api_key and api_key != 'YOUR_REAL_API_KEY_HERE' else '❌ Not found'}")
        
        if not api_key or api_key == "YOUR_REAL_API_KEY_HERE":
            print("⚠️  Using MOCK mode (no valid API key)")
            print(f"{'='*60}\n")
            return
        
        try:
            # Initialize the new client
            print("🔄 Configuring new Gemini API client...")
            self.client = genai.Client(api_key=api_key)
            
            # Try different models
            models_to_try = [
                'gemini-2.0-flash-exp',
                'gemini-1.5-flash',
                'gemini-1.5-pro',
            ]
            
            for model_name in models_to_try:
                try:
                    print(f"🤖 Testing {model_name}...")
                    response = self.client.models.generate_content(
                        model=model_name,
                        contents='Hello, this is a test. Reply with "OK"'
                    )
                    if response and response.text:
                        self.mock_mode = False
                        self.model_name = model_name
                        print(f"✅ Successfully connected with {model_name}")
                        print(f"   Test response: {response.text[:50]}...")
                        break
                except Exception as e:
                    print(f"  ❌ {model_name} failed: {str(e)[:80]}")
                    continue
            
            if self.mock_mode:
                print("⚠️ Could not connect to any model, using MOCK mode")
            else:
                print("🎉 REAL Gemini mode activated!")
                
            print(f"{'='*60}\n")
                
        except Exception as e:
            print(f"❌ Setup error: {e}")
            print(f"{'='*60}\n")
    
    async def generate_response(self, message: str, context: Dict[str, Any] = None):
        """Generate AI response"""
        
        # MOCK MODE - Enhanced medical responses
        if self.mock_mode or not hasattr(self, 'client'):
            return self._get_mock_response(message)
        
        # REAL MODE - Use new Gemini API
        try:
            prompt = f"""You are HealthGuard AI, a professional healthcare assistant.

Patient message: "{message}"

Context: {context or 'General health consultation'}

Provide a helpful, empathetic response that:
1. Acknowledges their concern
2. Gives practical advice or next steps
3. Clearly states when to seek professional medical care
4. Suggests follow-up questions or actions

Format your response with clear sections using emojis for readability."""
            
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model_name,
                contents=prompt
            )
            
            return {
                "content": response.text,
                "sources": ["Google Gemini AI"],
                "confidence": 0.95,
                "model_used": f"Gemini {self.model_name}",
                "is_mock": False
            }
            
        except Exception as e:
            print(f"❌ API error: {e}")
            return self._get_mock_response(message, is_fallback=True)
    
    def _get_mock_response(self, message: str, is_fallback: bool = False):
        """Enhanced mock responses"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['sick', 'ill', 'unwell', 'fever']):
            return {
                "content": """I understand you're not feeling well. Here's some guidance:

🤒 **Self-Care Tips:**
• Get plenty of rest
• Stay hydrated with water or clear fluids
• Monitor your temperature
• Note your symptoms (fever, cough, pain, etc.)

🏥 **When to See a Doctor:**
• Fever over 103°F (39.4°C)
• Difficulty breathing
• Severe or worsening pain
• Symptoms lasting more than 3 days
• Confusion or disorientation

📞 **Next Steps:**
• Schedule a virtual visit with our providers
• Talk to a nurse for advice
• Find an urgent care center near you

Would you like me to help schedule an appointment?""",
                "sources": ["HealthGuard AI"],
                "confidence": 0.95,
                "model_used": "Mock Assistant",
                "is_mock": True
            }
        else:
            return {
                "content": f"I understand you're asking about: '{message}'. As your healthcare assistant, I can help with symptoms, appointments, medications, and more. Could you provide more details?",
                "sources": ["HealthGuard AI"],
                "confidence": 0.95,
                "model_used": "Mock Assistant",
                "is_mock": True
            }

# Create global instance
print("\n" + "="*60)
print("🏥 HealthGuard AI - New Gemini Client")
print("="*60)
gemini_client = GeminiClient()
print("✅ New Gemini Client initialized")
print("="*60 + "\n")