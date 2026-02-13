import React, { useState, useRef } from 'react';

interface PrescriptionReaderProps {
  onScanComplete: (data: { medication: string; dosage: string; frequency: string }) => void;
}

const PrescriptionReader: React.FC<PrescriptionReaderProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      simulateScan();
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    // Simulate AI Vision/OCR processing
    setTimeout(() => {
      setIsScanning(false);
      onScanComplete({
        medication: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily"
      });
    }, 3000);
  };

  return (
    <div className="bg-white border-2 border-emerald-100 rounded-2xl overflow-hidden shadow-lg animate-in zoom-in-95">
      <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-800">
          <i className="fa-solid fa-file-medical"></i>
          <span className="text-[10px] font-black uppercase tracking-wider">Prescription AI Reader</span>
        </div>
        <i className="fa-solid fa-microscope text-emerald-400"></i>
      </div>

      <div className="p-6">
        {!previewUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-100 transition-all">
              <i className="fa-solid fa-file-arrow-up text-xl"></i>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-700">Upload Prescription</p>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Clear photo of script • JPEG or PNG</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[1/1.2] max-h-64 mx-auto">
            <img src={previewUrl} alt="Prescription Preview" className="w-full h-full object-cover" />
            
            {isScanning && (
              <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="w-full h-1 bg-white/20 absolute top-0">
                  <div className="h-full bg-emerald-400 animate-[progress_3s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <i className="fa-solid fa-magnifying-glass-plus animate-bounce text-3xl"></i>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">AI Reading Medication...</p>
                </div>
                {/* Scanning line effect */}
                <div className="absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

export default PrescriptionReader;