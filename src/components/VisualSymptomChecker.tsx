import React, { useState, useRef } from 'react';

interface VisualSymptomCheckerProps {
  onScanComplete: (data: { diagnosis: string; severity: 'Low' | 'Medium' | 'High' }) => void;
}

const VisualSymptomChecker: React.FC<VisualSymptomCheckerProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      simulateAIAnalysis();
    }
  };

  const simulateAIAnalysis = () => {
    setIsScanning(true);
    // Simulate Gemini Vision processing
    setTimeout(() => {
      setIsScanning(false);
      onScanComplete({
        diagnosis: "Erythematous rash (localized)",
        severity: "Medium"
      });
    }, 4000);
  };

  return (
    <div className="bg-white border-2 border-rose-100 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
      <div className="bg-rose-50 p-4 border-b border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-800">
          <i className="fa-solid fa-camera-retro"></i>
          <span className="text-[10px] font-black uppercase tracking-wider">Visual AI Triage Scan</span>
        </div>
        <div className="flex items-center gap-2 text-rose-400">
          <span className="text-[8px] font-black uppercase">Vision Core-v4</span>
          <i className="fa-solid fa-circle-nodes"></i>
        </div>
      </div>

      <div className="p-8">
        {!previewUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-rose-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-rose-400 hover:bg-rose-50/50 transition-all group"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-rose-300 group-hover:text-rose-500 group-hover:scale-110 transition-all shadow-sm border border-rose-100">
              <i className="fa-solid fa-plus text-2xl"></i>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Take or Upload Photo</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-[180px] leading-relaxed">Ensure good lighting and high focus on the concern area.</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment"
              onChange={handleFileChange} 
            />
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-rose-100 aspect-square max-h-72 mx-auto bg-slate-100">
            <img src={previewUrl} alt="Symptom Photo" className="w-full h-full object-cover" />
            
            {isScanning && (
              <div className="absolute inset-0 bg-rose-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Scanning Pixels...</span>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-60">ID_9921_X</span>
                </div>
                
                <div className="relative w-32 h-32 border-2 border-rose-400/30 rounded-full flex items-center justify-center">
                   <div className="w-full h-1 bg-rose-400 shadow-[0_0_20px_rgba(244,63,94,1)] absolute animate-[scan_2.5s_ease-in-out_infinite]"></div>
                   <i className="fa-solid fa-magnifying-glass-chart text-4xl animate-pulse"></i>
                </div>

                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-rose-300">Classifying Symptom...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0.2; }
          50% { top: 90%; opacity: 1; }
          100% { top: 10%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default VisualSymptomChecker;