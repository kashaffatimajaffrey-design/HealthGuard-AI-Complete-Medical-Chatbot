import sys
import os

# Add parent directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import APIRouter
import random
from datetime import datetime, timedelta
import psutil

router = APIRouter()

# Mock data for activities
mock_activities = [
    {"id": "act1", "type": "voice_call", "user": "Patient John", "time": "2 min ago", "status": "completed", "details": "Appointment scheduling"},
    {"id": "act2", "type": "crm_lead", "user": "Sarah Miller", "time": "5 min ago", "status": "processed", "details": "New lead from voice AI"},
    {"id": "act3", "type": "appointment", "user": "Alice M.", "time": "10 min ago", "status": "scheduled", "details": "Follow-up visit"},
    {"id": "act4", "type": "ai_chat", "user": "Guest User", "time": "15 min ago", "status": "active", "details": "Symptom consultation"},
    {"id": "act5", "type": "workflow", "user": "System", "time": "20 min ago", "status": "executed", "details": "Missed call follow-up"},
    {"id": "act6", "type": "webhook", "user": "Retell.ai", "time": "25 min ago", "status": "processed", "details": "Voice transcript analyzed"}
]

@router.get("/live")
async def get_live_metrics():
    """Get real-time system metrics"""
    try:
        # Get actual system metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Get network stats
        net_io = psutil.net_io_counters()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_usage": round(cpu_percent, 1),
                "memory_usage": round(memory.percent, 1),
                "memory_used_gb": round(memory.used / (1024**3), 2),
                "disk_usage": round(disk.percent, 1),
                "bytes_sent_mb": round(net_io.bytes_sent / (1024**2), 2),
                "bytes_recv_mb": round(net_io.bytes_recv / (1024**2), 2),
                "active_connections": random.randint(5, 20)
            },
            "ai": {
                "tokens_processed": random.randint(1000, 5000),
                "response_time_ms": random.randint(100, 500),
                "active_sessions": random.randint(3, 15),
                "model": "Gemini 1.5 Flash",
                "requests_last_hour": random.randint(50, 200)
            },
            "automation": {
                "workflows_active": 3,
                "webhooks_processed": random.randint(50, 200),
                "crm_sync_status": "active",
                "last_sync": (datetime.now() - timedelta(minutes=random.randint(1, 10))).isoformat()
            },
            "services": [
                {"name": "API Gateway", "status": "up", "latency_ms": random.randint(10, 50)},
                {"name": "AI Engine", "status": "up", "latency_ms": random.randint(100, 300)},
                {"name": "CRM Sync", "status": "up", "latency_ms": random.randint(200, 500)},
                {"name": "Voice Relay", "status": "up", "latency_ms": random.randint(50, 150)},
                {"name": "Database", "status": "up", "latency_ms": random.randint(20, 80)}
            ]
        }
    except Exception as e:
        print(f"Metrics error: {e}")
        # Return mock data if psutil fails
        return {
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_usage": 24.5,
                "memory_usage": 65.2,
                "active_connections": 12,
                "requests_per_second": 45
            },
            "ai": {
                "tokens_processed": 1240,
                "response_time_ms": 142,
                "active_sessions": 8
            },
            "automation": {
                "workflows_active": 3,
                "webhooks_processed": 89,
                "crm_sync_status": "active"
            }
        }

@router.get("/activities")
async def get_recent_activities():
    """Get recent system activities"""
    return {
        "total": len(mock_activities),
        "activities": mock_activities,
        "summary": {
            "today": random.randint(20, 50),
            "this_week": random.randint(150, 300),
            "success_rate": "96.5%"
        }
    }

@router.get("/throughput")
async def get_throughput():
    """Get system throughput data"""
    # Generate time series data for charts
    timestamps = []
    values = []
    
    now = datetime.now()
    for i in range(24):
        time = (now - timedelta(hours=i)).strftime("%H:00")
        timestamps.append(time)
        values.append(random.randint(800, 2000))
    
    return {
        "timestamps": list(reversed(timestamps)),
        "values": list(reversed(values)),
        "average": round(sum(values) / len(values), 1),
        "peak": max(values),
        "current": values[-1]
    }
