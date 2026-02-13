import React, { useState, useRef } from 'react';

interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  reference: string;
  status: 'Normal' | 'High' | 'Low';
}

interface LabReportAnalyzerProps {
  onAnalysisComplete: (results: LabResult[]) => void;
}

const LabReportAnalyzer: React.FC<LabReportAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<LabResult[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      simulateAnalysis();
    }
  };

  const simulateAnalysis = () => {
    setIsScanning(true);
    setResults(null);
    
    // Simulate AI deep document parsing
    setTimeout(() => {
      setIsScanning(false);
      const mockResults: LabResult[] = [
        { parameter: "Glucose (Fasting)", value: "92", unit: "mg/dL", reference: "70-99", status: "Normal" },
        { parameter: "Total Cholesterol", value: "215", unit: "mg/dL", reference: "<200", status: "High" },
        { parameter: "Vitamin D, 25-OH", value: "18", unit: "ng/mL", reference: "30-100", status: "Low" },
        { parameter: "Hemoglobin A1c", value: "5.4", unit: "%", reference: "4.0-5.6", status: "Normal" }
      ];
      setResults(mockResults);
      onAnalysisComplete(mockResults);
    }, 3500);
  };

  return (
    <div className="bg-white border-2 border-indigo-100 rounded-3xl overflow-hidden shadow-xl animate-in zoom-in-95">
      <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-800">
          <i className="fa-solid fa-microscope"></i>
          <span className="text-[10px] font-black uppercase tracking-wider">Clinical Lab AI Analyzer</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Vision-v3 Active</span>
        </div>
      </div>

      <div className="p-6">
        {!previewUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-100 transition-all shadow-sm">
              <i className="fa-solid fa-file-waveform text-2xl"></i>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-700">Drop Lab Report Here</p>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">PDF • JPEG • PNG (Max 10MB)</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf" 
              onChange={handleFileChange} 
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-48 shadow-inner bg-slate-100">
              <img src={previewUrl} alt="Report Preview" className="w-full h-full object-contain" />
              
              {isScanning && (
                <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-400 border-t-white rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">AI Multimodal Analysis...</p>
                  </div>
                  {/* Scanning line effect */}
                  <div className="absolute left-0 right-0 h-[2px] bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,1)] animate-[scan_2.5s_ease-in-out_infinite]"></div>
                </div>
              )}
            </div>

            {results && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extracted Biomarkers</h4>
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Found {results.length} Values</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {results.map((res, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex items-center justify-between group transition-all ${
                      res.status === 'High' ? 'bg-rose-50 border-rose-100' : 
                      res.status === 'Low' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                          res.status === 'High' ? 'bg-rose-500 text-white' : 
                          res.status === 'Low' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <i className={`fa-solid ${res.status === 'High' ? 'fa-arrow-trend-up' : res.status === 'Low' ? 'fa-arrow-trend-down' : 'fa-check'}`}></i>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">{res.parameter}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Ref: {res.reference} {res.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${
                          res.status === 'High' ? 'text-rose-600' : 
                          res.status === 'Low' ? 'text-amber-600' : 'text-slate-800'
                        }`}>{res.value} <span className="text-[9px] opacity-60">{res.unit}</span></p>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${
                          res.status === 'High' ? 'text-rose-400' : 
                          res.status === 'Low' ? 'text-amber-400' : 'text-emerald-500'
                        }`}>{res.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4">
                   <p className="text-[9px] text-slate-500 font-medium leading-relaxed italic">
                     * This analysis is for clinical triage reference. Please consult with your assigned doctor to discuss these values in detail.
                   </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.2; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default LabReportAnalyzer;