import React, { useState, useEffect } from 'react';
import { ArchNode, PerformanceMetric } from '../types';

const NODES: ArchNode[] = [
  { id: 'fe', label: 'Frontend', tech: 'React 19 / TS', description: 'Patient interface, Voice UI, and Clinical dashboards.', status: 'online', icon: 'fa-desktop' },
  { id: 'api', label: 'Backend API', tech: 'FastAPI / Python', description: 'Core business logic & Voice orchestrator for multimodal streams.', status: 'online', icon: 'fa-server' },
  { id: 'ai', label: 'AI Engine', tech: 'Gemini 3 Flash', description: 'Multimodal processing, clinical reasoning, and automated triage.', status: 'online', icon: 'fa-brain' },
  { id: 'n8n', label: 'Automation', tech: 'n8n.io Workflow', description: 'High-performance webhook handling and CRM data pipelines.', status: 'online', icon: 'fa-diagram-project' },
  { id: 'crm', label: 'CRM / GHL', tech: 'Cloud API', description: 'Lead storage, opportunity management, and clinical database.', status: 'online', icon: 'fa-address-book' },
  { id: 'cal', label: 'Scheduler', tech: 'SaaS Calendar', description: 'Practice availability, appointment slots, and patient booking.', status: 'online', icon: 'fa-calendar-days' },
];

const METRICS: PerformanceMetric[] = [
  { label: 'Cloud Latency', value: '142ms', trend: 'down' },
  { label: 'Active Sessions', value: '38', trend: 'up' },
  { label: 'Webhook Load', value: '1.2 RPS', trend: 'stable' },
  { label: 'AI Queue', value: '0 items', trend: 'stable' },
];

