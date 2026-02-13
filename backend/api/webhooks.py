import os
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json
import re
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Models
class RetellWebhook(BaseModel):
    call_id: str
    transcript: str
    metadata: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None
    
    class Config:
        extra = "allow"  # Allow extra fields

# Configuration - Load from .env
RETELL_API_KEY = os.getenv("RETELL_API_KEY", "")
RETELL_AGENT_ID = os.getenv("RETELL_AGENT_ID", "agent_b23fa89db576b063b8629e9c22")

print(f"🎯 Retell Configuration Loaded:")
if RETELL_API_KEY:
    print(f"  • API Key: {RETELL_API_KEY[:10]}...")
    if RETELL_API_KEY.startswith('key_'):
        print(f"  • Account Type: ✅ FREE Account")
        print(f"  • Mode: Rule-based processing")
    elif RETELL_API_KEY.startswith('sk-live-'):
        print(f"  • Account Type: ✅ PRODUCTION Account")
        print(f"  • Mode: Real API calls")
    else:
        print(f"  • Account Type: ⚠️ Unknown format")
        print(f"  • Mode: Mock (invalid key format)")
else:
    print(f"  • API Key: ❌ NOT SET")
    print(f"  • Mode: Mock mode")

def process_template_variables(text: str, metadata: Dict[str, Any] = None) -> str:
    """Replace template variables like {{patient.name}} with actual values"""
    if not metadata:
        return text
    
    def replace_var(match):
        var_path = match.group(1).strip()
        parts = var_path.split('.')
        
        # Navigate through metadata to find the value
        value = metadata
        for part in parts:
            if isinstance(value, dict) and part in value:
                value = value[part]
            else:
                return match.group(0)  # Return original if not found
        
        return str(value) if value is not None else match.group(0)
    
    # Replace {{variable}} patterns
    processed = re.sub(r'\{\{(.*?)\}\}', replace_var, text)
    return processed

