import { DollarSign, Users, Package, FileText, TrendingUp, CreditCard } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const expenseData = [
  { name: "Infrastructure", value: 35, color: "hsl(195, 100%, 50%)" },
  { name: "Salaries", value: 40, color: "hsl(157, 100%, 50%)" },
  { name: "Marketing", value: 10, color: "hsl(263, 35%, 55%)" },
  { name: "Operations", value: 15, color: "hsl(25, 95%, 53%)" },
];

const invoices = [
  { client: "Acme Corp", amount: "KES 150,000", status: "paid", date: "Mar 28" },
  { client: "TechFlow", amount: "KES 85,000", status: "pending", date: "Mar 25" },
  { client: "SecureNet", amount: "KES 220,000", status: "overdue", date: "Mar 15" },
  { client: "DataWave", amount: "KES 45,000", status: "paid", date: "Mar 22" },
];

const statusColors: Record<string, string> = {
  paid: "text-primary bg-primary/10",
  pending: "text-warning bg-warning/10",
  overdue: "text-destructive bg-destructive/10",
};

export default function ERP() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow-green">ERP — BUSINESS OPERATIONS</h1>
        <p className="text-sm text-muted-foreground font-mono">Finance • HR • Inventory • M-Pesa</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={DollarSign} title="Revenue (Month)" value="725K" variant="green" change="KES" />
        <MetricCard icon={CreditCard} title="Expenses" value="410K" variant="orange" change="KES" />
        <MetricCard icon={Users} title="Employees" value="4" variant="cyan" />
        <MetricCard icon={Package} title="Assets" value="18" variant="purple" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">EXPENSE BREAKDOWN</h3>
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
                <span className="w-2 h-2 rounded-full" style={{ background: e.color }} /> {e.name}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">RECENT INVOICES</h3>
          <div className="space-y-2">
            {invoices.map((inv, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-foreground">{inv.client}</span>
                <span className="font-mono text-primary">{inv.amount}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${statusColors[inv.status]}`}>{inv.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 border-glow-green">
        <h3 className="font-display text-sm text-primary mb-2">M-PESA INTEGRATION</h3>
        <p className="text-xs text-muted-foreground">Daraja API connected • Payments auto-reconciled • Till: 174379</p>
        <div className="flex gap-3 mt-3">
          <div className="text-center">
            <div className="text-lg font-display font-bold text-primary">47</div>
            <div className="text-[10px] text-muted-foreground font-mono">Transactions Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-display font-bold text-primary">KES 89K</div>
            <div className="text-[10px] text-muted-foreground font-mono">Received Today</div>
          </div>
        </div>
      </div>
    </div>
  );
}
