import { Ticket, Clock, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";
import MetricCard from "@/components/MetricCard";

const tickets = [
  { id: "TKT-001", title: "Email server not responding", client: "Acme Corp", priority: "critical", status: "open", sla: "1h left", assigned: "Kelvin" },
  { id: "TKT-002", title: "Password reset request", client: "TechFlow", priority: "low", status: "in_progress", sla: "OK", assigned: "Dennis" },
  { id: "TKT-003", title: "Website SSL certificate expiring", client: "SecureNet", priority: "high", status: "open", sla: "3h left", assigned: "Rosemary" },
  { id: "TKT-004", title: "Database backup failed", client: "Internal", priority: "critical", status: "resolved", sla: "Met", assigned: "Kelvin" },
  { id: "TKT-005", title: "New user setup request", client: "DataWave", priority: "medium", status: "open", sla: "OK", assigned: "Dorine" },
];

const priorityColors: Record<string, string> = {
  critical: "text-destructive bg-destructive/10",
  high: "text-warning bg-warning/10",
  medium: "text-secondary bg-secondary/10",
  low: "text-muted-foreground bg-muted/30",
};

const statusColors: Record<string, string> = {
  open: "text-warning bg-warning/10",
  in_progress: "text-secondary bg-secondary/10",
  resolved: "text-primary bg-primary/10",
};

export default function ITSM() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-warning">ITSM — SUPPORT CENTER</h1>
        <p className="text-sm text-muted-foreground font-mono">Tickets • SLA Tracking • AI Resolution</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Ticket} title="Open Tickets" value="12" variant="orange" />
        <MetricCard icon={Clock} title="Avg Resolution" value="4.2h" variant="cyan" />
        <MetricCard icon={CheckCircle} title="Resolved Today" value="8" variant="green" />
        <MetricCard icon={AlertTriangle} title="SLA Breaches" value="1" variant="red" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm text-warning mb-3">ACTIVE TICKETS</h3>
        <div className="space-y-1">
          {tickets.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
              <span className="text-xs text-muted-foreground font-mono w-16 shrink-0">{t.id}</span>
              <span className="flex-1 text-foreground truncate">{t.title}</span>
              <span className="text-xs text-muted-foreground hidden md:block">{t.client}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${priorityColors[t.priority]}`}>{t.priority}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusColors[t.status]}`}>{t.status.replace("_", " ")}</span>
              <span className="text-xs text-muted-foreground font-mono hidden sm:block">{t.assigned}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
