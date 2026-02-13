const API_BASE = "http://localhost:8000";
const WS_BASE = "ws://localhost:8000";

// Chat function (working)
export const chatStream = async (contents: any[], systemInstruction: string) => {
  console.log('?? Calling HealthGuard AI backend...');
  
  try {
    const lastUserMessage = contents.reverse().find(msg => msg.role === 'user');
    const messageText = lastUserMessage?.parts[0]?.text || '';
    
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageText,
        conversation_id: `conv_${Date.now()}`,
        system_instruction: systemInstruction,
        patient_id: 'current_user'
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    console.log('? Backend response:', data);
    
    const responseText = data.response || "I'm your HealthGuard AI assistant.";
    
    return {
      async *[Symbol.asyncIterator]() {
        const words = responseText.split(' ');
        for (const word of words) {
          await new Promise(resolve => setTimeout(resolve, 20));
          yield { text: word + ' ' };
        }
      }
    };

  } catch (error) {
    console.error('?? Chat API error:', error);
    
    return {
      async *[Symbol.asyncIterator]() {
        const words = "I'm your HealthGuard AI assistant. How can I help you today?".split(' ');
        for (const word of words) {
          await new Promise(resolve => setTimeout(resolve, 30));
          yield { text: word + ' ' };
        }
      }
    };
  }
};

// REAL Voice Connection with WebSocket
export const connectLive = (config: any, callbacks: any) => {
  console.log('?? Connecting to voice WebSocket...');
  
  const ws = new WebSocket(`${WS_BASE}/webhooks/voice-relay`);
  
  ws.onopen = () => {
    console.log('? Voice WebSocket connected');
    callbacks.onopen?.();
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('?? Voice WebSocket message:', data);
    
    if (data.type === 'transcript') {
      callbacks.onTranscriptUpdate?.(data.text);
    } else if (data.type === 'ai_response') {
      callbacks.onResponseChunk?.({text: data.text});
    }
  };
  
  ws.onclose = () => {
    console.log('?? Voice WebSocket closed');
    callbacks.onclose?.();
  };
  
  ws.onerror = (error) => {
    console.error('?? Voice WebSocket error:', error);
    callbacks.onerror?.(error);
  };
  
  return Promise.resolve({
    sendRealtimeInput: (data: any) => {
      console.log('?? Sending voice input:', data);
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'text',
          text: data.transcript || data.text || "User speaking",
          timestamp: new Date().toISOString()
        }));
      } else {
        console.warn('WebSocket not open, using fallback');
        // Fallback to HTTP
        fetch(`${API_BASE}/webhooks/retell`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            call_id: `call_${Date.now()}`,
            transcript: data.transcript || "User voice input",
            metadata: { type: 'voice_input' }
          })
        }).then(r => r.json()).then(response => {
          callbacks.onTranscriptUpdate?.(response.transcript || "Voice received");
          callbacks.onResponseChunk?.({text: response.ai_response || "I heard you"});
        });
      }
    },
    close: () => {
      console.log('?? Closing voice connection');
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }
  });
};

// Live Metrics Function
export const fetchLiveMetrics = async () => {
  try {
    const response = await fetch(`${API_BASE}/metrics/live`);
    return await response.json();
  } catch (error) {
    console.error('Metrics error:', error);
    return {
      system: { cpu_usage: 24, memory_usage: 65, active_connections: 8 },
      ai: { tokens_processed: 1240, response_time_ms: 142, active_sessions: 5 },
      automation: { workflows_active: 3, webhooks_processed: 89 }
    };
  }
};

// Webhook Simulator
export const simulateWebhook = async (type: string, payload: any) => {
  const endpoint = type === 'voice' ? '/webhooks/retell' : `/webhooks/simulate/${type}`;
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
};
