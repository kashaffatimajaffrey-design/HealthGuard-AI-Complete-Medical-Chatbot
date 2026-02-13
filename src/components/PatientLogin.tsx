import React, { useState } from 'react';
import { PatientInfo } from '../types';

interface PatientLoginProps {
  allPatients: PatientInfo[];
  onLogin: (patient: PatientInfo) => void;
  onCancel: () => void;
}

const PatientLogin: React.FC<PatientLoginProps> = ({ allPatients, onLogin, onCancel }) => {
  const [mrn, setMrn] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(false);

    // Simulate secure lookup
    setTimeout(() => {
      const found = allPatients.find(p => p.id.toLowerCase() === mrn.toLowerCase() || p.mrn?.toLowerCase() === mrn.toLowerCase());
      if (found) {
        onLogin(found);
      } else {
        setError(true);
        setIsVerifying(false);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-[#0F172A] p-10 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-500 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>
          
          <button 
            onClick={onCancel}
            className="absolute top-6 right-6 text-slate-500 hover:text-white p-2 transition-colors z-20"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-sky-500 text-white rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-sky-900/20 border-2 border-sky-400/30">
              <i className="fa-solid fa-fingerprint text-3xl"></i>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Patient Vault</h2>
            <p className="text-[9px] text-sky-400 font-black uppercase tracking-[0.3em] mt-2">Secure MRN Access Gateway</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black py-4 px-6 rounded-2xl flex items-center gap-4 animate-in shake duration-300">
              <i className="fa-solid fa-circle-exclamation text-base"></i>
              RECORD NOT FOUND. PLEASE VERIFY YOUR MRN.
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Record Number (MRN)</label>
            <div className="relative">
              <i className="fa-solid fa-hashtag absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                required
                type="text"
                value={mrn}
                onChange={(e) => setMrn(e.target.value)}
                disabled={isVerifying}
                className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white transition-all placeholder:text-slate-300"
                placeholder="HG-XXXX-XXXX"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isVerifying}
            className={`w-full py-5 rounded-2xl font-black transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs ${
              isVerifying ? 'bg-slate-100 text-slate-400' : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-100 active:scale-95'
            }`}
          >
            {isVerifying ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                Verifying Record
              </>
            ) : (
              <>
                <i className="fa-solid fa-shield-check"></i>
                Unlock Profile
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-[9px] text-slate-400 font-bold leading-relaxed uppercase">
              By signing in, you agree to our <span className="text-sky-500 hover:underline cursor-pointer">HIPAA Privacy Policy</span> and data encryption standards.
            </p>
          </div>
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Encrypted Session • TLS 1.3 Active</span>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;