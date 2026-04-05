import { useState, useEffect } from "react";
import { Users, TrendingUp, DollarSign, UserPlus, Plus, X, Loader2, Handshake, MessageSquare } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Client {
  id: number; name: string; email: string | null; phone: string | null;
  mpesa_number: string | null; contract_value: number; status: string; created_at: string;
}
interface Deal {
  id: number; client_id: number; title: string; value: number; stage: string;
  probability: number; close_date: string | null; notes: string | null;
}

const stageColors: Record<string, string> = {
  lead: "bg-muted/30 text-muted-foreground", prospect: "bg-secondary/10 text-secondary",
  quote: "bg-warning/10 text-warning", deal: "bg-primary/10 text-primary", closed: "bg-primary/20 text-primary",
};

export default function CRM() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDeal, setShowDeal] = useState(false);
  const [tab, setTab] = useState<"clients" | "deals">("clients");
  const [form, setForm] = useState({ name: "", email: "", phone: "", mpesa_number: "", contract_value: "0", address: "" });
  const [dealForm, setDealForm] = useState({ client_id: "", title: "", value: "0", stage: "lead", probability: "20", close_date: "", notes: "" });

  const loadData = async () => {
    const [cliRes, dealRes] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("deals").select("*").order("created_at", { ascending: false }),
    ]);
    setClients((cliRes.data as Client[]) || []);
    setDeals((dealRes.data as Deal[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("clients").insert({
      name: form.name, email: form.email || null, phone: form.phone || null,
      mpesa_number: form.mpesa_number || null, contract_value: Number(form.contract_value),
      address: form.address || null, created_by: user?.id,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Client added");
    setForm({ name: "", email: "", phone: "", mpesa_number: "", contract_value: "0", address: "" });
    setShowAdd(false);
    loadData();
  };

  const addDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("deals").insert({
      client_id: Number(dealForm.client_id), title: dealForm.title,
      value: Number(dealForm.value), stage: dealForm.stage,
      probability: Number(dealForm.probability), close_date: dealForm.close_date || null,
      notes: dealForm.notes || null, created_by: user?.id,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Deal created");
    setDealForm({ client_id: "", title: "", value: "0", stage: "lead", probability: "20", close_date: "", notes: "" });
    setShowDeal(false);
    loadData();
  };

  const totalValue = clients.reduce((a, c) => a + Number(c.contract_value), 0);
  const dealValue = deals.reduce((a, d) => a + Number(d.value), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-secondary text-glow-cyan">CRM — CUSTOMER INTELLIGENCE</h1>
          <p className="text-sm text-muted-foreground font-mono">Clients • Deals • Interactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowAdd(!showAdd); setShowDeal(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-mono hover:bg-primary/30 transition">
            {showAdd ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />} {showAdd ? "Cancel" : "Add Client"}
          </button>
          <button onClick={() => { setShowDeal(!showDeal); setShowAdd(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary/20 text-secondary text-xs font-mono hover:bg-secondary/30 transition">
            {showDeal ? <X className="w-3 h-3" /> : <Handshake className="w-3 h-3" />} {showDeal ? "Cancel" : "New Deal"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Users} title="Total Clients" value={String(clients.length)} variant="cyan" />
        <MetricCard icon={TrendingUp} title="Active" value={String(clients.filter(c => c.status === "active").length)} variant="green" />
        <MetricCard icon={DollarSign} title="Pipeline (KES)" value={`${(totalValue / 1000).toFixed(0)}K`} variant="green" />
        <MetricCard icon={Handshake} title="Open Deals" value={String(deals.filter(d => d.stage !== "closed").length)} variant="purple" />
      </div>

      {showAdd && (
        <form onSubmit={addClient} className="rounded-lg border border-primary/30 bg-card p-4 space-y-3">
          <h3 className="font-display text-sm text-primary mb-2">ADD NEW CLIENT</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { k: "name", p: "Company Name *", r: true },
              { k: "email", p: "Email", t: "email" },
              { k: "phone", p: "Phone" },
              { k: "mpesa_number", p: "M-Pesa Number" },
              { k: "address", p: "Address" },
              { k: "contract_value", p: "Contract Value (KES)", t: "number" },
            ].map(f => (
              <input key={f.k} value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                required={f.r} type={f.t || "text"} placeholder={f.p}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50" />
            ))}
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm hover:opacity-90 transition">Save Client</button>
        </form>
      )}

      {showDeal && (
        <form onSubmit={addDeal} className="rounded-lg border border-secondary/30 bg-card p-4 space-y-3">
          <h3 className="font-display text-sm text-secondary mb-2">CREATE DEAL</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <select value={dealForm.client_id} onChange={e => setDealForm(p => ({ ...p, client_id: e.target.value }))} required
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono">
              <option value="">Select Client *</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={dealForm.title} onChange={e => setDealForm(p => ({ ...p, title: e.target.value }))} required placeholder="Deal Title *"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono" />
            <input type="number" value={dealForm.value} onChange={e => setDealForm(p => ({ ...p, value: e.target.value }))} placeholder="Value (KES)"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono" />
            <select value={dealForm.stage} onChange={e => setDealForm(p => ({ ...p, stage: e.target.value }))}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono">
              <option value="lead">Lead</option><option value="prospect">Prospect</option>
              <option value="quote">Quote</option><option value="deal">Deal</option><option value="closed">Closed</option>
            </select>
            <input type="number" value={dealForm.probability} onChange={e => setDealForm(p => ({ ...p, probability: e.target.value }))} placeholder="Probability %"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono" />
            <input type="date" value={dealForm.close_date} onChange={e => setDealForm(p => ({ ...p, close_date: e.target.value }))}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-mono text-sm hover:opacity-90 transition">Create Deal</button>
        </form>
      )}

      <div className="flex gap-2">
        <button onClick={() => setTab("clients")} className={`px-3 py-1.5 rounded-lg text-xs font-mono ${tab === "clients" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>CLIENTS</button>
        <button onClick={() => setTab("deals")} className={`px-3 py-1.5 rounded-lg text-xs font-mono ${tab === "deals" ? "bg-secondary/20 text-secondary" : "text-muted-foreground"}`}>DEALS ({deals.length})</button>
      </div>

      {tab === "clients" ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">ALL CLIENTS</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono text-center py-8">No clients yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground font-mono border-b border-border">
                  <th className="text-left py-2 pr-4">Company</th><th className="text-left py-2 pr-4 hidden sm:table-cell">Email</th>
                  <th className="text-left py-2 pr-4 hidden md:table-cell">Phone</th><th className="text-left py-2 pr-4">Value</th><th className="text-left py-2">Status</th>
                </tr></thead>
                <tbody>{clients.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition">
                    <td className="py-2 pr-4 text-foreground font-medium">{c.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground hidden sm:table-cell">{c.email || "—"}</td>
                    <td className="py-2 pr-4 text-muted-foreground hidden md:table-cell font-mono">{c.phone || "—"}</td>
                    <td className="py-2 pr-4 text-primary font-mono">KES {Number(c.contract_value).toLocaleString()}</td>
                    <td className="py-2"><span className={`px-1.5 py-0.5 rounded text-xs font-mono ${c.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{c.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3">DEALS PIPELINE</h3>
          {deals.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono text-center py-8">No deals yet</p>
          ) : (
            <div className="space-y-2">
              {deals.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                  <Handshake className="w-4 h-4 text-secondary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{clients.find(c => c.id === d.client_id)?.name || "—"} • {d.probability}% • {d.close_date || "No date"}</p>
                  </div>
                  <span className="text-primary font-mono text-xs">KES {Number(d.value).toLocaleString()}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${stageColors[d.stage] || ""}`}>{d.stage}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
