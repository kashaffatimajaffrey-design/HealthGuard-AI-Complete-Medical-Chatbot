from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/test/retell")
async def test_retell_connection():
    """Test endpoint to verify Retell can reach us"""
    return {
        "status": "success",
        "message": "HealthGuard AI backend is reachable",
        "timestamp": datetime.now().isoformat(),
        "endpoint": "/webhooks/retell/real",
        "ready": True
    }

@router.get("/test/echo")
async def test_echo(message: str = "Hello from Retell"):
    """Echo test"""
    return {
        "received": message,
        "timestamp": datetime.now().isoformat(),
        "echo": f"Echo: {message}"
    }
