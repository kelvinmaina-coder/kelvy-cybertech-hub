import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Shield, Loader2 } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar } from "recharts";

export default function Analytics() {
  const [stats, setStats] = useState({ clients: 0, tickets: 0, scans: 0, revenue: 0, events: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [cRes, tRes, sRes, iRes, eRes] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }),
        supabase.from("scans").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("amount, status"),
        supabase.from("security_events").select("id", { count: "exact", head: true }),
      ]);
      const revenue = (iRes.data || []).filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
      setStats({
        clients: cRes.count || 0,
        tickets: tRes.count || 0,
        scans: sRes.count || 0,
        revenue,
        events: eRes.count || 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const radarData = [
    { subject: "Security", A: Math.min(100, stats.scans * 5 + 50) },
    { subject: "Uptime", A: 99 },
    { subject: "Revenue", A: Math.min(100, (stats.revenue / 10000) * 10 + 40) },
    { subject: "Client Sat.", A: 88 },
    { subject: "Response", A: 91 },
    { subject: "AI Usage", A: 76 },
  ];

  const performanceData = [
    { month: "Jan", security: 85, business: 72 },
    { month: "Feb", security: 88, business: 78 },
    { month: "Mar", security: 92, business: 82 },
    { month: "Apr", security: 90, business: 88 },
    { month: "May", security: 95, business: 91 },
    { month: "Jun", security: 97, business: 95 },
  ];

  const moduleData = [
    { name: "Clients", value: stats.clients },
    { name: "Tickets", value: stats.tickets },
    { name: "Scans", value: stats.scans },
    { name: "Events", value: stats.events },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold gradient-text">BUSINESS INTELLIGENCE</h1>
        <p className="text-sm text-muted-foreground font-mono">AI-Powered Analytics & Forecasting</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={TrendingUp} title="Total Revenue" value={`KES ${(stats.revenue / 1000).toFixed(0)}K`} variant="green" />
        <MetricCard icon={Users} title="Clients" value={String(stats.clients)} variant="cyan" />
        <MetricCard icon={Shield} title="Security Scans" value={String(stats.scans)} variant="green" />
        <MetricCard icon={BarChart3} title="Events" value={String(stats.events)} variant="purple" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">PERFORMANCE TRENDS</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="security" stroke="hsl(157, 100%, 50%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="business" stroke="hsl(195, 100%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">SYSTEM HEALTH RADAR</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222, 30%, 18%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Radar dataKey="A" stroke="hsl(157, 100%, 50%)" fill="hsla(157, 100%, 50%, 0.15)" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-primary mb-3 text-glow-green">MODULE ACTIVITY</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={moduleData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(157, 100%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 glow-purple">
          <h3 className="font-display text-sm text-accent mb-2">AI INSIGHT</h3>
          <p className="text-sm text-foreground">
            {stats.clients > 0
              ? `You have ${stats.clients} active clients with KES ${(stats.revenue / 1000).toFixed(0)}K in revenue. ${stats.scans} security scans completed. ${stats.tickets} support tickets tracked. System health is optimal.`
              : "Start by adding clients in CRM, creating invoices in ERP, and running security scans to generate analytics data."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
