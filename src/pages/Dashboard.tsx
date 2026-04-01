import { Shield, Users, Ticket, DollarSign, Cpu, HardDrive, Wifi, Bot, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const trafficData = [
  { time: "00:00", requests: 120, threats: 3 },
  { time: "04:00", requests: 80, threats: 1 },
  { time: "08:00", requests: 320, threats: 8 },
  { time: "12:00", requests: 450, threats: 12 },
  { time: "16:00", requests: 380, threats: 5 },
  { time: "20:00", requests: 290, threats: 7 },
  { time: "Now", requests: 340, threats: 4 },
];

const revenueData = [
  { month: "Jan", revenue: 45000 }, { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 }, { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 }, { month: "Jun", revenue: 72000 },
];

const recentEvents = [
  { type: "threat", message: "Brute force attempt blocked — 192.168.1.45", time: "2m ago", icon: AlertTriangle },
  { type: "success", message: "Full system backup completed", time: "15m ago", icon: CheckCircle },
  { type: "info", message: "New client onboarded — Acme Corp", time: "1h ago", icon: Users },
  { type: "threat", message: "SQL injection attempt detected — /api/users", time: "2h ago", icon: AlertTriangle },
  { type: "success", message: "Security scan completed — 0 critical", time: "3h ago", icon: Shield },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow-green">COMMAND CENTER</h1>
        <p className="text-sm text-muted-foreground font-mono">Executive Overview — All Systems Operational</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Shield} title="Threats Blocked" value="1,284" change="↑ 12% this week" variant="red" />
        <MetricCard icon={Users} title="Active Clients" value="47" change="↑ 3 new this month" variant="cyan" />
        <MetricCard icon={Ticket} title="Open Tickets" value="12" change="4 critical" variant="orange" />
        <MetricCard icon={DollarSign} title="Revenue (KES)" value="725K" change="↑ 18% vs last month" variant="green" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Cpu} title="CPU Usage" value="34%" variant="cyan" />
        <MetricCard icon={HardDrive} title="Disk" value="42%" variant="green" />
        <MetricCard icon={Wifi} title="Network" value="98.5%" change="Uptime" variant="green" />
        <MetricCard icon={Bot} title="AI Queries" value="2.4K" change="Today" variant="purple" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">NETWORK TRAFFIC & THREATS</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222 44% 10%)", border: "1px solid hsl(222 30% 18%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="requests" stroke="hsl(195 100% 50%)" fill="hsla(195, 100%, 50%, 0.1)" />
              <Area type="monotone" dataKey="threats" stroke="hsl(348 86% 61%)" fill="hsla(348, 86%, 61%, 0.1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">REVENUE TREND (KES)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222 44% 10%)", border: "1px solid hsl(222 30% 18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="hsl(157 100% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">LIVE EVENT FEED</h3>
        <div className="space-y-2">
          {recentEvents.map((event, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/30 text-sm">
              <event.icon className={`w-4 h-4 shrink-0 ${event.type === "threat" ? "text-destructive" : event.type === "success" ? "text-primary" : "text-secondary"}`} />
              <span className="flex-1 text-foreground">{event.message}</span>
              <span className="text-xs text-muted-foreground font-mono shrink-0">{event.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
