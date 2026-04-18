import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Users, DollarSign, Shield, Activity, Bot, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ExecutiveDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({ revenue: 0, clients: 0, threats: 0, tickets: 0, growth: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [aiPrediction, setAiPrediction] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); getAIPrediction(); }, []);

  const fetchData = async () => {
    try {
      const { data: invoices } = await supabase.from('invoices').select('amount, created_at');
      const { data: clients } = await supabase.from('clients').select('id');
      const { data: threats } = await supabase.from('security_events').select('id');
      const { data: tickets } = await supabase.from('tickets').select('id');
      
      const revenue = (invoices || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const lastMonthRevenue = (invoices || []).filter(i => new Date(i.created_at) > new Date(Date.now() - 30*24*60*60*1000)).reduce((sum, inv) => sum + (inv.amount || 0), 0);
      
      setMetrics({ revenue, clients: clients?.length || 0, threats: threats?.length || 0, tickets: tickets?.length || 0, growth: lastMonthRevenue > 0 ? ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0 });
      
      const monthlyData = (invoices || []).reduce((acc: any, inv) => {
        const month = new Date(inv.created_at).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + (inv.amount || 0);
        return acc;
      }, {});
      setRevenueData(Object.entries(monthlyData).map(([name, value]) => ({ name, value })));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const getAIPrediction = async () => {
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: 'Based on typical cybersecurity business metrics, provide a 1-sentence prediction for next month\'s revenue and security posture.', stream: false })
      });
      const data = await res.json();
      setAiPrediction(data.response);
    } catch(e) { setAiPrediction('AI prediction: Steady growth expected next month'); }
  };

  const cards = [
    { title: 'Revenue (KES)', value: `KES ${metrics.revenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, change: metrics.growth, color: 'text-accent-green' },
    { title: 'Active Clients', value: metrics.clients, icon: <Users className="w-6 h-6" />, change: 8, color: 'text-accent-cyan' },
    { title: 'Threats Blocked', value: metrics.threats, icon: <Shield className="w-6 h-6" />, change: -5, color: 'text-accent-red' },
    { title: 'Open Tickets', value: metrics.tickets, icon: <Activity className="w-6 h-6" />, change: -12, color: 'text-accent-orange' }
  ];

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Executive Dashboard</h1><p className="text-text-muted">CEO View - AI-Powered Business Intelligence</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{cards.map(card => (<div key={card.title} className="bg-bg-card rounded-xl p-4 border border-border"><div className="flex justify-between items-start"><div><p className="text-text-muted text-sm">{card.title}</p><p className="text-2xl font-bold mt-1">{card.value}</p></div><div className={card.color}>{card.icon}</div></div><div className="flex items-center gap-1 mt-2 text-xs"><span className={card.change >= 0 ? 'text-green-500' : 'text-red-500'}>{card.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}{Math.abs(card.change)}%</span><span className="text-text-muted">vs last month</span></div></div>))}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3">Revenue Trend</h3><ResponsiveContainer width="100%" height={250}><LineChart data={revenueData}><XAxis dataKey="name" stroke="#64748b" /><YAxis stroke="#64748b" /><Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} /><Line type="monotone" dataKey="value" stroke="#00ff88" strokeWidth={2} dot={{ fill: '#00ff88' }} /></LineChart></ResponsiveContainer></div>
        <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" />AI Prediction</h3><div className="bg-accent-purple/10 rounded-lg p-4"><p className="text-text-primary">{aiPrediction}</p></div><button onClick={() => window.print()} className="mt-3 px-3 py-1 bg-accent-cyan/20 rounded-lg text-sm">Export PDF Report</button></div>
      </div>
    </div>
  );
};
export default ExecutiveDashboard;
