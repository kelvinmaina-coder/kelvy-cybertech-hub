import { useState } from "react";
import { ShieldCheck, Download, RefreshCw, AlertCircle, CheckCircle2, Cpu, History } from "lucide-react";

export default function SecurityPatching() {
  const [isPatching, setIsPatching] = useState(false);
  const patches = [
    { id: 1, name: "Kernel Vulnerability Patch (CVE-2024-1234)", target: "Linux Production Clusters", status: "Installed", date: "Today, 10:45 AM" },
    { id: 2, name: "OpenSSL Memory Leak Fix", target: "API Gateways", status: "Pending Reboot", date: "Today, 09:12 AM" },
    { id: 3, name: "Nginx Security Headers Update", target: "Load Balancers", status: "Installed", date: "Yesterday" },
  ];

  const runPatch = () => {
    setIsPatching(true);
    setTimeout(() => setIsPatching(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            AUTONOMOUS SECURITY PATCHING
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Automated Vulnerability Management & Hot-Fix Deployment
          </p>
        </div>
        <button 
          onClick={runPatch}
          disabled={isPatching}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
            isPatching ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          }`}
        >
          {isPatching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isPatching ? "PATCHING NODES..." : "CHECK FOR UPDATES"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Systems Protected", value: "248", icon: Cpu, color: "text-blue-500" },
          { label: "Pending Hotfixes", value: "02", icon: AlertCircle, color: "text-orange-500" },
          { label: "Auto-Update Status", value: "ENABLED", icon: CheckCircle2, color: "text-green-500" },
          { label: "Last Sync", value: "4m ago", icon: History, color: "text-primary" },
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
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Patch Deployment History</h3>
        </div>
        <div className="divide-y divide-border">
          {patches.map((patch) => (
            <div key={patch.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${patch.status === 'Installed' ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                  <ShieldCheck className={`w-4 h-4 ${patch.status === 'Installed' ? 'text-green-500' : 'text-orange-500'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold font-display">{patch.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Target: {patch.target}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                   patch.status === 'Installed' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-orange-500/30 text-orange-500 bg-orange-500/5'
                }`}>
                  {patch.status.toUpperCase()}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">{patch.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
