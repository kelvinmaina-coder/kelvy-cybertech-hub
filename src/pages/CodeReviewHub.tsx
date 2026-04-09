import { Search, Code, CheckCircle, AlertTriangle, MessageSquare, Zap, Loader2 } from "lucide-react";
import { useState } from "react";

export default function CodeReviewHub() {
  const [analyzing, setAnalyzing] = useState(false);
  const reviews = [
    { file: "main.py", status: "Warning", issues: 3, score: 78, ai: "Detected potential memory leak in loop on line 242." },
    { file: "utils.ts", status: "Clean", issues: 0, score: 98, ai: "Code follows all enterprise standards." },
    { file: "api.go", status: "Critical", issues: 1, score: 45, ai: "Hardcoded credential detected in production path." },
  ];

  const startReview = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-secondary">AI CODE REVIEW HUB</h1>
          <p className="text-xs text-muted-foreground font-mono">Automated static analysis & neural audit</p>
        </div>
        <button 
          onClick={startReview}
          disabled={analyzing}
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {analyzing ? "ANALYZING..." : "START REPOSITORY AUDIT"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card border border-border overflow-hidden">
            <div className="p-3 bg-muted/50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Repository Health Overview
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.file} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-secondary/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${rev.issues > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        <Code className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold font-mono">{rev.file}</div>
                        <div className="text-[10px] text-muted-foreground">Status: {rev.status} • {rev.issues} issues found</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Quality Score</div>
                        <div className={`text-sm font-mono font-bold ${rev.score > 80 ? 'text-green-500' : rev.score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>{rev.score}%</div>
                      </div>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${rev.score > 80 ? 'bg-green-500' : rev.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${rev.score}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 border border-secondary/20 bg-secondary/5">
            <h3 className="text-xs font-bold text-secondary mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> NEURAL FEEDBACK
            </h3>
            <div className="space-y-4">
              {reviews.filter(r => r.issues > 0).map(r => (
                <div key={r.file} className="space-y-1">
                  <div className="text-[10px] font-bold text-foreground/70 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-500" /> {r.file}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    "{r.ai}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4 border border-border">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> BEST PRACTICES COMPLIANCE
            </h3>
            <div className="space-y-2">
              {["Clean Code Principles", "SOLID Architecture", "Test Coverage (>80%)", "Security Headers"].map(check => (
                <div key={check} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{check}</span>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
