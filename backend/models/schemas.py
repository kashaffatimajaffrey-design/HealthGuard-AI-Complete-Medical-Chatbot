from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class Message(BaseModel):
    id: str
    role: Role
    content: str
    timestamp: str
    type: Optional[str] = None
    options: Optional[List[str]] = None
    widget: Optional[str] = None

class PatientInfo(BaseModel):
    id: str
    name: str
    gender: str = Field(..., pattern="^(Male|Female|Other|N/A)$")
    dob: str
    lastVisit: str
    nextVisit: Optional[str] = None
    status: str = Field(..., pattern="^(Active|Inactive|Pending|Guest)$")
    mrn: Optional[str] = None
    registeredAt: Optional[str] = None
    visits: List[Dict[str, Any]] = []
    chatHistory: List[Message] = []
    assignedDoctor: Optional[str] = None
    department: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    patient_id: Optional[str] = None
    system_instruction: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    quick_replies: Optional[List[str]] = None
    widget: Optional[str] = None  # calendar, intake-form, etc.

class WebhookRequest(BaseModel):
    call_id: Optional[str] = None
    transcript: str
    metadata: Optional[Dict[str, Any]] = {}
    timestamp: Optional[str] = None

class CRMLead(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    source: str = Field(..., pattern="^(AI Chatbot|Voice AI|Manual)$")
    status: str = Field(..., pattern="^(New|Contacted|Booked)$")
    createdAt: str

class Workflow(BaseModel):
    id: str
    name: str
    status: str = Field(..., pattern="^(active|paused|error)$")
    triggerCount: int
    lastRun: str
    workflow_json: str 

class WebhookLog(BaseModel):
    id: str
    path: str
    timestamp: str
    status: int
    payload: str
    type: Optional[str] = None
    automationTriggered: bool = False

class SystemMetrics(BaseModel):
    cpuUsage: float
    activeRequests: int
    aiTokensSec: int
    latencyMs: int
    history: List[float]

class AppointmentRequest(BaseModel):
    patient_id: str
    date: str
    time: str
    service_type: str
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    appointment_id: str
    status: str
    confirmation: str
    calendar_link: Optional[str] = None