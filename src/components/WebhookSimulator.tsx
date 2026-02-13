import React, { useState, useCallback } from 'react';
import { WebhookLog, PatientInfo } from '../types';

interface WebhookSimulatorProps {
  patient: PatientInfo;
  onEvent: (log: WebhookLog) => void;
}

const TEMPLATES = {
  RETELL_VOICE: {
    name: 'Retell.ai Voice Stream',
    type: 'voice' as const,
    path: '/webhooks/retell',
    body: `{
  "call_id": "call_v93X82",
  "transcript": "I need help with my medication. Name: {{patient.name}}.",
  "metadata": {
    "patient_id": "{{patient.id}}",
    "sentiment": "neutral"
  },
  "timestamp": "{{timestamp}}"
}`
  },
  CRM_LEAD: {
    name: 'GHL Lead Inbound',
    type: 'crm' as const,
    path: '/webhooks/ghl-lead',
    body: `{
  "event": "lead_created",
  "data": {
    "name": "{{patient.name}}",
    "email": "user@example.com",
    "source": "Voice AI",
    "patient_id": "{{patient.id}}"
  }
}`
  }
};

type TemplateKey = keyof typeof TEMPLATES;

const WebhookSimulator: React.FC<WebhookSimulatorProps> = ({ patient, onEvent }) => {
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('RETELL_VOICE');
  const [editorValue, setEditorValue] = useState(TEMPLATES.RETELL_VOICE.body);
  const [isSending, setIsSending] = useState(false);

  const resolveVariables = useCallback((text: string) => {
    return text
      .replace(/{{patient.name}}/g, patient.name)
      .replace(/{{patient.id}}/g, patient.id)
      .replace(/{{timestamp}}/g, new Date().toISOString());
  }, [patient]);

  const handleSend = useCallback(async () => {
    setIsSending(true);
    const resolvedBody = resolveVariables(editorValue);
    const url = `http://localhost:8000${TEMPLATES[activeTemplate].path}`;
    
    console.log(`📤 Sending to: ${url}`);
    console.log(`📦 Payload:`, JSON.parse(resolvedBody));
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: resolvedBody
      });
      
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      console.log(`📥 Response (${response.status}):`, responseData);
      
      // Create log entry with proper types
      const newLog: WebhookLog = {
        id: Math.random().toString(36).substr(2, 9),
        path: TEMPLATES[activeTemplate].path,
        timestamp: new Date().toLocaleTimeString(),
        status: response.status,  // This is already a number
        payload: resolvedBody,
        response: responseData,
        type: TEMPLATES[activeTemplate].type,
        automationTriggered: response.status === 200
      };
      onEvent(newLog);
    } catch (error) {
      console.error('❌ Fetch error:', error);
      
      // Log error with proper types
      const newLog: WebhookLog = {
        id: Math.random().toString(36).substr(2, 9),
        path: TEMPLATES[activeTemplate].path,
        timestamp: new Date().toLocaleTimeString(),
        status: 0,  // 0 indicates network/fetch error
        payload: resolvedBody,
        response: { error: error instanceof Error ? error.message : String(error) },
        type: TEMPLATES[activeTemplate].type,
        automationTriggered: false
      };
      onEvent(newLog);
    } finally {
      setIsSending(false);
    }
  }, [editorValue, activeTemplate, resolveVariables, onEvent]);

  return (
    <div className="flex-1 h-full bg-[#0B0E14] flex flex-col md:flex-row overflow-hidden font-mono text-slate-300">
      <div className="w-full md:w-1/2 border-r border-slate-800 flex flex-col min-h-0">
        <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <i className="fa-solid fa-vial-circle-check text-emerald-400"></i>
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Payload Lab</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 gap-3">
            {(Object.keys(TEMPLATES) as TemplateKey[]).map(key => (
              <button
                key={key}
                onClick={() => { 
                  setActiveTemplate(key); 
                  setEditorValue(TEMPLATES[key].body); 
                }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  activeTemplate === key 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase">{TEMPLATES[key].name}</span>
                  <i className={`fa-solid ${TEMPLATES[key].type === 'voice' ? 'fa-microphone' : 'fa-database'} text-[10px]`}></i>
                </div>
                <div className="text-[9px] mt-2 opacity-50 font-mono">{TEMPLATES[key].path}</div>
              </button>
            ))}
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
              JSON Payload Editor
            </label>
            <textarea
              value={editorValue}
              onChange={e => setEditorValue(e.target.value)}
              className="w-full h-[400px] bg-black/40 border border-slate-800 rounded-2xl p-6 text-[11px] text-emerald-400 outline-none focus:border-emerald-500/30 resize-none font-mono"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="p-8 bg-slate-900 border-t border-slate-800">
          <button
            onClick={handleSend}
            disabled={isSending}
            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-3 ${
              isSending 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20 active:scale-95'
            }`}
          >
            {isSending 
              ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Sending...</>
              : <><i className="fa-solid fa-cloud-arrow-up"></i> Dispatch Test Webhook</>
            }
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#07090D] p-10 flex flex-col items-center justify-center">
        <div className="text-center space-y-6 max-w-sm opacity-20">
          <i className="fa-solid fa-network-wired text-8xl mb-4"></i>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] leading-loose">
            Awaiting Manual Dispatches
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebhookSimulator;