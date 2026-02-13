import React from 'react';
import { PatientInfo, HistoryItem, AppMode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientInfo;
  onStartRegistration: () => void;
  onStartLogin: () => void;
  onLogout: () => void;
  onSwitchMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, patient, onStartRegistration, onStartLogin, onLogout, onSwitchMode }) => {
  const isGuest = patient.status === 'Guest';

  const history: HistoryItem[] = isGuest ? [] : [
    { id: '1', title: 'Intake Registration', date: patient.registeredAt || 'Today' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed md:static inset-y-0 left-0 w-72 bg-white border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-[#1E293B]">Patient Portal</h2>
            {!isGuest && (
              <button 
                onClick={onLogout}
                className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-2 py-1 rounded transition-colors"
              >
                Logout
              </button>
            )}
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          {/* Patient Card */}
          <div className={`border rounded-xl p-4 mb-8 transition-all ${isGuest ? 'bg-amber-50 border-amber-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm transition-colors ${isGuest ? 'bg-amber-400' : 'bg-sky-500'}`}>
                {isGuest ? <i className="fa-solid fa-user-plus text-sm"></i> : patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-slate-800 truncate leading-tight">
                  {isGuest ? 'Guest Access' : patient.name}
                </h3>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block ${
                  isGuest ? 'bg-amber-200 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {patient.status}
                </span>
              </div>
            </div>

            {isGuest ? (
              <div className="space-y-3">
                <button 
                  onClick={onStartRegistration}
                  className="w-full bg-white border border-amber-200 text-amber-700 text-[11px] font-bold py-2 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-id-card"></i>
                  Register Profile
                </button>
                <button 
                  onClick={onStartLogin}
                  className="w-full text-center text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-800 transition-colors"
                >
                  Returning Patient? Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Special ID:</span>
                  <span className="text-slate-800 font-bold font-mono">{patient.id}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Joined:</span>
                  <span className="text-slate-800 font-bold">{patient.registeredAt || 'Today'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Saved Documents */}
          <div className="mb-8 flex-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Saved Documents</h3>
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map(item => (
                  <button key={item.id} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                    <div className="text-xs font-bold text-slate-700 group-hover:text-sky-600">{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{item.date}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <i className="fa-solid fa-cloud-arrow-up text-slate-200 text-3xl mb-2"></i>
                <p className="text-[10px] text-slate-400 font-medium px-4">Register to enable persistent clinical cloud sync.</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <button 
              onClick={() => onSwitchMode('chat')}
              className="w-full flex items-center gap-3 p-3 text-xs font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-all"
            >
              <i className="fa-solid fa-calendar-plus text-sky-500"></i>
              Text Triage
            </button>
            <button 
              onClick={() => onSwitchMode('voice')}
              className="w-full flex items-center gap-3 p-3 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
            >
              <i className="fa-solid fa-microphone text-rose-500"></i>
              Voice Assistant
            </button>
            <div className="h-4"></div>
            <button 
              onClick={() => onSwitchMode('admin')}
              className="w-full flex items-center gap-3 p-3 text-xs font-bold text-slate-400 hover:text-indigo-600 border border-transparent hover:border-indigo-100 rounded-xl transition-all"
            >
              <i className="fa-solid fa-user-lock"></i>
              Staff Management
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;