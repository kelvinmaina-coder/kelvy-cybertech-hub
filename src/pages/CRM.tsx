import { useState, useEffect } from "react";
import { Users, TrendingUp, DollarSign, UserPlus, Plus, X, Loader2 } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  mpesa_number: string | null;
  contract_value: number;
  status: string;
  created_at: string;
}

export default function CRM() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", mpesa_number: "", contract_value: "0" });

  const loadClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients((data as Client[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadClients(); }, []);

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("clients").insert({
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      mpesa_number: form.mpesa_number || null,
      contract_value: Number(form.contract_value),
      created_by: user?.id,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Client added");
    setForm({ name: "", email: "", phone: "", mpesa_number: "", contract_value: "0" });
    setShowAdd(false);
    loadClients();
  };

  const totalValue = clients.reduce((a, c) => a + Number(c.contract_value), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-secondary text-glow-cyan">CRM — CUSTOMER INTELLIGENCE</h1>
          <p className="text-sm text-muted-foreground font-mono">Real-Time Client Management</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-mono hover:bg-primary/30 transition">
          {showAdd ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showAdd ? "Cancel" : "Add Client"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Users} title="Total Clients" value={String(clients.length)} variant="cyan" />
        <MetricCard icon={TrendingUp} title="Active" value={String(clients.filter(c => c.status === "active").length)} variant="green" />
        <MetricCard icon={DollarSign} title="Pipeline (KES)" value={`${(totalValue / 1000).toFixed(0)}K`} variant="green" />
        <MetricCard icon={UserPlus} title="This Month" value={String(clients.filter(c => new Date(c.created_at) > new Date(Date.now() - 30 * 86400000)).length)} variant="purple" />
      </div>

      {showAdd && (
        <form onSubmit={addClient} className="rounded-lg border border-primary/30 bg-card p-4 space-y-3">
          <h3 className="font-display text-sm text-primary mb-2">ADD NEW CLIENT</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Company Name *"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50" />
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" type="email"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50" />
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50" />
            <input value={form.mpesa_number} onChange={e => setForm(p => ({ ...p, mpesa_number: e.target.value }))} placeholder="M-Pesa Number"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50" />
            <input value={form.contract_value} onChange={e => setForm(p => ({ ...p, contract_value: e.target.value }))} placeholder="Contract Value (KES)" type="number"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50" />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm hover:opacity-90 transition">Save Client</button>
        </form>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">ALL CLIENTS</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : clients.length === 0 ? (
          <p className="text-sm text-muted-foreground font-mono text-center py-8">No clients yet. Add your first client above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground font-mono border-b border-border">
                  <th className="text-left py-2 pr-4">Company</th>
                  <th className="text-left py-2 pr-4 hidden sm:table-cell">Email</th>
                  <th className="text-left py-2 pr-4 hidden md:table-cell">Phone</th>
                  <th className="text-left py-2 pr-4">Value</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition">
                    <td className="py-2 pr-4 text-foreground font-medium">{c.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground hidden sm:table-cell">{c.email || "-"}</td>
                    <td className="py-2 pr-4 text-muted-foreground hidden md:table-cell font-mono">{c.phone || "-"}</td>
                    <td className="py-2 pr-4 text-primary font-mono">KES {Number(c.contract_value).toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${c.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
