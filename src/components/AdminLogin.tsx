
import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Credentials updated to KASHAF / password123
    if (username === 'KASHAF' && password === 'password123') {
      onLogin(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="bg-slate-50 p-10 text-center border-b border-slate-100 relative">
          <button 
            onClick={onCancel}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <i className="fa-solid fa-user-shield text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Staff Authentication</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 opacity-60">HealthGuard Secure Access</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-black py-3 px-5 rounded-2xl flex items-center gap-3 animate-pulse">
              <i className="fa-solid fa-circle-exclamation"></i>
              INVALID STAFF CREDENTIALS
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <div className="relative">
              <i className="fa-solid fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                placeholder="Enter Staff ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-2xl shadow-slate-200 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            Grant Access
          </button>
        </form>

        <div className="p-8 bg-slate-50 text-center border-t border-slate-100">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed opacity-60">
            SECURE LOG: ACCESS ATTEMPTS MONITORED
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
