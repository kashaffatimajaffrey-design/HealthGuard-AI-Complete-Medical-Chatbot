import os
import requests
import json
from typing import Dict, Any
import asyncio
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

class GeminiClient:
    """Working Gemini client with correct model names"""
    
    def __init__(self):
        self.mock_mode = True
        self.api_key = os.getenv("GEMINI_API_KEY")
        
        print(f"\n{'='*60}")
        print("🚀 Initializing Gemini Client...")
        print(f"🔑 API Key: {'✅ Found' if self.api_key else '❌ Not found'}")
        
        if not self.api_key:
            print("⚠️  Using MOCK mode (no API key)")
            print(f"{'='*60}\n")
            return
        
        # Use the latest flash model (fast and efficient)
        self.model_name = "gemini-2.5-flash"
        self.api_version = "v1beta"  # Use v1beta which worked in your test
        
        print(f"✅ Using model: {self.model_name}")
        print(f"✅ API version: {self.api_version}")
        self.mock_mode = False
        print("🎉 REAL Gemini mode activated!")
        print(f"{'='*60}\n")
    
    async def generate_response(self, message: str, context: Dict[str, Any] = None):
        """Generate AI response using REST API"""
        
        if self.mock_mode:
            return self._get_mock_response(message)
        
        try:
            # Construct the API URL
            url = f"https://generativelanguage.googleapis.com/{self.api_version}/models/{self.model_name}:generateContent?key={self.api_key}"
            
            # Prepare the request
            headers = {
                'Content-Type': 'application/json'
            }
            
            # Create a medical-focused prompt
            prompt = f"""You are HealthGuard AI, a professional healthcare assistant. Provide helpful, accurate medical guidance.

Patient message: "{message}"

Context: {context or 'General health consultation'}

Provide a response that:
1. Acknowledges their concern with empathy
2. Gives practical, evidence-based advice
3. Clearly states when to seek professional medical care
4. Suggests appropriate next steps

Format your response with clear sections using emojis for readability. Be professional but warm."""
            
            data = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    # No maxOutputTokens on purpose. An 800-token cap truncates
                    # exactly the responses that most need to be complete -
                    # "when to see a doctor" sections land at the end.
                }
            }
            
            print(f"📡 Sending request to Gemini...")
            
            # Make the API call
            response = await asyncio.to_thread(
                requests.post,
                url,
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                # Extract the text from the response
                if 'candidates' in result and len(result['candidates']) > 0:
                    text = result['candidates'][0]['content']['parts'][0]['text']
                    
                    return {
                        "content": text,
                        "sources": ["Google Gemini 2.5 Flash"],
                        "confidence": 0.95,
                        "model_used": "Gemini 2.5 Flash",
                        "is_mock": False
                    }
                else:
                    print("❌ No candidates in response")
                    return self._get_mock_response(message, is_fallback=True)
            else:
                print(f"❌ API error: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return self._get_mock_response(message, is_fallback=True)
                
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
        elif any(word in message_lower for word in ['headache', 'migraine']):
            return {
                "content": """I'm sorry to hear about your headache. Here's some information:

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

Would you like to schedule an appointment?""",
                "sources": ["HealthGuard AI"],
                "confidence": 0.95,
                "model_used": "Mock Assistant",
                "is_mock": True
            }
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
        else:
            return {
                "content": f"""I understand you're asking about: "{message}"

As your healthcare assistant, I can help with:
• Symptom guidance
• Appointment scheduling
• Medication information
• Lab results
• General health questions

How would you like me to help you today?""",
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
print("✅ Gemini Client initialized")
print("="*60 + "\n")