import { useState } from "react";
import { Users, Gift, Share2, Copy, CheckCircle2, TrendingUp, DollarSign, Zap } from "lucide-react";

export default function ClientReferral() {
  const [referralCode, setReferralCode] = useState("KELVY-REF-0912");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Gift className="w-5 h-5" />
            CLIENT REFERRAL PROGRAM
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Grow Together & Earn Credits for Security Upgrades
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card border border-border rounded-xl p-8 bg-gradient-to-r from-primary/10 to-transparent">
           <h3 className="font-display font-bold text-2xl mb-4 text-foreground">Earn 10% Credit for every successful referral</h3>
           <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-8">
              Help your network secure their infrastructure. For every client that signs an Enterprise agreement through your link, we'll credit 10% of their first year's value to your hub account.
           </p>
           
           <div className="flex items-center gap-4">
              <div className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-3 flex items-center justify-between">
                 <span className="font-mono text-lg font-bold text-primary">{referralCode}</span>
                 <button className="p-2 rounded hover:bg-muted transition" onClick={() => navigator.clipboard.writeText(referralCode)}>
                    <Copy className="w-4 h-4 text-muted-foreground" />
                 </button>
              </div>
              <button className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold transition-all hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] flex items-center gap-2 uppercase tracking-widest">
                 <Share2 className="w-4 h-4" />
                 Invite Now
              </button>
           </div>
        </div>

        <div className="glass-card p-6 border border-border rounded-xl bg-card flex flex-col justify-between">
           <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground mb-6">Your Earnings</h3>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                       <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-2xl font-mono font-bold">$1,450</p>
                       <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">Available Credit</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                       <Users className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-2xl font-mono font-bold">12</p>
                       <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">Referrals Sent</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="mt-8 p-3 rounded bg-blue-500/5 border border-blue-500/20 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-mono text-muted-foreground leading-tight italic">Top 1% Referrer badge awarded!</span>
           </div>
        </div>
      </div>

      <div className="glass-card border border-border rounded-xl">
        <div className="p-4 border-b border-border bg-muted/20">
           <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Referral History</h3>
        </div>
        <div className="divide-y divide-border">
           {[
             { name: "Vertex Tech", status: "Converted", reward: "$850", date: "Mar 2026" },
             { name: "Nexus Lab", status: "In Discussion", reward: "Pending", date: "Apr 2026" },
             { name: "Orbit Soft", status: "Converted", reward: "$600", date: "Feb 2026" },
           ].map((r, i) => (
             <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                   </div>
                   <div>
                      <p className="text-sm font-bold font-display">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase">{r.date}</p>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className="text-sm font-mono font-bold text-primary">{r.reward}</span>
                   <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                     r.status === 'Converted' ? 'border-green-500/50 text-green-500 bg-green-500/5' : 'border-muted text-muted-foreground'
                   }`}>
                      {r.status.toUpperCase()}
                   </span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
