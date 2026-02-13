import React, { useState } from 'react';
import { AppMode, SystemMetrics, LiveActivity } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  metrics?: SystemMetrics;
  notifications?: LiveActivity[];
  unreadCount?: number;
  clearNotifications?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  isSidebarOpen, 
  setSidebarOpen, 
  activeMode, 
  setActiveMode, 
  metrics,
  notifications = [],
  unreadCount = 0,
  clearNotifications
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const getIconForType = (type: string) => {
    switch(type) {
      case 'clinical': return 'fa-notes-medical text-rose-500';
      case 'ai': return 'fa-brain text-indigo-500';
      case 'automation': return 'fa-gears text-emerald-500';
      case 'system': return 'fa-shield-halved text-sky-500';
      default: return 'fa-bell text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Header Bar */}
      <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg md:hidden"
            aria-label="Toggle Sidebar"
          >
            <i className="fa-solid fa-bars text-slate-600"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
              activeMode === 'dashboard' ? 'bg-slate-900 shadow-slate-200' :
              activeMode === 'admin' ? 'bg-indigo-600 shadow-indigo-100' : 
              activeMode === 'automation' ? 'bg-slate-800 shadow-slate-100' : 
              activeMode === 'crm' ? 'bg-blue-600 shadow-blue-100' :
              activeMode === 'simulator' ? 'bg-emerald-600 shadow-emerald-100' : 
              activeMode === 'voice' ? 'bg-rose-500 shadow-rose-100 animate-pulse' :
              activeMode === 'architecture' ? 'bg-purple-600 shadow-purple-100' : 'bg-[#0EA5E9] shadow-sky-100'
            }`}>
              <i className={`fa-solid ${
                activeMode === 'dashboard' ? 'fa-chart-pie' :
                activeMode === 'admin' ? 'fa-user-shield' : 
                activeMode === 'automation' ? 'fa-gears' : 
                activeMode === 'crm' ? 'fa-address-book' :
                activeMode === 'simulator' ? 'fa-bolt' : 
                activeMode === 'voice' ? 'fa-microphone' :
                activeMode === 'architecture' ? 'fa-network-wired' : 'fa-comment-dots'
              } text-white text-base`}></i>
            </div>
            <div>
              <h1 className="font-black text-base text-[#1E293B] leading-none uppercase tracking-tighter">
                {activeMode === 'dashboard' ? 'Overview' :
                 activeMode === 'admin' ? 'Staff Portal' : 
                 activeMode === 'automation' ? 'Workflow Hub' : 
                 activeMode === 'crm' ? 'CRM Center' :
                 activeMode === 'simulator' ? 'Sim Lab' : 
                 activeMode === 'voice' ? 'Voice Live' :
                 activeMode === 'architecture' ? 'Blueprint' : 'Triage AI'}
              </h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">HealthGuard Platform</p>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
          {[
            { id: 'dashboard', icon: 'fa-chart-pie', label: 'Stats' },
            { id: 'chat', icon: 'fa-comment-dots', label: 'Triage' },
            { id: 'voice', icon: 'fa-microphone', label: 'Voice' },
            { id: 'crm', icon: 'fa-address-book', label: 'CRM' },
            { id: 'automation', icon: 'fa-gears', label: 'Auto' },
            { id: 'architecture', icon: 'fa-network-wired', label: 'System' },
            { id: 'simulator', icon: 'fa-bolt', label: 'Lab' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveMode(tab.id as AppMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                activeMode === tab.id 
                ? 'bg-white text-slate-900 shadow-lg scale-105 border border-slate-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-xs`}></i>
              <span className="font-black text-[9px] uppercase tracking-wider">{tab.label}</span>
              {tab.id === 'voice' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping ml-[-4px]"></span>}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 relative">
          {metrics && (
            <div className="hidden lg:flex items-center gap-3 border-l border-slate-100 pl-6 mr-2">
               <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Global Load</span>
                  <span className="text-[10px] font-bold text-emerald-600">{Math.round(metrics.cpuUsage)}%</span>
               </div>
               <div className="flex items-end gap-0.5 h-6">
                 {metrics.history.map((h, i) => (
                   <div key={i} className="w-1 bg-emerald-500 rounded-full animate-in slide-in-from-bottom-2 duration-500" style={{ height: `${h / 2}px` }}></div>
                 ))}
               </div>
            </div>
          )}
          
          {/* Notification Button */}
          <button 
            onClick={() => { setShowNotifications(!showNotifications); clearNotifications?.(); }}
            className="relative w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <i className="fa-solid fa-bell"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute top-14 right-0 w-80 bg-white rounded-3xl border border-slate-200 shadow-2xl z-[70] overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Command Alerts</span>
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live Ready</span>
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar p-2">
                  {notifications.length > 0 ? notifications.map((n) => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                      <div className="flex items-center gap-3 mb-1.5">
                        <i className={`fa-solid ${getIconForType(n.type)} text-[10px]`}></i>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{n.type} • {n.timestamp}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 leading-tight tracking-tight">{n.message}</p>
                    </div>
                  )) : (
                    <div className="py-12 text-center text-slate-300">
                      <i className="fa-solid fa-bell-slash text-3xl mb-3 opacity-20"></i>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Zero Critical Alerts</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-slate-100">
                    <button className="w-full py-2 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-colors">Mark all as seen</button>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="hidden sm:flex items-center gap-3 pl-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-xl shadow-slate-200">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {children}
      </div>

      <footer className="bg-white border-t border-slate-200 px-8 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Cloud Core Active
          </span>
          <span className="hidden md:inline text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">
            Node: HG-SF-001 • HIPAA Ready
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-slate-100">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Ops:</span>
             <span className="text-[10px] font-bold text-sky-600">STABLE</span>
          </div>
          <div className="flex items-center gap-2 text-rose-500 text-[9px] font-black uppercase tracking-[0.2em]">
            <i className="fa-solid fa-circle-exclamation"></i>
            Emergencies Call 911
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;