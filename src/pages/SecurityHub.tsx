import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Loader2, ArrowRight, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const severityColors: Record<string, string> = {
  critical: "text-destructive bg-destructive/10",
  high: "text-warning bg-warning/10",
  medium: "text-secondary bg-secondary/10",
  low: "text-primary bg-primary/10",
  info: "text-muted-foreground bg-muted/30",
};

const pieColors = ["hsl(348, 86%, 61%)", "hsl(25, 95%, 53%)", "hsl(195, 100%, 50%)", "hsl(157, 100%, 50%)", "hsl(215, 20%, 55%)"];

export default function SecurityHub() {
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [evRes, scRes] = await Promise.all([
        supabase.from("security_events").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      setEvents(evRes.data || []);
      setScans(scRes.data || []);
      setLoading(false);
    };
    load();

    const channel = supabase.channel("security-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "security_events" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "scans" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const severityCounts = events.reduce((acc: Record<string, number>, e) => {
    const s = e.severity || "info";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(severityCounts).map(([name, value]) => ({ name, value }));
  const criticalCount = severityCounts["critical"] || 0;
  const highCount = severityCounts["high"] || 0;
  const blocked = events.filter(e => e.event_type === "blocked" || e.severity === "critical" || e.severity === "high").length;

  const toolCounts = scans.reduce((acc: Record<string, number>, s) => {
    acc[s.tool] = (acc[s.tool] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(toolCounts).slice(0, 8).map(([tool, count]) => ({ tool, count }));
  const securityScore = Math.max(40, Math.min(98, 100 - (criticalCount * 12 + highCount * 8 + (severityCounts["medium"] || 0) * 4)));
  const scoreImprovement = Math.max(-12, Math.min(18, (severityCounts["low"] || 0) - (criticalCount + highCount)));
  const darkWebBreaches = events.filter(e => e.source === "darkweb" || e.category === "darkweb").length;
  const achievementBadges = [
    { title: "AI Threat Hunting", icon: <Zap className="w-4 h-4" /> },
    { title: "Weekly Dark Web Scan", icon: <ShieldCheck className="w-4 h-4" /> },
    { title: "Compliance Ready", icon: <Shield className="w-4 h-4" /> },
    { title: "Posture Intelligence", icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const filtered = filter === "all" ? events : events.filter(e => e.severity === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-destructive">SECURITY OPERATIONS CENTER</h1>
          <p className="text-sm text-muted-foreground font-mono">Real-time threat monitoring & response</p>
        </div>
        <Link to="/tools" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted hover:text-foreground">
          <span>Open Linux Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard icon={Shield} title="Threats Blocked" value={String(blocked)} variant="red" change="From events" />
        <MetricCard icon={TrendingUp} title="Security Score" value={`${securityScore}`} variant="purple" change={`${scoreImprovement >= 0 ? `+${scoreImprovement}` : `${scoreImprovement}`} improvement`} />
        <MetricCard icon={AlertTriangle} title="Dark Web Alerts" value={String(darkWebBreaches)} variant="destructive" change="Weekly scan" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {achievementBadges.map((badge) => (
          <div key={badge.title} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 text-sm font-medium text-foreground hover:border-accent hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">{badge.icon}</div>
            <div>{badge.title}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={AlertTriangle} title="Critical" value={String(criticalCount)} variant="orange" />
        <MetricCard icon={CheckCircle} title="Scans Run" value={String(scans.length)} variant="green" />
        <MetricCard icon={XCircle} title="High Severity" value={String(highCount)} variant="cyan" change={`${events.length} total events`} />
        <MetricCard icon={Activity} title="Total Events" value={String(events.length)} variant="secondary" change="Across all sources" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-destructive mb-3">SEVERITY BREAKDOWN</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map(({ name }, i) => <Cell key={name || i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8 font-mono">No events recorded yet</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">TOOL USAGE</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="tool" tick={{ fontSize: 9, fill: "hsl(215, 20%, 55%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(195, 100%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8 font-mono">No scans recorded yet</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm text-destructive">SECURITY EVENT LOG</h3>
          <div className="flex gap-1">
            {["all", "critical", "high", "medium", "low"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2 py-1 text-xs rounded font-mono transition ${filter === f ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {(() => {
          if (loading) {
            return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
          }
          if (filtered.length === 0) {
            return <p className="text-xs text-muted-foreground text-center py-8 font-mono">No security events. System is clean.</p>;
          }
          return (
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {filtered.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm animate-slide-in">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${severityColors[e.severity || "info"]}`}>{e.severity || "info"}</span>
                  <span className="font-mono text-foreground flex-1 truncate">{e.event_type || "event"}</span>
                  <span className="text-muted-foreground text-xs hidden sm:block truncate max-w-[200px]">{e.description}</span>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">{new Date(e.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">RECENT SCANS</h3>
        {scans.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 font-mono">Run scans from Linux Tools Hub</p>
        ) : (
          <div className="space-y-1">
            {scans.slice(0, 8).map(s => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
                <span className="font-mono text-foreground flex-1">{s.tool}</span>
                <span className="text-xs text-muted-foreground font-mono">{s.target || "localhost"}</span>
                {s.severity && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${severityColors[s.severity] || ""}`}>{s.severity}</span>
                )}
                <span className="text-xs text-muted-foreground font-mono">{new Date(s.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
