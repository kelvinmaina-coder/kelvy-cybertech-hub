import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Users, Ticket, Wallet, Bot, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    threats: 0,
    devices: 0,
    tickets: 0,
    revenue: 0,
    aiQueries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const [threats, devices, tickets, revenue, aiQueries] = await Promise.all([
        supabase.from('security_events').select('*', { count: 'exact', head: true }),
        supabase.from('devices').select('*', { count: 'exact', head: true }),
        supabase.from('tickets').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('amount').eq('status', 'paid'),
        supabase.from('chat_history').select('*', { count: 'exact', head: true })
      ]);
      const totalRevenue = (revenue.data || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);
      setMetrics({
        threats: threats.count || 0,
        devices: devices.count || 0,
        tickets: tickets.count || 0,
        revenue: totalRevenue,
        aiQueries: aiQueries.count || 0
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const cards = [
    { title: 'Threats Blocked', value: metrics.threats, icon: <Shield className="w-6 h-6" />, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { title: 'Active Devices', value: metrics.devices, icon: <Activity className="w-6 h-6" />, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    { title: 'Open Tickets', value: metrics.tickets, icon: <Ticket className="w-6 h-6" />, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { title: 'Revenue (KES)', value: `KES ${metrics.revenue.toLocaleString()}`, icon: <Wallet className="w-6 h-6" />, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    { title: 'AI Queries', value: metrics.aiQueries, icon: <Bot className="w-6 h-6" />, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Real-time system overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.title} className={`${card.bg} border ${card.border} rounded-xl p-4 backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className={card.color}>{card.icon}</span>
              <TrendingUp className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
"@ | Out-File -FilePath "C:\Users\USER\Desktop\kelvy-cybertech-hub\kelvy-ai-hub-0308d451\src\pages\Dashboard.tsx" -Encoding utf8

Write-Host "✅ Dashboard.tsx FULLY FIXED!" -ForegroundColor Green
Write-Host "🔄 Refresh your browser at http://localhost:8080" -ForegroundColor Yellow