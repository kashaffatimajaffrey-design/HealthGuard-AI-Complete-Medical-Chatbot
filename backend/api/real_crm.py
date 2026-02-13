import sys
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import APIRouter, HTTPException
import requests
import os

router = APIRouter()

# Real CRM API endpoints (example - would need actual API keys)
GHL_API_KEY = os.getenv("GHL_API_KEY")
GHL_LOCATION_ID = os.getenv("GHL_LOCATION_ID")

@router.get("/real/leads")
async def get_real_leads():
    """Get REAL leads from GoHighLevel"""
    if not GHL_API_KEY:
        return {"message": "Set GHL_API_KEY in .env for real CRM", "mock": True, "leads": []}
    
    try:
        # Real API call example
        headers = {
            "Authorization": f"Bearer {GHL_API_KEY}",
            "Version": "2021-07-28",
            "Content-Type": "application/json"
        }
        
        # This is example - actual endpoint may differ
        response = requests.get(
            f"https://rest.gohighlevel.com/v1/contacts/",
            headers=headers,
            params={"locationId": GHL_LOCATION_ID, "limit": 10}
        )
        
        if response.status_code == 200:
            return {"real": True, "data": response.json()}
        else:
            return {"error": response.text, "mock_fallback": True}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
