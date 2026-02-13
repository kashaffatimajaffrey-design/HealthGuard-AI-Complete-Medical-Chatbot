
import React, { useState, useEffect, useCallback, useRef, Component, ErrorInfo, ReactNode } from 'react';
import Layout from './components/Layout.tsx';
import Sidebar from './components/Sidebar.tsx';
import ChatContainer from './components/ChatContainer.tsx';
import VoiceInterface from './components/VoiceInterface.tsx';
import AdminPortal from './components/AdminPortal.tsx';
import AdminLogin from './components/AdminLogin.tsx';
import PatientLogin from './components/PatientLogin.tsx';
import AutomationDashboard from './components/AutomationDashboard.tsx';
import WebhookSimulator from './components/WebhookSimulator.tsx';
import CRMIntegration from './components/CRMIntegration.tsx';
import ArchitectureDiagram from './components/ArchitectureDiagram.tsx';
import Dashboard from './components/Dashboard.tsx';
import { Message, PatientInfo, WebhookLog, CRMLead, CRMAutomationRule, AppMode, SystemMetrics, LiveActivity, TriageIntel } from './types.ts';
import { chatStream } from './services/gemini.ts';

const RECORDS_KEY = 'healthguard_records_v6';

// Corrected ErrorBoundary with proper TypeScript types for class components
class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Clinical System Fault:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <i className="fa-solid fa-circle-exclamation text-rose-500 text-6xl mb-6"></i>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">System Interface Fault</h1>
          <p className="text-slate-500 mt-2 max-w-md">{this.state.error?.message || 'A critical runtime exception occurred.'}</p>
          <div className="flex gap-4 mt-8">
            <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Reboot Interface</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const INITIAL_PATIENT: PatientInfo = {
  id: "GUEST-000",
  name: "Guest User",
  gender: 'N/A',
  dob: '',
  lastVisit: "None",
  status: "Guest",
  visits: [],
  chatHistory: []
};

const INITIAL_TRIAGE_INTEL: TriageIntel = {
  riskLevel: 'Low',
  labHighlights: [],
  symptoms: []
};

const DEFAULT_LEADS: CRMLead[] = [
  { id: 'l1', name: 'John Peterson', email: 'john.p@gmail.com', phone: '(555) 123-4567', source: 'AI Chatbot', status: 'Booked', createdAt: '2023-11-15' },
  { id: 'l2', name: 'Sarah Miller', email: 's.miller@outlook.com', phone: '(555) 987-6543', source: 'Voice AI', status: 'New', createdAt: '2023-11-16' },
];

const DEFAULT_RULES: CRMAutomationRule[] = [
  { id: 'r1', trigger: 'New lead from voice chatbot', action: 'Add to CRM + Send welcome email + Tag for follow-up', active: true },
  { id: 'r2', trigger: 'Missed call during office hours', action: 'Send SMS + Create follow-up task', active: true },
];

