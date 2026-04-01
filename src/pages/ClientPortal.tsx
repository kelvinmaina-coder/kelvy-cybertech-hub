import { Globe, FileText, Ticket, Shield, CreditCard } from "lucide-react";
import MetricCard from "@/components/MetricCard";

export default function ClientPortal() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-secondary text-glow-cyan">CLIENT PORTAL</h1>
        <p className="text-sm text-muted-foreground font-mono">Secure External Access for Clients</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Globe} title="Active Clients" value="12" variant="cyan" />
        <MetricCard icon={FileText} title="Active Projects" value="8" variant="green" />
        <MetricCard icon={Ticket} title="Open Tickets" value="5" variant="orange" />
        <MetricCard icon={CreditCard} title="Pending Invoices" value="3" variant="red" />
      </div>

      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <Globe className="w-12 h-12 text-secondary mx-auto mb-3 animate-float" />
        <h3 className="font-display text-lg text-foreground mb-2">Client Portal Interface</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          External clients log in to view their projects, invoices, support tickets, and security reports. 
          Accessible at <span className="font-mono text-secondary">portal.kelvycybertech.com</span>
        </p>
        <div className="flex justify-center gap-3 mt-4">
          {["Projects", "Invoices", "Tickets", "Reports"].map(item => (
            <span key={item} className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground font-mono">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
