import { useState } from "react";
import { TrendingUp, Cpu, Server, Activity, ArrowUpRight, Zap, ShieldCheck } from "lucide-react";

export default function PredictiveScaling() {
  const [isSimulating, setIsSimulating] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            PREDICTIVE RESOURCE SCALING
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            AI-Driven Infrastructure Forecasting & Optimization
          </p>
        </div>
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl">
           <Zap className="w-4 h-4 text-primary animate-pulse" />
           <div className="text-[10px] font-mono leading-tight">
              <span className="text-muted-foreground block">ESTIMATED SAVINGS (24H)</span>
              <span className="text-primary font-bold">$142.50 USD</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card border border-border rounded-xl p-6 relative overflow-hidden">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest">Load Prediction (Next 12 Hours)</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Predicted</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Baseline</span>
                 </div>
              </div>
           </div>
           
           <div className="h-48 flex items-end gap-1.5 px-2">
              {[30, 35, 45, 60, 85, 95, 80, 55, 40, 35, 45, 60].map((val, i) => (
                <div key={i} className="flex-1 bg-primary/20 rounded-t relative group transition-all hover:bg-primary/40" style={{ height: `${val}%` }}>
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition">{val}%</div>
                </div>
              ))}
           </div>
           <div className="flex justify-between mt-4 text-[10px] font-mono text-muted-foreground uppercase px-2">
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
           </div>
        </div>

        <div className="space-y-4">
           <div className="glass-card p-5 border border-border rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                 <Server className="w-5 h-5 text-primary" />
                 <span className="text-[10px] font-bold font-mono text-green-500 uppercase">HEALTHY</span>
              </div>
              <h4 className="text-sm font-bold font-display uppercase tracking-wider mb-2">Replica Status</h4>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-muted-foreground">Current Nodes</span>
                    <span className="text-xs font-mono font-bold">12</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-muted-foreground">Target (AI Rec)</span>
                    <span className="text-xs font-mono font-bold text-primary">18</span>
                 </div>
              </div>
              <button 
                 onClick={() => setIsSimulating(true)}
                 className="w-full mt-6 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest transition hover:shadow-[0_0_10px_rgba(var(--primary),0.3)]"
              >
                 Authorize Auto-Scale
              </button>
           </div>

           <div className="glass-card p-4 border border-border rounded-xl">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                 <Activity className="w-3.5 h-3.5" />
                 Neural Insight
              </h4>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "Observed spike patterns from 'East-US-2' suggest a 45% increase in traffic at 18:30 UTC. Recommending proactive warm-up of 6 container instances."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
