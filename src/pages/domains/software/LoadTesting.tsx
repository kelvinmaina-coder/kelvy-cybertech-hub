import { useState } from "react";
import { Activity, Zap, Users, ShieldAlert, Play, RotateCcw, BarChart3, Clock } from "lucide-react";

export default function LoadTesting() {
  const [isRunning, setIsRunning] = useState(false);
  const [virtualUsers, setVirtualUsers] = useState(100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Zap className="w-5 h-5" />
            VIRTUAL USER LOAD TESTING
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            High-Concurrency Stress & Scalability Validation
          </p>
        </div>
        <button 
          onClick={() => { setIsRunning(true); setTimeout(() => setIsRunning(false), 5000); }}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
            isRunning ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          }`}
        >
          {isRunning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isRunning ? "STRESSING SYSTEMS..." : "INITIATE LOAD TEST"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Virtual Users", value: virtualUsers.toString(), icon: Users, color: "text-blue-500" },
          { label: "Request Rate", value: isRunning ? "4.2k/s" : "0/s", icon: Zap, color: "text-primary" },
          { label: "Error Rate", value: "0.02%", icon: ShieldAlert, color: "text-red-500" },
          { label: "Avg. Response", value: "142ms", icon: Clock, color: "text-green-500" },
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
        <div className="glass-card p-6 border border-border rounded-xl">
           <h3 className="text-xs font-bold font-mono uppercase tracking-widest mb-6 flex justify-between items-center">
              Load Parameters
              <span className="text-primary font-bold text-[10px]">ADJUSTABLE</span>
           </h3>
           <div className="space-y-8">
              <div>
                 <div className="flex justify-between text-xs font-mono mb-4">
                    <span className="text-muted-foreground uppercase">Virtual User Count</span>
                    <span className="text-foreground font-bold">{virtualUsers} Users</span>
                 </div>
                 <input 
                    type="range" 
                    min="10" 
                    max="5000" 
                    step="10"
                    value={virtualUsers}
                    onChange={(e) => setVirtualUsers(parseInt(e.target.value))}
                    className="w-full accent-primary bg-muted rounded-lg h-1.5 appearance-none cursor-pointer"
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button className="py-2.5 rounded-lg border border-border bg-muted/30 text-[10px] font-bold font-mono uppercase hover:border-primary transition">Spike Test</button>
                 <button className="py-2.5 rounded-lg border border-border bg-muted/30 text-[10px] font-bold font-mono uppercase hover:border-primary transition">Soak Test</button>
              </div>
           </div>
        </div>

        <div className="glass-card border border-border rounded-xl flex flex-col">
           <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Response Time Trend (ms)
              </h3>
           </div>
           <div className="flex-1 flex items-end gap-1 p-6">
              {[120, 135, 128, 142, 160, 190, 240, 210, 150, 145, 138, 142, 165, 180, 210, 250, 310, 280, 220, 185, 160, 145,140, 135].map((val, i) => (
                <div key={i} className="flex-1 bg-red-500/20 rounded-t-sm" style={{ height: `${val / 4}%` }} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
