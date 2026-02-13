import sys
import os
from pathlib import Path

# Add the parent directory to Python path
current_dir = Path(__file__).parent.parent  # backend folder
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from gemini_client_final import gemini_client
import time
from datetime import datetime

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint with REAL Gemini AI - NO TOKEN LIMITS"""
    try:
        print(f"\n{'='*60}")
        print(f"💬 Chat request received at {datetime.now().isoformat()}")
        print(f"   Message: '{request.message}'")
        print(f"   User: {request.patient_id or 'anonymous'}")
        print(f"   Mode: {'REAL Gemini' if not gemini_client.mock_mode else 'MOCK'}")
        
        start_time = time.time()
        
        # Get REAL AI response (no token limits)
        ai_response = await gemini_client.generate_response(
            message=request.message,
            context={
                "system_instruction": request.system_instruction or "You are HealthGuard AI, a compassionate healthcare assistant. Provide complete, thorough responses.",
                "conversation_id": request.conversation_id,
                "patient_id": request.patient_id,
                "timestamp": datetime.now().isoformat(),
                "mode": "real" if not gemini_client.mock_mode else "mock"
            }
        )
        
        response_time = time.time() - start_time
        
        print(f"✅ Response generated in {response_time:.2f}s")
        print(f"   AI Model: {ai_response.get('model_used', 'Unknown')}")
        print(f"   Mock Mode: {ai_response.get('is_mock', True)}")
        print(f"   Response length: {len(ai_response['content'])} characters")
        print(f"   Full response received - not truncated")
        
        # Generate quick replies based on content
        quick_replies = generate_quick_replies(request.message, ai_response["content"])
        
        # Determine widget based on content
        widget = determine_widget(request.message, ai_response["content"])
        
        return ChatResponse(
            response=ai_response["content"],
            conversation_id=request.conversation_id or f"conv_{int(time.time())}",
            quick_replies=quick_replies,
            widget=widget,
            metadata={
                "ai_model": ai_response.get("model_used", "Gemini"),
                "response_time": f"{response_time:.2f}s",
                "is_mock": ai_response.get("is_mock", False),
                "confidence": ai_response.get("confidence", 0.95),
                "timestamp": datetime.now().isoformat(),
                "response_length": len(ai_response["content"]),
                "complete_response": True
            }
        )
        
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

def generate_quick_replies(user_message: str, ai_response: str):
    """Generate context-aware quick replies"""
    message_lower = user_message.lower()
    response_lower = ai_response.lower()
    
    replies = []
    
    # Mental health quick replies
    if any(word in message_lower for word in ['panic', 'anxiety', 'attack', 'scared', 'afraid', 'stress']):
        replies = [
            "Grounding Exercises",
            "Breathing Techniques", 
            "Talk to Someone",
            "Emergency Help"
        ]
    # Medical-related quick replies
    elif any(word in message_lower for word in ['sick', 'ill', 'unwell', 'pain', 'hurt', 'fever']):
        replies = [
            "Schedule Appointment",
            "Symptom Checker", 
            "Medication Info",
            "Find Urgent Care"
        ]
    elif 'appointment' in message_lower:
        replies = [
            "Check Availability",
            "Reschedule",
            "Cancel Appointment",
            "Telehealth Options"
        ]
    elif any(word in message_lower for word in ['prescription', 'medication', 'pill']):
        replies = [
            "Refill Request",
            "Side Effects",
            "Dosage Info",
            "Alternative Meds"
        ]
    elif any(word in message_lower for word in ['result', 'test', 'lab', 'blood']):
        replies = [
            "View Lab Results",
            "Explain Results",
            "Next Steps",
            "Schedule Follow-up"
        ]
    else:
        replies = [
            "Schedule Appointment",
            "Prescription Refill",
            "Symptom Check",
            "Mental Health Support",
            "Lab Results",
            "Find Provider"
        ]
    
    # Add emergency option if urgent keywords detected
    if any(word in response_lower for word in ['emergency', 'urgent', '911', 'immediate', 'severe', 'panic']):
        replies = ["🚨 Emergency Help"] + replies[:3]
    
    return replies[:4]

def determine_widget(user_message: str, ai_response: str):
    """Determine which widget to show based on conversation"""
    message_lower = user_message.lower()
    response_lower = ai_response.lower()
    
    # Mental health widget
    if any(word in message_lower for word in ['panic', 'anxiety', 'stress', 'mental']):
        return "mental_health"
    
    if 'appointment' in message_lower or 'schedule' in message_lower:
        return "calendar"
    
    if any(word in message_lower for word in ['symptom', 'check', 'assessment']):
        return "symptom_checker"
    
    if any(word in message_lower for word in ['medication', 'prescription', 'pharmacy']):
        return "medication_list"
    
    if any(word in message_lower for word in ['result', 'test', 'lab']):
        return "lab_results"
    
    if any(word in message_lower for word in ['bill', 'payment', 'insurance']):
        return "billing"
    
    # Check if AI suggested a widget
    if 'calendar' in response_lower or 'schedule' in response_lower:
        return "calendar"
    
    if 'symptom' in response_lower or 'assessment' in response_lower:
        return "symptom_checker"
    
    return None