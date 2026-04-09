import { useState } from "react";
import { Trophy, TrendingUp, Shield, Target, Award, Users, Search, Filter } from "lucide-react";

export default function SecurityLeaderboard() {
  const players = [
    { id: 1, name: "Kelvin Kibet", rank: 1, xp: "12,450", badges: 24, status: "Master", level: 42 },
    { id: 2, name: "Sarah Tech", rank: 2, xp: "10,200", badges: 18, status: "Advanced", level: 38 },
    { id: 3, name: "James Dev", rank: 3, xp: "9,850", badges: 15, status: "Advanced", level: 35 },
    { id: 4, name: "Alice Security", rank: 4, xp: "8,400", badges: 12, status: "Intermediate", level: 29 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            GLOBAL SECURITY LEADERBOARD
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Gamified Cyber Defense & Team Performance Tracking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card border border-border rounded-xl flex flex-col overflow-hidden">
           <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Top Defenders</h3>
              <div className="flex gap-4">
                 <Search className="w-4 h-4 text-muted-foreground cursor-pointer" />
                 <Filter className="w-4 h-4 text-muted-foreground cursor-pointer" />
              </div>
           </div>
           <div className="divide-y divide-border">
              {players.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition group">
                   <div className="flex items-center gap-6">
                      <div className={`w-8 font-mono font-bold text-lg ${p.rank === 1 ? 'text-yellow-500' : p.rank === 2 ? 'text-gray-400' : p.rank === 3 ? 'text-orange-500' : 'text-muted-foreground font-normal'}`}>
                         #{p.rank}
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 relative">
                            <span className="text-xs font-bold uppercase">{p.name.charAt(0)}</span>
                            {p.rank === 1 && <Trophy className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-500" />}
                         </div>
                         <div>
                            <p className="text-sm font-bold font-display">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase">Level {p.level} · {p.status}</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-12">
                      <div className="text-right">
                         <p className="text-xs font-mono font-bold text-primary">{p.xp} XP</p>
                         <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-tighter">Combat Experience</p>
                      </div>
                      <div className="flex gap-1">
                         {[...Array(3)].map((_, i) => (
                           <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (p.badges % 5) ? 'bg-primary' : 'bg-muted'}`} />
                         ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-4">
           <div className="glass-card p-6 border border-border rounded-xl bg-gradient-to-br from-primary/10 to-transparent">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase mb-4 tracking-widest flex items-center gap-2">
                 <Shield className="w-4 h-4 text-primary" />
                 Your Ranking
              </h3>
              <div className="flex flex-col items-center py-4">
                 <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin-slow flex items-center justify-center mb-4">
                    <span className="text-2xl font-display font-bold text-foreground">#18</span>
                 </div>
                 <p className="text-xs font-bold font-mono text-primary uppercase">Top 5% Globally</p>
                 <p className="text-[10px] text-muted-foreground font-mono mt-1">450 XP to Next Rank</p>
              </div>
           </div>

           <div className="glass-card p-5 border border-border rounded-xl">
              <h4 className="text-[10px] font-bold font-mono uppercase text-muted-foreground mb-4">Upcoming Tournaments</h4>
              <div className="space-y-4">
                 {[
                   { name: "Zero-Day Defense", date: "Apr 15", prize: "Elite Badge" },
                   { name: "Network Ghost Hunt", date: "Apr 22", prize: "5k XP" },
                 ].map((t, i) => (
                   <div key={i} className="p-3 rounded bg-muted/30 border border-border group hover:border-primary/50 cursor-pointer transition">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-xs font-bold font-display">{t.name}</span>
                         <span className="text-[10px] font-mono text-primary">{t.date}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Reward: {t.prize}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
