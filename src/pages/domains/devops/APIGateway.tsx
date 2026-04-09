import { useState } from "react";
import { Key, Globe, Shield, Activity, Zap, Plus, ExternalLink, Database } from "lucide-react";

export default function APIGateway() {
  const [keys, setKeys] = useState([
    { id: 1, name: "Stripe Webhook Listener", key: "sk_live_...4v2k", usage: "12.4k req", status: "Active" },
    { id: 2, name: "Mobile App Prod", key: "apk_...98x1", usage: "450.2k req", status: "Active" },
    { id: 3, name: "Internal Services Hub", key: "is_...z902", usage: "2.1M req", status: "Revoked" },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Key className="w-5 h-5" />
            API GATEWAY FOR CLIENTS
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Key Management, Rate Limiting & Edge Routing
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter">
          <Plus className="w-3.5 h-3.5" />
          Generate New Key
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Daily Requests", value: "2.5M", icon: Activity, color: "text-blue-500" },
          { label: "Active Keys", value: "12", icon: Key, color: "text-primary" },
          { label: "Blocked IP's", value: "148", icon: Shield, color: "text-red-500" },
          { label: "Current PPS", value: "245", icon: Zap, color: "text-green-500" },
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

      <div className="glass-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
           <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Managed API Keys</h3>
           <Database className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="p-0">
           {keys.map((k) => (
             <div key={k.id} className="p-4 border-b border-border last:border-0 flex items-center justify-between hover:bg-muted/10 transition">
                <div className="flex items-center gap-4">
                   <div className="p-2 rounded-lg bg-muted">
                      <Key className={`w-4 h-4 ${k.status === 'Active' ? 'text-primary' : 'text-muted-foreground'}`} />
                   </div>
                   <div>
                      <p className="text-sm font-bold font-display">{k.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded mt-1">{k.key}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Usage: {k.usage}</p>
                   <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                     k.status === 'Active' ? 'border-primary/50 text-primary bg-primary/5' : 'border-red-500/20 text-red-500 bg-red-500/5'
                   }`}>
                     {k.status.toUpperCase()}
                   </span>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col justify-between">
            <div>
               <h4 className="font-display font-bold text-foreground flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Request Filtering
               </h4>
               <p className="text-xs text-muted-foreground leading-relaxed">
                  Apply global WAF rules and geographical restrictions to your API keys with one click.
               </p>
            </div>
            <button className="mt-4 text-[10px] font-bold font-mono text-primary uppercase text-left hover:underline">Configure Edge Rules →</button>
         </div>
         <div className="p-5 rounded-xl bg-card border border-border flex flex-col justify-between">
            <h4 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
               <ExternalLink className="w-4 h-4 text-muted-foreground" />
               Documentation
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
               Share your public API documentation with clients including auto-generated SDKs.
            </p>
            <button className="mt-4 text-[10px] font-bold font-mono text-muted-foreground uppercase text-left hover:text-foreground">Visit Portal →</button>
         </div>
      </div>
    </div>
  );
}
