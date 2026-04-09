import { useState } from "react";
import { CreditCard, Globe, Zap, ArrowUpRight, ArrowDownLeft, ShieldCheck, Database, Wallet, Activity } from "lucide-react";

export default function CryptoPayments() {
  const [methods, setMethods] = useState([
    { id: 1, name: "Visa / Mastercard", status: "Active", fee: "2.9%" },
    { id: 2, name: "Bitcoin (BTC)", status: "Active", fee: "1.2%" },
    { id: 3, name: "Ethereum (ETH)", status: "Active", fee: "0.8%" },
    { id: 4, name: "USDT (Polygon)", status: "Maintenance", fee: "0.5%" },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            MULTI-CURRENCY & CRYPTO PAYMENTS
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Global Payment Processing & Web3 Settlement Engine
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter">
          <Wallet className="w-3.5 h-3.5" />
          Connect Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Volume", value: "$1.2M", icon: Activity, color: "text-primary" },
          { label: "Crypto Volume", value: "$420k", icon: Zap, color: "text-orange-500" },
          { label: "Success Rate", value: "99.9%", icon: ShieldCheck, color: "text-green-500" },
          { label: "Payouts Pending", value: "$14.2k", icon: Database, color: "text-muted-foreground" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 border border-border rounded-xl">
             <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</span>
             </div>
             <p className="text-lg font-mono font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card border border-border rounded-xl overflow-hidden">
           <div className="p-4 border-b border-border bg-muted/20">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Accepted Payment Methods</h3>
           </div>
           <div className="divide-y divide-border">
              {methods.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                   <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                         <CreditCard className={`w-4 h-4 ${m.status === 'Active' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                         <p className="text-sm font-bold font-display">{m.name}</p>
                         <p className="text-[10px] text-muted-foreground font-mono">Processing Fee: {m.fee}</p>
                      </div>
                   </div>
                   <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                     m.status === 'Active' ? 'border-green-500/50 text-green-500 bg-green-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'
                   }`}>
                      {m.status.toUpperCase()}
                   </span>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-4">
           <div className="glass-card p-6 border border-border rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Globe className="w-4 h-4 text-primary" />
                 Global Exchange Rates
              </h3>
              <div className="space-y-4">
                 {[
                   { pair: "KES / USD", rate: "131.50", change: "-0.2%" },
                   { pair: "BTC / USD", rate: "64,240.20", change: "+1.4%" },
                   { pair: "ETH / USD", rate: "3,420.15", change: "+0.8%" },
                 ].map((rate, i) => (
                   <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <span className="text-xs font-mono font-bold">{rate.pair}</span>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-mono">{rate.rate}</span>
                         <span className={`text-[9px] font-mono ${rate.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{rate.change}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <ArrowUpRight className="w-5 h-5 text-primary" />
                 <div>
                    <p className="text-xs font-bold font-display uppercase tracking-wider">Settlement Hub</p>
                    <p className="text-[10px] text-muted-foreground font-mono italic">Next auto-settlement in 12h</p>
                 </div>
              </div>
              <button className="text-[10px] font-bold font-mono text-primary hover:underline">RECONCILE NOW</button>
           </div>
        </div>
      </div>
    </div>
  );
}
