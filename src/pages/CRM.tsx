import { Users, TrendingUp, DollarSign, UserPlus } from "lucide-react";
import MetricCard from "@/components/MetricCard";

const pipeline = [
  { stage: "Lead", count: 23, color: "bg-secondary/20 border-secondary/40 text-secondary" },
  { stage: "Prospect", count: 15, color: "bg-accent/20 border-accent/40 text-accent" },
  { stage: "Quote", count: 8, color: "bg-warning/20 border-warning/40 text-warning" },
  { stage: "Deal", count: 5, color: "bg-primary/20 border-primary/40 text-primary" },
  { stage: "Closed", count: 12, color: "bg-primary/20 border-primary/40 text-primary" },
];

const contacts = [
  { name: "Acme Corp", contact: "John Doe", stage: "Deal", value: "KES 250K", activity: "Call scheduled" },
  { name: "TechFlow Ltd", contact: "Jane Smith", stage: "Quote", value: "KES 180K", activity: "Proposal sent" },
  { name: "DataWave Inc", contact: "Mike Chen", stage: "Prospect", value: "KES 95K", activity: "Demo booked" },
  { name: "SecureNet", contact: "Sarah Ali", stage: "Lead", value: "KES 320K", activity: "Initial contact" },
  { name: "CloudFirst", contact: "David Kimani", stage: "Closed", value: "KES 450K", activity: "Onboarding" },
];

export default function CRM() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-secondary text-glow-cyan">CRM — CUSTOMER INTELLIGENCE</h1>
        <p className="text-sm text-muted-foreground font-mono">Pipeline • Contacts • AI-Powered Follow-ups</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Users} title="Total Contacts" value="63" variant="cyan" />
        <MetricCard icon={TrendingUp} title="Conversion" value="19%" variant="green" />
        <MetricCard icon={DollarSign} title="Pipeline Value" value="1.3M" variant="green" change="KES" />
        <MetricCard icon={UserPlus} title="New Leads" value="8" variant="purple" change="This week" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {pipeline.map(p => (
          <div key={p.stage} className={`flex-1 min-w-[100px] rounded-lg border p-3 text-center ${p.color}`}>
            <div className="text-2xl font-display font-bold">{p.count}</div>
            <div className="text-xs font-mono mt-1">{p.stage}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">ACTIVE CONTACTS</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground font-mono border-b border-border">
                <th className="text-left py-2 pr-4">Company</th>
                <th className="text-left py-2 pr-4 hidden sm:table-cell">Contact</th>
                <th className="text-left py-2 pr-4">Stage</th>
                <th className="text-left py-2 pr-4">Value</th>
                <th className="text-left py-2 hidden md:table-cell">Activity</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition">
                  <td className="py-2 pr-4 text-foreground font-medium">{c.name}</td>
                  <td className="py-2 pr-4 text-muted-foreground hidden sm:table-cell">{c.contact}</td>
                  <td className="py-2 pr-4"><span className="px-1.5 py-0.5 rounded text-xs font-mono bg-secondary/10 text-secondary">{c.stage}</span></td>
                  <td className="py-2 pr-4 text-primary font-mono">{c.value}</td>
                  <td className="py-2 text-muted-foreground text-xs hidden md:table-cell">{c.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
