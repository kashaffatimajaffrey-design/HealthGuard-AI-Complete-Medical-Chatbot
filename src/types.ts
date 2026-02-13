export type Role = 'user' | 'assistant' | 'system';

export type AppMode = 'dashboard' | 'chat' | 'voice' | 'settings' | 'admin' | 'automation' | 'simulator' | 'crm' | 'architecture';

export interface TriageIntel {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Emergency';
  insurance?: { provider: string; id: string };
  medication?: { name: string; dose: string };
  labHighlights: { parameter: string; status: string }[];
  symptoms: string[];
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  type?: 'standard' | 'confirmation' | 'urgent' | 'booking' | 'options' | 'intake';
  options?: string[];
  widget?: 'calendar' | 'file-upload' | 'intake-form' | 'insurance-scan' | 'prescription-scan' | 'lab-scan' | 'symptom-scan' | 'referral';
  metadata?: any;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface LabWork {
  test: string;
  result: string;
  status: 'Pending' | 'Completed' | 'Abnormal';
}

export interface Visit {
  id: string;
  date: string;
  symptoms: string;
  diagnosis?: string;
  medications?: Medication[];
  labWorks?: LabWork[];
  department?: string;
  assignedDoctor?: string;
  notes?: string;
}

export interface PatientInfo {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other' | 'N/A';
  dob: string;
  lastVisit: string;
  nextVisit?: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Guest';
  mrn?: string;
  registeredAt?: string;
  visits: Visit[];
  chatHistory: Message[]; 
  assignedDoctor?: string;
  department?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  date: string;
}

// Automation Dashboard Types
export interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'error';
  triggerCount: number;
  lastRun: string;
  workflow_json: string;  // Changed from 'json' to avoid conflict
}

export interface WebhookLog {
  id: string;
  path: string;
  timestamp: string;
  status: number;  // FIXED: Changed from union type to number
  payload: string;
  response?: any;  // Added to store response data
  type?: 'voice' | 'crm' | 'calendar' | 'system' | 'automation';
  automationTriggered?: boolean;
}

export interface ServiceStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  lastSync: string;
}

// CRM Simulation Types
export interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'AI Chatbot' | 'Voice AI' | 'Manual';
  status: 'New' | 'Contacted' | 'Booked';
  createdAt: string;
}

export interface CRMAutomationRule {
  id: string;
  trigger: string;
  action: string;
  active: boolean;
}

export interface CRMSyncAction {
  id: string;
  action: string;
  timestamp: string;
  status: 'success' | 'pending';
}

// Architecture Types
export interface ArchNode {
  id: string;
  label: string;
  tech: string;
  description: string;
  status: 'online' | 'degraded' | 'offline';
  icon: string;
}

export interface PerformanceMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}

export interface SystemMetrics {
  cpuUsage: number;
  activeRequests: number;
  aiTokensSec: number;
  latencyMs: number;
  history: number[];
}

export interface LiveActivity {
  id: string;
  type: 'clinical' | 'system' | 'ai' | 'automation';
  message: string;
  timestamp: string;
}