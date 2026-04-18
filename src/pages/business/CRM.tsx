import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Edit2, Trash2, Search, Bot } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  created_at: string;
}

const CRM: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', status: 'active' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (!error && data) setClients(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      if (editingClient) {
        await supabase.from('clients').update(formData).eq('id', editingClient.id);
      } else {
        await supabase.from('clients').insert([formData]);
      }
      fetchClients();
      setShowForm(false);
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', company: '', status: 'active' });
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this client?')) {
      await supabase.from('clients').delete().eq('id', id);
      fetchClients();
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">CRM</h1>
          <p className="text-text-muted">Customer Relationship Management</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingClient(null); setFormData({ name: '', email: '', phone: '', company: '', status: 'active' }); }} className="px-4 py-2 bg-accent-green/20 border border-accent-green rounded-lg text-accent-green flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input type="text" placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary" />
      </div>

      {/* Client List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-bg-card rounded-xl border border-border p-4 hover:border-accent-green transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent-cyan" />
                  <h3 className="font-semibold text-text-primary">{client.name || client.email}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingClient(client); setFormData(client); setShowForm(true); }} className="p-1 hover:bg-accent rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(client.id)} className="p-1 hover:bg-accent-red/20 rounded"><Trash2 className="w-4 h-4 text-accent-red" /></button>
                </div>
              </div>
              <p className="text-sm text-text-muted">{client.email}</p>
              <p className="text-sm text-text-muted">{client.phone}</p>
              <p className="text-sm text-accent-green mt-2">{client.company || 'No company'}</p>
              <div className={`mt-2 inline-block px-2 py-0.5 rounded text-xs ${client.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'}`}>{client.status}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-card rounded-xl p-6 w-full max-w-md border border-border">
            <h2 className="text-xl font-bold mb-4">{editingClient ? 'Edit Client' : 'New Client'}</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg" />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg" />
              <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg" />
              <input type="text" placeholder="Company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg" />
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSave} className="flex-1 py-2 bg-accent-green/20 border border-accent-green rounded-lg text-accent-green">Save</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-accent-red/20 border border-accent-red rounded-lg text-accent-red">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
