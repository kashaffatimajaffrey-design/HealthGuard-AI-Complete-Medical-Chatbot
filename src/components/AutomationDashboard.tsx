import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Workflow, WebhookLog, ServiceStatus, PatientInfo } from '../types.ts';
import { WorkflowSkeleton } from './Skeletons.tsx';

interface AutomationDashboardProps {
  initialLogs?: WebhookLog[];
  patients: PatientInfo[];
}

const INITIAL_WORKFLOWS: Workflow[] = [
  { id: 'wf1', name: 'Patient Intake Sync', status: 'active', triggerCount: 124, lastRun: '2 mins ago', json: '{\n  "nodes": [\n    { "type": "webhook", "path": "/intake" },\n    { "type": "validator", "schema": "clinical_intake_v1" },\n    { "type": "crm_sync", "provider": "ghl" }\n  ],\n  "logic": "hl7_standard_mapper"\n}' },
  { id: 'wf2', name: 'Voice Transcription Relay', status: 'paused', triggerCount: 890, lastRun: '1 hour ago', json: '{\n  "nodes": [\n    { "type": "websocket", "path": "/voice-relay" },\n    { "type": "gemini_multimodal", "prompt": "extract_clinical_entities" }\n  ],\n  "ai_model": "gemini-2.5-flash-native"\n}' },
  { id: 'wf3', name: 'CRM Appointment Update', status: 'error', triggerCount: 45, lastRun: '12 mins ago', json: '{\n  "error": "Invalid API Key for GHL Integration",\n  "stack": "UnauthorizedError: Access denied for endpoint /v2/appointments",\n  "node_id": "ghl_sync_001"\n}' },
];

const INITIAL_SERVICES: ServiceStatus[] = [
  { name: 'Google Gemini API', status: 'online', lastSync: 'Real-time' },
  { name: 'Retell.ai Voice Relay', status: 'online', lastSync: '1 min ago' },
  { name: 'Practice GHL CRM', status: 'degraded', lastSync: '5 mins ago' },
  { name: 'Clinical HL7 DB', status: 'offline', lastSync: 'Never' },
];

