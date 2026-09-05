
# HealthGuard AI

A multi-channel health assistant built on FastAPI and Google Gemini 2.5 Flash.
One backend serves a REST chat endpoint, Retell voice webhooks, and a WebSocket
relay, returning structured actions — symptom assessment, appointment scheduling,
medication information, and mental health support.

# 📋 Table of Contents
Demo

What This Solves

Features

Tech Stack

Installation

Configuration

Usage

API Documentation

Project Structure

Contributing

License

# 🎥 Demo
Watch the Demo Video at https://youtu.be/l8CTEOd3hBE to see HealthGuard AI in action!

text
User: "I'm having a panic attack"
AI: Provides immediate grounding techniques, breathing exercises, and emergency guidance

User: "I have a fever and feel lightheaded"  
AI: Gives symptom assessment, self-care tips, and when to seek medical help
## What This Solves

A health assistant has to work across channels without losing the thread. Someone
starts by typing, calls in later, and expects the system to know who they are and
what they already said. HealthGuard exposes all three surfaces from one FastAPI
service — the REST chat endpoint, Retell webhooks, and a WebSocket relay — so the
shared conversation layer has a single place to live instead of three codebases to
reconcile.

Every reply comes back as a structured action rather than a blob of text: a
conversation ID, quick-replies, an optional widget, and confidence in the metadata.
The client renders state instead of parsing prose, which is what makes the same
backend usable from a chat window and from a phone call.

The harder problem is knowing when the agent shouldn't answer at all. Crisis input
is matched deterministically **before** the model is called — self-harm, overdose,
violence, and medical emergencies route straight to fixed, reviewed emergency
guidance, and the model is never invoked. A generated response is the wrong artifact
when someone is in danger: model output is non-deterministic and can't be signed off
by a clinician ahead of time, but the strings in `backend/api/crisis.py` can be. Chat
and voice call the same module, so the two channels can't drift apart on the one path
where drifting matters.

Matching is deliberately biased toward false positives — there is no negation
handling, so "I don't want to kill myself" still routes to the crisis card. Showing
that card to someone speaking figuratively is a mild annoyance; missing a real
disclosure is not.

**Where the boundary still is.** This is keyword matching, and it is a floor rather
than a substitute for human escalation: it won't catch obfuscation, misspellings, or
indirect disclosure. The resource numbers are US-only, so any deployment outside the
US needs locale-aware routing before this is fit for use. Both limits are enforced by
tests in `tests/test_crisis.py` rather than left to a reviewer to discover.

# ✨ Features
🏥 Medical Conversations
Complete responses — no `maxOutputTokens` cap, so guidance is never truncated mid-section

Evidence-based medical guidance

Clear "when to see a doctor" indicators

Medication information and refill requests

🧠 Mental Health Support
Grounding techniques (5-4-3-2-1 method)

Breathing exercises with guided instructions

Crisis intervention with emergency resources

Panic attack management

Anxiety relief strategies

🤒 Symptom Assessment
Intelligent symptom analysis

Severity evaluation

Self-care recommendations

Urgent care indicators

Follow-up suggestions

📅 Appointment Management
Schedule appointments

Check provider availability

Reschedule/cancel options

Telehealth integration

💊 Medication Tools
Prescription refill requests

Side effect information

Dosage guidance

Medication interactions

🚨 Crisis Routing (deterministic)
Crisis input matched before the model runs — the model is bypassed entirely

Fixed, reviewable emergency guidance per category (self-harm, overdose, violence, medical emergency)

Shared by the chat endpoint and the voice webhook via `backend/api/crisis.py`

Covered by `tests/test_crisis.py` and `tests/test_endpoints.py`

🔌 Integration Ready
Retell.ai webhook support for voice AI

WebSocket endpoints for real-time voice relay

RESTful API for easy frontend integration

CORS configured for multiple frontend origins

# 🛠️ Tech Stack
Component	Technology	Purpose
Backend Framework	FastAPI	High-performance Python web framework
AI Model	Google Gemini 2.5 Flash	State-of-the-art language model
API Style	REST + WebSockets	Flexible communication
Authentication	Environment Variables	Secure API key management
CORS	FastAPI Middleware	Frontend integration
Webhooks	Retell.ai Compatible	Voice AI integration
Documentation	Swagger UI + ReDoc	Auto-generated API docs
Server	Uvicorn	ASGI server
📦 Installation
Prerequisites
Python 3.9 or higher

Google Gemini API key

