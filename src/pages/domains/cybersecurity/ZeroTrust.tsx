import { useState } from "react";
import { Lock, Fingerprint, Key, ShieldCheck, Globe, Monitor, Zap, AppWindow } from "lucide-react";

export default function ZeroTrust() {
  const [policies, setPolicies] = useState([
    { id: 1, name: "Production SSH Access", condition: "MFA + Device Cert", status: "Enforced" },
    { id: 2, name: "External API Access", condition: "OAuth 2.1 + IP Whitelist", status: "Enforced" },
    { id: 3, name: "Admin Dashboard", condition: "Biometric Required", status: "Warning" },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Lock className="w-5 h-5" />
            ZERO-TRUST DASHBOARD
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Identity-Centric Network & Access Management
          </p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <div className="text-[10px] font-mono">
              <span className="text-muted-foreground">Gateway:</span>
              <span className="text-foreground ml-1">US-EAST-1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Verified Users", value: "1,248", icon: Fingerprint, color: "text-purple-500" },
          { label: "Active Sessions", value: "85", icon: Monitor, color: "text-blue-500" },
          { label: "Access Denied", value: "12", icon: Lock, color: "text-red-500" },
          { label: "Auth Latency", value: "14ms", icon: Zap, color: "text-primary" },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card border border-border rounded-xl">
          <div className="p-4 border-b border-border bg-muted/20">
             <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Access Policies</h3>
          </div>
          <div className="p-0">
             {policies.map((policy) => (
               <div key={policy.id} className="p-4 border-b border-border last:border-0 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <ShieldCheck className={`w-4 h-4 ${policy.status === 'Enforced' ? 'text-green-500' : 'text-orange-500'}`} />
                   <div>
                     <p className="text-sm font-bold font-display">{policy.name}</p>
                     <p className="text-[10px] text-muted-foreground font-mono">Condition: {policy.condition}</p>
                   </div>
                 </div>
                 <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                   policy.status === 'Enforced' ? 'border-primary/50 text-primary bg-primary/5' : 'border-orange-500/50 text-orange-500 bg-orange-500/5'
                 }`}>
                   {policy.status.toUpperCase()}
                 </span>
               </div>
             ))}
          </div>
        </div>

        <div className="glass-card border border-border rounded-xl">
          <div className="p-4 border-b border-border bg-muted/20">
             <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Recent Authentications</h3>
          </div>
          <div className="p-4 space-y-4">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                   <Monitor className="w-4 h-4 text-muted-foreground" />
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-center">
                     <p className="text-xs font-bold font-mono">user_09@kelvy.ai</p>
                     <span className="text-[10px] text-muted-foreground font-mono">2m ago</span>
                   </div>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">MacBook Pro · London, UK · </span>
                     <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest font-mono">PASSED</span>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
