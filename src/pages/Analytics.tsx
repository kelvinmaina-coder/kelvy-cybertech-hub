import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Shield, Loader2, Download, Bot } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { analyzeWithOllama } from "@/lib/ollama";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const pieColors = ["hsl(157, 100%, 50%)", "hsl(195, 100%, 50%)", "hsl(25, 95%, 53%)", "hsl(348, 86%, 61%)", "hsl(263, 35%, 55%)"];

export default function Analytics() {
  const [stats, setStats] = useState({ clients: 0, tickets: 0, scans: 0, revenue: 0, events: 0 });
  const [ticketsByPriority, setTicketsByPriority] = useState<any[]>([]);
  const [scansByTool, setScansByTool] = useState<any[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    const load = async () => {
      const [cRes, tRes, sRes, iRes, eRes, ticketsData, scansData] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }),
        supabase.from("scans").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("amount, status, paid_at"),
        supabase.from("security_events").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("priority"),
        supabase.from("scans").select("tool"),
      ]);

      const paidInvoices = (iRes.data || []).filter(i => i.status === "paid");
      const revenue = paidInvoices.reduce((s, i) => s + Number(i.amount), 0);

      // Tickets by priority
      const prioCount: Record<string, number> = {};
      (ticketsData.data || []).forEach((t: any) => { prioCount[t.priority] = (prioCount[t.priority] || 0) + 1; });
      setTicketsByPriority(Object.entries(prioCount).map(([name, value]) => ({ name, value })));

      // Scans by tool
      const toolCount: Record<string, number> = {};
      (scansData.data || []).forEach((s: any) => { toolCount[s.tool] = (toolCount[s.tool] || 0) + 1; });
      setScansByTool(Object.entries(toolCount).slice(0, 10).map(([tool, count]) => ({ tool, count })));

      // Revenue by month
      const monthMap: Record<string, number> = {};
      paidInvoices.forEach(inv => {
        const d = inv.paid_at ? new Date(inv.paid_at) : new Date();
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap[key] = (monthMap[key] || 0) + Number(inv.amount);
      });
      setRevenueByMonth(Object.entries(monthMap).sort().slice(-12).map(([month, amount]) => ({ month, amount })));

      setStats({ clients: cRes.count || 0, tickets: tRes.count || 0, scans: sRes.count || 0, revenue, events: eRes.count || 0 });
      setLoading(false);
    };
    load();
  }, []);

  const exportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Clients", stats.clients],
      ["Tickets", stats.tickets],
      ["Scans", stats.scans],
      ["Revenue (KES)", stats.revenue],
      ["Security Events", stats.events],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kelvy-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  const generateAIReport = async () => {
    setAiLoading(true);
    setAiReport("Generating AI report...");
    const summary = `Business Analytics Summary:\n- Clients: ${stats.clients}\n- Tickets: ${stats.tickets} (by priority: ${ticketsByPriority.map(t => `${t.name}: ${t.value}`).join(", ")})\n- Scans: ${stats.scans}\n- Revenue: KES ${stats.revenue.toLocaleString()}\n- Security Events: ${stats.events}\n- Top tools: ${scansByTool.map(s => `${s.tool}: ${s.count}`).join(", ")}`;
    const report = await analyzeWithOllama("analytics", summary, "qwen2.5:7b");
    setAiReport(report);
    setAiLoading(false);
  };

  const radarData = [
    { subject: "Security", A: Math.min(100, stats.scans * 5 + 50) },
    { subject: "Uptime", A: 99 },
    { subject: "Revenue", A: Math.min(100, (stats.revenue / 10000) * 10 + 40) },
    { subject: "Client Sat.", A: 88 },
    { subject: "Response", A: 91 },
    { subject: "AI Usage", A: 76 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold gradient-text">BUSINESS INTELLIGENCE</h1>
          <p className="text-sm text-muted-foreground font-mono">AI-Powered Analytics & Forecasting</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-mono hover:bg-primary/30 transition">
            <Download className="w-3 h-3" /> Export CSV
          </button>
          <button onClick={generateAIReport} disabled={aiLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-xs font-mono hover:bg-accent/30 transition disabled:opacity-50">
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />} AI Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={TrendingUp} title="Total Revenue" value={`KES ${(stats.revenue / 1000).toFixed(0)}K`} variant="green" />
        <MetricCard icon={Users} title="Clients" value={String(stats.clients)} variant="cyan" />
        <MetricCard icon={Shield} title="Security Scans" value={String(stats.scans)} variant="green" />
        <MetricCard icon={BarChart3} title="Events" value={String(stats.events)} variant="purple" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-primary mb-3 text-glow-green">REVENUE BY MONTH</h3>
          {revenueByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(215, 20%, 55%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="amount" fill="hsl(157, 100%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8 font-mono">No revenue data yet</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">TICKETS BY PRIORITY</h3>
          {ticketsByPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={ticketsByPriority} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {ticketsByPriority.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8 font-mono">No ticket data yet</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">SCANS BY TOOL</h3>
          {scansByTool.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scansByTool}>
                <XAxis dataKey="tool" tick={{ fontSize: 9, fill: "hsl(215, 20%, 55%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(195, 100%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8 font-mono">No scan data yet</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">SYSTEM HEALTH RADAR</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222, 30%, 18%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Radar dataKey="A" stroke="hsl(157, 100%, 50%)" fill="hsla(157, 100%, 50%, 0.15)" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {aiReport && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 glow-purple">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-accent" />
            <h3 className="font-display text-sm text-accent">AI ANALYTICS REPORT</h3>
            {aiLoading && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
          </div>
          <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">{aiReport}</pre>
        </div>
      )}
    </div>
  );
}
