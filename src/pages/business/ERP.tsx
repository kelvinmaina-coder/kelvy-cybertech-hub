import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Plus, Eye, CheckCircle, XCircle, Wallet, Bot } from 'lucide-react';

const ERP: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ client_id: '', amount: '', due_date: '', status: 'pending' });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: invoicesData } = await supabase.from('invoices').select('*, clients(name)').order('created_at', { ascending: false });
      const { data: clientsData } = await supabase.from('clients').select('id, name');
      if (invoicesData) setInvoices(invoicesData);
      if (clientsData) setClients(clientsData);
      const revenue = (invoicesData || []).filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);
      setTotalRevenue(revenue);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await supabase.from('invoices').insert([{
        invoice_number: `INV-${Date.now()}`,
        client_id: parseInt(formData.client_id),
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        status: formData.status
      }]);
      fetchData();
      setShowForm(false);
      setFormData({ client_id: '', amount: '', due_date: '', status: 'pending' });
    } catch (e) { console.error(e); }
  };

  const handleMarkPaid = async (id: number) => {
    await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id);
    fetchData();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-text-primary">ERP</h1><p className="text-text-muted">Invoices & Financial Management</p></div>
        <div className="flex gap-3"><div className="px-4 py-2 bg-accent-green/20 rounded-lg"><Wallet className="w-5 h-5 inline mr-2" />Total Revenue: KES {totalRevenue.toLocaleString()}</div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-accent-green/20 border border-accent-green rounded-lg"><Plus className="w-4 h-4 inline mr-1" />Create Invoice</button></div>
      </div>

      {loading ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div></div>) : (
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border"><tr><th className="px-4 py-3 text-left">Invoice #</th><th className="px-4 py-3 text-left">Client</th><th className="px-4 py-3 text-left">Amount</th><th className="px-4 py-3 text-left">Due Date</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
            <tbody>{invoices.map(inv => (<tr key={inv.id} className="border-b border-border"><td className="px-4 py-3 font-mono text-sm">{inv.invoice_number}</td><td className="px-4 py-3">{inv.clients?.name || 'N/A'}</td><td className="px-4 py-3">KES {inv.amount?.toLocaleString()}</td><td className="px-4 py-3">{new Date(inv.due_date).toLocaleDateString()}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${inv.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{inv.status}</span></td><td className="px-4 py-3">{inv.status !== 'paid' && <button onClick={() => handleMarkPaid(inv.id)} className="text-accent-green hover:underline text-sm">Mark Paid</button>}</td></tr>))}</tbody>
          </table>
        </div>
      )}

      {showForm && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-bg-card rounded-xl p-6 w-full max-w-md"><h2 className="text-xl font-bold mb-4">New Invoice</h2>
      <select value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3"><option value="">Select Client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <input type="number" placeholder="Amount (KES)" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3" />
      <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3" />
      <div className="flex gap-3"><button onClick={handleSave} className="flex-1 py-2 bg-accent-green/20 rounded-lg">Create</button><button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-accent-red/20 rounded-lg">Cancel</button></div></div></div>)}
    </div>
  );
};
export default ERP;
