import { useState } from "react";
import { Users, Eye, Fingerprint, AlertTriangle, Shield, Search, Activity } from "lucide-react";

export default function InsiderThreat() {
  const [anomalies, setAnomalies] = useState([
    { id: 1, user: "admin_jt", action: "Bulk DB Export", risk: 85, location: "Nairobi (KE)", time: "14 mins ago" },
    { id: 2, user: "contractor_09", action: "After-hours Login", risk: 42, location: "Mombasa (KE)", time: "2 hours ago" },
    { id: 3, user: "hr_susan", action: "Lateral Movement Attempt", risk: 92, location: "Remote/VPN", time: "Just now" },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Eye className="w-5 h-5" />
            INSIDER THREAT DETECTION
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            AI-Driven Behavioral Analysis & UEBA
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-500 font-mono italic">3 HIGH RISK ALERTS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card border border-border rounded-xl">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Live Behavior Stream
              </h3>
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="p-0">
              {anomalies.map((anom) => (
                <div key={anom.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className={`absolute -right-1 -top-1 w-3 h-3 rounded-full border-2 border-background ${
                        anom.risk > 80 ? "bg-red-500 animate-pulse" : anom.risk > 40 ? "bg-orange-500" : "bg-green-500"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold font-mono">{anom.user}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{anom.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-mono">{anom.location}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{anom.time}</p>
                    </div>
                    <div className="w-24">
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span>RISK</span>
                        <span className={anom.risk > 80 ? "text-red-500" : "text-orange-500"}>{anom.risk}%</span>
                      </div>
                      <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${
                          anom.risk > 80 ? "bg-red-500" : anom.risk > 40 ? "bg-orange-500" : "bg-green-500"
                        }`} style={{ width: `${anom.risk}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5 border border-primary/20 bg-primary/5 rounded-xl text-center">
            <Fingerprint className="w-12 h-12 text-primary mx-auto mb-3 opacity-50" />
            <h3 className="font-display font-bold text-foreground uppercase tracking-wider">Neural Baseline</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Status: CALIBRATED</p>
            <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border text-left">
              <p className="text-xs text-muted-foreground leading-relaxed">
                The AI has established 4,281 behavioral baselines. Any deviation is analyzed for intent and threat probability.
              </p>
            </div>
          </div>

          <div className="glass-card p-4 border border-border rounded-xl">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Enforcement Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-mono hover:bg-red-500/10 transition">
                FORCE LOGOUT (USER_JT)
              </button>
              <button className="w-full text-left px-3 py-2 rounded border border-orange-500/20 bg-orange-500/5 text-orange-500 text-xs font-mono hover:bg-orange-500/10 transition">
                隔離 SUSPICIOUS PROCESSORS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
