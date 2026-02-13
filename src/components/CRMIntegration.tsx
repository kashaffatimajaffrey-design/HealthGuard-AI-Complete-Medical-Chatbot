
import React, { useState, useCallback, useMemo } from 'react';
import { CRMLead, CRMAutomationRule, PatientInfo } from '../types';
import { TableSkeleton } from './Skeletons';

interface CRMIntegrationProps {
  leads: CRMLead[];
  setLeads: React.Dispatch<React.SetStateAction<CRMLead[]>>;
  rules: CRMAutomationRule[];
  setRules: React.Dispatch<React.SetStateAction<CRMAutomationRule[]>>;
  patients: PatientInfo[];
}

const CRMIntegration: React.FC<CRMIntegrationProps> = ({ leads, setLeads, rules, setRules, patients }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'pipeline' | 'automation'>('leads');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: 'Manual' as const });

  const filteredLeads = useMemo(() => {
    return leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()));
  }, [leads, search]);

  // Fix: Explicitly type pipelineStages to avoid 'unknown' errors during Object.entries mapping
  const pipelineStages: Record<string, CRMLead[]> = useMemo(() => {
    return {
      'New': leads.filter(l => l.status === 'New'),
      'Contacted': leads.filter(l => l.status === 'Contacted'),
      'Booked': leads.filter(l => l.status === 'Booked')
    };
  }, [leads]);

  const handleSync = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const handleAddManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name) return;

    const lead: CRMLead = {
      id: `manual-${Date.now()}`,
      name: newLead.name,
      email: newLead.email || 'n/a',
      phone: newLead.phone || 'n/a',
      source: newLead.source,
      status: 'New',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLeads(prev => [lead, ...prev]);
    setShowAddLead(false);
    setNewLead({ name: '', email: '', phone: '', source: 'Manual' });
  };

  const toggleRule = useCallback((id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  }, [setRules]);

  return (
    <div className="flex-1 h-full bg-[#F3F7FA] flex flex-col overflow-hidden animate-in fade-in duration-500">
      <header className="bg-white border-b border-slate-200 px-10 py-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <i className="fa-solid fa-layer-group text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Practice CRM</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">GHL Integration Hub • Secure</p>
            </div>
          </div>
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(['leads', 'pipeline', 'automation'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddLead(true)}
            className="bg-white border border-slate-200 text-slate-800 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <i className="fa-solid fa-plus text-blue-600"></i>
            Add Lead
          </button>
          <button 
            onClick={handleSync}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-900/10 transition-all flex items-center gap-2"
          >
            {loading ? <i className="fa-solid fa-rotate animate-spin"></i> : <i className="fa-solid fa-cloud-arrow-down"></i>}
            Sync Opportunities
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {activeTab === 'leads' && (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                <div className="relative group">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input 
                    type="text" 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search clinical leads..." 
                    className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold w-80 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all" 
                  />
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Database: {leads.length} Records</span>
                </div>
              </div>
              
              <div className="p-4">
                {loading ? <TableSkeleton /> : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Lead Detail</th>
                        <th className="px-6 py-4">Inbound Route</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredLeads.length > 0 ? filteredLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-blue-50/20 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">{lead.name[0]}</div>
                              <div>
                                <p className="text-sm font-black text-slate-800">{lead.name}</p>
                                <p className="text-[10px] text-slate-400">{lead.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[9px] font-black bg-slate-100 px-3 py-1 rounded-lg uppercase border border-slate-200 tracking-tighter">{lead.source}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg border ${
                              lead.status === 'Booked' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                              lead.status === 'New' ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                              'text-slate-600 bg-slate-50 border-slate-100'
                            }`}>{lead.status}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 px-3 py-1 rounded-lg transition-all">View Record</button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase tracking-[0.4em] opacity-50">Zero Matches Found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="flex gap-6 h-full min-h-[500px] animate-in slide-in-from-right-10 duration-500">
            {(Object.entries(pipelineStages)).map(([stage, items]) => (
              <div key={stage} className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between px-4">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">{stage}</h4>
                  <span className="bg-slate-200 text-slate-600 text-[9px] font-black px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="flex-1 bg-slate-200/30 rounded-[2rem] p-4 space-y-3 border border-slate-200/50">
                  {items.map(lead => (
                    <div key={lead.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group">
                      <p className="text-xs font-black text-slate-800 mb-1">{lead.name}</p>
                      <p className="text-[10px] text-slate-400 mb-4">{lead.email}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-widest">{lead.source}</span>
                        <i className="fa-solid fa-ellipsis-vertical text-slate-300 group-hover:text-slate-400"></i>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                      <i className="fa-solid fa-folder-open text-4xl mb-2"></i>
                      <p className="text-[8px] font-black uppercase">Empty Stage</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="max-w-4xl mx-auto space-y-6">
             {rules.map(rule => (
                <div key={rule.id} className={`bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex items-center justify-between transition-opacity ${!rule.active ? 'opacity-50' : ''}`}>
                  <div className="flex gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${rule.active ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                      <i className={`fa-solid ${rule.active ? 'fa-bolt animate-pulse' : 'fa-power-off'}`}></i>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Trigger: {rule.trigger}</p>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight">{rule.action}</h4>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleRule(rule.id)}
                    className={`w-14 h-8 rounded-full relative transition-all border-2 ${rule.active ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-300 border-slate-400'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${rule.active ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
             ))}
          </div>
        )}
      </main>

      {/* Manual Lead Entry Modal */}
      {showAddLead && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight leading-none">New Practice Lead</h3>
                <p className="text-[9px] text-blue-200 font-black uppercase tracking-[0.3em] mt-2">Manual Gateway • HIPAA Secured</p>
              </div>
              <button onClick={() => setShowAddLead(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddManualLead} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Full Name</label>
                <input 
                  required
                  type="text"
                  value={newLead.name}
                  onChange={e => setNewLead({...newLead, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                  placeholder="e.g. Michael Thorne"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Email</label>
                  <input 
                    type="email"
                    value={newLead.email}
                    onChange={e => setNewLead({...newLead, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                    placeholder="patient@secure.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Link</label>
                  <input 
                    type="tel"
                    value={newLead.phone}
                    onChange={e => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowAddLead(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-800 transition-colors">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/10 transition-all active:scale-95">Establish Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMIntegration;
