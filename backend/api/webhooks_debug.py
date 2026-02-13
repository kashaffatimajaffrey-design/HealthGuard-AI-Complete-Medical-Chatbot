import os
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configuration
RETELL_API_KEY = os.getenv("RETELL_API_KEY", "")

# DEBUG: Temporary model that accepts ANY data
from pydantic import BaseModel, Field
from typing import Any

class DebugRetellWebhook(BaseModel):
    """Accept any Retell webhook format for debugging"""
    data: Dict[str, Any] = Field(default_factory=dict)

@router.post("/retell/real")
async def debug_retell_webhook(request: Request):
    """Debug endpoint to see Retell's actual format"""
    
    # Get raw request body
    raw_body = await request.body()
    raw_text = raw_body.decode('utf-8')
    
    print(f"\n" + "="*60)
    print(f"🔍 DEBUG: RAW RETELL WEBHOOK RECEIVED")
    print(f"======================================")
    print(f"Raw body: {raw_text[:500]}...")
    print(f"Content-Type: {request.headers.get('content-type')}")
    print(f"User-Agent: {request.headers.get('user-agent')}")
    print(f"Retell likely sent: {len(raw_text)} chars")
    
    # Try to parse as JSON
    try:
        parsed_data = json.loads(raw_text)
        print(f"✅ Can parse as JSON")
        print(f"JSON keys: {list(parsed_data.keys())}")
        
        # Check for common Retell fields
        common_fields = ['call_id', 'transcript', 'metadata', 'event', 'type']
        for field in common_fields:
            if field in parsed_data:
                print(f"   • {field}: {str(parsed_data[field])[:100]}...")
                
    except json.JSONDecodeError as e:
        print(f"❌ Not valid JSON: {e}")
        print(f"First 200 chars: {raw_text[:200]}")
    
    print("="*60 + "\n")
    
    # Always return success during debugging
    return {
        "status": "debug_mode",
        "message": "Webhook received in debug mode",
        "raw_length": len(raw_text),
        "timestamp": datetime.now().isoformat(),
        "note": "Check backend logs for Retell's actual format"
    }

print("✅ Debug webhook handler loaded - will log Retell's actual format")
