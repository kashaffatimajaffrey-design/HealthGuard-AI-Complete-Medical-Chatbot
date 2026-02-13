import React, { useState, useEffect, useRef, useCallback } from 'react';
import { decode, decodeAudioData, createPcmBlob } from '../utils/audio';
import { connectLive, chatStream } from '../services/gemini';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface VoiceInterfaceProps {
  onClose: () => void;
  patientName: string;
}

type VoiceEngine = 'live' | 'fallback' | 'connecting';

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onClose, patientName }) => {
  const [engine, setEngine] = useState<VoiceEngine>('connecting');
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiTranscription, setAiTranscription] = useState('');
  const [status, setStatus] = useState('Establishing Clinical Link...');
  
  const isListeningRef = useRef(false);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);

  const startFallbackEngine = useCallback(() => {
    setEngine('fallback');
    setStatus('Standard Voice Engine Active');
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscription(text);
        if (event.results[0].isFinal) {
          handleFallbackResponse(text);
        }
      };
      recognition.onerror = () => setStatus('Voice recognition error');
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [patientName]);

  const handleFallbackResponse = async (userText: string) => {
    setStatus('Clinical reasoning...');
    try {
      const stream = await chatStream(
        [{ role: 'user', parts: [{ text: userText }] }],
        `You are a voice assistant for HealthGuard. You are speaking with ${patientName}. Respond briefly and professionally.`
      );
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk.text || "";
        setAiTranscription(fullText);
      }

      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.onstart = () => setStatus('Synthesizing audio...');
        utterance.onend = () => {
          setStatus('Ready');
          setTranscription('');
          setAiTranscription('');
        };
        synthRef.current.speak(utterance);
      }
    } catch (err) {
      setStatus('Engine stall');
    }
  };

  useEffect(() => {
    let active = true;
    const initLiveVoice = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) return;

        const inCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const outCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = inCtx;
        outContextRef.current = outCtx;

        // Use string constants for modalities to avoid import dependencies
        const sessionPromise = connectLive({
          responseModalities: ['AUDIO'],
          systemInstruction: `You are a triage assistant for HealthGuard. Speaking with ${patientName}. Focus on symptom gathering and appointment routing.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }, {
          onopen: () => {
            if (!active) return;
            setEngine('live');
            setIsListening(true);
            isListeningRef.current = true;
            setStatus('Secure Live Link established');
          },
          onmessage: async (msg: any) => {
            if (!active) return;
            if (msg.serverContent?.inputTranscription) setTranscription(msg.serverContent.inputTranscription.text);
            if (msg.serverContent?.outputTranscription) setAiTranscription(prev => prev + msg.serverContent.outputTranscription.text);
            
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.onended = () => activeSourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              activeSourcesRef.current.add(source);
              setStatus('Assistant speaking...');
            }

            if (msg.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (err: any) => {
            console.warn("Live API Fault:", err);
            if (active) startFallbackEngine();
          },
          onclose: () => {
             if (active) startFallbackEngine();
          }
        });

        sessionPromiseRef.current = sessionPromise;

        const source = inCtx.createMediaStreamSource(mediaStream);
        const processor = inCtx.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (e) => {
          if (!active || !isListeningRef.current) return;
          sessionPromise.then((session) => {
            const pcmBlob = createPcmBlob(e.inputBuffer.getChannelData(0));
            session.sendRealtimeInput({ media: pcmBlob });
          }).catch(() => {});
        };
        source.connect(processor);
        processor.connect(inCtx.destination);

      } catch (err) {
        if (active) startFallbackEngine();
      }
    };

    initLiveVoice();

    return () => {
      active = false;
      sessionPromiseRef.current?.then(s => {
        try { s.close(); } catch(e) {}
      });
      audioContextRef.current?.close();
      outContextRef.current?.close();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [patientName, startFallbackEngine]);

  const toggleVoice = () => {
    if (engine === 'fallback') {
      if (isListening) {
        recognitionRef.current?.stop();
      } else {
        recognitionRef.current?.start();
      }
    } else {
      const newState = !isListening;
      setIsListening(newState);
      isListeningRef.current = newState;
      setStatus(newState ? 'Listening...' : 'Interface Muted');
    }
  };

  return (
    <div className="absolute inset-0 bg-white/98 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
      <button onClick={onClose} className="absolute top-6 right-6 p-3 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all">
        <i className="fa-solid fa-xmark text-2xl"></i>
      </button>

      <div className="mb-12">
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all shadow-2xl ${
          isListening ? (engine === 'live' ? 'bg-indigo-600 shadow-indigo-200 scale-110' : 'bg-emerald-600 shadow-emerald-200 scale-110') : 'bg-slate-100 text-slate-400'
        }`}>
          <i className={`fa-solid ${isListening ? 'fa-waveform-lines animate-pulse text-white' : 'fa-microphone-slash'} text-4xl`}></i>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            {engine === 'live' ? 'Live Multimodal' : engine === 'fallback' ? 'Voice Concierge' : 'Connecting...'}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
            <p className="font-black tracking-[0.2em] uppercase text-[10px] text-slate-500">{status}</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl w-full h-40 flex flex-col items-center justify-center mb-10 px-8">
        {aiTranscription ? (
          <p className="text-indigo-600 font-bold text-xl leading-tight animate-in fade-in slide-in-from-bottom-2">
            {aiTranscription}
          </p>
        ) : (
          <p className="text-slate-400 italic text-lg">
            {transcription || "Waiting for audio input..."}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 h-20 mb-16 w-full max-w-sm">
        {[...Array(24)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isListening ? (engine === 'live' ? 'bg-indigo-500 wave-bar' : 'bg-emerald-500 wave-bar') : 'h-1.5 bg-slate-200'
            }`}
            style={{ 
              height: isListening ? `${20 + Math.random() * 80}%` : '6px',
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-8">
        <button 
          onClick={toggleVoice}
          className={`w-28 h-28 flex items-center justify-center rounded-full text-white shadow-2xl transition-all transform active:scale-90 hover:scale-105 ${
            isListening ? 'bg-rose-500 shadow-rose-200' : 'bg-indigo-600 shadow-indigo-200'
          }`}
        >
          <i className={`fa-solid ${isListening ? 'fa-microphone-slash' : 'fa-microphone'} text-4xl`}></i>
        </button>
        
        <div className="flex items-center gap-4 text-slate-400">
           <i className="fa-solid fa-shield-halved text-xs"></i>
           <span className="text-[9px] font-black uppercase tracking-[0.3em]">HIPAA Encrypted Interface</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
