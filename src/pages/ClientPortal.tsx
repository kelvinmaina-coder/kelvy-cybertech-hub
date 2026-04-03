import { useState, useEffect } from "react";
import { Globe, FileText, Ticket, CreditCard, Loader2 } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const statusColors: Record<string, string> = {
  open: "text-warning bg-warning/10",
  "in-progress": "text-secondary bg-secondary/10",
  resolved: "text-primary bg-primary/10",
  closed: "text-muted-foreground bg-muted/30",
  paid: "text-primary bg-primary/10",
  pending: "text-warning bg-warning/10",
  overdue: "text-destructive bg-destructive/10",
  draft: "text-muted-foreground bg-muted/30",
};

export default function ClientPortal() {
  const { user, hasRole } = useAuth();
  const isClient = hasRole("client");
  const [tickets, setTickets] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const [tRes, iRes] = await Promise.all([
        supabase.from("tickets").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      setTickets(tRes.data || []);
      setInvoices(iRes.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in-progress").length;
  const pendingInvoices = invoices.filter(i => i.status === "pending" || i.status === "overdue").length;
  const totalOwed = invoices.filter(i => i.status === "pending" || i.status === "overdue").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-secondary text-glow-cyan">CLIENT PORTAL</h1>
        <p className="text-sm text-muted-foreground font-mono">
          {isClient ? "Your tickets, invoices & projects" : "Client Overview — All Data"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Ticket} title="Open Tickets" value={String(openTickets)} variant="orange" />
        <MetricCard icon={CreditCard} title="Pending Invoices" value={String(pendingInvoices)} variant="red" />
        <MetricCard icon={FileText} title="Total Tickets" value={String(tickets.length)} variant="cyan" />
        <MetricCard icon={Globe} title="Amount Due" value={`KES ${(totalOwed / 1000).toFixed(0)}K`} variant="green" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">MY TICKETS</h3>
            {tickets.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6 font-mono">No tickets found</p>
            ) : (
              <div className="space-y-1 max-h-[350px] overflow-y-auto">
                {tickets.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
                    <Ticket className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-foreground truncate">{t.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusColors[t.status] || ""}`}>{t.status}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-sm text-primary mb-3 text-glow-green">MY INVOICES</h3>
            {invoices.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6 font-mono">No invoices found</p>
            ) : (
              <div className="space-y-1 max-h-[350px] overflow-y-auto">
                {invoices.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
                    <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-foreground font-mono text-xs">{inv.invoice_number || `#${inv.id}`}</span>
                    <span className="font-mono text-primary text-xs">KES {Number(inv.amount).toLocaleString()}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusColors[inv.status] || ""}`}>{inv.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
