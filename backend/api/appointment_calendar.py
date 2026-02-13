import sys
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import APIRouter, HTTPException
from google.oauth2 import service_account
from googleapiclient.discovery import build
import datetime

router = APIRouter()

# Google Calendar setup (would need service account)
GOOGLE_CALENDAR_CREDENTIALS = os.getenv("GOOGLE_CALENDAR_CREDENTIALS")

@router.get("/calendar/real/appointments")
async def get_real_appointments():
    """Get REAL Google Calendar appointments"""
    if not GOOGLE_CALENDAR_CREDENTIALS:
        return {
            "message": "Set GOOGLE_CALENDAR_CREDENTIALS for real calendar",
            "mock": True,
            "appointments": []
        }
    
    try:
        # Real Google Calendar API
        credentials = service_account.Credentials.from_service_account_file(
            GOOGLE_CALENDAR_CREDENTIALS,
            scopes=['https://www.googleapis.com/auth/calendar.readonly']
        )
        
        service = build('calendar', 'v3', credentials=credentials)
        
        # Get today's events
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        events_result = service.events().list(
            calendarId='primary',
            timeMin=now,
            maxResults=10,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        return {"real": True, "events": events_result.get('items', [])}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
