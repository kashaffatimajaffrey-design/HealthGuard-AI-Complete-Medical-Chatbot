import React, { useRef, useEffect } from 'react';
import { Message, PatientInfo, TriageIntel } from '../types.ts';
import BookingWidget from './BookingWidget.tsx';
import IntakeForm from './IntakeForm.tsx';
import InsuranceOCR from './InsuranceOCR.tsx';
import PrescriptionReader from './PrescriptionReader.tsx';
import LabReportAnalyzer from './LabReportAnalyzer.tsx';
import VisualSymptomChecker from './VisualSymptomChecker.tsx';
import DoctorReferral from './DoctorReferral.tsx';

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onOptionClick: (option: string) => void;
  onRegisterPatient: (patient: PatientInfo) => void;
  apiError?: boolean;
  triageIntel: TriageIntel;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isTyping, onSendMessage, onOptionClick, onRegisterPatient, apiError, triageIntel }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current?.value.trim()) {
      onSendMessage(inputRef.current.value);
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#F8FAFC] relative overflow-hidden">
      <div className="flex-1 flex flex-col h-full border-r border-slate-200 min-w-0">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar"
        >
          {apiError && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-4">
              <i className="fa-solid fa-circle-exclamation"></i>
              API Connection Offline - Local Demo Mode
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : (msg.role === 'system' ? 'justify-center' : 'justify-start')} animate-in fade-in slide-in-from-bottom-2`}>
              {msg.role === 'system' ? (
                <div className="bg-slate-200/50 backdrop-blur-sm border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-lock"></i>
                  {msg.content}
                </div>
              ) : (
                <div className={`max-w-[90%] md:max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-white border-2 border-sky-100 text-slate-800 rounded-tr-none' 
                      : 'bg-sky-500 text-white rounded-tl-none shadow-sky-100'}
                  `}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.type === 'options' && msg.options && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {msg.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => onOptionClick(opt)}
                            className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-sky-600 hover:scale-105 transition-all"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.widget === 'calendar' && (
                      <div className="mt-4 w-full">
                        <BookingWidget onSelect={(slot) => onSendMessage(`Confirming appointment for ${slot}.`)} />
                      </div>
                    )}

                    {msg.widget === 'intake-form' && (
                      <div className="mt-4 w-full">
                        <IntakeForm 
                          onComplete={onRegisterPatient} 
                          onCancel={() => onSendMessage("Cancel registration.")} 
                        />
                      </div>
                    )}

                    {msg.widget === 'insurance-scan' && (
                      <div className="mt-4 w-full">
                        <InsuranceOCR 
                          onScanComplete={(data) => onSendMessage(`Scanned card. Provider: ${data.provider}, ID: ${data.memberId}.`)} 
                        />
                      </div>
                    )}

                    {msg.widget === 'prescription-scan' && (
                      <div className="mt-4 w-full">
                        <PrescriptionReader 
                          onScanComplete={(data) => onSendMessage(`Uploaded script. Medication: ${data.medication}.`)} 
                        />
                      </div>
                    )}

                    {msg.widget === 'lab-scan' && (
                      <div className="mt-4 w-full">
                        <LabReportAnalyzer 
                          onAnalysisComplete={() => onSendMessage(`Lab report analyzed.`)} 
                        />
                      </div>
                    )}

                    {msg.widget === 'symptom-scan' && (
                      <div className="mt-4 w-full">
                        <VisualSymptomChecker 
                          onScanComplete={(data) => onSendMessage(`Analysis complete: ${data.diagnosis}.`)} 
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 px-1">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">{msg.timestamp}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-200/50 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative flex gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Describe your concern..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600 text-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg transition-all"
            >
              <i className="fa-solid fa-paper-plane text-lg"></i>
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex w-80 bg-[#0F172A] flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <i className="fa-solid fa-brain text-emerald-400"></i>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Intelligence Panel</h3>
          </div>
          
          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-black text-slate-500 uppercase">Triage Risk</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase">{triageIntel.riskLevel}</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full mt-2">
               <div className="h-full bg-emerald-500 w-1/4"></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-3 opacity-40">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <i className="fa-solid fa-shield-halved"></i> Insurance Status
             </span>
             <div className="p-4 rounded-xl border border-dashed border-slate-800 flex items-center justify-center">
               <span className="text-[9px] text-slate-600 font-black uppercase">Pending Data...</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;