const ArchitectureDiagram: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % 5); // 5 primary flow steps
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const selectedNode = NODES.find(n => n.id === selectedNodeId);

  // Payload simulation text
  const getPayloadText = () => {
    switch(activeStep) {
      case 0: return '{"event": "voice_transcript"}';
      case 1: return '{"prompt": "identify_symptoms"}';
      case 2: return '{"action": "create_crm_lead"}';
      case 3: return '{"sync": "lead_ghl_location_1"}';
      case 4: return '{"calendar": "update_slot_10am"}';
      default: return '';
    }
  };

  return (
    <div className="flex-1 h-full bg-[#0B0E14] text-slate-300 font-mono flex flex-col overflow-hidden animate-in fade-in duration-700">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 custom-scrollbar relative">
        
        {/* Header Controls */}
        <div className="absolute top-10 left-10 z-20 flex flex-col gap-3">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-5 py-3 flex items-center gap-6 shadow-2xl">
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all transform active:scale-90 ${isPlaying ? 'bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Flow Architecture</span>
              <span className="text-xs font-bold text-indigo-400">Status: {isPlaying ? 'Monitoring Real-time Data' : 'Snapshot Paused'}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-black/40 px-3 py-1.5 rounded-lg text-[9px] font-black text-emerald-500 border border-emerald-500/20 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              API: 200 OK
            </div>
            <div className="bg-black/40 px-3 py-1.5 rounded-lg text-[9px] font-black text-indigo-500 border border-indigo-500/20 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              AI: READY
            </div>
          </div>
        </div>

        {/* The Core Diagram Canvas */}
        <div className="min-h-[500px] flex items-center justify-center relative py-32 mt-12">
          {/* SVG Connection Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.2))' }}>
            <path d="M 15% 50% L 32% 50%" stroke="#1E293B" strokeWidth="2" strokeDasharray="8 4" />
            <path d="M 32% 50% L 49% 50%" stroke="#1E293B" strokeWidth="2" strokeDasharray="8 4" />
            <path d="M 49% 50% L 66% 50%" stroke="#1E293B" strokeWidth="2" strokeDasharray="8 4" />
            <path d="M 66% 50% L 83% 50%" stroke="#1E293B" strokeWidth="2" strokeDasharray="8 4" />
            <path d="M 83% 50% L 100% 50%" stroke="#1E293B" strokeWidth="2" strokeDasharray="8 4" />

            {activeStep >= 0 && (
              <g>
                <circle r="6" fill="#6366f1" className="shadow-[0_0_20px_rgba(99,102,241,0.8)]">
                  <animateMotion dur="3s" repeatCount="indefinite" path={
                    activeStep === 0 ? "M 200 250 L 400 250" :
                    activeStep === 1 ? "M 400 250 L 600 250" :
                    activeStep === 2 ? "M 600 250 L 800 250" :
                    activeStep === 3 ? "M 800 250 L 1000 250" :
                    "M 1000 250 L 1150 250"
                  } />
                </circle>
                <foreignObject width="150" height="40" x="0" y="0">
                  <div className="bg-indigo-600/90 text-white text-[8px] px-2 py-1 rounded-md border border-indigo-400 font-bold whitespace-nowrap shadow-xl">
                    {getPayloadText()}
                  </div>
                  <animateMotion dur="3s" repeatCount="indefinite" path={
                    activeStep === 0 ? "M 220 220 L 420 220" :
                    activeStep === 1 ? "M 420 220 L 620 220" :
                    activeStep === 2 ? "M 620 220 L 820 220" :
                    activeStep === 3 ? "M 820 220 L 1020 220" :
                    "M 1020 220 L 1150 220"
                  } />
                </foreignObject>
              </g>
            )}
          </svg>

          <div className="grid grid-cols-6 gap-12 w-full max-w-7xl relative z-10 px-10">
            {NODES.map((node) => (
              <div 
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`relative group cursor-pointer transition-all duration-500 ${selectedNodeId === node.id ? 'scale-110 z-30' : 'hover:scale-105'}`}
              >
                <div className={`
                  w-44 h-44 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 border-2 transition-all
                  ${selectedNodeId === node.id ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.4)]' : 'bg-[#151a24]/90 backdrop-blur-md border-slate-800 group-hover:border-indigo-500/40'}
                `}>
                  <div className={`text-4xl transition-colors duration-300 ${selectedNodeId === node.id ? 'text-white' : 'text-slate-600 group-hover:text-indigo-400'}`}>
                    <i className={`fa-solid ${node.icon}`}></i>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">{node.label}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase mt-1 opacity-60">{node.tech}</span>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-12">
          <section className="lg:col-span-3 space-y-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white border-b border-slate-800/50 pb-3 mb-8">Infrastructure Technical Specification</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {NODES.map(node => (
                <div 
                  key={node.id} 
                  onClick={() => setSelectedNodeId(node.id)} 
                  className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${selectedNodeId === node.id ? 'bg-indigo-900/10 border-indigo-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/30'}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <i className={`fa-solid ${node.icon}`}></i>
                    </div>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{node.tech}</span>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">{node.label}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{node.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white border-b border-slate-800/50 pb-3 mb-8">Live Telemetry</h2>
            <div className="space-y-4">
              {METRICS.map((metric, i) => (
                <div key={i} className="bg-slate-900/30 p-6 rounded-[1.8rem] border border-slate-800 flex justify-between items-center group hover:bg-slate-800/50 transition-all">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{metric.label}</p>
                    <p className="text-2xl font-black text-white tracking-tighter">{metric.value}</p>
                  </div>
                  <div className={`text-sm ${metric.trend === 'up' ? 'text-emerald-400' : metric.trend === 'down' ? 'text-rose-400' : 'text-slate-600'}`}>
                    <i className={`fa-solid fa-chart-line shadow-emerald-500/20`}></i>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-[1.8rem] mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Global Load Index</span>
                <span className="text-[10px] font-bold text-white">84%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '84%' }}></div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {selectedNode && (
        <div className="fixed inset-0 z-[100] bg-[#0B0E14]/90 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setSelectedNodeId(null)}>
          <div className="bg-[#151a24] border border-slate-800 w-full max-w-2xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
            <div className="p-12 space-y-8">
              <div className="flex items-center gap-8">
                <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center text-5xl text-white shadow-2xl ${selectedNode.id === 'crm' ? 'bg-blue-600 shadow-blue-900/40' : 'bg-indigo-600 shadow-indigo-900/40'}`}>
                  <i className={`fa-solid ${selectedNode.icon}`}></i>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedNode.label}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold text-indigo-400 font-mono tracking-widest">{selectedNode.tech}</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">Active System</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 pt-8 border-t border-slate-800/50">
                <div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] block mb-3">Service Role Description</span>
                  <p className="text-base text-slate-300 leading-relaxed font-medium">{selectedNode.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-black/30 p-5 rounded-2xl border border-slate-800">
                    <span className="text-[9px] font-black text-slate-600 uppercase block mb-2">Internal Throughput</span>
                    <span className="text-sm font-bold text-white">{selectedNode.id === 'crm' ? '4.2k ops / sec' : '1.8k ops / sec'}</span>
                  </div>
                  <div className="bg-black/30 p-5 rounded-2xl border border-slate-800">
                    <span className="text-[9px] font-black text-slate-600 uppercase block mb-2">Failover Redundancy</span>
                    <span className="text-sm font-bold text-white">{selectedNode.id === 'crm' ? 'N + 2 Strategy' : 'Active-Passive'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-[1.5rem] transition-all uppercase tracking-widest text-xs shadow-xl shadow-indigo-900/20 active:scale-95">Open Live Metrics</button>
                <button onClick={() => setSelectedNodeId(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-5 rounded-[1.5rem] transition-all uppercase tracking-widest text-xs active:scale-95">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureDiagram;