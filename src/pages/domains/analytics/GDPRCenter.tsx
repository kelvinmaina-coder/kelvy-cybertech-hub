import { useState } from "react";
import { ShieldCheck, FileCheck, Users, Globe, Lock, AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function GDPRCenter() {
  const [isAuditing, setIsAuditing] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            GDPR COMPLIANCE CENTER
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Privacy Enforcement & Data Processing Management
          </p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-tighter">
              <FileCheck className="w-4 h-4" />
              Generate ROPA
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Data Subjects", value: "12,482", icon: Users, color: "text-blue-500" },
          { label: "Consent Rate", value: "94.2%", icon: CheckCircle2, color: "text-green-500" },
          { label: "Active DPA", value: "15", icon: Globe, color: "text-primary" },
          { label: "Risk Level", value: "LOW", icon: ShieldCheck, color: "text-primary" },
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
           <div className="glass-card border border-border rounded-xl">
              <div className="p-4 border-b border-border bg-muted/20">
                 <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Data Processing Activities</h3>
              </div>
              <div className="divide-y divide-border">
                 {[
                   { name: "Client Billing Data", owner: "Finance", encryption: "AES-256-GCM", retention: "7 Years" },
                   { name: "OAuth Access Tokens", owner: "Engineering", encryption: "Argon2ID", retention: "30 Days" },
                   { name: "Marketing Emails", owner: "Growth", encryption: "TLS 1.3", retention: "Indefinite" },
                 ].map((act, i) => (
                   <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                         </div>
                         <div>
                            <p className="text-sm font-bold font-display">{act.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">OWNER: {act.owner} · RETENTION: {act.retention}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{act.encryption}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-4">
           <div className="glass-card p-5 border border-border rounded-xl text-center">
              <h3 className="font-display font-bold text-foreground uppercase tracking-widest mb-4">Compliance Status</h3>
              <div className="flex justify-center mb-4">
                 <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center">
                    <span className="text-2xl font-mono font-bold text-green-500">100%</span>
                 </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4 font-mono uppercase tracking-tighter">Last Audit: 12 Apr 2026</p>
              <button 
                 onClick={() => { setIsAuditing(true); setTimeout(() => setIsAuditing(false), 2000); }}
                 className={`w-full py-2.5 rounded-lg border border-border bg-muted/30 text-[10px] font-bold font-mono uppercase tracking-widest transition hover:border-primary ${isAuditing ? 'animate-pulse' : ''}`}
              >
                 {isAuditing ? 'Auditing Nodes...' : 'Run Compliance Audit'}
              </button>
           </div>

           <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                 KASA AI has reviewed your Data Processing Agreements. Global GDPR compliance standards are being met automatically.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
