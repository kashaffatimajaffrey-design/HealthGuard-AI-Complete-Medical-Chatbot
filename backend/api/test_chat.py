import requests
import json
import time

def test_chat_endpoint():
    """Test the chat endpoint with real Gemini"""
    url = "http://localhost:8000/api/chat"
    
    test_messages = [
        "I'm feeling sick with headache and fever",
        "I need to schedule an appointment",
        "Can I get a prescription refill?",
        "What do my lab results mean?",
        "I have chest pain and shortness of breath"
    ]
    
    for i, message in enumerate(test_messages):
        print(f"\n{'='*60}")
        print(f"Test {i+1}: {message}")
        
        payload = {
            "message": message,
            "patient_id": f"test_patient_{i}",
            "conversation_id": f"test_conv_{int(time.time())}",
            "system_instruction": "You are HealthGuard AI, a healthcare assistant."
        }
        
        try:
            start_time = time.time()
            response = requests.post(url, json=payload)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! ({response_time:.2f}s)")
                print(f"AI Response: {data['response'][:100]}...")
                print(f"Quick Replies: {data['quick_replies']}")
                print(f"Widget: {data.get('widget', 'None')}")
                print(f"Model: {data.get('metadata', {}).get('ai_model', 'Unknown')}")
                print(f"Mock: {data.get('metadata', {}).get('is_mock', True)}")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")
        
        time.sleep(1)  # Delay between requests

if __name__ == "__main__":
    print("🚀 Testing HealthGuard AI Chat Endpoint")
    print("Make sure your FastAPI server is running on port 8000")
    print("="*60)
    test_chat_endpoint()