const AutomationDashboard: React.FC<AutomationDashboardProps> = React.memo(({ initialLogs = [], patients }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [logs, setLogs] = useState<WebhookLog[]>(initialLogs);
  const [loading, setLoading] = useState(true);
  const [viewingJson, setViewingJson] = useState<Workflow | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initialLogs.length > 0) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const toggleWorkflow = useCallback((id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        const newStatus = w.status === 'active' ? 'paused' : 'active';
        return { ...w, status: newStatus as any };
      }
      return w;
    }));
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const simulateWebhook = useCallback((type: string) => {
    const statuses: Array<200 | 400 | 500> = [200, 200, 200, 400, 500];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const newLog: WebhookLog = {
      id: Math.random().toString(36).substr(2, 9),
      path: `/webhook/${type.toLowerCase()}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      status,
      payload: JSON.stringify({ 
        event: `SIMULATED_${type.toUpperCase()}`, 
        data: { 
          node: "HG-CLOUD-01", 
          ts: Date.now(),
          registry_count: patients.length 
        } 
      }, null, 2),
      type: type as any
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  }, [patients.length]);

  const getStatusStyles = (status: number) => {
    if (status >= 500) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (status >= 400) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  const serviceIcons = useMemo(() => ({
    'online': 'fa-circle-check text-emerald-500',
    'degraded': 'fa-triangle-exclamation text-amber-500',
    'offline': 'fa-circle-xmark text-rose-500'
  }), []);

  return (
    <div className="flex-1 h-full bg-[#0F172A] text-slate-300 font-mono flex flex-col overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
        
        {/* n8n Workflows Section */}
        <section>
          <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] flex items-center justify-center text-white">
              <i className="fa-solid fa-diagram-project text-sm"></i>
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">n8n Logic Orchestrator</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? [...Array(3)].map((_, i) => <WorkflowSkeleton key={i} />) : workflows.map(wf => (
              <div key={wf.id} className={`bg-slate-900 border ${wf.status === 'error' ? 'border-rose-900/50' : 'border-slate-800'} rounded-2xl p-6 shadow-2xl hover:border-slate-600 transition-all group`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-white text-sm font-black mb-2 uppercase tracking-tight">{wf.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${wf.status === 'active' ? 'bg-emerald-500 animate-pulse' : wf.status === 'paused' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{wf.status}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleWorkflow(wf.id)}
                    className={`w-12 h-7 rounded-full relative transition-colors ${wf.status === 'active' ? 'bg-emerald-600' : 'bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${wf.status === 'active' ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/30 p-3 rounded-xl border border-slate-800/50">
                    <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Total Hits</span>
                    <span className="text-xs font-black text-white">{wf.triggerCount}</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-slate-800/50">
                    <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Last Sync</span>
                    <span className="text-xs font-black text-slate-400">{wf.lastRun}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewingJson(wf)}
                    className="flex-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black py-2.5 rounded-xl transition-all uppercase tracking-widest"
                  >
                    View JSON
                  </button>
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black py-2.5 rounded-xl transition-all uppercase tracking-widest">Editor</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Webhook Log Panel */}
        <section className="flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <i className="fa-solid fa-tower-broadcast text-sm"></i>
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Inbound Webhook Logs</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={clearLogs} className="text-[9px] font-black bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 text-rose-400 border border-slate-700 uppercase transition-all">Flush Logs</button>
              <button onClick={() => simulateWebhook('voice')} className="text-[9px] font-black bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 text-[#0EA5E9] border border-slate-700 uppercase transition-all">Sim Voice</button>
              <button onClick={() => simulateWebhook('crm')} className="text-[9px] font-black bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 text-emerald-400 border border-slate-700 uppercase transition-all">Sim CRM</button>
            </div>
          </div>
          
          <div className="flex-1 bg-black/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col text-[11px] shadow-2xl">
            <div className="bg-slate-900/90 px-8 py-4 grid grid-cols-12 border-b border-slate-800 text-slate-500 font-black tracking-widest text-[9px] uppercase">
              <div className="col-span-5">Endpoint Path</div>
              <div className="col-span-4">Timestamp</div>
              <div className="col-span-3 text-right">Status Code</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0B0E14] divide-y divide-slate-800/30">
              {logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="group hover:bg-slate-900/20 transition-all">
                  <div className="px-8 py-4 grid grid-cols-12 items-center">
                    <div className="col-span-5 flex items-center gap-3">
                       <i className={`fa-solid ${log.type === 'voice' ? 'fa-microphone text-sky-400' : log.type === 'crm' ? 'fa-database text-emerald-400' : 'fa-code text-slate-400'} text-[10px]`}></i>
                       <span className="font-black text-white uppercase tracking-tighter truncate">{log.path}</span>
                    </div>
                    <div className="col-span-4 text-slate-500 font-bold tabular-nums">
                      {log.timestamp}
                    </div>
                    <div className="col-span-3 text-right">
                      <span className={`px-2.5 py-1 rounded-md font-black text-[10px] border tracking-widest ${getStatusStyles(log.status)}`}>
                        {log.status} {log.status === 200 ? 'OK' : log.status >= 500 ? 'SERVER_ERR' : 'CLIENT_ERR'}
                      </span>
                    </div>
                  </div>
                  <div className="hidden group-hover:block px-8 pb-4 animate-in slide-in-from-top-2 duration-200">
                    <pre className="text-[9px] text-emerald-500/80 overflow-x-auto bg-black/80 p-5 rounded-2xl border border-slate-800/50 whitespace-pre">
                      {log.payload}
                    </pre>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 py-32">
                  <i className="fa-solid fa-terminal text-7xl mb-6"></i>
                  <p className="text-[11px] font-black uppercase tracking-[0.5em]">Awaiting inbound protocol data...</p>
                </div>
              )}
              <div ref={logEndRef} />
            </div>

            <div className="bg-slate-900/50 px-8 py-3 flex justify-between items-center text-[9px] font-black text-slate-600 border-t border-slate-800 uppercase tracking-widest">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Success: {logs.filter(l => l.status === 200).length}</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Failure: {logs.filter(l => l.status >= 400).length}</span>
              </div>
              <span>Protocol: HTTPS/WSS Secure</span>
            </div>
          </div>
        </section>

        {/* Integration Integrity Cards */}
        <section>
          <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
              <i className="fa-solid fa-server text-sm"></i>
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Cloud Integrity Status</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12">
            {INITIAL_SERVICES.map((srv, i) => (
              <div key={i} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:bg-slate-900/50 transition-colors">
                <i className={`fa-solid ${serviceIcons[srv.status as keyof typeof serviceIcons]} text-lg`}></i>
                <div>
                  <h4 className="text-[11px] font-black text-white mb-1 uppercase">{srv.name}</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{srv.lastSync}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* JSON Viewer Modal */}
      {viewingJson && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col h-[70vh] animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-black uppercase tracking-tight">{viewingJson.name}</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Raw Workflow Logic Configuration</p>
              </div>
              <button 
                onClick={() => setViewingJson(null)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#0B0E14]">
              <pre className="text-emerald-400 text-xs leading-relaxed whitespace-pre font-mono">
                {viewingJson.json}
              </pre>
            </div>
            <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(viewingJson.json);
                  // Optional: Add toast notification here
                }}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Copy to Clipboard
              </button>
              <button 
                onClick={() => setViewingJson(null)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AutomationDashboard;