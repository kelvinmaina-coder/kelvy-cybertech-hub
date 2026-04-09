import { useState } from "react";
import { Award, ShieldCheck, Download, ExternalLink, Calendar, CheckCircle2, History, Briefcase, Plus } from "lucide-react";

export default function CertManagement() {
  const certs = [
    { id: 1, name: "ISO 27001:2022", issuer: "TÜV SÜD", expiry: "Dec 2026", status: "Active" },
    { id: 2, name: "SOC2 Type II", issuer: "AICPA", expiry: "Aug 2026", status: "Audit Pending" },
    { id: 3, name: "GDPR Compliance", issuer: "Kelvy AI Audit", expiry: "Apr 2027", status: "Active" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Award className="w-5 h-5" />
            CERTIFICATION & COMPLIANCE MANAGEMENT
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Governance, Risk & Compliance (GRC) Tracking
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter">
          <Plus className="w-3.5 h-3.5" />
          Add Certification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {certs.map((cert) => (
          <div key={cert.id} className="glass-card border border-border rounded-2xl p-6 group hover:border-primary/50 transition-all bg-gradient-to-br from-primary/5 to-transparent">
             <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                   <Award className="w-6 h-6 text-primary" />
                </div>
                <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  cert.status === 'Active' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-orange-500/30 text-orange-500 bg-orange-500/5'
                }`}>
                   {cert.status.toUpperCase()}
                </div>
             </div>
             <h3 className="font-display font-bold text-xl mb-1">{cert.name}</h3>
             <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter mb-6">ISSUED BY: {cert.issuer}</p>
             
             <div className="flex items-center gap-6 py-4 border-y border-white/5 mb-6">
                <div>
                   <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono mb-1">
                      <Calendar className="w-3 h-3" />
                      Expiry
                   </div>
                   <p className="text-sm font-mono font-bold">{cert.expiry}</p>
                </div>
                <div>
                   <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono mb-1">
                      <History className="w-3 h-3" />
                      Frequency
                   </div>
                   <p className="text-sm font-mono font-bold">Annual</p>
                </div>
             </div>

             <div className="flex gap-2">
                <button className="flex-1 py-1.5 rounded bg-muted/50 text-[10px] font-bold uppercase tracking-widest font-mono hover:bg-muted transition flex items-center justify-center gap-2">
                   <Download className="w-3.5 h-3.5" />
                   Certificate
                </button>
                <button className="p-1.5 aspect-square rounded bg-muted/50 text-muted-foreground hover:text-primary transition">
                   <ExternalLink className="w-3.5 h-3.5" />
                </button>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 border border-border rounded-xl">
         <h3 className="text-xs font-bold font-mono uppercase tracking-widest mb-6 flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Upcoming Compliance Tasks
         </h3>
         <div className="space-y-4">
            {[
              { task: "Internal Data Privacy Review", deadline: "7 Days", priority: "High" },
              { task: "Vulnerability Disclosure Policy Audit", deadline: "14 Days", priority: "Medium" },
              { task: "Employee Security Training Completion", deadline: "21 Days", priority: "High" },
            ].map((t, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded bg-muted/30 border border-border">
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${t.priority === 'High' ? 'bg-red-500' : 'bg-orange-500'}`} />
                    <span className="text-xs font-bold font-display">{t.task}</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Due in {t.deadline}</span>
                    <button className="text-[10px] font-bold text-primary hover:underline uppercase">Start Task</button>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
