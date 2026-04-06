import { useState, useEffect } from "react";
import { Globe, FileText, Ticket, CreditCard, Loader2, FolderOpen } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const statusColors: Record<string, string> = {
  open: "text-warning bg-warning/10",
  "in-progress": "text-secondary bg-secondary/10",
  in_progress: "text-secondary bg-secondary/10",
  resolved: "text-primary bg-primary/10",
  closed: "text-muted-foreground bg-muted/30",
  paid: "text-primary bg-primary/10",
  pending: "text-warning bg-warning/10",
  overdue: "text-destructive bg-destructive/10",
  draft: "text-muted-foreground bg-muted/30",
  planning: "text-secondary bg-secondary/10",
  active: "text-primary bg-primary/10",
  completed: "text-primary bg-primary/10",
};

export default function ClientPortal() {
  const { user, hasRole } = useAuth();
  const isClient = hasRole("client");
  const [tickets, setTickets] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"tickets" | "invoices" | "projects">("tickets");

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      // RLS policies already filter data for client role users
      const [tRes, iRes, pRes] = await Promise.all([
        supabase.from("tickets").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setTickets(tRes.data || []);
      setInvoices(iRes.data || []);
      setProjects(pRes.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
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
        <MetricCard icon={FolderOpen} title="Projects" value={String(projects.length)} variant="cyan" />
        <MetricCard icon={Globe} title="Amount Due" value={`KES ${(totalOwed / 1000).toFixed(0)}K`} variant="green" />
      </div>

      <div className="flex gap-2">
        {(["tickets", "invoices", "projects"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase ${tab === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {t} ({t === "tickets" ? tickets.length : t === "invoices" ? invoices.length : projects.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          {tab === "tickets" && (
            <>
              <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">MY TICKETS</h3>
              {tickets.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 font-mono">No tickets found</p>
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {tickets.map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
                      <Ticket className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground font-mono">#{t.id}</span>
                      <span className="flex-1 text-foreground truncate">{t.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusColors[t.status] || ""}`}>{t.status}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusColors[t.priority] || "bg-muted text-muted-foreground"}`}>{t.priority}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "invoices" && (
            <>
              <h3 className="font-display text-sm text-primary mb-3 text-glow-green">MY INVOICES</h3>
              {invoices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 font-mono">No invoices found</p>
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {invoices.map(inv => (
                    <div key={inv.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
                      <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-foreground font-mono text-xs">{inv.invoice_number || `#${inv.id}`}</span>
                      <span className="font-mono text-primary text-xs">KES {Number(inv.amount).toLocaleString()}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusColors[inv.status] || ""}`}>{inv.status}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{inv.due_date || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "projects" && (
            <>
              <h3 className="font-display text-sm text-accent mb-3">MY PROJECTS</h3>
              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 font-mono">No projects found</p>
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {projects.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
                      <FolderOpen className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-foreground truncate">{p.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusColors[p.status] || "bg-muted text-muted-foreground"}`}>{p.status}</span>
                      <span className="text-xs text-muted-foreground font-mono">KES {Number(p.budget || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
