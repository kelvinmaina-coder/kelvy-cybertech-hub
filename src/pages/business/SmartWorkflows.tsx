import React, { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Play, Clock, Bot } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SmartWorkflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ trigger: '', action: '', enabled: true });

  useEffect(() => { fetchWorkflows(); }, []);

  const fetchWorkflows = async () => {
    try { const { data } = await supabase.from('workflows').select('*'); if (data) setWorkflows(data); } catch(e) {}
  };

  const saveWorkflow = async () => {
    await supabase.from('workflows').insert([formData]);
    fetchWorkflows(); setShowForm(false);
  };

  const toggleWorkflow = async (id: number, enabled: boolean) => {
    await supabase.from('workflows').update({ enabled }).eq('id', id);
    fetchWorkflows();
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Smart Workflows</h1><p className="text-text-muted">IFTTT-style automation</p></div><button onClick={() => setShowForm(true)} className="px-4 py-2 bg-accent-green/20 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" />Create Workflow</button></div>
      <div className="space-y-3">{workflows.map(w => (<div key={w.id} className="bg-bg-card rounded-xl p-4 border border-border flex items-center justify-between"><div className="flex items-center gap-3"><Zap className={`w-5 h-5 ${w.enabled ? 'text-accent-green' : 'text-text-muted'}`} /><div><p className="font-mono text-sm">IF {w.trigger} → THEN {w.action}</p><p className="text-xs text-text-muted">{w.enabled ? 'Active' : 'Disabled'}</p></div></div><button onClick={() => toggleWorkflow(w.id, !w.enabled)} className={`px-3 py-1 rounded text-sm ${w.enabled ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>{w.enabled ? 'Disable' : 'Enable'}</button></div>))}</div>
      {showForm && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-bg-card rounded-xl p-6 w-full max-w-md"><h2 className="text-xl font-bold mb-4">New Workflow</h2><select value={formData.trigger} onChange={(e) => setFormData({...formData, trigger: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3"><option value="">Select Trigger</option><option value="New Critical Vulnerability">New Critical Vulnerability</option><option value="Ticket Overdue">Ticket Overdue</option><option value="Scan Complete">Scan Complete</option></select><select value={formData.action} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3"><option value="">Select Action</option><option value="Send SMS to Kelvin">Send SMS to Kelvin</option><option value="Create Urgent Ticket">Create Urgent Ticket</option><option value="Email Report">Email Report</option></select><div className="flex gap-3"><button onClick={saveWorkflow} className="flex-1 py-2 bg-accent-green/20 rounded-lg">Create</button><button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-accent-red/20 rounded-lg">Cancel</button></div></div></div>)}
    </div>
  );
};
export default SmartWorkflows;
