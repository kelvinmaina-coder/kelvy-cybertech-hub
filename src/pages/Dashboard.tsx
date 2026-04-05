import { useEffect, useState } from "react";
import { Shield, Users, Ticket, DollarSign, AlertTriangle, CheckCircle, TrendingUp, Activity } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, tickets: 0, scans: 0, events: 0, revenue: 0, pending: 0, scansToday: 0 });
  const [events, setEvents] = useState<any[]>([]);
  const [ticketTrend, setTicketTrend] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const dayAgo = new Date(now.getTime() - 86400000).toISOString();

      const [clientsRes, ticketsRes, scansRes, eventsRes, invoicesRes, pendingRes, scansTodayRes] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }).neq("status", "closed"),
        supabase.from("scans").select("id", { count: "exact", head: true }),
        supabase.from("security_events").select("*").order("created_at", { ascending: false }).limit(8),
        supabase.from("invoices").select("amount, status, paid_at"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("approved", false),
        supabase.from("scans").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
      ]);

      const paidInvoices = (invoicesRes.data || []).filter((i: any) => i.status === "paid");
      const monthlyRevenue = paidInvoices
        .filter((i: any) => i.paid_at && i.paid_at >= monthStart)
        .reduce((a: number, i: any) => a + Number(i.amount), 0);

      setStats({
        clients: clientsRes.count || 0,
        tickets: ticketsRes.count || 0,
        scans: scansRes.count || 0,
        events: (eventsRes.data || []).length,
        revenue: monthlyRevenue,
        pending: pendingRes.count || 0,
        scansToday: scansTodayRes.count || 0,
      });
      setEvents(eventsRes.data || []);

      // Build ticket trend for last 7 days
      const { data: recentTickets } = await supabase.from("tickets").select("created_at").gte("created_at", new Date(now.getTime() - 7 * 86400000).toISOString());
      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        days[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
      }
      (recentTickets || []).forEach((t: any) => {
        const d = new Date(t.created_at).toLocaleDateString("en-US", { weekday: "short" });
        if (days[d] !== undefined) days[d]++;
      });
      setTicketTrend(Object.entries(days).map(([day, count]) => ({ day, tickets: count })));
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
        <p className="text-sm text-muted-foreground font-mono">Executive Overview — Real-Time Data from Database</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Shield} title="Scans Today" value={String(stats.scansToday)} variant="red" />
        <MetricCard icon={Users} title="Active Clients" value={String(stats.clients)} variant="cyan" />
        <MetricCard icon={Ticket} title="Open Tickets" value={String(stats.tickets)} variant="orange" />
        <MetricCard icon={DollarSign} title="Revenue (KES)" value={stats.revenue > 0 ? `${(stats.revenue / 1000).toFixed(0)}K` : "0"} variant="green" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Activity} title="Total Scans" value={String(stats.scans)} variant="purple" />
        <MetricCard icon={AlertTriangle} title="Security Events" value={String(stats.events)} variant="red" />
        <MetricCard icon={TrendingUp} title="Pending Approvals" value={String(stats.pending)} variant="orange" />
        <MetricCard icon={CheckCircle} title="System Status" value="ONLINE" variant="green" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">TICKET TREND (7 DAYS)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ticketTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">LIVE EVENT FEED</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground font-mono text-center py-4">No security events yet</p>
            ) : events.map((event: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/30 text-sm">
                <AlertTriangle className={`w-4 h-4 shrink-0 ${event.severity === "critical" ? "text-destructive" : event.severity === "warning" ? "text-warning" : "text-secondary"}`} />
                <span className="flex-1 text-foreground text-xs">{event.description || event.event_type}</span>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">{new Date(event.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
