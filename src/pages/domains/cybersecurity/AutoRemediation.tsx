import { useState } from "react";
import { Shield, Zap, CheckCircle, AlertTriangle, Play, Settings, Cpu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AutoRemediation() {
  const { profile } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [remediations, setRemediations] = useState([
    { id: 1, type: "WAF Rule", target: "SQL Injection attempted on Primary API", status: "Auto-Refined", severity: "High", time: "2 mins ago" },
    { id: 2, type: "Network Path", target: "DDoS Mitigation Layer 7 triggered", status: "Active", severity: "Critical", time: "10 mins ago" },
    { id: 3, type: "Auth Policy", target: "Brute force detected - IP 192.168.1.105 jailed", status: "Completed", severity: "Medium", time: "1 hour ago" },
  ]);

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI AUTO-REMEDIATION ENGINE
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Autonomous Threat Response & Mitigation System
          </p>
        </div>
        <button 
          onClick={startScan}
          disabled={isScanning}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
            isScanning ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          }`}
        >
          {isScanning ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isScanning ? "REMEDIATING..." : "RUN GLOBAL SCAN"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Response Mode</span>
          </div>
          <p className="text-sm font-mono font-bold text-green-500 uppercase">FULLY AUTONOMOUS</p>
          <div className="mt-2 w-full bg-muted/30 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[100%]" />
          </div>
        </div>
        <div className="glass-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Neural Confidence</span>
          </div>
          <p className="text-sm font-mono font-bold text-primary uppercase">99.8% ACCURACY</p>
          <div className="mt-2 w-full bg-muted/30 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[99%]" />
          </div>
        </div>
        <div className="glass-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Silo</span>
          </div>
          <p className="text-sm font-mono font-bold text-orange-500 uppercase">CONTAINMENT LEVEL 2</p>
          <div className="mt-2 w-full bg-muted/30 h-1.5 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full w-[45%]" />
          </div>
        </div>
      </div>

      <div className="glass-card border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/30 p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Live Remediation Log</h3>
          <Settings className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition" />
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-6 py-3 font-semibold uppercase">Mitigation Type</th>
                <th className="px-6 py-3 font-semibold uppercase">Target/Incident</th>
                <th className="px-6 py-3 font-semibold uppercase">Severity</th>
                <th className="px-6 py-3 font-semibold uppercase">Status</th>
                <th className="px-6 py-3 font-semibold uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {remediations.map((rem) => (
                <tr key={rem.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{rem.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">{rem.target}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      rem.severity === 'Critical' ? 'border-red-500/50 bg-red-500/10 text-red-500' :
                      rem.severity === 'High' ? 'border-orange-500/50 bg-orange-500/10 text-orange-500' :
                      'border-blue-500/50 bg-blue-500/10 text-blue-500'
                    }`}>
                      {rem.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${rem.status === 'Active' ? 'bg-primary animate-pulse' : 'bg-green-500'}`} />
                      <span className={rem.status === 'Active' ? 'text-primary' : 'text-green-500'}>{rem.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{rem.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-4">
        <Brain className="w-8 h-8 text-primary shrink-0 mt-1" />
        <div>
          <h4 className="font-display font-bold text-primary uppercase text-sm">KASA AI Insights</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            The neural engine has successfully mitigated {remediations.length} potential vectors in the last 24 hours. 
            The SQL injection pattern suggests a coordinated probe from known botnet signatures. 
            Automated WAF hardening has been deployed across all entry points.
          </p>
        </div>
      </div>
    </div>
  );
}

function Brain(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9.5 2t.5.5a3 3 0 0 1 0 5.24l-.5.26a3 3 0 0 1-2.52 0l-.5-.26a3 3 0 0 1 0-5.24l.5-.26A3 3 0 0 1 9.5 2z" />
      <path d="M14.5 2l.5.5a3 3 0 0 1 0 5.24l-.5.26a3 3 0 0 1-2.52 0l-.5-.26a3 3 0 0 1 0-5.24l.5-.26A3 3 0 0 1 14.5 2z" />
      <path d="M21 16a3 3 0 0 1-3 3h-1.3l-1.4 1.9a1 1 0 0 1-1.6 0L12.3 19H11a3 3 0 0 1-3-3 3 3 0 0 1 3-3h1.3l1.4-1.9a1 1 0 0 1 1.6 0l1.4 1.9H18a3 3 0 0 1 3 3z" />
      <path d="M11 10a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3" />
      <path d="M13 10a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3" />
      <path d="M7 16a3 3 0 0 0-3 3v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a3 3 0 0 0-3-3" />
    </svg>
  );
}