pip (Python package manager)

Step 1: Clone the Repository
bash
git clone https://github.com/kashaffatimajaffrey-design/HealthGuard-AI.git
cd healthguard-ai
Step 2: Create Virtual Environment
bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
Step 3: Install Dependencies
bash
pip install -r requirements.txt
Step 4: Set Up Environment Variables
Copy the template and fill in your own keys. Never commit `.env`:

bash
cp .env.example .env

The template looks like this:

env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Environment
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
MOCK_MODE=false

# Server
PORT=8000
HOST=0.0.0.0

# Retell AI (optional)
RETELL_API_KEY=your_retell_api_key_here
RETELL_AGENT_ID=your_agent_id_here
Step 5: Run the Server
bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
Your server will be running at http://localhost:8000

Step 6: Run the Tests
bash
python3 tests/test_crisis.py      # crisis router, no dependencies needed
python3 tests/test_endpoints.py   # both channels end-to-end, mock mode

Configuration
Environment Variables
Variable	Description	Required	Default
GEMINI_API_KEY	Your Google Gemini API key	✅ Yes	-
ENVIRONMENT	dev/production	❌ No	development
FRONTEND_URL	Frontend URL for CORS	❌ No	http://localhost:3000
MOCK_MODE	Use mock responses	❌ No	false
PORT	Server port	❌ No	8000
HOST	Server host	❌ No	0.0.0.0
RETELL_API_KEY	Retell.ai API key	❌ No	-
RETELL_AGENT_ID	Retell.ai agent ID	❌ No	-
BACKEND_PORT	Backend port (alt)	❌ No	8000
NGROK_URL	Public tunnel URL for local webhook testing	❌ No	-
Usage
Testing the API
Root Endpoint
bash
curl http://localhost:8000/
Health Check
bash
curl http://localhost:8000/health
Chat Endpoint
bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have a headache and feel dizzy",
    "patient_id": "patient_123"
  }'
Example Response
json
{
  "response": "I understand you're not feeling well. Here's some guidance...",
  "conversation_id": "conv_1234567890",
  "quick_replies": ["Schedule Appointment", "Symptom Checker", "Medication Info", "Find Urgent Care"],
  "widget": null,
  "metadata": {
    "ai_model": "Gemini 2.5 Flash",
    "response_time": "1.23s",
    "is_mock": false,
    "confidence": 0.95,
    "timestamp": "2024-01-01T12:00:00Z",
    "response_length": 1245
  }
}
API Documentation
Once the server is running, access auto-generated documentation:

Swagger UI: http://localhost:8000/docs

ReDoc: http://localhost:8000/redoc

Endpoints Overview
Method	Endpoint	Description
GET	/	Root endpoint with API info
GET	/health	Health check
POST	/api/chat	Main chat endpoint
POST	/webhooks/retell	Retell.ai webhook
POST	/webhooks/retell/real	Main webhook endpoint
POST	/webhooks/retell/debug	Debug webhook
WS	/webhooks/voice-relay	WebSocket for voice
GET	/crm/leads	CRM leads
GET	/workflows	Automation workflows
GET	/patients	Patient data
GET	/metrics/live	Live system metrics
# 📁 Project Structure
text
healthguard-ai/
├── backend/
│   ├── __init__.py
│   ├── main.py                 # Main FastAPI application
│   ├── gemini_client_final.py  # Gemini API client
│   ├── api/
│   │   ├── __init__.py
│   │   ├── chat.py             # Chat endpoint router
│   │   ├── webhooks.py         # Webhook handlers
│   │   ├── crm.py              # CRM simulation
│   │   ├── workflows.py        # Automation workflows
│   │   ├── patients.py         # Patient management
│   │   └── metrics.py          # System metrics
│   └── models/
│       ├── __init__.py
│       └── schemas.py          # Pydantic models
├── .env.example                 # Environment variable template (committed)
├── .env                         # Your real keys (git-ignored, NEVER commit)
├── .gitignore                   # Git ignore file
├── requirements.txt             # Python dependencies
├── README.md                    # This file
└── LICENSE                      # MIT License
🤝 Contributing
Contributions are welcome! Here's how you can help:

Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to your Gemini API key
3. Run the app:
   `npm run dev`

# Contact
Kashaf Fatima - kash.fatima7@gmail.com

Project Link: https://github.com/kashaffatimajaffrey-design/HealthGuard-AI

# Acknowledgments
Google Gemini API

FastAPI

Retell.ai for voice AI inspiration
