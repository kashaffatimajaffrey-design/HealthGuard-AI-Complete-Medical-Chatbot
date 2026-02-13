import os
import google.generativeai as genai
from typing import Dict, Any
import asyncio
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiClient:
    """Working Gemini API Client"""
    
    def __init__(self):
        self.mock_mode = False  # Start as real mode
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key or api_key == "YOUR_REAL_API_KEY_HERE":
            print("❌ No valid API key found. Using mock mode.")
            self.mock_mode = True
            return
        
        try:
            print(f"🔑 Using Gemini API Key: {api_key[:15]}...")
            
            # Configure the API
            genai.configure(api_key=api_key)
            
            # List available models
            print("📋 Checking available models...")
            models = genai.list_models()
            
            # Filter for gemini models
            gemini_models = [m.name for m in models if 'gemini' in m.name.lower()]
            print(f"Found Gemini models: {gemini_models[:5]}...")
            
            # Try to use the first available gemini model
            if gemini_models:
                # Use gemini-1.5-flash as it's free tier friendly
                if 'models/gemini-1.5-flash' in gemini_models:
                    model_name = 'models/gemini-1.5-flash'
                elif 'models/gemini-1.5-flash-latest' in gemini_models:
                    model_name = 'models/gemini-1.5-flash-latest'
                elif 'models/gemini-1.5-pro' in gemini_models:
                    model_name = 'models/gemini-1.5-pro'
                elif 'models/gemini-pro' in gemini_models:
                    model_name = 'models/gemini-pro'
                else:
                    model_name = gemini_models[0]
                
                print(f"🎯 Selected model: {model_name}")
                self.model = genai.GenerativeModel(model_name)
                
                # Test connection
                print("🧪 Testing connection...")
                test_response = self.model.generate_content("Hello")
                print(f"✅ Connection successful! Test response: '{test_response.text[:50]}...'")
                self.mock_mode = False
            else:
                print("❌ No Gemini models found")
                self.mock_mode = True
                
        except Exception as e:
            print(f"❌ Gemini initialization error: {str(e)[:100]}")
            print("⚠️  Falling back to mock mode")
            self.mock_mode = True
    
    async def generate_response(self, message: str, context: Dict[str, Any] = None):
        """Generate AI response - REAL if possible"""
        
        # If mock mode or no model, use enhanced mock
        if self.mock_mode or not hasattr(self, 'model'):
            return await self._mock_response(message)
        
        try:
            # REAL Gemini API call
            prompt = self._create_prompt(message, context)
            
            print(f"🤖 Sending to Gemini: '{message[:50]}...'")
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            
            return {
                "content": response.text,
                "sources": ["Google Gemini AI"],
                "confidence": 0.95,
                "is_mock": False,
                "model_used": "Gemini"
            }
            
        except Exception as e:
            print(f"❌ Gemini API error: {e}")
            return await self._mock_response(message, True)
    
    async def _mock_response(self, message: str, is_fallback: bool = False):
        """Enhanced mock responses"""
        await asyncio.sleep(0.2)
        
        message_lower = message.lower()
        
        # Medical responses
        if any(word in message_lower for word in ['sick', 'ill', 'unwell']):
            response = """I understand you're feeling unwell. Here's some general guidance:

🤒 Common Care Tips:
• Rest and stay hydrated
• Monitor your symptoms
• Check your temperature
• Avoid strenuous activity

🩺 When to Seek Help:
• High fever (over 103°F/39.4°C)
• Difficulty breathing
• Severe pain
• Symptoms lasting more than 3 days

📞 For immediate concerns, please contact:
• Telehealth: (555) 123-4567
• Emergency: 911 (if life-threatening)"""
        
        elif 'headache' in message_lower:
            response = """For headaches:

💡 Immediate Relief:
• Rest in a dark, quiet room
• Apply cold compress to forehead
• Stay hydrated
• Consider OTC pain relief if appropriate

⚠️ Red Flags (Seek Medical Attention):
• Sudden, severe headache
• Headache with fever/stiff neck
• Headache after injury
• Vision changes or confusion"""
        
        elif 'fever' in message_lower:
            response = """Fever Management:

🌡️ Monitoring:
• Take temperature every 4-6 hours
• Rest and drink plenty of fluids
• Light clothing, keep room comfortable

💊 Treatment:
• Acetaminophen or ibuprofen as directed
• Lukewarm sponge bath if needed
• Avoid alcohol/caffeine

🏥 Seek Help If:
• Fever over 104°F (40°C)
• Lasts more than 3 days
• Infant under 3 months with fever"""
        
        else:
            response = f"""I understand: "{message}"

As HealthGuard AI, I'm here to provide healthcare guidance. Currently running in {'fallback' if is_fallback else 'mock'} mode.

🔐 To enable real AI responses, please:
1. Ensure GEMINI_API_KEY is correctly set
2. Check internet connection
3. Verify API key permissions

📋 In the meantime, I can help with:
• Symptom guidance
• Appointment scheduling
• Medication information
• General health advice"""

        return {
            "content": response,
            "sources": ["HealthGuard AI Medical Database"],
            "confidence": 0.92,
            "is_mock": True,
            "model_used": "Mock" + (" (Fallback)" if is_fallback else "")
        }
    
    def _create_prompt(self, message: str, context: Dict[str, Any] = None):
        """Create a professional medical prompt"""
        context_str = json.dumps(context) if context else "General consultation"
        
        return f"""You are HealthGuard AI, a professional healthcare assistant.

CONTEXT:
{context_str}

PATIENT MESSAGE:
"{message}"

Please provide:
1. Acknowledgment of their concern
2. Professional medical guidance (if appropriate)
3. Clear instructions on when to seek emergency care
4. Suggestions for self-care
5. Follow-up recommendations

Be:
- Professional and empathetic
- Clear and concise
- Evidence-based when possible
- Cautious about diagnosing

Format response in clear paragraphs with emojis for readability."""
    
    async def analyze_medical_text(self, text: str):
        """Analyze medical text"""
        if self.mock_mode:
            return await self._mock_analysis(text)
        
        try:
            prompt = f"""Analyze this medical text:
            
            {text}
            
            Provide a structured analysis with:
            1. Key symptoms identified
            2. Possible conditions (suggest only, don't diagnose)
            3. Urgency level (low/medium/high)
            4. Recommended next steps
            5. When to seek immediate care"""
            
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            
            return {
                "analysis": response.text,
                "urgency": "medium",  # Would parse from response
                "recommendations": ["Consult with healthcare provider"],
                "is_mock": False
            }
            
        except Exception as e:
            return await self._mock_analysis(text, True)
    
    async def _mock_analysis(self, text: str, is_fallback: bool = False):
        """Mock medical analysis"""
        await asyncio.sleep(0.3)
        
        return {
            "analysis": f"Analysis of: '{text[:100]}...'\n\nIn mock mode. Real analysis available with full Gemini API.",
            "urgency": "medium",
            "recommendations": [
                "Schedule appointment with primary care",
                "Monitor symptoms",
                "Document any changes"
            ],
            "is_mock": True,
            "note": "Add valid API key for real AI analysis" if not is_fallback else "API temporarily unavailable"
        }

# Create global instance
print("🚀 Initializing Gemini Client...")
gemini_client = GeminiClient()
print(f"✅ Gemini Client ready. Mode: {'MOCK' if gemini_client.mock_mode else 'REAL'}")

# Quick test
if __name__ == "__main__":
    import asyncio
    
    async def test():
        client = GeminiClient()
        print("\n🧪 Testing response generation...")
        result = await client.generate_response("I'm feeling sick with a headache and fever")
        print(f"\n📝 Response:\n{result['content'][:200]}...")
        print(f"\n📊 Metadata: {result['model_used']}, Mock: {result['is_mock']}")
    
    asyncio.run(test())
