import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Play, Clock } from "lucide-react";
import MetricCard from "@/components/MetricCard";

const threats = [
  { id: 1, type: "Brute Force", source: "192.168.1.45", target: "SSH (22)", severity: "critical", status: "blocked", time: "2m ago" },
  { id: 2, type: "SQL Injection", source: "10.0.0.88", target: "/api/users", severity: "high", status: "blocked", time: "2h ago" },
  { id: 3, type: "Port Scan", source: "172.16.0.12", target: "All Ports", severity: "medium", status: "monitored", time: "4h ago" },
  { id: 4, type: "XSS Attempt", source: "203.0.113.5", target: "/portal/login", severity: "high", status: "blocked", time: "6h ago" },
  { id: 5, type: "DDoS", source: "Multiple", target: "Web Server", severity: "critical", status: "mitigated", time: "1d ago" },
];

const scans = [
  { name: "Full Network Scan", tool: "nmap", status: "completed", findings: 3, time: "1h ago" },
  { name: "Web Vulnerability Scan", tool: "nikto", status: "running", findings: 0, time: "running..." },
  { name: "WordPress Audit", tool: "wpscan", status: "completed", findings: 1, time: "6h ago" },
  { name: "SQL Injection Test", tool: "sqlmap", status: "completed", findings: 0, time: "12h ago" },
];

const severityColors: Record<string, string> = {
  critical: "text-destructive bg-destructive/10",
  high: "text-warning bg-warning/10",
  medium: "text-secondary bg-secondary/10",
  low: "text-primary bg-primary/10",
};

export default function SecurityHub() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-destructive">SECURITY OPERATIONS CENTER</h1>
        <p className="text-sm text-muted-foreground font-mono">Real-time threat monitoring & response</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Shield} title="Threats Blocked" value="1,284" variant="red" change="Last 24h" />
        <MetricCard icon={AlertTriangle} title="Active Alerts" value="3" variant="orange" />
        <MetricCard icon={CheckCircle} title="Scans Today" value="12" variant="green" />
        <MetricCard icon={XCircle} title="Vulnerabilities" value="4" variant="cyan" change="2 Critical" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm text-destructive">THREAT LOG</h3>
          <div className="flex gap-1">
            {["all", "critical", "high", "medium"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2 py-1 text-xs rounded font-mono transition ${filter === f ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          {threats.filter(t => filter === "all" || t.severity === filter).map(t => (
            <div key={t.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${severityColors[t.severity]}`}>{t.severity}</span>
              <span className="font-mono text-foreground flex-1">{t.type}</span>
              <span className="text-muted-foreground text-xs hidden sm:block">{t.source} → {t.target}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${t.status === "blocked" ? "text-primary bg-primary/10" : "text-warning bg-warning/10"}`}>{t.status}</span>
              <span className="text-xs text-muted-foreground font-mono">{t.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm text-secondary text-glow-cyan">RECENT SCANS</h3>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded bg-primary/20 text-primary text-xs font-mono hover:bg-primary/30 transition">
            <Play className="w-3 h-3" /> NEW SCAN
          </button>
        </div>
        <div className="space-y-1">
          {scans.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
              <span className="font-mono text-foreground flex-1">{s.name}</span>
              <span className="text-xs text-muted-foreground font-mono">{s.tool}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${s.status === "running" ? "text-warning bg-warning/10 animate-pulse" : "text-primary bg-primary/10"}`}>
                {s.status === "running" ? "● RUNNING" : `${s.findings} findings`}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{s.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
