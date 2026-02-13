import sys
import os
from pathlib import Path

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import uvicorn
from datetime import datetime

# Load environment variables
load_dotenv()

# Import routers
from api.chat import router as chat_router
from api.webhooks import router as webhooks_router
from api.crm import router as crm_router
from api.workflows import router as workflows_router
from api.patients import router as patients_router
from api.metrics import router as metrics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events - startup and shutdown"""
    # Startup
    print("\n" + "="*60)
    print("🏥 HealthGuard AI Backend Starting...")
    print(f"🌍 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"🔗 Frontend URL: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}")
    
    if os.getenv('MOCK_MODE', 'false').lower() == 'true':
        print("🤖 Running in MOCK MODE - No real API calls")
    else:
        print("✨ Real AI mode - Gemini API active (NO TOKEN LIMITS)")
    print("="*60 + "\n")
    
    yield
    # Shutdown
    print("👋 HealthGuard AI Backend Shutting Down...")

# Create FastAPI app - THIS IS WHAT UVICORN NEEDS
app = FastAPI(
    title="HealthGuard AI Backend",
    description="Healthcare Automation Platform API",
    version="6.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "https://localhost:3000",
    "http://localhost:3001",
    "https://localhost:3001",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",
    "http://localhost:5173",
    "https://localhost:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== WEBHOOK REDIRECTS =====
@app.api_route("/webhook/retell", methods=["GET", "POST", "PUT", "DELETE"])
@app.api_route("/webhook/retell/", methods=["GET", "POST", "PUT", "DELETE"])
async def redirect_webhook_singular(request: Request):
    """Redirect singular webhook path to plural"""
    full_path = str(request.url.path)
    new_path = full_path.replace("/webhook/", "/webhooks/", 1)
    
    if request.query_params:
        new_path += "?" + str(request.query_params)
    
    print(f"🔄 Redirecting {request.method} {full_path} -> {new_path}")
    return RedirectResponse(url=new_path, status_code=307)

@app.api_route("/webhook", methods=["GET", "POST"])
@app.api_route("/webhook/", methods=["GET", "POST"])
async def redirect_webhook_base(request: Request):
    """Redirect base webhook path to webhooks"""
    full_path = str(request.url.path)
    new_path = full_path.replace("/webhook", "/webhooks", 1)
    
    if request.query_params:
        new_path += "?" + str(request.query_params)
    
    print(f"🔄 Redirecting {request.method} {full_path} -> {new_path}")
    return RedirectResponse(url=new_path, status_code=307)

# ===== WEBSOCKET ENDPOINTS =====
@app.websocket("/webhooks/voice-relay")
async def websocket_voice_relay(websocket: WebSocket):
    """WebSocket endpoint for voice relay"""
    await websocket.accept()
    print(f"🔊 WebSocket connection accepted")
    try:
        while True:
            data = await websocket.receive_text()
            print(f"📨 Received voice data: {data[:50]}...")
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        print(f"🔇 WebSocket disconnected")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")

# ===== GLOBAL EXCEPTION HANDLER =====
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "path": request.url.path
        }
    )

# ===== HEALTH CHECK ENDPOINTS =====
@app.get("/")
async def root():
    return {
        "status": "active",
        "service": "HealthGuard AI Backend",
        "version": "6.0.0",
        "mode": os.getenv("ENVIRONMENT", "development"),
        "mock": os.getenv("MOCK_MODE", "false").lower() == "true",
        "token_limits": "DISABLED - Complete responses guaranteed",
        "endpoints": {
            "chat": "/api/chat",
            "webhooks": "/webhooks/retell",
            "crm": "/crm/leads",
            "workflows": "/workflows",
            "patients": "/patients",
            "metrics": "/metrics/live",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "api": "online",
            "database": "simulated",
            "ai_engine": "ready (no token limits)",
            "automation": "active",
            "crm": "connected",
            "metrics": "active",
            "voice": "ready"
        }
    }

@app.get("/api/test")
async def test_endpoint():
    return {
        "message": "Backend is connected!",
        "token_limits": "DISABLED - You will receive complete responses",
        "endpoints_available": [
            "POST /api/chat - AI chat endpoint (complete responses)",
            "POST /webhooks/retell - Retell.ai voice webhook",
            "WS /webhooks/voice-relay - Voice WebSocket",
            "GET /crm/leads - CRM leads",
            "GET /workflows - n8n workflows",
            "GET /patients - Patient data",
            "GET /metrics/live - Live metrics",
            "GET /docs - API documentation"
        ]
    }

# ===== ROUTERS =====
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(webhooks_router, prefix="/webhooks", tags=["Webhooks"])
app.include_router(crm_router, prefix="/crm", tags=["CRM"])
app.include_router(workflows_router, prefix="/workflows", tags=["Workflows"])
app.include_router(patients_router, prefix="/patients", tags=["Patients"])
app.include_router(metrics_router, prefix="/metrics", tags=["Metrics"])

@app.get("/api/info")
async def api_info():
    return {
        "name": "HealthGuard AI API",
        "version": "6.0.0",
        "description": "Healthcare automation platform with voice AI, CRM, and n8n workflows",
        "token_limits": "DISABLED - All responses are complete",
        "features": [
            "Real-time voice AI processing",
            "CRM integration (Go High Level simulation)",
            "n8n workflow automation",
            "Patient management system",
            "Webhook handling for Retell.ai",
            "Live system metrics",
            "WebSocket voice relay",
            "Mental health support with complete responses"
        ],
        "tech_stack": {
            "backend": "FastAPI + Python",
            "ai": "Google Gemini 2.5 Flash (no token limits)",
            "database": "In-memory (simulated)",
            "automation": "n8n simulation",
            "websocket": "FastAPI WebSockets"
        }
    }

# This allows running with `python main.py`
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )