import { Cloud, Smartphone, Server, Database, Activity, Zap, Loader2, Container, Repeat, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function CloudDevOpsHub() {
  const [loading, setLoading] = useState(false);
  const resources = [
    { name: "AWS-EC2-PRODUCTION", type: "Compute", status: "Running", load: "42%" },
    { name: "Azure-DB-Global", type: "Database", status: "Stable", load: "18%" },
    { name: "GCP-Storage-Bucket", type: "Storage", status: "Active", load: "N/A" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-sky-500">CLOUD & DEVOPS CENTER</h1>
          <p className="text-xs text-muted-foreground font-mono">Infrastructure as Code & Deployment Orchestration</p>
        </div>
        <button 
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
          disabled={loading}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-sky-700 transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Repeat className="w-4 h-4" />}
          SYNC CLOUD STATE
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card border border-border p-4">
            <h3 className="text-xs font-bold mb-4 uppercase text-muted-foreground flex items-center gap-2">
              <Server className="w-4 h-4" /> Cloud Resources
            </h3>
            <div className="space-y-3">
              {resources.map((res) => (
                <div key={res.name} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-sky-500/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{res.name}</div>
                      <div className="text-[10px] text-muted-foreground">{res.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">Load</div>
                      <div className="text-xs font-mono font-bold text-sky-400">{res.load}</div>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[9px] font-bold">
                      {res.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 border border-border flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                 <Container className="w-5 h-5" />
               </div>
               <div>
                 <div className="text-xs font-bold uppercase text-muted-foreground">Containers</div>
                 <div className="text-xl font-mono font-bold">12 Active</div>
               </div>
            </div>
            <div className="glass-card p-4 border border-border flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                 <Activity className="w-5 h-5" />
               </div>
               <div>
                 <div className="text-xs font-bold uppercase text-muted-foreground">Pipelines</div>
                 <div className="text-xl font-mono font-bold">4 Success</div>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 border border-sky-500/20 bg-sky-500/5">
            <h3 className="text-xs font-bold text-sky-500 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-500" /> AI CLOUD ADVISOR
            </h3>
            <p className="text-[11px] text-foreground/80 leading-relaxed italic border-l-2 border-sky-500 pl-3 mb-4">
              "Your Azure DB node is currently over-provisioned. Scaling down to T3-instance would save ~KES 12,000/month without impacting performance."
            </p>
            <button className="w-full bg-sky-500/10 border border-sky-500/20 text-sky-500 py-1.5 rounded text-[10px] font-bold hover:bg-sky-500 hover:text-white transition">
              OPTIMIZE INFRASTRUCTURE
            </button>
          </div>

          <div className="glass-card p-4 border border-border">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> COST ANALYSIS
            </h3>
            <div className="h-32 flex items-end gap-1 px-2">
               {[65, 40, 80, 55, 90, 75, 45].map((h, i) => (
                 <div key={i} className="flex-1 bg-sky-500/20 hover:bg-sky-500/40 transition-colors rounded-t" style={{ height: `${h}%` }} />
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
