import { useEffect, useState } from "react";
import { Shield, Users, Ticket, DollarSign, Cpu, HardDrive, Wifi, Bot, AlertTriangle, CheckCircle } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const trafficData = [
  { time: "00:00", requests: 120, threats: 3 },
  { time: "04:00", requests: 80, threats: 1 },
  { time: "08:00", requests: 320, threats: 8 },
  { time: "12:00", requests: 450, threats: 12 },
  { time: "16:00", requests: 380, threats: 5 },
  { time: "20:00", requests: 290, threats: 7 },
  { time: "Now", requests: 340, threats: 4 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, tickets: 0, scans: 0, events: 0, revenue: 0 });
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [clientsRes, ticketsRes, scansRes, eventsRes, invoicesRes] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("scans").select("id", { count: "exact", head: true }),
        supabase.from("security_events").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("invoices").select("amount, status"),
      ]);
      const totalRevenue = (invoicesRes.data || []).filter((i: any) => i.status === "paid").reduce((a: number, i: any) => a + Number(i.amount), 0);
      setStats({
        clients: clientsRes.count || 0,
        tickets: ticketsRes.count || 0,
        scans: scansRes.count || 0,
        events: (eventsRes.data || []).length,
        revenue: totalRevenue,
      });
      setEvents(eventsRes.data || []);
    };
    load();

    const channel = supabase.channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "security_events" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow-green">COMMAND CENTER</h1>
        <p className="text-sm text-muted-foreground font-mono">Executive Overview — Real-Time Data</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Shield} title="Security Scans" value={String(stats.scans)} variant="red" />
        <MetricCard icon={Users} title="Active Clients" value={String(stats.clients)} variant="cyan" />
        <MetricCard icon={Ticket} title="Open Tickets" value={String(stats.tickets)} variant="orange" />
        <MetricCard icon={DollarSign} title="Revenue (KES)" value={stats.revenue > 0 ? `${(stats.revenue / 1000).toFixed(0)}K` : "0"} variant="green" />
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
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">LIVE EVENT FEED</h3>
          <div className="space-y-2">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground font-mono text-center py-4">No security events yet</p>
            ) : events.map((event: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/30 text-sm">
                <AlertTriangle className={`w-4 h-4 shrink-0 ${event.severity === "critical" ? "text-destructive" : event.severity === "warning" ? "text-warning" : "text-secondary"}`} />
                <span className="flex-1 text-foreground">{event.description || event.event_type}</span>
                <span className="text-xs text-muted-foreground font-mono shrink-0">{new Date(event.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
