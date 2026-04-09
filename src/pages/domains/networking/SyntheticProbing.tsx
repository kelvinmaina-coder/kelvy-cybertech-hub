import { useState } from "react";
import { Search, Globe, Zap, Shield, Play, Activity, Server, Target } from "lucide-react";

export default function SyntheticProbing() {
  const [isProbing, setIsProbing] = useState(false);
  const probes = [
    { id: 1, name: "Login Flow Simulation", target: "auth.kelvy.ai", status: "Healthy", time: "12ms" },
    { id: 2, name: "Checkout API Stress", target: "api.kelvy.ai/v1/checkout", status: "Degraded", time: "850ms" },
    { id: 3, name: "File Upload Integrity", target: "cdn.kelvy.ai", status: "Healthy", time: "45ms" },
  ];

  const runProbe = () => {
    setIsProbing(true);
    setTimeout(() => setIsProbing(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Target className="w-5 h-5" />
            SYNTHETIC NETWORK PROBING
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Simulated User Transactions & API Health Validation
          </p>
        </div>
        <button 
          onClick={runProbe}
          disabled={isProbing}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
            isProbing ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          }`}
        >
          {isProbing ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isProbing ? "PROBING..." : "RUN GLOBAL SUITE"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {probes.map((probe) => (
          <div key={probe.id} className="glass-card border border-border rounded-xl group hover:border-primary/50 transition-all">
             <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest font-bold">
                <div className="flex items-center gap-2">
                   <Server className="w-3.5 h-3.5 text-muted-foreground" />
                   {probe.status}
                </div>
                <span className={probe.status === 'Healthy' ? 'text-green-500' : 'text-orange-500'}>{probe.time}</span>
             </div>
             <div className="p-5">
                <h3 className="font-display font-bold text-lg mb-1">{probe.name}</h3>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{probe.target}</p>
                <div className="mt-6 flex flex-col gap-2">
                   <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-muted-foreground uppercase">Stability</span>
                      <span className="text-primary font-bold">99.8%</span>
                   </div>
                   <div className="w-full bg-muted/50 h-1 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[99%]" />
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-card border border-border rounded-xl p-6">
         <div className="flex items-center gap-4 mb-6">
            <Globe className="w-8 h-8 text-primary opacity-50" />
            <div>
               <h3 className="font-display font-bold text-foreground uppercase tracking-widest">Global Probing Network</h3>
               <p className="text-xs text-muted-foreground">Probes are executed every 60s from 12 edge locations worldwide.</p>
            </div>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Nairobi', 'London', 'New York', 'Singapore'].map((city) => (
              <div key={city} className="flex items-center justify-between p-3 rounded bg-muted/30 border border-border">
                 <span className="text-[10px] font-bold font-mono uppercase tracking-widest">{city}</span>
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
