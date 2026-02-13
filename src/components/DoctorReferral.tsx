import React from 'react';

interface DoctorReferralProps {
  department: string;
  onBook: (doctor: string) => void;
}

const DOCTORS_MAP: Record<string, any> = {
  'Dermatology': { name: 'Dr. Sarah Chen', title: 'Senior Dermatologist', rating: '4.9', bio: 'Specializes in clinical visual diagnostics and autoimmune skin conditions.', avatar: 'SC' },
  'Cardiology': { name: 'Dr. Marcus Thorne', title: 'Cardiac Surgeon', rating: '5.0', bio: 'Expert in non-invasive diagnostic procedures and heart rhythm management.', avatar: 'MT' },
  'Neurology': { name: 'Dr. Elena Rodriguez', title: 'Neuroscience Lead', rating: '4.8', bio: 'Specializes in migraines, sleep disorders, and neural data analysis.', avatar: 'ER' },
  'General Triage': { name: 'Dr. James Wilson', title: 'Triage Specialist', rating: '4.7', bio: 'Focuses on primary care diagnostics and emergency response routing.', avatar: 'JW' }
};

const DoctorReferral: React.FC<DoctorReferralProps> = ({ department, onBook }) => {
  const doc = DOCTORS_MAP[department] || DOCTORS_MAP['General Triage'];

  return (
    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-right-8 duration-700 border border-slate-800">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Specialist Referral</span>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <i className="fa-solid fa-star text-emerald-400 text-[8px]"></i>
            <span className="text-[9px] font-black text-emerald-500">{doc.rating} Rated</span>
          </div>
        </div>

        <div className="flex gap-6 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-indigo-950">
            {doc.avatar}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-black text-white tracking-tight leading-none mb-1">{doc.name}</h4>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{doc.title}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-medium italic border-l border-slate-800 pl-4 mb-8">
          "{doc.bio}"
        </p>

        <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between mb-8">
           <div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Availability</span>
             <span className="text-xs font-bold text-white">Next: Today, 3:30 PM</span>
           </div>
           <i className="fa-solid fa-calendar-check text-indigo-400"></i>
        </div>

        <button 
          onClick={() => onBook(doc.name)}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-950/20 active:scale-95"
        >
          Secure Consultation
        </button>
      </div>

      <div className="bg-black/30 p-4 text-center border-t border-slate-800">
         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Encrypted Medical Gateway Secure</span>
      </div>
    </div>
  );
};

export default DoctorReferral;