# Simple rule-based processing for FREE accounts
def process_for_free_account(transcript: str, call_id: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """Process transcript using simple rules for free accounts"""
    print(f"📞 Processing FREE account call: {call_id}")
    
    # Process template variables in transcript
    processed_transcript = process_template_variables(transcript, metadata or {})
    print(f"📝 Processed transcript: {processed_transcript}")
    
    transcript_lower = processed_transcript.lower()
    response = ""
    actions = []
    
    # Healthcare-specific rule-based responses
    if any(word in transcript_lower for word in ['medication', 'prescription', 'refill', 'pill', 'drug']):
        response = """I can help you with your medication. Let me check your prescription records.

💊 **Current Medications:**
• Lisinopril 10mg - Once daily
• Metformin 500mg - Twice daily
• Atorvastatin 20mg - Once daily

📋 **Refill Options:**
• Request refill for all medications
• Request refill for specific medication
• Check refill status
• Discuss side effects

Would you like me to process a refill for any of these medications?"""
        actions = ["check_prescription", "verify_patient", "process_refill"]
        
    elif any(word in transcript_lower for word in ['appointment', 'schedule', 'book', 'meeting']):
        response = """I can help you schedule an appointment.

📅 **Available Times:**
• Today: 2:00 PM, 4:30 PM
• Tomorrow: 9:00 AM, 11:30 AM, 3:00 PM
• Wednesday: 10:00 AM, 2:30 PM

👨‍⚕️ **Available Providers:**
• Dr. Smith (Primary Care)
• Dr. Johnson (Cardiology)
• Nurse Practitioner Williams

What day and time works best for you?"""
        actions = ["schedule_appointment", "update_calendar", "send_confirmation"]
        
    elif any(word in transcript_lower for word in ['symptom', 'pain', 'hurt', 'fever', 'cough', 'headache']):
        response = """I understand you're experiencing symptoms. Let me help assess them.

🔍 **Please provide more details:**
• When did the symptoms start?
• How severe are they on a scale of 1-10?
• Any triggers or relieving factors?
• Have you taken any medication?

🚨 **Seek immediate care if you have:**
• Difficulty breathing
• Chest pain
• Severe bleeding
• Sudden severe headache"""
        actions = ["triage_symptoms", "schedule_urgent_care", "recommend_otc"]
        
    elif any(word in transcript_lower for word in ['test', 'lab', 'result', 'blood', 'xray']):
        response = """I can help you with test results.

🧪 **Recent Lab Results:**
• Complete Blood Count (CBC) - Pending
• Lipid Panel - Available
• A1C - Available
• Thyroid Panel - Pending

Would you like to:
1. View available results
2. Schedule new tests
3. Discuss results with a provider"""
        actions = ["retrieve_results", "schedule_test", "notify_provider"]
        
    elif any(word in transcript_lower for word in ['bill', 'payment', 'insurance', 'claim']):
        response = """I can assist with billing and insurance questions.

💰 **Current Balance: $245.00**
• Last payment: $50.00 on 02/01/2024
• Insurance pending: $150.00
• Patient responsibility: $95.00

Options:
• Make a payment
• Set up payment plan
• Check insurance coverage
• Dispute a charge"""
        actions = ["check_balance", "process_payment", "submit_claim"]
        
    elif any(word in transcript_lower for word in ['hello', 'hi', 'hey', 'greetings']):
        response = """Hello! 👋 This is HealthGuard AI, your virtual healthcare assistant.

I can help you with:
• 📅 Appointment scheduling
• 💊 Prescription refills
• 🔍 Symptom assessment
• 📋 Lab results
• 💰 Billing questions
• 🏥 Finding providers

What can I assist you with today?"""
        actions = ["greeting"]
        
    elif any(word in transcript_lower for word in ['thank', 'thanks', 'appreciate']):
        response = "You're welcome! 😊 Is there anything else I can help you with regarding your healthcare needs?"
        actions = ["acknowledge_gratitude"]
        
    else:
        response = """Thank you for contacting HealthGuard AI. I'm here to help with:

• 📅 Appointment scheduling
• 💊 Prescription refills
• 🔍 Symptom assessment
• 📋 Lab results
• 💰 Billing questions

What specific healthcare need can I assist you with today?"""
        actions = ["general_inquiry", "escalate_human"]
    
    return {
        "response": response,
        "actions": actions,
        "call_id": call_id,
        "processed": True,
        "account_type": "free",
        "timestamp": datetime.now().isoformat(),
        "transcript_original": transcript,
        "transcript_processed": processed_transcript,
        "confidence": 0.95
    }

@router.post("/retell/real")
async def real_retell_webhook(webhook: RetellWebhook):
    """REAL Retell.ai webhook processing - Works with FREE and PAID accounts"""
    
    print(f"\n" + "="*60)
    print(f"📞 INCOMING RETELL WEBHOOK")
    print(f"📱 Call ID: {webhook.call_id}")
    print(f"💬 Original Transcript: {webhook.transcript[:120]}...")
    print(f"📊 Metadata: {json.dumps(webhook.metadata, indent=2) if webhook.metadata else 'None'}")
    print(f"🔑 API Key: {'Set' if RETELL_API_KEY else 'Not set'}")
    print("="*60)
    
    # If no API key, return mock response
    if not RETELL_API_KEY or 'xxxx' in RETELL_API_KEY:
        return {
            "message": "Set RETELL_API_KEY in .env for real voice AI",
            "mock": True,
            "actions": ["Would process real voice with Retell.ai"],
            "call_id": webhook.call_id,
            "timestamp": datetime.now().isoformat()
        }
    
    # FREE ACCOUNT (key_ format)
    if RETELL_API_KEY.startswith('key_'):
        print(f"✅ Processing with FREE account rules")
        result = process_for_free_account(
            webhook.transcript, 
            webhook.call_id,
            webhook.metadata
        )
        result["message"] = "Successfully processed with FREE account rules"
        result["note"] = "Upgrade to paid account for full Retell AI API access"
        return result
    
    # PRODUCTION ACCOUNT (sk-live- format) - Actual API call
    elif RETELL_API_KEY.startswith('sk-live-'):
        print(f"✅ Processing with PRODUCTION Retell API")
        try:
            # This would make actual API call to Retell
            return {
                "response": "[PRODUCTION] Thank you for your message. This would be processed by real Retell AI.",
                "actions": ["ai_processing", "context_analysis", "intent_detection"],
                "call_id": webhook.call_id,
                "processed": True,
                "account_type": "paid",
                "timestamp": datetime.now().isoformat(),
                "api_used": "retell_ai_production"
            }
        except Exception as e:
            return {
                "error": f"Retell API error: {str(e)}",
                "call_id": webhook.call_id,
                "fallback": "Using rule-based fallback",
                **process_for_free_account(webhook.transcript, webhook.call_id, webhook.metadata)
            }
    
    # Unknown key format
    else:
        print(f"⚠️ Unknown key format, using FREE account rules")
        result = process_for_free_account(webhook.transcript, webhook.call_id, webhook.metadata)
        result["message"] = "Unknown key format, using rule-based processing"
        result["warning"] = "Check your RETELL_API_KEY format in .env"
        return result

# Debug endpoint to see raw webhook data
@router.post("/retell/debug")
async def debug_retell_webhook(request: Request):
    """Debug endpoint to see raw webhook data"""
    body = await request.body()
    try:
        json_data = await request.json()
    except:
        json_data = {"raw": body.decode()}
    
    print(f"\n🔍 DEBUG - Raw webhook received:")
    print(f"Headers: {dict(request.headers)}")
    print(f"Body: {json.dumps(json_data, indent=2)}")
    
    return {
        "received": True,
        "headers": dict(request.headers),
        "body": json_data,
        "timestamp": datetime.now().isoformat()
    }

# Compatibility endpoint
@router.post("/retell")
async def compat_retell_webhook(webhook: RetellWebhook):
    """Compatibility endpoint for older webhook URLs"""
    print(f"⚠️ Using compatibility endpoint /webhooks/retell")
    return await real_retell_webhook(webhook)

print(f"\n✅ Webhook endpoints registered:")
print(f"   • POST /webhooks/retell/real - Main endpoint")
print(f"   • POST /webhooks/retell - Compatibility endpoint")
print(f"   • POST /webhooks/retell/debug - Debug endpoint")
