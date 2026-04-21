import React, { useEffect, useState } from 'react';
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { supabase } from '@/lib/supabase';
import { AIInfoBox } from "@/components/AIInfoBox";
import { AnimatedProgressRing } from "@/components/AnimatedProgressRing";
import { AchievementBadges } from "@/components/AchievementBadges";
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign,
  Activity, Eye, Clock, ChevronRight, MoreHorizontal,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => (
  <div className="metric-card p-5 border border-light hover:border-accent-green/50 transition-all duration-200 group">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        {icon}
      </div>
      <span className={`text-xs font-medium flex items-center gap-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(change)}%
      </span>
    </div>
    <h3 className="text-2xl font-bold text-primary">{value}</h3>
    <p className="text-sm text-muted-foreground mt-1">{title}</p>
  </div>
);

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  status: string;
  time: string;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    activeUsers: 0,
    scans: 0,
    tickets: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [revenue, users, scans, tickets] = await Promise.all([
        supabase.from('invoices').select('amount').eq('status', 'paid'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('scans').select('id', { count: 'exact', head: true }),
        supabase.from('tickets').select('id', { count: 'exact', head: true })
      ]);

      const totalRevenue = (revenue.data || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);

      setMetrics({
        revenue: totalRevenue,
        activeUsers: users.count || 0,
        scans: scans.count || 0,
        tickets: tickets.count || 0,
      });

      setRecentActivity([
        { id: 1, user: 'John Doe', action: 'Created ticket #1234', status: 'Completed', time: '2 min ago' },
        { id: 2, user: 'Jane Smith', action: 'Ran security scan', status: 'In Progress', time: '15 min ago' },
        { id: 3, user: 'Admin', action: 'Updated client profile', status: 'Completed', time: '1 hour ago' },
        { id: 4, user: 'Security Team', action: 'Blocked suspicious IP', status: 'Alert', time: '2 hours ago' },
      ]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const metricsCards = [
    { title: 'Total Revenue', value: `KES ${metrics.revenue.toLocaleString()}`, change: 18, icon: <DollarSign className="w-5 h-5" />, color: 'text-green-500' },
    { title: 'Active Users', value: metrics.activeUsers, change: 12, icon: <Users className="w-5 h-5" />, color: 'text-blue-500' },
    { title: 'Security Scans', value: metrics.scans, change: 8, icon: <Activity className="w-5 h-5" />, color: 'text-purple-500' },
    { title: 'Open Tickets', value: metrics.tickets, change: -5, icon: <ShoppingBag className="w-5 h-5" />, color: 'text-orange-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's what's happening with your security operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm bg-accent-green/10 border border-accent-green/30 rounded-lg text-accent-green hover:bg-accent-green/20 transition-colors">
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsCards.map((card, index) => (
          <MetricCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 metric-card p-5 border border-light">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-primary">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue tracking</p>
            </div>
            <select className="text-xs bg-transparent border border-light rounded-lg px-2 py-1 text-muted-foreground">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-light rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Revenue chart will appear here</p>    
              <p className="text-xs text-muted-foreground mt-1">KES {metrics.revenue.toLocaleString()} total revenue</p>
            </div>
          </div>
        </div>

        <div className="metric-card p-5 border border-light">
          <h3 className="text-base font-semibold text-primary mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-light">       
              <span className="text-sm text-muted-foreground">Security Score</span>
              <span className="text-lg font-bold text-accent-green">94/100</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-light">       
              <span className="text-sm text-muted-foreground">Threats Blocked</span>
              <span className="text-lg font-bold text-primary">1,284</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-light">       
              <span className="text-sm text-muted-foreground">Avg Response Time</span>
              <span className="text-lg font-bold text-primary">2.4 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">System Uptime</span>
              <span className="text-lg font-bold text-green-500">99.98%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="metric-card border border-light overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-light">
          <div>
            <h3 className="text-base font-semibold text-primary">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Latest security events and user actions</p>
          </div>
          <button className="text-xs text-accent-green hover:underline flex items-center gap-1"> 
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Action</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-secondary/30 transition-colors">       
                  <td className="px-5 py-3 text-sm text-primary">{activity.user}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{activity.action}</td> 
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      activity.status === 'Completed' ? 'bg-green-500/10 text-green-500' :       
                      activity.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500' :   
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{activity.time}</td>   
                  <td className="px-5 py-3 text-right">
                    <button className="text-muted-foreground hover:text-accent-green">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <LiveActivityFeed />
        <AchievementBadges />
      </div>
    </div>
  );
};

export default Dashboard;
