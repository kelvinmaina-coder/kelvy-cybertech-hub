import { useState } from "react";
import { Zap, Activity, MessageSquare, Repeat, Settings, AlertCircle, CheckCircle2, Terminal } from "lucide-react";

export default function WebhookEngine() {
  const [isTestRunning, setIsTestRunning] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Zap className="w-5 h-5" />
            WEBHOOK ENGINE
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Event-Driven Automation & Third-Party Integrations
          </p>
        </div>
        <button 
           onClick={() => { setIsTestRunning(true); setTimeout(() => setIsTestRunning(false), 2000); }}
           className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter"
        >
          {isTestRunning ? <Repeat className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
          {isTestRunning ? "DELIVERING..." : "TEST ENDPOINT"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
           <div className="glass-card border border-border rounded-xl">
              <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                 <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Outgoing Webhooks</h3>
                 <button className="text-[10px] font-bold text-primary hover:underline">ADD NEW</button>
              </div>
              <div className="divide-y divide-border">
                 {[
                   { name: "Slack Alerts", url: "https://hooks.slack.com/services/...", status: "Enabled", events: "Security, Auth" },
                   { name: "Client CRM Sync", url: "https://api.salesforce.com/...", status: "Enabled", events: "Billing, Subscription" },
                   { name: "Discord Monitoring", url: "https://discord.com/api/webhooks/...", status: "Paused", events: "Health" },
                 ].map((hook, i) => (
                   <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                      <div className="flex items-center gap-4">
                         <div className={`p-2 rounded-full ${hook.status === 'Enabled' ? 'bg-green-500/10' : 'bg-muted'}`}>
                            <MessageSquare className={`w-4 h-4 ${hook.status === 'Enabled' ? 'text-green-500' : 'text-muted-foreground'}`} />
                         </div>
                         <div>
                            <p className="text-sm font-bold font-display">{hook.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{hook.url}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right mr-4">
                            <p className="text-[10px] text-muted-foreground uppercase font-mono">Events</p>
                            <p className="text-[10px] font-bold font-mono text-primary">{hook.events}</p>
                         </div>
                         <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                           hook.status === 'Enabled' ? 'border-primary/50 text-primary bg-primary/5' : 'border-muted text-muted-foreground'
                         }`}>
                           {hook.status.toUpperCase()}
                         </span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-4">
           <div className="glass-card p-5 border border-border rounded-xl">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase mb-4 tracking-widest flex items-center justify-between">
                 Reliability Metrics
                 <Activity className="w-3.5 h-3.5 text-primary" />
              </h3>
              <div className="space-y-4 pt-2">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-muted-foreground uppercase">Success Rate</span>
                    <span className="text-xs font-mono font-bold text-green-500">99.94%</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-muted-foreground uppercase">Retry Attempts</span>
                    <span className="text-xs font-mono font-bold text-orange-500">14 (24h)</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-muted-foreground uppercase">Avg. Latency</span>
                    <span className="text-xs font-mono font-bold text-primary">24ms</span>
                 </div>
              </div>
           </div>

           <div className="glass-card p-4 border border-border rounded-xl bg-black/40">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                 <Terminal className="w-3.5 h-3.5" />
                 Last Delivery Payload
              </h3>
              <pre className="text-[9px] font-mono text-blue-300 leading-tight">
{`{
  "event": "security.alert",
  "data": {
    "type": "BRUTE_FORCE",
    "source": "192.168.1.1",
    "severity": "HIGH"
  },
  "timestamp": "2026-04-12T..."
}`}
              </pre>
           </div>
        </div>
      </div>
    </div>
  );
}
