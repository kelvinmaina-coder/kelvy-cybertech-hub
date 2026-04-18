import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search, Phone, MessageCircle, Video } from 'lucide-react';

const Contacts: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const { data } = await supabase.from('profiles').select('id, email, full_name, role'); if (data) setUsers(data); } catch(e) {}
    setLoading(false);
  };

  const groupedUsers = users.reduce((acc, user) => {
    const role = user.role || 'client';
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {} as Record<string, any[]>);

  const roleNames: Record<string, string> = { super_admin: '👑 Admins', manager: '📊 Managers', security_analyst: '🛡️ Security', technician: '🔧 Technicians', client: '👥 Clients' };

  const filteredUsers = (roleUsers: any[]) => roleUsers.filter(u => u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Contacts</h1><p className="text-text-muted">Team members by department</p></div><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-bg-secondary border border-border rounded-lg" /></div></div>
      {loading ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div></div>) : (
        <div className="space-y-6">{Object.entries(groupedUsers).map(([role, roleUsers]) => (<div key={role}><h2 className="text-lg font-semibold mb-3">{roleNames[role] || role}</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{filteredUsers(roleUsers).map(user => (<div key={user.id} className="bg-bg-card rounded-xl p-3 border border-border flex items-center justify-between"><div><p className="font-medium">{user.full_name || user.email}</p><p className="text-xs text-text-muted">{user.email}</p></div><div className="flex gap-2"><button className="p-2 hover:bg-accent-green/20 rounded-lg"><MessageCircle className="w-4 h-4" /></button><button className="p-2 hover:bg-accent-cyan/20 rounded-lg"><Phone className="w-4 h-4" /></button><button className="p-2 hover:bg-accent-purple/20 rounded-lg"><Video className="w-4 h-4" /></button></div></div>))}</div></div>))}</div>)}
    </div>
  );
};
export default Contacts;
