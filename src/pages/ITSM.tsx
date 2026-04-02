import { useState, useEffect } from "react";
import { Ticket, Clock, CheckCircle, AlertTriangle, Plus, X, Loader2 } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TicketData {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  client_id: number | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
}

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
  closed: "text-muted-foreground bg-muted/30",
};

export default function ITSM() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });

  const loadTickets = async () => {
    const { data } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
    setTickets((data as TicketData[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
    const channel = supabase.channel("tickets-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => loadTickets())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("tickets").insert({
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      created_by: user?.id,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket created");
    setForm({ title: "", description: "", priority: "medium" });
    setShowAdd(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await supabase.from("tickets").update({ status } as any).eq("id", id);
    toast.success(`Ticket ${status}`);
  };

  const openCount = tickets.filter(t => t.status === "open").length;
  const resolvedToday = tickets.filter(t => t.status === "resolved" && new Date(t.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-warning">ITSM — SUPPORT CENTER</h1>
          <p className="text-sm text-muted-foreground font-mono">Real-Time Ticket Management</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/20 text-warning text-xs font-mono hover:bg-warning/30 transition">
          {showAdd ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showAdd ? "Cancel" : "New Ticket"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Ticket} title="Open Tickets" value={String(openCount)} variant="orange" />
        <MetricCard icon={Clock} title="Total" value={String(tickets.length)} variant="cyan" />
        <MetricCard icon={CheckCircle} title="Resolved Today" value={String(resolvedToday)} variant="green" />
        <MetricCard icon={AlertTriangle} title="Critical" value={String(tickets.filter(t => t.priority === "critical" && t.status === "open").length)} variant="red" />
      </div>

      {showAdd && (
        <form onSubmit={addTicket} className="rounded-lg border border-warning/30 bg-card p-4 space-y-3">
          <h3 className="font-display text-sm text-warning mb-2">CREATE TICKET</h3>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Ticket Title *"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-warning/50" />
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-warning/50 min-h-[80px]" />
          <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button type="submit" className="px-4 py-2 rounded-lg bg-warning text-warning-foreground font-mono text-sm hover:opacity-90 transition">Submit Ticket</button>
        </form>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm text-warning mb-3">ALL TICKETS</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-warning" /></div>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground font-mono text-center py-8">No tickets yet</p>
        ) : (
          <div className="space-y-1">
            {tickets.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
                <span className="text-xs text-muted-foreground font-mono w-12 shrink-0">#{t.id}</span>
                <span className="flex-1 text-foreground truncate">{t.title}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${priorityColors[t.priority] || ""}`}>{t.priority}</span>
                <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono bg-transparent border border-border ${statusColors[t.status] || ""}`}>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
