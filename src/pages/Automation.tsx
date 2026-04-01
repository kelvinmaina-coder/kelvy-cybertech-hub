import { Zap, Clock, CheckCircle, Play, RefreshCw } from "lucide-react";
import MetricCard from "@/components/MetricCard";

const workflows = [
  { name: "Hourly Network Scan", schedule: "Every 1h", lastRun: "45m ago", status: "active", runs: 342 },
  { name: "Nightly DB Backup", schedule: "Every night 2AM", lastRun: "6h ago", status: "active", runs: 89 },
  { name: "Morning Digest Report", schedule: "Every day 8AM", lastRun: "10h ago", status: "active", runs: 67 },
  { name: "Weekly Security Report", schedule: "Every Monday", lastRun: "3d ago", status: "active", runs: 12 },
  { name: "Client Onboarding", schedule: "On trigger", lastRun: "2d ago", status: "active", runs: 23 },
  { name: "Auto IP Block (5 fails)", schedule: "On event", lastRun: "1h ago", status: "active", runs: 156 },
  { name: "High CPU Auto-Restart", schedule: "On alert", lastRun: "5d ago", status: "active", runs: 8 },
  { name: "Vulnerability Check", schedule: "Every 6h", lastRun: "2h ago", status: "active", runs: 178 },
];

export default function Automation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow-green">AUTOMATION ENGINE</h1>
        <p className="text-sm text-muted-foreground font-mono">Workflows • Schedules • Event Triggers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Zap} title="Active Workflows" value="8" variant="green" />
        <MetricCard icon={Clock} title="Runs Today" value="47" variant="cyan" />
        <MetricCard icon={CheckCircle} title="Success Rate" value="99.2%" variant="green" />
        <MetricCard icon={RefreshCw} title="Total Runs" value="875" variant="purple" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm text-primary mb-3 text-glow-green">WORKFLOWS</h3>
        <div className="space-y-1">
          {workflows.map((w, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse-glow" />
              <span className="flex-1 text-foreground">{w.name}</span>
              <span className="text-xs text-muted-foreground font-mono hidden sm:block">{w.schedule}</span>
              <span className="text-xs text-muted-foreground font-mono">{w.runs} runs</span>
              <span className="text-xs text-muted-foreground font-mono hidden md:block">{w.lastRun}</span>
              <button className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs hover:bg-primary/20">
                <Play className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
