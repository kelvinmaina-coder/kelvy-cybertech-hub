import { useState } from "react";
import { Award, Zap, ShieldCheck, Flame, Star, Brain, Cpu, Target, Lock } from "lucide-react";

export default function TeamAchievements() {
  const badges = [
    { name: "Threat Hunter", icon: Target, level: "Gold", progress: 85, color: "text-yellow-500" },
    { name: "Code Defender", icon: ShieldCheck, level: "Platinum", progress: 92, color: "text-blue-400" },
    { name: "Bug Squasher", icon: Zap, level: "Silver", progress: 45, color: "text-gray-400" },
    { name: "Neural Architect", icon: Brain, level: "Diamond", progress: 100, color: "text-primary" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Award className="w-5 h-5" />
            TEAM ACHIEVEMENTS & BADGES
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Professional milestones, skill certifications and reputation points.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-lg">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold text-primary font-mono uppercase tracking-widest">12 Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {badges.map((b) => (
          <div key={b.name} className="glass-card border border-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-all">
             <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full bg-muted/50 border border-border ${b.color} group-hover:scale-110 transition-transform`}>
                   <b.icon className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="font-display font-bold text-lg">{b.name}</h3>
                   <span className="text-[10px] font-mono font-bold uppercase opacity-60">{b.level} TIER</span>
                </div>
                <div className="w-full space-y-1.5">
                   <div className="flex justify-between items-baseline px-1">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Progress</span>
                      <span className="text-[10px] font-mono font-bold text-foreground">{b.progress}%</span>
                   </div>
                   <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${b.progress}%` }} />
                   </div>
                </div>
             </div>
             {b.progress === 100 && (
               <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rotate-45 flex items-end justify-center pb-1">
                  <Star className="w-3 h-3 text-white -rotate-45" />
               </div>
             )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="glass-card p-6 border border-border rounded-xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest mb-6 flex items-center gap-2">
               <Cpu className="w-4 h-4 text-primary" />
               Skill Progression Tree
            </h3>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { skill: "Ethical Hacking", val: 78 },
                 { skill: "Cloud Security", val: 94 },
                 { skill: "AI Engineering", val: 65 },
                 { skill: "Incident Resp", val: 82 },
               ].map((s) => (
                 <div key={s.skill} className="p-3 rounded border border-border bg-card">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">{s.skill}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-mono font-bold">{s.val}</span>
                       <div className="flex-1 bg-muted h-1 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${s.val}%` }} />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="glass-card p-6 border border-border rounded-xl relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-xs font-bold font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Locked Elite Perks
               </h3>
               <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed mb-6">
                  Reach <span className="text-primary font-bold">Level 50</span> to unlock direct shell access to the Quantum Simulation Sandbox and the "Neural Pioneer" custom avatar.
               </p>
               <button className="px-5 py-2 rounded-lg border border-border text-[10px] font-bold font-mono uppercase tracking-widest opacity-50 cursor-not-allowed">
                  Claim Reward
               </button>
            </div>
            <Award className="absolute -bottom-8 -right-8 w-48 h-48 text-primary opacity-[0.03]" />
         </div>
      </div>
    </div>
  );
}
