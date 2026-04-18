import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket, Plus, CheckCircle, Clock, AlertTriangle, Bot } from 'lucide-react';

const ITSM: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', status: 'open' });
  const [aiSuggestion, setAiSuggestion] = useState('');

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try { const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false }); if (data) setTickets(data); } catch(e) {}
    setLoading(false);
  };

  const handleSave = async () => {
    await supabase.from('tickets').insert([formData]);
    fetchTickets(); setShowForm(false); setFormData({ title: '', description: '', priority: 'medium', status: 'open' });
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await supabase.from('tickets').update({ status }).eq('id', id);
    fetchTickets();
  };

  const getAISuggestion = async () => {
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Suggest a solution for this ticket: ${formData.title} - ${formData.description}`, stream: false })
      });
      const data = await res.json();
      setAiSuggestion(data.response);
    } catch(e) { setAiSuggestion('AI suggestion unavailable'); }
  };

  const priorityColors = { low: 'bg-blue-500/20 text-blue-500', medium: 'bg-yellow-500/20 text-yellow-500', high: 'bg-orange-500/20 text-orange-500', critical: 'bg-red-500/20 text-red-500' };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">ITSM</h1><p className="text-text-muted">Service Desk & Ticket Management</p></div>
      <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-accent-green/20 border border-accent-green rounded-lg"><Plus className="w-4 h-4 inline mr-1" />New Ticket</button></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-bg-card rounded-xl p-4 border border-border"><Ticket className="w-8 h-8 text-accent-cyan mb-2" /><p className="text-2xl font-bold">{tickets.length}</p><p className="text-text-muted text-sm">Total Tickets</p></div>
        <div className="bg-bg-card rounded-xl p-4 border border-border"><Clock className="w-8 h-8 text-yellow-500 mb-2" /><p className="text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</p><p className="text-text-muted text-sm">Open</p></div>
        <div className="bg-bg-card rounded-xl p-4 border border-border"><CheckCircle className="w-8 h-8 text-green-500 mb-2" /><p className="text-2xl font-bold">{tickets.filter(t => t.status === 'closed').length}</p><p className="text-text-muted text-sm">Closed</p></div>
      </div>

      {loading ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div></div>) : (
        <div className="space-y-3">{tickets.map(ticket => (<div key={ticket.id} className="bg-bg-card rounded-xl p-4 border border-border"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{ticket.title}</h3><p className="text-text-muted text-sm mt-1">{ticket.description}</p><div className="flex gap-2 mt-2"><span className={`px-2 py-0.5 rounded text-xs ${priorityColors[ticket.priority]}`}>{ticket.priority}</span><span className="px-2 py-0.5 rounded text-xs bg-gray-500/20">{ticket.status}</span></div></div>
        <div className="flex gap-2">{ticket.status !== 'closed' && <button onClick={() => handleStatusUpdate(ticket.id, 'closed')} className="px-3 py-1 bg-green-500/20 rounded text-sm">Resolve</button>}{ticket.status !== 'open' && <button onClick={() => handleStatusUpdate(ticket.id, 'open')} className="px-3 py-1 bg-yellow-500/20 rounded text-sm">Reopen</button>}</div></div></div>))}</div>)}

      {showForm && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-bg-card rounded-xl p-6 w-full max-w-md"><h2 className="text-xl font-bold mb-4">New Ticket</h2>
      <input placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3" />
      <textarea placeholder="Description" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3" />
      <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
      <button onClick={getAISuggestion} className="w-full mb-3 py-2 bg-accent-purple/20 rounded-lg text-sm">🤖 Get AI Suggestion</button>
      {aiSuggestion && <div className="bg-accent-purple/10 p-3 rounded-lg mb-3 text-sm">{aiSuggestion}</div>}
      <div className="flex gap-3"><button onClick={handleSave} className="flex-1 py-2 bg-accent-green/20 rounded-lg">Create</button><button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-accent-red/20 rounded-lg">Cancel</button></div></div></div>)}
    </div>
  );
};
export default ITSM;
