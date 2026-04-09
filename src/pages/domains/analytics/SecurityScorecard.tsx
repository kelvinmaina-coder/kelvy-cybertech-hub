import { useState } from "react";
import { Shield, Target, AlertTriangle, CheckCircle2, Search, FileText, BarChart3, TrendingUp } from "lucide-react";

export default function SecurityScorecard() {
  const [score, setScore] = useState(84);
  const metrics = [
    { label: "Network Hardening", value: 92, trend: "+2%" },
    { label: "Access Control", value: 78, trend: "-1%" },
    { label: "Data Encryption", value: 100, trend: "Stable" },
    { label: "Threat Response", value: 85, trend: "+5%" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Shield className="w-5 h-5" />
            CLIENT SECURITY SCORECARD
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Holistic Cybersecurity Posture & Risk Assessment
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted font-mono text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-tighter">
          <FileText className="w-4 h-4" />
          Export Audit Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-primary/5 to-transparent">
           <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="w-full h-full -rotate-90">
                 <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                 <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * score) / 100} className="text-primary" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-5xl font-mono font-bold text-foreground">{score}</span>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Rank</span>
              </div>
           </div>
           <p className="text-sm font-display font-bold text-primary uppercase mb-1">Excellent Posture</p>
           <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Compared to Industry Average (62)</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
           {metrics.map((m, i) => (
             <div key={i} className="glass-card p-5 border border-border rounded-xl flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                   <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground">{m.label}</h4>
                   <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                     m.trend.startsWith('+') ? 'text-green-500 bg-green-500/10' : 
                     m.trend.startsWith('-') ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground bg-muted'
                   }`}>
                     {m.trend}
                   </span>
                </div>
                <div className="flex items-end justify-between font-mono">
                   <span className="text-3xl font-bold">{m.value}%</span>
                   <div className="w-32 bg-muted/50 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${m.value}%` }} />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="glass-card border border-border rounded-xl">
        <div className="p-4 border-b border-border bg-muted/20">
           <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Top Vulnerabilities / Risks</h3>
        </div>
        <div className="divide-y divide-border">
           {[
             { name: "Legacy TLS Versions", severity: "Medium", impact: "Communication Security" },
             { name: "Broken MFA Chain", severity: "High", impact: "System Access" },
             { name: "Unencrypted S3 Buckets", severity: "Critical", impact: "Data Privacy" },
           ].map((v, i) => (
             <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                <div className="flex items-center gap-4">
                   <AlertTriangle className={`w-4 h-4 ${v.severity === 'Critical' ? 'text-red-500' : 'text-orange-500'}`} />
                   <div>
                      <p className="text-sm font-bold font-display">{v.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono italic">Impact Area: {v.impact}</p>
                   </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border border-red-500/30 text-red-500 bg-red-500/5`}>
                   {v.severity.toUpperCase()}
                </span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