const AppContent: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showPatientLogin, setShowPatientLogin] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  
  const [patient, setPatient] = useState<PatientInfo>(INITIAL_PATIENT);
  const [allPatients, setAllPatients] = useState<PatientInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [globalWebhookLogs, setGlobalWebhookLogs] = useState<WebhookLog[]>([]);
  const [crmLeads, setCrmLeads] = useState<CRMLead[]>(DEFAULT_LEADS);
  const [crmRules, setCrmRules] = useState<CRMAutomationRule[]>(DEFAULT_RULES);
  const [triageIntel, setTriageIntel] = useState<TriageIntel>(INITIAL_TRIAGE_INTEL);
  const [unreadCount, setUnreadCount] = useState(0);

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 24, activeRequests: 4, aiTokensSec: 1240, latencyMs: 142,
    history: [24, 28, 22, 30, 25, 27, 24]
  });

  useEffect(() => {
    const saved = localStorage.getItem(RECORDS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setAllPatients(parsed);
      } catch (e) {
        localStorage.removeItem(RECORDS_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (allPatients.length > 0) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(allPatients));
    }
  }, [allPatients]);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setApiError(false);

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text }] });

      const stream = await chatStream(history, "You are a professional medical assistant for HealthGuard.");
      
      let assistantContent = '';
      const assistantId = "assistant-" + Date.now();
      
      for await (const chunk of stream) {
        assistantContent += (chunk as any).text || "";
        setMessages(prev => {
          const others = prev.filter(m => m.id !== assistantId);
          return [...others, {
            id: assistantId,
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }];
        });
      }

      const lower = assistantContent.toLowerCase();
      let widget: Message['widget'] = undefined;
      if (lower.includes('schedule') || lower.includes('appointment')) widget = 'calendar';
      if (lower.includes('register') || lower.includes('form')) widget = 'intake-form';
      if (lower.includes('insurance')) widget = 'insurance-scan';
      if (lower.includes('lab') || lower.includes('report')) widget = 'lab-scan';
      
      if (widget) {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, widget } : m));
      }

    } catch (err) {
      setApiError(true);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having difficulty connecting to the clinical cloud. Let's switch to local triage protocols.",
        timestamp: new Date().toLocaleTimeString(),
        type: 'options',
        options: ['Schedule Check-up', 'Start Intake Form', 'Upload Insurance']
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Layout 
      isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} 
      activeMode={activeMode} setActiveMode={setActiveMode}
      metrics={systemMetrics} unreadCount={unreadCount}
      clearNotifications={() => setUnreadCount(0)}
    >
      <Sidebar 
        isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} patient={patient}
        onStartRegistration={() => handleSendMessage("Register new profile")}
        onStartLogin={() => setShowPatientLogin(true)} 
        onLogout={() => setPatient(INITIAL_PATIENT)} 
        onSwitchMode={setActiveMode}
      />

      <main className="flex-1 h-full relative overflow-hidden flex flex-col bg-slate-50">
        {activeMode === 'dashboard' && <Dashboard patients={allPatients} leads={crmLeads} logs={globalWebhookLogs} onSwitchMode={setActiveMode} metrics={systemMetrics} activities={[]} />}
        {activeMode === 'chat' && <ChatContainer messages={messages} isTyping={isTyping} onSendMessage={handleSendMessage} onOptionClick={handleSendMessage} onRegisterPatient={(p) => setAllPatients(prev => [p, ...prev])} apiError={apiError} triageIntel={triageIntel} />}
        {activeMode === 'voice' && <VoiceInterface onClose={() => setActiveMode('dashboard')} patientName={patient.name} />}
        {activeMode === 'admin' && (isAdminAuthenticated ? <AdminPortal patients={allPatients} onLogout={() => setIsAdminAuthenticated(false)} onUpdatePatient={(p) => setAllPatients(prev => prev.map(c => c.id === p.id ? p : c))} /> : <AdminLogin onLogin={setIsAdminAuthenticated} onCancel={() => setActiveMode('dashboard')} />)}
        {activeMode === 'automation' && <AutomationDashboard initialLogs={globalWebhookLogs} patients={allPatients} />}
        {activeMode === 'crm' && <CRMIntegration leads={crmLeads} setLeads={setCrmLeads} rules={crmRules} setRules={setCrmRules} patients={allPatients} />}
        {activeMode === 'architecture' && <ArchitectureDiagram />}
        {activeMode === 'simulator' && <WebhookSimulator patient={patient} onEvent={(log) => setGlobalWebhookLogs(prev => [log, ...prev].slice(0, 50))} />}
      </main>

      {showPatientLogin && (
        <PatientLogin 
          allPatients={allPatients} 
          onLogin={(p) => { setPatient(p); setShowPatientLogin(false); setActiveMode('chat'); }} 
          onCancel={() => setShowPatientLogin(false)} 
        />
      )}
    </Layout>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
