import os
import google.generativeai as genai
from typing import Dict, Any
import asyncio
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from project root
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

class GeminiClient:
    """Working Gemini client for HealthGuard AI"""
    
    def __init__(self):
        self.mock_mode = True
        api_key = os.getenv("GEMINI_API_KEY")
        
        print(f"\n{'='*60}")
        print("🚀 Initializing Gemini Client...")
        print(f"🔑 API Key: {'✅ Found' if api_key and api_key != 'YOUR_REAL_API_KEY_HERE' else '❌ Not found'}")
        
        if not api_key or api_key == "YOUR_REAL_API_KEY_HERE":
            print("⚠️  Using MOCK mode (no valid API key)")
            print(f"{'='*60}\n")
            return
        
        try:
            # Configure Gemini
            print("🔄 Configuring Gemini API...")
            genai.configure(api_key=api_key)
            
            # Try different models (AI Studio keys work with these)
            models_to_try = [
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-pro',
            ]
            
            for model_name in models_to_try:
                try:
                    print(f"🤖 Testing {model_name}...")
                    model = genai.GenerativeModel(model_name)
                    # Quick test
                    response = model.generate_content("Hello, this is a test. Reply with 'OK'")
                    if response and response.text:
                        self.model = model
                        self.mock_mode = False
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
        if self.mock_mode or not hasattr(self, 'model'):
            return self._get_mock_response(message)
        
        # REAL MODE - Use Gemini API
        try:
            # Create a professional medical prompt
            prompt = f"""You are HealthGuard AI, a professional healthcare assistant.

Patient message: "{message}"

Context: {context or 'General health consultation'}

Provide a helpful, empathetic response that:
1. Acknowledges their concern
2. Gives practical advice or next steps
3. Clearly states when to seek professional medical care
4. Suggests follow-up questions or actions

Format your response with clear sections using emojis for readability."""
            
            # Generate response
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            
            return {
                "content": response.text,
                "sources": ["Google Gemini AI"],
                "confidence": 0.95,
                "model_used": "Gemini 1.5 Flash",
                "is_mock": False
            }
            
        except Exception as e:
            print(f"❌ API error: {e}")
            return self._get_mock_response(message, is_fallback=True)
    
    def _get_mock_response(self, message: str, is_fallback: bool = False):
        """Enhanced mock responses for common medical queries"""
        message_lower = message.lower()
        
        # Response for "I'm sick" or similar
        if any(word in message_lower for word in ['sick', 'ill', 'unwell', 'not feeling well']):
            return {
                "content": """I understand you're not feeling well. Here's some guidance to help:

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

Would you like me to help schedule an appointment or provide more specific information?""",
                "sources": ["HealthGuard AI Medical Database"],
                "confidence": 0.95,
                "model_used": "Mock Assistant" + (" (Fallback)" if is_fallback else ""),
                "is_mock": True
            }
        
        # Response for headaches
        elif 'headache' in message_lower:
            return {
                "content": """I'm sorry to hear about your headache. Here's some information that might help:

💡 **Immediate Relief:**
• Rest in a quiet, dark room
• Apply a cold or warm compress to your head/neck
• Stay hydrated
• Consider OTC pain relievers if appropriate

⚠️ **Seek Medical Attention If:**
• Headache is sudden and severe
• Accompanied by fever, stiff neck, or confusion
• Follows a head injury
• Affects your vision or speech

📋 **Track Your Symptoms:**
• When did it start?
• Where is the pain located?
• What makes it better or worse?

Would you like to schedule an appointment or get more specific advice?""",
                "sources": ["HealthGuard AI Medical Database"],
                "confidence": 0.95,
                "model_used": "Mock Assistant",
                "is_mock": True
            }
        
        # Response for appointments
        elif any(word in message_lower for word in ['appointment', 'schedule', 'book']):
            return {
                "content": """I can help you with appointments! Here's what you need to know:

📅 **Available Appointment Types:**
• Primary Care - 30 min
• Telehealth Visit - 15 min  
• Follow-up - 20 min
• Urgent Care - Same day

🕒 **Office Hours:**
• Monday-Friday: 8am - 6pm
• Saturday: 9am - 1pm
• Sunday: Closed

📞 **To Schedule:**
1. Tell me your preferred date/time
2. Select appointment type
3. Choose provider (optional)
4. Confirm insurance information

Would you like to check availability for this week?""",
                "sources": ["HealthGuard AI"],
                "confidence": 0.95,
                "model_used": "Mock Assistant",
                "is_mock": True
            }
        
        # Default response
        else:
            return {
                "content": f"""I understand you're asking: "{message}"

As your healthcare assistant, I can help with:
• Symptom guidance
• Appointment scheduling
• Medication information
• Lab results
• General health questions

💡 **For the best assistance, please:**
• Describe your symptoms in more detail
• Ask specific questions
• Let me know if this is urgent

How would you like me to help?""",
                "sources": ["HealthGuard AI"],
                "confidence": 0.95,
                "model_used": "Mock Assistant",
                "is_mock": True
            }

# Create global instance
print("\n" + "="*60)
print("🏥 HealthGuard AI - Gemini Client")
print("="*60)
gemini_client = GeminiClient()
print("✅ Gemini Client initialized and ready")
print("="*60 + "\n")