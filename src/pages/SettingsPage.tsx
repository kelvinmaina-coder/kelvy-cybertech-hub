import { Settings, Users, Shield, Database, Key, Bell } from "lucide-react";

const teamMembers = [
  { name: "Kelvin", role: "Admin", status: "online" },
  { name: "Dennis", role: "Developer", status: "online" },
  { name: "Rosemary", role: "Analyst", status: "offline" },
  { name: "Dorine", role: "Manager", status: "online" },
];

const settings = [
  { icon: Shield, label: "Security", desc: "MFA, password policy, session management" },
  { icon: Database, label: "Database", desc: "PostgreSQL, Redis, ChromaDB connections" },
  { icon: Key, label: "API Keys", desc: "M-Pesa, Gmail, GitHub integrations" },
  { icon: Bell, label: "Notifications", desc: "Email, Discord, push alerts" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">SETTINGS</h1>
        <p className="text-sm text-muted-foreground font-mono">System Configuration & User Management</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-primary mb-3 text-glow-green">TEAM MEMBERS</h3>
          <div className="space-y-2">
            {teamMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/20">
                <span className={`w-2 h-2 rounded-full shrink-0 ${m.status === "online" ? "bg-primary" : "bg-muted-foreground"}`} />
                <span className="text-sm text-foreground flex-1">{m.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">CONFIGURATION</h3>
          <div className="space-y-2">
            {settings.map((s, i) => (
              <button key={i} className="w-full flex items-center gap-3 p-2 rounded bg-muted/20 hover:bg-muted/40 transition text-left">
                <s.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-sm text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
