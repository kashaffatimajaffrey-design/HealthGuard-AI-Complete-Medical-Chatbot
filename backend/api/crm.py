import sys
import os

# Add parent directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)  # Gets C:\health_guard_ai\backend
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import APIRouter, HTTPException
from models.schemas import CRMLead, AppointmentRequest, AppointmentResponse
from typing import List, Dict, Any
import json
import uuid
from datetime import datetime, timedelta

router = APIRouter()

# Mock CRM database
crm_leads = [
    {
        "id": "l1",
        "name": "John Peterson",
        "email": "john.p@gmail.com",
        "phone": "(555) 123-4567",
        "source": "AI Chatbot",
        "status": "Booked",
        "createdAt": "2023-11-15"
    },
    {
        "id": "l2", 
        "name": "Sarah Miller",
        "email": "s.miller@outlook.com",
        "phone": "(555) 987-6543",
        "source": "Voice AI",
        "status": "New",
        "createdAt": "2023-11-16"
    }
]

# Mock appointments
appointments = []

# Mock automation rules
automation_rules = [
    {
        "id": "r1",
        "trigger": "New lead from voice chatbot",
        "action": "Add to CRM + Send welcome email + Tag for follow-up",
        "active": True
    },
    {
        "id": "r2",
        "trigger": "Missed call during office hours",
        "action": "Send SMS + Create follow-up task",
        "active": True
    }
]

@router.get("/leads")
async def get_leads(status: str = None, source: str = None):
    """Get CRM leads with optional filtering"""
    filtered_leads = crm_leads.copy()
    
    if status:
        filtered_leads = [l for l in filtered_leads if l["status"].lower() == status.lower()]
    
    if source:
        filtered_leads = [l for l in filtered_leads if l["source"].lower() == source.lower()]
    
    return {
        "total": len(filtered_leads),
        "leads": filtered_leads,
        "stats": {
            "new": len([l for l in crm_leads if l["status"] == "New"]),
            "contacted": len([l for l in crm_leads if l["status"] == "Contacted"]),
            "booked": len([l for l in crm_leads if l["status"] == "Booked"]),
            "by_source": {
                "AI Chatbot": len([l for l in crm_leads if l["source"] == "AI Chatbot"]),
                "Voice AI": len([l for l in crm_leads if l["source"] == "Voice AI"]),
                "Manual": len([l for l in crm_leads if l["source"] == "Manual"])
            }
        }
    }

@router.post("/leads")
async def create_lead(lead: CRMLead):
    """Create a new CRM lead"""
    # Generate ID if not provided
    if not lead.id:
        lead.id = f"lead_{len(crm_leads) + 1}"
    
    # Set creation date if not provided
    if not lead.createdAt:
        lead.createdAt = datetime.now().strftime("%Y-%m-%d")
    
    lead_dict = lead.dict()
    crm_leads.append(lead_dict)
    
    # Simulate automation rule execution
    print(f"🎯 CRM Automation Triggered: New lead from {lead.source}")
    print(f"📧 Welcome email sent to: {lead.email}")
    print(f"🏷️  Tagged for follow-up")
    
    return {
        "status": "success",
        "message": "Lead created and automation triggered",
        "lead_id": lead.id,
        "automation_actions": [
            "Added to CRM database",
            "Welcome email scheduled",
            "Assigned to sales queue",
            "Follow-up task created"
        ]
    }

@router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, updates: Dict[str, Any]):
    """Update a CRM lead"""
    for i, lead in enumerate(crm_leads):
        if lead["id"] == lead_id:
            crm_leads[i].update(updates)
            
            # Check if status changed to "Booked"
            if updates.get("status") == "Booked":
                print(f"✅ Lead {lead_id} booked! Triggering appointment workflow")
            
            return {
                "status": "success",
                "message": f"Lead {lead_id} updated",
                "lead": crm_leads[i]
            }
    
    raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found")

@router.post("/appointments")
async def create_appointment(request: AppointmentRequest):
    """Create a new appointment"""
    
    # Generate appointment ID
    appointment_id = f"appt_{len(appointments) + 1}"
    
    # Create appointment record
    appointment = {
        "id": appointment_id,
        "patient_id": request.patient_id,
        "date": request.date,
        "time": request.time,
        "service_type": request.service_type,
        "notes": request.notes,
        "status": "confirmed",
        "created_at": datetime.now().isoformat(),
        "calendar_event_id": f"cal_{uuid.uuid4().hex[:8]}"
    }
    
    appointments.append(appointment)
    
    # Simulate calendar integration
    print(f"📅 Appointment created: {request.date} at {request.time}")
    print(f"📲 SMS confirmation sent")
    print(f"📧 Calendar invite generated")
    
    # Find and update corresponding lead
    for lead in crm_leads:
        # In real system, you'd match by patient_id
        if lead.get("status") == "New":
            lead["status"] = "Booked"
            break
    
    return AppointmentResponse(
        appointment_id=appointment_id,
        status="confirmed",
        confirmation=f"Appointment confirmed for {request.date} at {request.time}",
        calendar_link=f"https://calendar.example.com/event/{appointment['calendar_event_id']}"
    )

@router.get("/appointments")
async def get_appointments(date: str = None):
    """Get appointments, optionally filtered by date"""
    if date:
        filtered = [a for a in appointments if a["date"] == date]
    else:
        filtered = appointments
    
    return {
        "total": len(filtered),
        "appointments": filtered,
        "upcoming": len([a for a in appointments if a["date"] >= datetime.now().strftime("%Y-%m-%d")])
    }

@router.get("/rules")
async def get_automation_rules():
    """Get CRM automation rules"""
    return {
        "rules": automation_rules,
        "active_rules": len([r for r in automation_rules if r["active"]]),
        "total_rules": len(automation_rules)
    }

@router.put("/rules/{rule_id}/toggle")
async def toggle_rule(rule_id: str):
    """Toggle automation rule active status"""
    for rule in automation_rules:
        if rule["id"] == rule_id:
            rule["active"] = not rule["active"]
            return {
                "status": "success",
                "message": f"Rule {rule_id} {'activated' if rule['active'] else 'deactivated'}",
                "rule": rule
            }
    
    raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found")

@router.get("/sync/status")
async def sync_status():
    """Get CRM sync status"""
    return {
        "last_sync": datetime.now().isoformat(),
        "status": "synced",
        "records_processed": len(crm_leads),
        "next_sync": (datetime.now() + timedelta(minutes=5)).isoformat()
    }

@router.post("/sync/trigger")
async def trigger_sync():
    """Manually trigger CRM sync"""
    print("🔄 Triggering CRM sync...")
    
    # Simulate sync process
    import time
    time.sleep(1)
    
    return {
        "status": "success",
        "message": "CRM sync completed",
        "stats": {
            "leads_processed": len(crm_leads),
            "appointments_synced": len(appointments),
            "errors": 0
        },
        "timestamp": datetime.now().isoformat()
    }

@router.get("/analytics")
async def get_analytics():
    """Get CRM analytics"""
    # Mock analytics data
    return {
        "conversion_rate": "42%",
        "avg_response_time": "2.3 hours",
        "lead_sources": {
            "AI Chatbot": 65,
            "Voice AI": 25,
            "Manual": 10
        },
        "monthly_trend": [
            {"month": "Sep", "leads": 45, "conversions": 18},
            {"month": "Oct", "leads": 52, "conversions": 22},
            {"month": "Nov", "leads": 68, "conversions": 28}
        ]
    }