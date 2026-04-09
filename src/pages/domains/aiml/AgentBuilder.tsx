import { useState } from "react";
import { Brain, Cpu, Sparkles, MessageSquare, Play, Settings, Save, Zap } from "lucide-react";

export default function AgentBuilder() {
  const [agentName, setAgentName] = useState("KASA-lite-1");
  const [isBuilding, setIsBuilding] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-280px)] flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            NEURAL AGENT BUILDER
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Custom AI Agent Orchestration & Logic Design
          </p>
        </div>
        <button 
           onClick={() => { setIsBuilding(true); setTimeout(() => setIsBuilding(false), 3000); }}
           className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
             isBuilding ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
           }`}
        >
          {isBuilding ? <Zap className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isBuilding ? "PUBLISHING..." : "PUBLISH AGENT"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="glass-card border border-border rounded-xl p-6 space-y-6 overflow-y-auto">
           <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Agent Name</label>
              <input 
                type="text" 
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 font-mono text-sm focus:ring-1 focus:ring-primary outline-none"
              />
           </div>
           <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Core Persona / Purpose</label>
              <textarea 
                className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 font-mono text-sm h-32 resize-none focus:ring-1 focus:ring-primary outline-none"
                placeholder="Describe what this agent does..."
              />
           </div>
           <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Capabilities</label>
              <div className="grid grid-cols-1 gap-2">
                 {['Web Browsing', 'File Execution', 'API Integration', 'Code Analysis'].map((cap) => (
                   <label key={cap} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 cursor-pointer transition">
                      <input type="checkbox" className="accent-primary" />
                      <span className="text-xs font-mono">{cap}</span>
                   </label>
                 ))}
              </div>
           </div>
        </div>

        <div className="md:col-span-2 glass-card border border-border rounded-xl flex flex-col bg-black/20 overflow-hidden">
           <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-bold font-mono uppercase text-muted-foreground">Preview Console</span>
              </div>
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
           </div>
           <div className="flex-1 p-6 font-mono text-xs flex flex-col justify-center items-center text-center space-y-4">
              <Brain className="w-16 h-16 text-primary opacity-20" />
              <p className="text-muted-foreground max-w-xs">Enter your agent's parameters to begin the neural synthesis process.</p>
              <div className="flex gap-4">
                 <button className="px-4 py-1.5 rounded border border-border text-[10px] font-bold font-mono uppercase hover:border-primary transition">Test Chat</button>
                 <button className="px-4 py-1.5 rounded border border-border text-[10px] font-bold font-mono uppercase hover:border-primary transition">View XML</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
