
import React, { useState } from 'react';
import { PatientInfo, Visit, Medication, LabWork, Message } from '../types';

interface AdminPortalProps {
  patients: PatientInfo[];
  onLogout: () => void;
  onUpdatePatient: (updatedPatient: PatientInfo) => void;
}

const DEPARTMENTS = ['General Triage', 'Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Emergency'];
const DOCTORS = ['Dr. Sarah Chen', 'Dr. Marcus Thorne', 'Dr. Elena Rodriguez', 'Dr. James Wilson'];

const AdminPortal: React.FC<AdminPortalProps> = ({ patients, onLogout, onUpdatePatient }) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showCheckIn, setShowCheckIn] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'clinical' | 'chat'>('clinical');

  // Form State for new check-in
  const [checkInForm, setCheckInForm] = useState({
    symptoms: '',
    diagnosis: '',
    dept: 'General Triage',
    doctor: 'Dr. Sarah Chen',
    medName: '',
    medDosage: '',
    medFreq: '',
    labTest: '',
    nextVisit: ''
  });

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'All' || p.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const calculateAge = (dob: string) => {
    if (!dob) return '--';
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = patients.find(p => p.id === showCheckIn);
    if (!p) return;

    const newVisit: Visit = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      symptoms: checkInForm.symptoms,
      diagnosis: checkInForm.diagnosis,
      department: checkInForm.dept,
      assignedDoctor: checkInForm.doctor,
      medications: checkInForm.medName ? [{
        name: checkInForm.medName,
        dosage: checkInForm.medDosage,
        frequency: checkInForm.medFreq
      }] : [],
      labWorks: checkInForm.labTest ? [{
        test: checkInForm.labTest,
        result: 'Awaiting Results',
        status: 'Pending'
      }] : []
    };

    const updatedPatient: PatientInfo = {
      ...p,
      department: checkInForm.dept,
      assignedDoctor: checkInForm.doctor,
      nextVisit: checkInForm.nextVisit,
      lastVisit: new Date().toLocaleDateString(),
      visits: [newVisit, ...p.visits]
    };

    onUpdatePatient(updatedPatient);
    setShowCheckIn(null);
    setCheckInForm({
      symptoms: '', diagnosis: '', dept: 'General Triage', 
      doctor: 'Dr. Sarah Chen', medName: '', medDosage: '', 
      medFreq: '', labTest: '', nextVisit: ''
    });
  };

  return (
    <div className="flex-1 h-full bg-slate-50 flex flex-col overflow-hidden animate-in fade-in duration-500">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Hospital Administration</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Clinical Data Center v6.0 • Logged in as KASHAF</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-600 uppercase">Database Connected</span>
          </div>
          <button onClick={onLogout} className="bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-all p-3 rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-bold">
            <i className="fa-solid fa-power-off"></i>
            Exit Portal
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Clinical Directory Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Global Patient Registry</h3>
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
                  <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Special ID or Name..."
                    className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold w-80 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department:</span>
                <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="text-[11px] font-black bg-slate-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 border-transparent">
                  <option>All</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Export CSV</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">Special ID / Patient Name</th>
                    <th className="px-8 py-5">Assigned Department</th>
                    <th className="px-8 py-5">Encounters</th>
                    <th className="px-8 py-5">Recent Diagnosis</th>
                    <th className="px-8 py-5">Next Appointment</th>
                    <th className="px-8 py-5 text-right">Registry Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPatients.length > 0 ? filteredPatients.map((p) => (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`hover:bg-indigo-50/30 transition-colors cursor-pointer group ${selectedPatientId === p.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${selectedPatientId === p.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600'}`}>
                            {p.name[0]}
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-slate-800 tracking-tight">{p.name}</p>
                            <p className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-tighter">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {p.department || 'Awaiting Triage'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-folder-open text-slate-300"></i>
                          <span className="text-xs font-bold text-slate-600">{p.visits.length} Logs</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{p.visits[0]?.diagnosis || 'No Diagnosis Listed'}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{p.lastVisit}</p>
                      </td>
                      <td className="px-8 py-6">
                        {p.nextVisit ? (
                          <div className="px-3 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-lg w-fit text-[10px] font-black uppercase">
                            {p.nextVisit}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-bold italic uppercase">Not Scheduled</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowCheckIn(p.id); }}
                          className="bg-white border border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          <i className="fa-solid fa-plus mr-2"></i> New Encounter
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-[0.4em] italic opacity-50">
                        No Patient Records Matching Query
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Panel - The Record View */}
          {selectedPatient && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col min-h-[600px] animate-in slide-in-from-bottom-6 duration-500">
              <div className="bg-slate-900 px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-500 flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-900/40">
                    {selectedPatient.name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{selectedPatient.name}</h3>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[11px] text-indigo-400 font-mono font-black uppercase tracking-widest">Unique MRN: {selectedPatient.id}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{selectedPatient.gender} • {calculateAge(selectedPatient.dob)} Years Old</span>
                    </div>
                  </div>
                </div>
                <div className="flex bg-slate-800 p-2 rounded-[1.8rem] border border-slate-700">
                  <button 
                    onClick={() => setDetailTab('clinical')}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${detailTab === 'clinical' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}
                  >
                    Medical Timeline
                  </button>
                  <button 
                    onClick={() => setDetailTab('chat')}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${detailTab === 'chat' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}
                  >
                    AI Chat Logs
                  </button>
                </div>
              </div>

              <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                {detailTab === 'clinical' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <i className="fa-solid fa-clock-rotate-left text-indigo-500"></i>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Clinical Encounters Log</h4>
                      </div>
                      <div className="space-y-6">
                        {selectedPatient.visits.length > 0 ? selectedPatient.visits.map(v => (
                          <div key={v.id} className="group bg-slate-50/50 hover:bg-white p-6 rounded-[2rem] border border-slate-100 transition-all hover:shadow-xl hover:border-indigo-100 relative">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest block mb-1">{v.date}</span>
                                <h5 className="text-lg font-black text-slate-800 tracking-tight">{v.diagnosis || 'Clinical Assessment'}</h5>
                              </div>
                              <span className="text-[9px] font-black text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">{v.department}</span>
                            </div>
                            <div className="space-y-3">
                              <p className="text-xs text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-200 pl-4 py-1">"{v.symptoms}"</p>
                              {v.assignedDoctor && (
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-4">
                                  <i className="fa-solid fa-user-doctor text-indigo-400"></i> Signed by {v.assignedDoctor}
                                </p>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="py-32 flex flex-col items-center justify-center text-slate-300 gap-4">
                            <i className="fa-solid fa-folder-open text-6xl opacity-10"></i>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Historical Buffer Empty</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/10 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
                          <i className="fa-solid fa-id-card text-9xl"></i>
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-6 opacity-70">Clinical Summary</h4>
                        <div className="space-y-5 relative z-10">
                          <div className="flex justify-between items-end border-b border-white/10 pb-3">
                            <span className="text-[10px] font-black uppercase opacity-60">Status</span>
                            <span className="text-sm font-black uppercase">{selectedPatient.status}</span>
                          </div>
                          <div className="flex justify-between items-end border-b border-white/10 pb-3">
                            <span className="text-[10px] font-black uppercase opacity-60">DOB</span>
                            <span className="text-sm font-black">{selectedPatient.dob}</span>
                          </div>
                          <div className="flex justify-between items-end border-b border-white/10 pb-3">
                            <span className="text-[10px] font-black uppercase opacity-60">Primary MD</span>
                            <span className="text-sm font-black">{selectedPatient.assignedDoctor || 'Unassigned'}</span>
                          </div>
                          <div className="flex justify-between items-end pb-3">
                            <span className="text-[10px] font-black uppercase opacity-60">Next Visit</span>
                            <span className="text-sm font-black text-amber-300">{selectedPatient.nextVisit || 'Not Scheduled'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-200 pb-3">Quick Actions</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-700 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">Issue Referral</button>
                          <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-700 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">Generate Bill</button>
                          <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-700 uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm">Mark Inactive</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in slide-in-from-right-6 duration-700">
                    <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-[2rem] flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-200 rounded-2xl flex items-center justify-center text-amber-700 text-xl">
                        <i className="fa-solid fa-shield-halved"></i>
                      </div>
                      <div>
                        <h5 className="text-[11px] font-black text-amber-800 uppercase tracking-[0.2em]">HIPAA Compliance Audit View</h5>
                        <p className="text-[10px] text-amber-600 font-bold leading-relaxed uppercase opacity-70">
                          Staff are viewing the raw interaction data between the AI Triage agent and the unique MRN holder. 
                          These logs are stored persistently for clinical review and legal verification.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {selectedPatient.chatHistory.length > 0 ? selectedPatient.chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-6 rounded-[2rem] text-[13px] shadow-sm border ${
                            msg.role === 'user' 
                              ? 'bg-slate-50 text-slate-700 rounded-tr-none border-slate-200' 
                              : 'bg-indigo-600 text-white rounded-tl-none border-indigo-700'
                          }`}>
                            <div className="flex justify-between items-center mb-3 opacity-60 text-[9px] font-black uppercase tracking-widest">
                              <span>{msg.role === 'user' ? 'PATIENT INBOUND' : 'AI RESPONSE'}</span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p className="leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>
                            {msg.widget && (
                              <div className="mt-4 pt-4 border-t border-black/10 text-[9px] font-black uppercase tracking-widest opacity-60">
                                <i className="fa-solid fa-cube mr-2"></i> WIDGET_TRIGGERED: {msg.widget.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="h-96 flex flex-col items-center justify-center text-slate-200 space-y-6">
                          <i className="fa-solid fa-comment-slash text-7xl opacity-10"></i>
                          <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Communication Data Found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Encounter Check-In Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="bg-indigo-600 p-10 text-white relative">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                <i className="fa-solid fa-notes-medical text-9xl"></i>
              </div>
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Clinical Encounter</h3>
                  <p className="text-[10px] text-indigo-200 font-black uppercase tracking-[0.3em] mt-2">MRN: {showCheckIn} • COMMIT TO FILE</p>
                </div>
                <button onClick={() => setShowCheckIn(null)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleCheckInSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Symptoms (Reported)</label>
                <textarea required rows={3} value={checkInForm.symptoms} onChange={e => setCheckInForm({...checkInForm, symptoms: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all font-medium" placeholder="Describe clinical presentation..."/>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Clinical Diagnosis</label>
                <textarea required rows={3} value={checkInForm.diagnosis} onChange={e => setCheckInForm({...checkInForm, diagnosis: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all font-medium" placeholder="Final clinical findings..."/>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Department Assignment</label>
                <select value={checkInForm.dept} onChange={e => setCheckInForm({...checkInForm, dept: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold appearance-none cursor-pointer">
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Attending MD</label>
                <select value={checkInForm.doctor} onChange={e => setCheckInForm({...checkInForm, doctor: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold appearance-none cursor-pointer">
                  {DOCTORS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Next Follow-up Date</label>
                <input type="date" value={checkInForm.nextVisit} onChange={e => setCheckInForm({...checkInForm, nextVisit: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold"/>
              </div>

              <div className="md:col-span-2 pt-6 flex gap-6">
                <button type="button" onClick={() => setShowCheckIn(null)} className="flex-1 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-800 transition-colors">Discard Draft</button>
                <button type="submit" className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-[1.8rem] shadow-2xl shadow-indigo-900/20 transition-all active:scale-95">Commit Encounter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
