import { Brain, Cpu, Database, Activity, Zap, RefreshCw, BarChart } from "lucide-react";
import { useState } from "react";

export default function ModelHub() {
  const [loading, setLoading] = useState(false);
  const models = [
    { name: "qwen2.5:7b", type: "LLM", size: "4.7 GB", status: "Loaded", usage: "3.2 GB VRAM" },
    { name: "qwen3-vl:8b", type: "Vision", size: "5.2 GB", status: "Standby", usage: "0 GB" },
    { name: "llama3:8b", type: "LLM", size: "4.9 GB", status: "Idle", usage: "0 GB" },
    { name: "nomic-embed", type: "Embedding", size: "274 MB", status: "Loaded", usage: "128 MB VRAM" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-primary">NEURAL MODEL REGISTRY</h1>
          <p className="text-xs text-muted-foreground font-mono">Local LLM orchestration & performance metrics</p>
        </div>
        <button 
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
          disabled={loading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          RESCAN MODELS
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
             {models.map(model => (
               <div key={model.name} className="glass-card p-4 border border-border hover:border-primary/30 transition-all group">
                 <div className="flex justify-between items-start mb-3">
                   <div className="p-2 rounded-lg bg-primary/10 text-primary">
                     <Cpu className="w-5 h-5" />
                   </div>
                   <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${model.status === 'Loaded' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                     {model.status.toUpperCase()}
                   </div>
                 </div>
                 <div className="space-y-1">
                   <div className="text-sm font-bold font-mono">{model.name}</div>
                   <div className="flex justify-between text-[10px] text-muted-foreground">
                     <span>{model.type} • {model.size}</span>
                     <span className="font-mono text-primary">{model.usage}</span>
                   </div>
                 </div>
               </div>
             ))}
          </div>

          <div className="glass-card p-4 border border-border h-[200px] flex flex-col">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> INFERENCE LATENCY (MS)
            </h3>
            <div className="flex-1 flex items-end gap-1.5 px-2">
               {[20, 35, 25, 60, 45, 30, 25, 20, 15, 40].map((h, i) => (
                 <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t" style={{ height: `${h}%` }} />
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 border border-primary/20 bg-primary/5">
            <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> AI ORCHESTRATOR
            </h3>
            <p className="text-[11px] text-foreground/80 leading-relaxed italic mb-4">
              "Current GPU memory headroom is 4.2 GB. I recommend loading 'llama3:8b' for high-reasoning tasks or keeping 'qwen2.5' as the primary fast-response node."
            </p>
            <div className="space-y-2">
               <div className="text-[10px] flex justify-between">
                 <span className="text-muted-foreground">Context Window</span>
                 <span className="font-mono">32,768 tokens</span>
               </div>
               <div className="text-[10px] flex justify-between">
                 <span className="text-muted-foreground">Quantization</span>
                 <span className="font-mono text-green-500">Q4_K_M (Optimized)</span>
               </div>
            </div>
          </div>

          <div className="glass-card p-4 border border-border">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2 text-muted-foreground">
              <Database className="w-4 h-4" /> VECTOR DATABASE
            </h3>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-[11px]">
                 <span className="text-muted-foreground">Total Embeddings</span>
                 <span className="font-mono font-bold text-primary">1.2M</span>
               </div>
               <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-primary" style={{ width: '65%' }} />
               </div>
               <div className="text-[9px] text-muted-foreground text-center italic">
                 Storage: 842 MB / 2.0 GB allocated
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
