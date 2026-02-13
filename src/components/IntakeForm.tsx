
import React, { useState } from 'react';
import { PatientInfo } from '../types';

interface IntakeFormProps {
  onComplete: (patient: PatientInfo) => void;
  onCancel: () => void;
}

const IntakeForm: React.FC<IntakeFormProps> = ({ onComplete, onCancel }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'N/A'>('N/A');
  const [symptoms, setSymptoms] = useState('');
  const [doctor, setDoctor] = useState('Dr. Sarah Chen');

  const generateUniqueID = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = () => Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `HG-${segment()}-${segment()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return;
    
    const uniqueId = generateUniqueID();
    // Added chatHistory: [] to match the PatientInfo interface requirement.
    // This allows the parent component to receive a valid PatientInfo object.
    onComplete({
      id: uniqueId,
      name,
      dob,
      gender,
      assignedDoctor: doctor,
      lastVisit: new Date().toLocaleDateString(),
      status: 'Active',
      mrn: uniqueId,
      registeredAt: new Date().toLocaleDateString(),
      visits: symptoms ? [{
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        symptoms: symptoms,
        assignedDoctor: doctor,
        department: 'General Triage'
      }] : [],
      chatHistory: []
    });
  };

  return (
    <div className="bg-white border-2 border-amber-100 rounded-2xl overflow-hidden shadow-xl animate-in zoom-in-95">
      <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800">
          <i className="fa-solid fa-notes-medical"></i>
          <span className="text-xs font-bold uppercase tracking-wider">Clinical Intake Registration</span>
        </div>
        <button onClick={onCancel} className="text-amber-400 hover:text-amber-600 transition-colors">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice Smith"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
            <select 
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-500 transition-all"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="N/A">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
            <input 
              required
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Provider</label>
            <select 
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-500 transition-all"
            >
              <option>Dr. Sarah Chen</option>
              <option>Dr. Marcus Thorne</option>
              <option>Dr. Elena Rodriguez</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Chief Complaint / Initial Symptoms</label>
          <textarea 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe initial concerns for the medical record..."
            rows={2}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-500 transition-all resize-none"
          />
        </div>

        <div className="pt-2 flex gap-3">
          <button 
            type="submit"
            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-100 transition-all active:scale-95 text-xs"
          >
            Create Hospital Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default IntakeForm;
