import { useState } from "react";
import { Bell, Activity, Plus, Shield, Cpu, MessageSquare, Settings, Zap } from "lucide-react";

export default function NetworkAlerts() {
  const [alerts, setAlerts] = useState([
    { id: 1, name: "Latency Spike > 200ms", trigger: "Ping Node AF-1", status: "Active", severity: "High" },
    { id: 2, name: "CPU Utilization > 90%", trigger: "Worker-Group-B", status: "Muted", severity: "Medium" },
    { id: 3, name: "DDoS Detection L4", trigger: "Edge WAF", status: "Active", severity: "Critical" },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Bell className="w-5 h-5" />
            DYNAMIC ALERT RULES
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Autonomous Notification & Action Triggers
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter">
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
             <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Active Rules</h3>
             <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="p-0">
             {alerts.map((alert) => (
               <div key={alert.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/10 transition flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-lg ${
                     alert.severity === 'Critical' ? 'bg-red-500/10' : 
                     alert.severity === 'High' ? 'bg-orange-500/10' : 'bg-primary/10'
                   }`}>
                     <Zap className={`w-4 h-4 ${
                        alert.severity === 'Critical' ? 'text-red-500' : 
                        alert.severity === 'High' ? 'text-orange-500' : 'text-primary'
                     }`} />
                   </div>
                   <div>
                     <p className="text-sm font-bold font-display">{alert.name}</p>
                     <p className="text-[10px] text-muted-foreground font-mono">Trigger: {alert.trigger}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      alert.status === 'Active' ? 'border-primary/50 text-primary' : 'border-muted text-muted-foreground'
                    }`}>
                      {alert.status.toUpperCase()}
                    </span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="glass-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
              <MessageSquare className="w-8 h-8 text-primary" />
           </div>
           <div>
              <h3 className="font-display font-bold text-lg uppercase tracking-wider">Webhook Integrations</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
                Connect your alerts to Slack, Discord, or Microsoft Teams for instant response coordination.
              </p>
           </div>
           <div className="flex gap-4">
              <div className="px-3 py-1 bg-muted rounded border border-border text-[10px] font-bold font-mono uppercase tracking-widest transition hover:border-primary cursor-pointer">Slack</div>
              <div className="px-3 py-1 bg-muted rounded border border-border text-[10px] font-bold font-mono uppercase tracking-widest transition hover:border-primary cursor-pointer">Discord</div>
              <div className="px-3 py-1 bg-muted rounded border border-border text-[10px] font-bold font-mono uppercase tracking-widest transition hover:border-primary cursor-pointer">Email</div>
           </div>
        </div>
      </div>

      <div className="glass-card border border-border rounded-xl p-4 bg-primary/5">
         <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-primary" />
            <div>
               <h4 className="text-xs font-bold font-mono uppercase text-primary">AI Alert Correlation</h4>
               <p className="text-[10px] text-muted-foreground mt-0.5">
                  KASA is currently analyzing 8 related events to determine if they constitute a single high-level incident.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
