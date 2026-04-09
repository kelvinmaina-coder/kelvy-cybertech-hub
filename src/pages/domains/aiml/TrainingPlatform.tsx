import { useState } from "react";
import { Brain, Cloud, Database, Play, BarChart3, Activity, Zap, ShieldCheck } from "lucide-react";

export default function TrainingPlatform() {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(42);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI TRAINING PLATFORM
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Dataset Orchestration & Model Fine-Tuning
          </p>
        </div>
        <button 
           onClick={() => { setIsTraining(!isTraining); }}
           className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
             isTraining ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
           }`}
        >
          {isTraining ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isTraining ? "STOP TRAINING" : "START FINE-TUNING"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-border rounded-xl space-y-6">
           <div>
              <h3 className="text-xs font-bold font-mono uppercase mb-4 text-muted-foreground tracking-widest">Dataset Source</h3>
              <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-3">
                 <Database className="w-5 h-5 text-primary" />
                 <div>
                    <p className="text-xs font-bold font-mono uppercase tracking-tighter">Security Logs Cluster</p>
                    <p className="text-[10px] text-muted-foreground font-mono italic">4.2M Rows · 854GB</p>
                 </div>
              </div>
           </div>
           
           <div>
              <h3 className="text-xs font-bold font-mono uppercase mb-4 text-muted-foreground tracking-widest">Base Model</h3>
              <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-3">
                 <Cloud className="w-5 h-5 text-primary" />
                 <div>
                    <p className="text-xs font-bold font-mono uppercase tracking-tighter">qwen2.5:7b-instruct</p>
                    <p className="text-[10px] text-muted-foreground font-mono italic">FP16 · 8K Context</p>
                 </div>
              </div>
           </div>

           <div className="pt-4 space-y-4">
              <div className="flex justify-between text-xs font-mono">
                 <span className="text-muted-foreground">Epoch 2/5</span>
                 <span className="text-primary font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                 <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
           </div>
        </div>

        <div className="md:col-span-2 glass-card border border-border rounded-xl flex flex-col min-h-[300px]">
           <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Training Metrics (Loss Curve)
              </h3>
           </div>
           <div className="flex-1 flex items-end gap-1 p-8">
              {[0.9, 0.85, 0.82, 0.78, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.42, 0.4, 0.38, 0.35, 0.32, 0.3, 0.28, 0.25, 0.22, 0.2, 0.18, 0.15, 0.12].map((val, i) => (
                <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-sm" style={{ height: `${(1-val) * 100}%` }} />
              ))}
           </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <p className="text-xs text-muted-foreground">
               Training environment is <span className="text-green-500 font-bold uppercase">OPTIMIZED</span>. GPU Temperature: 68°C.
            </p>
         </div>
         <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-mono font-bold">14.2 TFLOPS</span>
         </div>
      </div>
    </div>
  );
}
