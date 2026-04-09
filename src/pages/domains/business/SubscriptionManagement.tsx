import { useState } from "react";
import { UserCheck, ShieldCheck, Zap, Repeat, CreditCard, ChevronRight, BarChart3, Clock } from "lucide-react";

export default function SubscriptionManagement() {
  const plans = [
    { name: "Starter Tier", active: 142, revenue: "$14.2k", growth: "+4%" },
    { name: "Enterprise Elite", active: 28, revenue: "$84.0k", growth: "+12%" },
    { name: "Managed SOC", active: 15, revenue: "$150.0k", growth: "+8%" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            SUBSCRIPTION MANAGEMENT
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Recurring Revenue, Plan Tiers & Client Lifecycle
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right">
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Current MRR</p>
              <p className="text-lg font-mono font-bold text-primary">$248,200</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.name} className="glass-card border border-border rounded-xl p-6 group hover:border-primary/50 transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                   <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold text-green-500 font-mono">{p.growth}</span>
                   <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">Last 30 Days</p>
                </div>
             </div>
             <h3 className="font-display font-bold text-xl mb-1">{p.name}</h3>
             <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-6">{p.active} Active Subscriptions</p>
             
             <div className="grid grid-cols-2 gap-4 py-4 border-y border-border mb-6">
                <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Total Rev</p>
                   <p className="text-sm font-mono font-bold">{p.revenue}</p>
                </div>
                <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Retention</p>
                   <p className="text-sm font-mono font-bold text-green-500">98.2%</p>
                </div>
             </div>

             <button className="w-full py-2 rounded-lg bg-muted border border-border text-[10px] font-bold font-mono uppercase tracking-widest hover:border-primary transition flex items-center justify-center gap-2">
                Manage Tier
                <ChevronRight className="w-3.5 h-3.5" />
             </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="glass-card p-6 border border-border rounded-xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest mb-6 flex items-center justify-between">
               Churn Analysis
               <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </h3>
            <div className="flex items-end gap-2 h-32">
               {[2, 1, 3, 2, 4, 1, 2, 3, 5, 2, 1, 2].map((val, i) => (
                 <div key={i} className="flex-1 bg-red-500/20 rounded-t-sm" style={{ height: `${val * 20}%` }} />
               ))}
            </div>
            <div className="flex justify-between mt-4 text-[9px] font-mono text-muted-foreground uppercase">
               <span>Jan</span>
               <span>Jun</span>
               <span>Dec</span>
            </div>
         </div>

         <div className="glass-card p-6 border border-border rounded-xl bg-gradient-to-br from-primary/5 to-transparent flex flex-col justify-between">
            <div>
               <h3 className="text-xs font-bold font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Renewal Forecast
               </h3>
               <p className="text-xs text-muted-foreground leading-relaxed">
                  12 Enterprise contracts are due for renewal in the next 30 days. Predicted renewal probability: <span className="text-green-500 font-bold">94%</span>.
               </p>
            </div>
            <div className="mt-6 p-3 rounded bg-black/20 border border-white/5 flex items-center gap-3">
               <Zap className="w-5 h-5 text-primary" />
               <p className="text-[10px] text-muted-foreground italic">AI Suggestion: Proactively offer a 5% discount for a 2-year early renewal commitment to Acme Corp.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
