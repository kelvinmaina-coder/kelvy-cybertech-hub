import { useState } from "react";
import { Receipt, Download, Plus, Search, Filter, CheckCircle2, Clock, Mail, FileText } from "lucide-react";
import SmartStamp from "@/components/SmartStamp";

export default function ClientBilling() {
  const [invoices, setInvoices] = useState([
    { id: "INV-2026-001", client: "Acme Corp", amount: "KES 1,250.00", status: "Paid", date: "Apr 10, 2026" },
    { id: "INV-2026-002", client: "Global Tech", amount: "KES 3,400.00", status: "Pending", date: "Apr 12, 2026" },
    { id: "INV-2026-003", client: "Nexa Systems", amount: "KES 850.00", status: "Overdue", date: "Apr 1, 2026" },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            AUTOMATED CLIENT BILLING
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Invoicing, Revenue Tracking & Financial Reporting
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter">
          <Plus className="w-3.5 h-3.5" />
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Revenue (MoM)", value: "KES 45,200", trend: "+12.4%", color: "text-green-500" },
          { label: "Outstanding", value: "KES 8,450", trend: "-2.1%", color: "text-orange-500" },
          { label: "Avg. Payment Time", value: "2.4 Days", trend: "0.5d faster", color: "text-primary" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 border border-border rounded-xl">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{stat.label}</p>
             <div className="flex items-end justify-between">
                <span className="text-3xl font-mono font-bold leading-none">{stat.value}</span>
                <span className={`text-[10px] font-mono font-bold ${stat.color}`}>{stat.trend}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-card border border-border rounded-xl">
        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Recent Invoices</h3>
              <div className="relative">
                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                 <input type="text" placeholder="Search..." className="bg-muted/50 border-none rounded py-1 pl-7 pr-4 text-[10px] outline-none" />
              </div>
           </div>
           <Filter className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
        </div>
        <div className="divide-y divide-border">
           {invoices.map((inv) => (
             <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                <div className="flex items-center gap-4">
                   <div className="p-2 rounded bg-muted">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                   </div>
                   <div>
                      <p className="text-sm font-bold font-display">{inv.client}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{inv.id} · {inv.date}</p>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className="text-sm font-mono font-bold">{inv.amount}</span>
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        inv.status === 'Paid' ? 'border-green-500/50 text-green-500 bg-green-500/5' : 
                        inv.status === 'Pending' ? 'border-orange-500/50 text-orange-500 bg-orange-500/5' : 
                        'border-red-500/50 text-red-500 bg-red-500/5'
                      }`}>
                         {inv.status.toUpperCase()}
                      </span>
                      <div className="flex gap-2">
                         <button className="p-1.5 rounded hover:bg-muted transition" title="Download"><Download className="w-3.5 h-3.5 text-muted-foreground" /></button>
                         <button className="p-1.5 rounded hover:bg-muted transition" title="Email"><Mail className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
      <SmartStamp type="invoice" />
    </div>
  );
}
