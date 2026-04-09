import { useState } from "react";
import { Database, Server, RefreshCw, HardDrive, ShieldCheck, Clock, CheckCircle2, Cloud } from "lucide-react";

export default function DisasterRecovery() {
  const [isSyncing, setIsSyncing] = useState(false);
  const backups = [
    { id: 1, name: "PostgreSQL Primary", size: "128 GB", type: "Differential", status: "Success", time: "2 hours ago" },
    { id: 2, name: "NFS User Assets", size: "1.2 TB", type: "Full", status: "Syncing", time: "Ongoing" },
    { id: 3, name: "Redis Cache Cluster", size: "16 GB", type: "Snaphot", status: "Success", time: "6 hours ago" },
  ];

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Database className="w-5 h-5" />
            DATA BACKUP & DISASTER RECOVERY
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Enterprise Resilience & Geo-Redundant Storage
          </p>
        </div>
        <button 
          onClick={triggerSync}
          disabled={isSyncing}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
            isSyncing ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          }`}
        >
          {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {isSyncing ? "SYNCING REPLICAS..." : "TRIGGER FAILOVER TEST"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Storage Used", value: "4.2 TB", icon: HardDrive, color: "text-blue-500" },
          { label: "Active Replicas", value: "03", icon: Server, color: "text-primary" },
          { label: "RTO Status", value: "< 5 MINS", icon: Clock, color: "text-green-500" },
          { label: "Geo-Regions", value: "3 (AF, EU, US)", icon: Cloud, color: "text-purple-500" },
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
           <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Storage Infrastructure</h3>
           <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>
        <div className="p-0">
           {backups.map((bk) => (
             <div key={bk.id} className="p-4 border-b border-border last:border-0 flex items-center justify-between hover:bg-muted/10 transition">
               <div className="flex items-center gap-4">
                 <div className="p-2 rounded bg-muted">
                    <Database className="w-4 h-4 text-muted-foreground" />
                 </div>
                 <div>
                    <p className="text-sm font-bold font-display">{bk.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Type: {bk.type} · Size: {bk.size}</p>
                 </div>
               </div>
               <div className="text-right">
                 <div className="flex items-center gap-2 justify-end">
                    <span className={`w-1.5 h-1.5 rounded-full ${bk.status === 'Success' ? 'bg-green-500' : 'bg-primary animate-pulse'}`} />
                    <p className={`text-xs font-bold ${bk.status === 'Success' ? 'text-green-500' : 'text-primary'}`}>{bk.status}</p>
                 </div>
                 <p className="text-[10px] text-muted-foreground font-mono mt-1">{bk.time}</p>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
