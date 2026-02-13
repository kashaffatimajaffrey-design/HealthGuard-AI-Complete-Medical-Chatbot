import time
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware to log ALL API calls
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log the request
    print(f"\n{'='*60}")
    print(f"📡 API REQUEST LOGGED")
    print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")
    print(f"Client: {request.client.host if request.client else 'Unknown'}")
    
    # Check for Gemini-related calls
    if any(keyword in str(request.url).lower() for keyword in ['gemini', 'generate', 'model', 'ai']):
        print(f"⚠️  GEMINI-RELATED REQUEST DETECTED!")
    
    # Process the request
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    print(f"Response: {response.status_code}")
    print(f"Duration: {process_time:.3f}s")
    print(f"{'='*60}\n")
    
    return response

@app.get("/")
async def root():
    return {"message": "API Logger Active", "status": "monitoring"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting API Logger on http://localhost:8001")
    print("Will log ALL API calls including Gemini-related ones")
    uvicorn.run(app, host="0.0.0.0", port=8001)
