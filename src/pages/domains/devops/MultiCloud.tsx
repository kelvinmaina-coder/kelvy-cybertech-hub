import { useState } from "react";
import { Cloud, Globe, Server, Database, Activity, Map, ExternalLink, ShieldCheck } from "lucide-react";

export default function MultiCloud() {
  const providers = [
    { name: "AWS", region: "London", nodes: 42, health: "100%", cost: "$420/day" },
    { name: "Google Cloud", region: "Singapore", nodes: 18, health: "98%", cost: "$210/day" },
    { name: "Azure", region: "Nairobi", nodes: 24, health: "100%", cost: "$340/day" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            MULTI-CLOUD MANAGEMENT
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Unified Control Plane for Hybrid & Multi-Cloud Clusters
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-muted text-foreground font-mono text-xs font-bold border border-border hover:border-primary transition flex items-center gap-2">
          <Map className="w-4 h-4" />
          Global Map View
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => (
          <div key={p.name} className="glass-card border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-all">
             <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center font-mono text-[10px] font-bold">
                <span className="text-muted-foreground">{p.region.toUpperCase()}</span>
                <span className="text-green-500">{p.health} HEALTH</span>
             </div>
             <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                      <Cloud className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                      <h3 className="font-display font-bold text-lg">{p.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{p.nodes} Active Nodes</p>
                   </div>
                </div>
                
                <div className="space-y-3 pt-2">
                   <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground uppercase">Resource Burn</span>
                      <span className="text-foreground font-bold">{p.cost}</span>
                   </div>
                   <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full opacity-60" style={{ width: '65%' }} />
                   </div>
                </div>

                <div className="mt-6 flex gap-2">
                   <button className="flex-1 py-1.5 rounded bg-muted/50 text-[10px] font-bold uppercase tracking-widest font-mono hover:bg-muted transition">Nodes</button>
                   <button className="flex-1 py-1.5 rounded bg-muted/50 text-[10px] font-bold uppercase tracking-widest font-mono hover:bg-muted transition">Cost Detail</button>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-card border border-border rounded-xl p-5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <div>
               <h4 className="font-display font-bold uppercase text-foreground">Compliance Guardrails</h4>
               <p className="text-xs text-muted-foreground">All cloud providers are currently meeting Kelvy's strict SOC2 and ISO27001 data residency policies.</p>
            </div>
         </div>
         <button className="px-4 py-2 rounded-lg border border-border text-[10px] font-bold font-mono uppercase tracking-widest flex items-center gap-2 hover:border-primary transition">
            Audit Policies
            <ExternalLink className="w-3.5 h-3.5" />
         </button>
      </div>
    </div>
  );
}
