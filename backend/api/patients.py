from fastapi import APIRouter, HTTPException
from models.schemas import PatientInfo
from typing import List, Dict, Any
import json
import uuid

router = APIRouter()

# Mock patient database (matching your frontend data)
patients = [
    {
        "id": "HG-77X2-B9A1",
        "name": "Alice Montgomery",
        "gender": "Female",
        "dob": "1988-05-12",
        "lastVisit": "11/20/2023",
        "nextVisit": "12/05/2023",
        "status": "Active",
        "visits": [
            {
                "id": "v1",
                "date": "11/20/2023",
                "symptoms": "Recurring migraines",
                "diagnosis": "Chronic Tension Headache",
                "department": "Neurology",
                "assignedDoctor": "Dr. Sarah Chen"
            }
        ],
        "chatHistory": [],
        "mrn": "HG-77X2-B9A1",
        "registeredAt": "11/15/2023",
        "assignedDoctor": "Dr. Sarah Chen",
        "department": "Neurology"
    },
    {
        "id": "GUEST-000",
        "name": "Guest User",
        "gender": "N/A",
        "dob": "",
        "lastVisit": "None",
        "status": "Guest",
        "visits": [],
        "chatHistory": []
    }
]

@router.get("/")
async def get_all_patients():
    """Get all patients"""
    return {
        "patients": patients,
        "total": len(patients),
        "stats": {
            "active": len([p for p in patients if p.get("status") == "Active"]),
            "guest": len([p for p in patients if p.get("status") == "Guest"]),
            "with_upcoming": len([p for p in patients if p.get("nextVisit")])
        }
    }

@router.get("/{patient_id}")
async def get_patient(patient_id: str):
    """Get specific patient by ID"""
    for patient in patients:
        if patient["id"] == patient_id:
            return patient
    
    raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

@router.post("/")
async def create_patient(patient: PatientInfo):
    """Create a new patient"""
    # Add to database
    patient_dict = patient.dict()
    patients.append(patient_dict)
    
    # Simulate EHR system update
    print(f"📋 New patient registered: {patient.name}")
    print(f"🆔 MRN: {patient.id}")
    print(f"📅 Assigned to: {patient.assignedDoctor or 'Triage'}")
    
    return {
        "status": "success",
        "message": "Patient created successfully",
        "patient_id": patient.id,
        "actions": [
            "Added to EHR system",
            "Medical record created",
            "Welcome packet queued",
            "Initial assessment scheduled"
        ]
    }

@router.put("/{patient_id}")
async def update_patient(patient_id: str, updates: Dict[str, Any]):
    """Update patient information"""
    for i, patient in enumerate(patients):
        if patient["id"] == patient_id:
            patients[i].update(updates)
            
            # Log the update
            print(f"📝 Patient {patient_id} updated")
            
            return {
                "status": "success",
                "message": f"Patient {patient_id} updated",
                "patient": patients[i]
            }
    
    raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

@router.post("/{patient_id}/visits")
async def add_visit(patient_id: str, visit: Dict[str, Any]):
    """Add a clinical visit to patient record"""
    for i, patient in enumerate(patients):
        if patient["id"] == patient_id:
            # Generate visit ID
            visit_id = f"visit_{len(patient.get('visits', [])) + 1}"
            visit["id"] = visit_id
            
            # Add to patient's visits
            if "visits" not in patients[i]:
                patients[i]["visits"] = []
            patients[i]["visits"].append(visit)
            
            # Update last visit date
            patients[i]["lastVisit"] = visit.get("date", "Today")
            
            return {
                "status": "success",
                "message": f"Visit added to {patient_id}",
                "visit_id": visit_id
            }
    
    raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

@router.get("/{patient_id}/chat")
async def get_patient_chat(patient_id: str):
    """Get patient's chat history"""
    for patient in patients:
        if patient["id"] == patient_id:
            return {
                "patient_id": patient_id,
                "name": patient.get("name"),
                "chat_history": patient.get("chatHistory", []),
                "message_count": len(patient.get("chatHistory", []))
            }
    
    raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

@router.post("/{patient_id}/chat")
async def add_chat_message(patient_id: str, message: Dict[str, Any]):
    """Add a chat message to patient's history"""
    for i, patient in enumerate(patients):
        if patient["id"] == patient_id:
            # Ensure chatHistory exists
            if "chatHistory" not in patients[i]:
                patients[i]["chatHistory"] = []
            
            # Add message
            patients[i]["chatHistory"].append(message)
            
            return {
                "status": "success",
                "message": "Chat message added",
                "total_messages": len(patients[i]["chatHistory"])
            }
    
    raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

@router.get("/search/{query}")
async def search_patients(query: str):
    """Search patients by name or ID"""
    results = []
    for patient in patients:
        if (query.lower() in patient.get("name", "").lower() or 
            query.lower() in patient.get("id", "").lower()):
            results.append({
                "id": patient["id"],
                "name": patient.get("name"),
                "status": patient.get("status"),
                "lastVisit": patient.get("lastVisit"),
                "department": patient.get("department")
            })
    
    return {
        "query": query,
        "results": results,
        "count": len(results)
    }

@router.get("/stats/overview")
async def get_patient_stats():
    """Get patient statistics"""
    return {
        "total_patients": len(patients),
        "by_status": {
            "Active": len([p for p in patients if p.get("status") == "Active"]),
            "Guest": len([p for p in patients if p.get("status") == "Guest"]),
            "Inactive": len([p for p in patients if p.get("status") == "Inactive"]),
            "Pending": len([p for p in patients if p.get("status") == "Pending"])
        },
        "by_department": {
            "Neurology": len([p for p in patients if p.get("department") == "Neurology"]),
            "Cardiology": len([p for p in patients if p.get("department") == "Cardiology"]),
            "General Triage": len([p for p in patients if p.get("department") == "General Triage"]),
            "Unassigned": len([p for p in patients if not p.get("department")])
        },
        "appointments_today": 12,
        "new_this_week": 5
    }