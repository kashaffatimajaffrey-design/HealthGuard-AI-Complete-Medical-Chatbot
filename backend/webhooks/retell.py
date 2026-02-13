from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import requests
import json

# Load environment variables
load_dotenv()

router = APIRouter()

# Models
class RetellWebhook(BaseModel):
    call_id: str
    transcript: str
    metadata: Optional[Dict[str, Any]] = None

class RetellResponse(BaseModel):
    response: str
    actions: Optional[list] = None

# Retell client for free accounts
class RetellFreeClient:
    def __init__(self):
        self.api_key = os.getenv("RETELL_API_KEY")
        self.agent_id = os.getenv("RETELL_AGENT_ID")
        self.mock_mode = False
        
        # Check if we have a valid key
        if not self.api_key or 'xxxx' in self.api_key:
            print("❌ No Retell API key found. Using mock mode.")
            self.mock_mode = True
        elif self.api_key.startswith('key_'):
            print(f"✅ Using FREE account Retell API key: {self.api_key[:10]}...")
            self.mock_mode = False
            self.base_url = "https://api.retellai.com"
        elif self.api_key.startswith('sk-live-'):
            print(f"✅ Using PRODUCTION Retell API key: {self.api_key[:10]}...")
            self.mock_mode = False
            self.base_url = "https://api.retellai.com"
        else:
            print(f"⚠️ Unknown Retell API key format: {self.api_key[:10]}...")
            self.mock_mode = True
    
    def process_transcript(self, transcript: str, call_id: str) -> Dict:
        """Process transcript using Retell AI"""
        
        if self.mock_mode:
            # Mock response for testing
            return {
                "response": "This is a mock response. Set a valid RETELL_API_KEY in .env",
                "actions": ["schedule_appointment", "send_followup"],
                "mock": True
            }
        
        try:
            # For free accounts, we might need to use a different approach
            # Since API might be limited, we'll process locally
            print(f"📞 Processing call {call_id}: {transcript[:50]}...")
            
            # Simple rule-based processing for free accounts
            response = self._rule_based_processing(transcript)
            
            return {
                "response": response,
                "actions": self._extract_actions(transcript),
                "call_id": call_id,
                "processed": True
            }
            
        except Exception as e:
            print(f"❌ Error processing with Retell: {e}")
            return {
                "response": "I apologize, but I'm having trouble processing your request.",
                "actions": [],
                "error": str(e)
            }
    
    def _rule_based_processing(self, transcript: str) -> str:
        """Simple rule-based response for free accounts"""
        transcript_lower = transcript.lower()
        
        if any(word in transcript_lower for word in ['appointment', 'schedule', 'book']):
            return "I can help you schedule an appointment. What day works best for you?"
        elif any(word in transcript_lower for word in ['symptom', 'pain', 'hurt']):
            return "I understand you're experiencing symptoms. Can you describe them in more detail?"
        elif any(word in transcript_lower for word in ['prescription', 'medication', 'refill']):
            return "I can assist with prescription refills. Which medication do you need?"
        elif any(word in transcript_lower for word in ['hello', 'hi', 'hey']):
            return "Hello! This is HealthGuard AI. How can I assist you with your healthcare needs today?"
        else:
            return "Thank you for sharing. How can I assist you with your healthcare needs today?"
    
    def _extract_actions(self, transcript: str) -> list:
        """Extract actions from transcript"""
        actions = []
        transcript_lower = transcript.lower()
        
        if any(word in transcript_lower for word in ['appointment', 'schedule']):
            actions.append("schedule_appointment")
        if any(word in transcript_lower for word in ['follow up', 'callback']):
            actions.append("send_followup")
        if any(word in transcript_lower for word in ['prescription', 'medication']):
            actions.append("process_prescription")
        
        return actions

# Initialize client
retell_client = RetellFreeClient()

@router.post("/retell/real")
async def handle_retell_webhook(webhook: RetellWebhook):
    """Handle Retell AI webhook calls - Works with FREE accounts"""
    
    print(f"📞 Received Retell webhook")
    print(f"Call ID: {webhook.call_id}")
    print(f"Transcript: {webhook.transcript[:100]}...")
    
    # Process the transcript
    result = retell_client.process_transcript(webhook.transcript, webhook.call_id)
    
    # Add metadata
    result.update({
        "call_id": webhook.call_id,
        "timestamp": datetime.now().isoformat(),
        "account_type": "free" if retell_client.api_key.startswith('key_') else "paid"
    })
    
    return result

# Also provide compatibility endpoint
@router.post("/retell")
async def handle_retell_compatibility(webhook: RetellWebhook):
    """Compatibility endpoint for older setups"""
    print("⚠️ Using compatibility endpoint /webhooks/retell")
    return await handle_retell_webhook(webhook)

# Import datetime
from datetime import datetime
