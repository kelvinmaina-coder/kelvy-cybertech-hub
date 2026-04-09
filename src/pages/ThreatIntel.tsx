import { Shield, MapPin, Globe, AlertTriangle, Search, Activity, Zap } from "lucide-react";

export default function ThreatIntel() {
  const threats = [
    { country: "United States", type: "Ransomware Distribution", ip: "192.168.10.55", status: "Critical", time: "2m ago" },
    { country: "Germany", type: "SQL Injection Probe", ip: "45.12.99.102", status: "High", time: "5m ago" },
    { country: "China", type: "Brute Force Attack", ip: "180.2.33.21", status: "Medium", time: "8m ago" },
    { country: "Brazil", type: "Cryptominer Payload", ip: "201.55.12.8", status: "Low", time: "12m ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-cyan-500">GLOBAL THREAT INTELLIGENCE</h1>
          <p className="text-xs text-muted-foreground font-mono">Real-time worldwide attack telemetry</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-500 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" /> Live Feed
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase">
             Node-6 Restricted
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 border border-border">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-500" /> REPUTATION CHECKER
            </h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Enter IP, Domain or Hash..."
                className="w-full bg-background border border-border p-2 rounded text-xs font-mono"
              />
              <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black py-1.5 rounded text-[11px] font-bold transition">
                QUERY DATABASE
              </button>
            </div>
          </div>

          <div className="glass-card p-4 border border-border">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2 text-cyan-400">
              <Shield className="w-4 h-4" /> BOTNET CLUSTERS
            </h3>
             <div className="space-y-3">
              {['Mirai Variant A', 'Mozi Botnet', 'Emotet Relay'].map(bot => (
                <div key={bot} className="flex justify-between items-center text-[10px] py-1 border-b border-white/5">
                  <span className="text-muted-foreground">{bot}</span>
                  <span className="text-red-500 font-mono font-bold">ACTIVE</span>
                </div>
              ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card border border-border overflow-hidden">
            <div className="bg-muted p-3 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" /> RECENT ATTACK VECTORS
              </h3>
              <span className="text-[10px] font-mono opacity-50 uppercase">Update: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-5 text-[10px] uppercase font-bold text-muted-foreground border-b border-border pb-2 mb-2">
                <div className="col-span-1">Origin</div>
                <div className="col-span-1">Vector</div>
                <div className="col-span-1">Target IP</div>
                <div className="col-span-1">Severity</div>
                <div className="col-span-1 text-right">Age</div>
              </div>
              <div className="space-y-1">
                {threats.map((threat, i) => (
                  <div key={i} className="grid grid-cols-5 items-center text-[11px] p-2 hover:bg-white/5 rounded transition-colors group">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-cyan-500" />
                      <span className="truncate">{threat.country}</span>
                    </div>
                    <div className="truncate text-foreground/80">{threat.type}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{threat.ip}</div>
                    <div>
                      <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold font-mono ${
                        threat.status === 'Critical' ? 'bg-red-500/20 text-red-500' : 
                        threat.status === 'High' ? 'bg-orange-500/20 text-orange-500' :
                        threat.status === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {threat.status}
                      </span>
                    </div>
                    <div className="text-right text-muted-foreground text-[10px] font-mono">{threat.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-4 border border-cyan-500/20 bg-cyan-500/5">
            <h3 className="text-xs font-bold text-cyan-500 mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> AI THREAT SUMMARY
            </h3>
            <p className="text-[11px] text-foreground/90 leading-relaxed italic">
              "System analysis indicates a 23% uptick in SMB exploitation attempts originating from Eastern European IP ranges. Recommend updating firewall SNI rules and enforcing MFA on all gateway accounts."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
