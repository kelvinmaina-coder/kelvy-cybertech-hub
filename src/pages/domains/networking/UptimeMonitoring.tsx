import { useState, useEffect } from "react";
import { Globe, Server, CheckCircle2, AlertCircle, Activity, BarChart3, Clock, RefreshCw } from "lucide-react";

export default function UptimeMonitoring() {
  const [nodes, setNodes] = useState([
    { id: 1, name: "API Gateway (AF-SOUTH-1)", status: "UP", latency: "42ms", uptime: "99.99%", lastCheck: "Just now" },
    { id: 2, name: "Database Cluster (EU-WEST-1)", status: "UP", latency: "12ms", uptime: "100%", lastCheck: "2s ago" },
    { id: 3, name: "Auth Service (US-EAST-1)", status: "DEGRADED", latency: "245ms", uptime: "98.5%", lastCheck: "1m ago" },
    { id: 4, name: "CDN Edge (Global)", status: "UP", latency: "8ms", uptime: "99.99%", lastCheck: "Just now" },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Activity className="w-5 h-5" />
            REAL-TIME UPTIME MONITORING
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Global Infrastructure Health & Latency Tracking
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-xs font-bold text-green-500 font-mono uppercase">GLOBAL SYSTEMS OPERATIONAL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Avg. Latency", value: "76ms", icon: Clock, color: "text-blue-500" },
          { label: "Uptime (30d)", value: "99.98%", icon: Globe, color: "text-primary" },
          { label: "Active Nodes", value: "24 / 25", icon: Server, color: "text-green-500" },
          { label: "Last Incident", value: "14d ago", icon: AlertCircle, color: "text-orange-500" },
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

      <div className="glass-card border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/30 p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Node Status Distribution</h3>
          <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin-slow cursor-pointer" />
        </div>
        <div className="divide-y divide-border">
          {nodes.map((node) => (
            <div key={node.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${node.status === 'UP' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`} />
                <div>
                  <p className="text-sm font-bold font-display">{node.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">Status: {node.status} · {node.lastCheck}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-mono mb-0.5">Latency</p>
                  <p className={`text-sm font-mono font-bold ${parseInt(node.latency) > 100 ? 'text-orange-500' : 'text-primary'}`}>{node.latency}</p>
                </div>
                <div className="text-right w-24">
                  <p className="text-[10px] text-muted-foreground uppercase font-mono mb-0.5">Uptime</p>
                  <p className="text-sm font-mono font-bold text-foreground">{node.uptime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-48 glass-card border border-border rounded-xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-primary" />
             Aggregated Performance Index
           </h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-mono text-muted-foreground">Response Time</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted" />
                <span className="text-[10px] font-mono text-muted-foreground">Baseline</span>
              </div>
           </div>
        </div>
        <div className="flex-1 flex items-end gap-1 px-2">
           {[40, 45, 38, 52, 60, 48, 42, 35, 30, 45, 50, 65, 75, 55, 45, 38, 42, 40, 45, 50, 48, 42, 35, 40, 45, 38].map((val, i) => (
             <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-sm relative group" style={{ height: `${val}%` }}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover border border-border px-2 py-1 rounded text-[8px] font-mono opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                   {val}ms
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
