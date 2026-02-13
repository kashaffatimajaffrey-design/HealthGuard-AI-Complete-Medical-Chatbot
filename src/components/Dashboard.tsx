
import React, { useMemo } from 'react';
import { PatientInfo, CRMLead, WebhookLog, SystemMetrics, LiveActivity } from '../types';

interface DashboardProps {
  patients: PatientInfo[];
  leads: CRMLead[];
  logs: WebhookLog[];
  onSwitchMode: (mode: any) => void;
  metrics: SystemMetrics;
  activities: LiveActivity[];
}

const Dashboard: React.FC<DashboardProps> = ({ patients, leads, logs, onSwitchMode, metrics, activities }) => {
  const stats = useMemo(() => [
    { label: 'Registered Patients', value: patients.length, icon: 'fa-hospital-user', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Cloud Latency', value: `${metrics.latencyMs}ms`, icon: 'fa-bolt', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Active Sessions', value: metrics.activeRequests, icon: 'fa-tower-broadcast', color: 'text-sky-500', bg: 'bg-sky-50' },
    { label: 'System Load', value: `${Math.round(metrics.cpuUsage)}%`, icon: 'fa-microchip', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ], [patients.length, metrics]);

  return (
    <div className="flex-1 h-full bg-[#F8FAFC] overflow-y-auto p-6 md:p-10 custom-scrollbar animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Platform Command</h2>
            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.3em]">Operational Telemetry v6.2</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center gap-2 mr-4 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Health:</span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  OPTIMAL
                </span>
             </div>
            <button 
              onClick={() => onSwitchMode('admin')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <i className="fa-solid fa-lock text-xs"></i>
              Staff Registry
            </button>
          </div>
        </header>

        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-default relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-xl transition-all duration-500 group-hover:rotate-12`}>
                  <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                {stat.label === 'System Load' && (
                  <div className="flex gap-0.5 items-end h-6">
                    {metrics.history.map((h, idx) => (
                      <div 
                        key={idx} 
                        className="w-1 bg-emerald-500/20 rounded-full transition-all duration-700"
                        style={{ height: `${h}%` }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 tabular-nums">{stat.value}</p>
              <div className="absolute bottom-0 left-0 h-1 bg-slate-50 w-full">
                <div 
                  className={`h-full transition-all duration-1000 ${stat.color.replace('text', 'bg')}`} 
                  style={{ width: stat.label === 'System Load' ? `${metrics.cpuUsage}%` : '100%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Call to Action: Triage */}
              <div 
                onClick={() => onSwitchMode('chat')}
                className="bg-sky-500 rounded-[2.5rem] p-6 text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-sky-100 hover:shadow-sky-200 transition-all"
              >
                <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
                  <i className="fa-solid fa-comment-medical text-8xl"></i>
                </div>
                <div className="relative z-10">
                  <h4 className="text-xl font-black uppercase tracking-tighter mb-2">Text Triage</h4>
                  <p className="text-[10px] text-sky-50 leading-relaxed font-medium mb-6 max-w-[150px]">
                    Secure clinical intake terminal.
                  </p>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                    <i className="fa-solid fa-message"></i> Open Chat
                  </div>
                </div>
              </div>

              {/* NEW: Voice AI Concierge */}
              <div 
                onClick={() => onSwitchMode('voice')}
                className="bg-rose-500 rounded-[2.5rem] p-6 text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-rose-100 hover:shadow-rose-200 transition-all border-2 border-rose-400/50"
              >
                <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:scale-125 transition-all duration-700">
                  <i className="fa-solid fa-microphone-lines text-8xl"></i>
                </div>
                <div className="relative z-10">
                  <h4 className="text-xl font-black uppercase tracking-tighter mb-2">Voice AI</h4>
                  <p className="text-[10px] text-rose-50 leading-relaxed font-medium mb-6 max-w-[150px]">
                    Multimodal voice triage concierge.
                  </p>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 animate-pulse">
                    <i className="fa-solid fa-phone"></i> Launch Live
                  </div>
                </div>
              </div>

              {/* Lab Sim Tile */}
              <div 
                onClick={() => onSwitchMode('simulator')}
                className="bg-slate-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-slate-200 hover:bg-black transition-all"
              >
                <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:scale-125 transition-all duration-700">
                  <i className="fa-solid fa-flask-vial text-8xl"></i>
                </div>
                <div className="relative z-10">
                  <h4 className="text-xl font-black uppercase tracking-tighter mb-2">Sim Lab</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium mb-6 max-w-[150px]">
                    Debug multimodal API events.
                  </p>
                  <div className="bg-indigo-600 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                    Enter <i className="fa-solid fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Monitoring Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-800">Inbound Load Index</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Cloud Data Relay • Real-time</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Peak</p>
                    <p className="text-sm font-black text-slate-800">4.2k req/m</p>
                  </div>
                </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-2.5 px-2">
                {metrics.history.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div className="w-full bg-slate-50 rounded-t-2xl h-full absolute top-0 opacity-50 group-hover:bg-indigo-50 transition-colors"></div>
                    <div 
                      className={`w-full rounded-t-2xl transition-all duration-1000 relative z-10 shadow-sm ${h > 70 ? 'bg-rose-400' : h > 40 ? 'bg-sky-400' : 'bg-emerald-400'}`} 
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {Math.round(h)}% LOAD
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-2">
                <span>08:00 AM</span>
                <span>SYSTEM MIDNIGHT</span>
                <span>NOW</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Feed */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col h-full max-h-[700px]">
              <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-800">Live Clinical Feed</h3>
                </div>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">History</button>
              </div>
              
              <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
                {activities.length > 0 ? activities.map((item) => (
                  <div key={item.id} className="group relative pl-8 py-2 border-l border-slate-100 animate-in slide-in-from-right-4 duration-500">
                    <div className={`absolute -left-[5px] top-4 w-2 h-2 rounded-full border-2 border-white shadow-sm transition-all duration-500 ${
                      item.type === 'clinical' ? 'bg-sky-500 scale-125' : 
                      item.type === 'ai' ? 'bg-indigo-500' : 
                      item.type === 'automation' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}></div>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[8px] font-black uppercase tracking-widest ${
                        item.type === 'clinical' ? 'text-sky-600' : 
                        item.type === 'ai' ? 'text-indigo-600' : 
                        item.type === 'automation' ? 'text-emerald-600' : 'text-slate-500'
                      }`}>{item.type}</span>
                      <span className="text-[8px] font-bold text-slate-300 font-mono tracking-tighter">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 leading-tight group-hover:text-slate-900 transition-colors">
                      {item.message}
                    </p>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center space-y-4">
                    <i className="fa-solid fa-satellite-dish text-5xl opacity-10 animate-pulse"></i>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Buffering Live Streams...</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100 bg-gradient-to-t from-white to-transparent">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase">AI Throughput</span>
                    <span className="text-[10px] font-black text-indigo-600">{metrics.aiTokensSec} tokens/s</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${(metrics.aiTokensSec / 2000) * 100}%` }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => onSwitchMode('architecture')}
                  className="w-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3"
                >
                  <i className="fa-solid fa-network-wired"></i>
                  System Blueprint
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
