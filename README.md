
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
=======
# HealthGuard-AI-Complete-Medical-Chatbot
# HealthGuard-AI-Complete-Medical-Chatbot
[A medical chatbot powered by Google Gemini 2.5 Flash with NO token limits! Provides complete, empathetic healthcare responses including mental health support, symptom assessment, and appointment scheduling.](https://img.shields.io/badge/Python-3.9%252B-blue
https://img.shields.io/badge/FastAPI-0.104.1-green
https://img.shields.io/badge/Google%2520Gemini-2.5%2520Flash-orange
https://img.shields.io/badge/License-MIT-yellow

A production-ready healthcare chatbot powered by Google Gemini 2.5 Flash with COMPLETE, UNTRUNCATED responses.
Never get cut off mid-sentence again!

# 📋 Table of Contents
Demo

The Problem I Solved

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
🔥 The Problem I Solved
The Token Limit Nightmare

Most Gemini API implementations suffer from truncated responses due to token limits. Users would ask for help and get cut off mid-sentence - which is terrible for healthcare where complete information is critical.

Before (Typical Implementation):

text
User: "I'm having a panic attack"
AI: "I'm so sorry you're going through this. Let me help you with some grounding techniques. First, try to..."
[RESPONSE CUT OFF]
After (HealthGuard AI - NO TOKEN LIMITS):

text
User: "I'm having a panic attack"  
AI: Provides COMPLETE response with grounding techniques, breathing exercises, emergency guidelines, and follow-up support - all in one message!
The fix was simple but crucial: Remove the maxOutputTokens parameter and let Gemini decide the response length!

# ✨ Features
🏥 Medical Conversations
Complete, empathetic responses (NEVER cut off!)

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

🚨 Emergency Detection
Automatically identifies crisis keywords

Provides immediate emergency instructions

Clear "call 911" indicators

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
git clone https://github.com/Kashaffatimaaa/HealthGuard-AI-Complete-Medical-Chatbot.git
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
Create a .env file in the root directory:

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
│   ├── gemini_client_final.py  # Gemini API client (NO TOKEN LIMITS!)
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
├── .env                         # Environment variables (NOT in git)
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

# Contact
Kashaf Fatima - kash.fatima7@gmail.com

Project Link: https://github.com/Kashaffatimaaa/HealthGuard-AI-Complete-Medical-Chatbot

# Acknowledgments
Google Gemini API

FastAPI

Retell.ai for voice AI inspiration
>>>>>>> f0f620674c9fa820725954947d6631cf45280f7f
