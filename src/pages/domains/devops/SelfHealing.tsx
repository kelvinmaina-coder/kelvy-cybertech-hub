import { useState } from "react";
import { Heart, Activity, CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck, Zap, History, RefreshCw } from "lucide-react";

export default function SelfHealing() {
  const [isFixing, setIsFixing] = useState(false);
  const incidents = [
    { id: 1, component: "Kubernetes Node 04", error: "OOM Kill detected", action: "Auto-Scaled Memory + Restart", status: "Resolved", time: "12m ago" },
    { id: 2, component: "Postgres Slave-2", error: "Replication lag gap", action: "Primary Resync triggered", status: "Fixing", time: "Just now" },
    { id: 3, component: "WAF Layer 7", error: "Health probe failed", action: "Route re-convergence", status: "Resolved", time: "1h ago" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Heart className="w-5 h-5" />
            SELF-HEALING INFRASTRUCTURE
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Autonomous Fault Detection & Recovery Engine
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span className="text-xs font-bold text-green-500 font-mono uppercase tracking-widest">System Resilient</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Recovery Rate", value: "99.8%", icon: Activity, color: "text-primary" },
          { label: "MTTR (Avg)", value: "4.2s", icon: Zap, color: "text-orange-500" },
          { label: "Auto-Fixes (24h)", value: "28", icon: RefreshCw, color: "text-blue-500" },
          { label: "Passive Health", value: "EXCELLENT", icon: CheckCircle2, color: "text-green-500" },
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

      <div className="glass-card border border-border rounded-xl">
        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
           <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Live Recovery Stream</h3>
           <History className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="divide-y divide-border">
           {incidents.map((inc) => (
             <div key={inc.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-lg ${inc.status === 'Resolved' ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                      <AlertTriangle className={`w-4 h-4 ${inc.status === 'Resolved' ? 'text-green-500' : 'text-orange-500'}`} />
                   </div>
                   <div>
                      <p className="text-sm font-bold font-display">{inc.component}</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter text-red-400">Error: {inc.error}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-primary font-bold font-mono uppercase tracking-widest mb-1">{inc.action}</p>
                   <div className="flex items-center gap-2 justify-end">
                      <span className={`w-1.5 h-1.5 rounded-full ${inc.status === 'Resolved' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                      <span className={`text-[10px] font-mono ${inc.status === 'Resolved' ? 'text-green-500' : 'text-orange-500'}`}>{inc.status.toUpperCase()}</span>
                      <span className="text-[10px] text-muted-foreground font-mono ml-2">{inc.time}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
         <Zap className="w-5 h-5 text-primary shrink-0" />
         <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-bold mr-2 uppercase">AI Hotfix applied:</span>
            Detected anomalous CPU burst on Worker-C. Preemptively migrated non-critical pods to spare node cluster and re-balanced load. 
            Zero downtime maintained.
         </p>
      </div>
    </div>
  );
}
