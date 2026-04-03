import { useState, useEffect } from "react";
import { DollarSign, Users, Package, FileText, CreditCard, Plus, Loader2, X } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const statusColors: Record<string, string> = {
  paid: "text-primary bg-primary/10",
  pending: "text-warning bg-warning/10",
  overdue: "text-destructive bg-destructive/10",
  draft: "text-muted-foreground bg-muted/30",
};

export default function ERP() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ client_id: "", amount: "", due_date: "", invoice_number: "", status: "draft" });

  const loadData = async () => {
    const [invRes, cliRes] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
    ]);
    setInvoices(invRes.data || []);
    setClients(cliRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + Number(i.amount), 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  const expenseData = [
    { name: "Paid", value: invoices.filter(i => i.status === "paid").length, color: "hsl(157, 100%, 50%)" },
    { name: "Pending", value: invoices.filter(i => i.status === "pending").length, color: "hsl(25, 95%, 53%)" },
    { name: "Overdue", value: overdueCount, color: "hsl(348, 86%, 61%)" },
    { name: "Draft", value: invoices.filter(i => i.status === "draft").length, color: "hsl(215, 20%, 55%)" },
  ].filter(d => d.value > 0);

  const addInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("invoices").insert({
      client_id: form.client_id ? Number(form.client_id) : null,
      amount: Number(form.amount),
      due_date: form.due_date || null,
      invoice_number: form.invoice_number || null,
      status: form.status,
      created_by: user?.id,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Invoice created");
    setForm({ client_id: "", amount: "", due_date: "", invoice_number: "", status: "draft" });
    setShowAdd(false);
    loadData();
  };

  const updateStatus = async (id: number, status: string) => {
    const update: any = { status };
    if (status === "paid") update.paid_at = new Date().toISOString();
    await supabase.from("invoices").update(update).eq("id", id);
    toast.success(`Invoice marked ${status}`);
    loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold gradient-text">ERP — BUSINESS OPERATIONS</h1>
          <p className="text-sm text-muted-foreground font-mono">Finance • Invoicing • M-Pesa</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-mono hover:bg-primary/30 transition">
          {showAdd ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />} {showAdd ? "Cancel" : "New Invoice"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={DollarSign} title="Revenue" value={`${(totalRevenue / 1000).toFixed(0)}K`} variant="green" change="KES (Paid)" />
        <MetricCard icon={CreditCard} title="Pending" value={`${(totalPending / 1000).toFixed(0)}K`} variant="orange" change="KES" />
        <MetricCard icon={FileText} title="Invoices" value={String(invoices.length)} variant="cyan" />
        <MetricCard icon={Package} title="Overdue" value={String(overdueCount)} variant="red" />
      </div>

      {showAdd && (
        <form onSubmit={addInvoice} className="rounded-lg border border-primary/30 bg-card p-4 space-y-3 animate-fade-in">
          <h3 className="font-display text-sm text-primary">CREATE INVOICE</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })} placeholder="INV-001"
              className="bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
            <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}
              className="bg-background border border-border rounded px-3 py-2 text-sm font-mono">
              <option value="">No client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount (KES)" required
              className="bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
            <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
              className="bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
          </div>
          <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-mono hover:opacity-90">Create Invoice</button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">INVOICE STATUS</h3>
          {expenseData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expenseData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {expenseData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {expenseData.map((e, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: e.color }} /> {e.name} ({e.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8 font-mono">No invoices yet</p>
          )}
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 border-glow-green">
          <h3 className="font-display text-sm text-primary mb-2">M-PESA INTEGRATION</h3>
          <p className="text-xs text-muted-foreground">Daraja API ready • Mark invoices paid with M-Pesa reference</p>
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <div className="text-lg font-display font-bold text-primary">{invoices.filter(i => i.mpesa_ref).length}</div>
              <div className="text-[10px] text-muted-foreground font-mono">M-Pesa Payments</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-display font-bold text-primary">KES {(invoices.filter(i => i.mpesa_ref).reduce((s, i) => s + Number(i.amount), 0) / 1000).toFixed(0)}K</div>
              <div className="text-[10px] text-muted-foreground font-mono">Via M-Pesa</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">ALL INVOICES</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : invoices.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8 font-mono">No invoices created yet</p>
        ) : (
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground font-mono text-xs">{inv.invoice_number || `#${inv.id}`}</span>
                <span className="flex-1 text-muted-foreground text-xs truncate">{clients.find(c => c.id === inv.client_id)?.name || "—"}</span>
                <span className="font-mono text-primary text-xs">KES {Number(inv.amount).toLocaleString()}</span>
                <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono bg-transparent border-none cursor-pointer ${statusColors[inv.status] || ""}`}>
                  <option value="draft">draft</option>
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                  <option value="overdue">overdue</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
