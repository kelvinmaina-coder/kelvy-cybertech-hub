import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, Bot } from 'lucide-react';

const UsageReports: React.FC = () => {
  const [data, setData] = useState({ scans: [], messages: [], calls: [] });
  const [dateRange, setDateRange] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [dateRange]);

  const fetchData = async () => {
    try {
      const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data: scans } = await supabase.from('scans').select('tool, created_at').gte('created_at', since);
      const { data: messages } = await supabase.from('messages').select('created_at').gte('created_at', since);
      const { data: calls } = await supabase.from('calls').select('created_at, type').gte('created_at', since);
      
      const toolCount: Record<string, number> = {};
      (scans || []).forEach(s => { toolCount[s.tool] = (toolCount[s.tool] || 0) + 1; });
      
      setData({ scans: Object.entries(toolCount).slice(0, 5).map(([name, value]) => ({ name, value })), messages: [{ name: 'Messages', value: messages?.length || 0 }], calls: [{ name: 'Calls', value: calls?.length || 0 }] });
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const exportCSV = () => { alert('CSV export coming soon'); };

  const COLORS = ['#00ff88', '#00d4ff', '#ff3860', '#ff8c42', '#7c5cbf'];

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Usage Reports</h1><p className="text-text-muted">System analytics and usage statistics</p></div><div className="flex gap-2"><select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-1 bg-bg-secondary border border-border rounded-lg text-sm"><option value="week">Last 7 days</option><option value="month">Last 30 days</option><option value="quarter">Last 90 days</option></select><button onClick={exportCSV} className="px-3 py-1 bg-accent-cyan/20 rounded-lg text-sm flex items-center gap-1"><Download className="w-3 h-3" />Export</button></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3">Top Tools Used</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={data.scans} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>{data.scans.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3">Activity Summary</h3><div className="space-y-3"><div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg"><span>📨 Messages</span><span className="text-2xl font-bold text-accent-cyan">{data.messages[0]?.value || 0}</span></div><div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg"><span>📞 Calls</span><span className="text-2xl font-bold text-accent-green">{data.calls[0]?.value || 0}</span></div><div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg"><span>🛡️ Scans Run</span><span className="text-2xl font-bold text-accent-purple">{data.scans.reduce((sum, s) => sum + s.value, 0)}</span></div></div></div>
      </div>
    </div>
  );
};
export default UsageReports;
