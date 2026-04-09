import { useState } from "react";
import { Search, Terminal, Activity, Filter, Download, Zap, Database, Server, Globe, AlertCircle, RefreshCw } from "lucide-react";

export default function LogStreaming() {
  const [logs, setLogs] = useState([
    { id: 1, type: "INFO", source: "AuthGW", message: "User login successful: user_09", time: "12:45:01" },
    { id: 2, type: "WARN", source: "API-1", message: "High memory usage detected on node cluster A", time: "12:45:04" },
    { id: 3, type: "ERROR", source: "DB-Master", message: "Connection refused from unauthorized subnet 10.0.4.2", time: "12:45:08" },
    { id: 4, type: "INFO", source: "CDN", message: "Cache purge completed for /assets/v2/*", time: "12:45:12" },
    { id: 5, type: "DEBUG", source: "KASA-AI", message: "Neuro-pattern match confirmed for vector SOC-12", time: "12:45:15" },
  ]);

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            ELASTIC LOG STREAMING
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Real-time Aggregation & Semantic Search
          </p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition">
              <Filter className="w-4 h-4 text-muted-foreground" />
           </button>
           <button className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition">
              <Download className="w-4 h-4 text-muted-foreground" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="md:col-span-2 glass-card border border-border rounded-xl bg-black/40 flex flex-col min-h-0">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Live Stream</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">Connected to kelvy-logs-cluster-01</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="bg-white/5 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs font-mono focus:ring-1 focus:ring-primary outline-none w-48 transition-all focus:w-64"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 group hover:bg-white/5 p-1 rounded transition">
                <span className="text-muted-foreground shrink-0">{log.time}</span>
                <span className={`font-bold shrink-0 w-12 ${
                  log.type === 'ERROR' ? 'text-red-500' : 
                  log.type === 'WARN' ? 'text-orange-500' : 
                  log.type === 'DEBUG' ? 'text-primary' : 'text-blue-500'
                }`}>
                  [{log.type}]
                </span>
                <span className="text-primary font-bold shrink-0">[{log.source}]</span>
                <span className="text-foreground/90 leading-tight">{log.message}</span>
              </div>
            ))}
            <div className="animate-pulse flex gap-4 p-1">
               <span className="text-muted-foreground">12:45:20</span>
               <span className="text-primary font-bold animate-pulse">_</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <div className="glass-card p-4 border border-border rounded-xl">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase mb-4 tracking-widest">Storage Status</h3>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                       <span>Hot Storage (SSD)</span>
                       <span>85%</span>
                    </div>
                    <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-primary h-full w-[85%]" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                       <span>Cold Archive (S3)</span>
                       <span>12%</span>
                    </div>
                    <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-muted h-full w-[12%]" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-card p-4 border border-border rounded-xl">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase mb-4 tracking-widest">Intelligent Parsing</h3>
              <div className="space-y-3">
                 {[
                   { label: "IP Addresses", count: "42", icon: Globe },
                   { label: "Detected Errors", count: "03", icon: AlertCircle },
                   { label: "AI Insights", count: "12", icon: Zap },
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border">
                      <div className="flex items-center gap-2">
                         <stat.icon className="w-3.5 h-3.5 text-primary" />
                         <span className="text-[10px] font-bold font-mono uppercase">{stat.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold">{stat.count}</span>
                   </div>
                 ))}
              </div>
           </div>

           <button className="w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-display font-bold text-xs uppercase tracking-widest hover:bg-primary/20 transition flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reset Aggregators
           </button>
        </div>
      </div>
    </div>
  );
}
