import { TestTube, CheckCircle, XCircle, Play, Loader2, BarChart3, Zap } from "lucide-react";
import { useState } from "react";

export default function TestingHub() {
  const [testing, setTesting] = useState(false);
  const testSuites = [
    { name: "Unit Tests (Client)", passed: 142, failed: 0, time: "12s" },
    { name: "Auth Integration", passed: 45, failed: 1, time: "34s" },
    { name: "Database Migrations", passed: 12, failed: 0, time: "8s" },
    { name: "End-to-End Core", passed: 8, failed: 0, time: "124s" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-green-500">AUTOMATED TESTING SUITE</h1>
          <p className="text-xs text-muted-foreground font-mono">Continuous integration & validation</p>
        </div>
        <button 
          onClick={() => { setTesting(true); setTimeout(() => setTesting(false), 2000); }}
          disabled={testing}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-green-700 transition"
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {testing ? "RUNNING PIPELINE..." : "EXECUTE FULL SUITE"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card border border-border bg-card">
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-border">
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Total Passed</div>
                <div className="text-xl font-mono font-bold text-green-500">207</div>
              </div>
              <div className="text-center border-l border-border">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Total Failed</div>
                <div className="text-xl font-mono font-bold text-red-500">1</div>
              </div>
              <div className="text-center border-l border-border">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Coverage</div>
                <div className="text-xl font-mono font-bold text-primary">89.4%</div>
              </div>
              <div className="text-center border-l border-border">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Avg. Speed</div>
                <div className="text-xl font-mono font-bold text-muted-foreground">42ms</div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {testSuites.map((suite) => (
                <div key={suite.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    {suite.failed > 0 ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                    <div className="text-sm font-medium">{suite.name}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-green-500">+{suite.passed}</span>
                    <span className="text-red-500">-{suite.failed}</span>
                    <span className="text-muted-foreground opacity-50">{suite.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 border border-green-500/20 bg-green-500/5">
             <h3 className="text-xs font-bold text-green-500 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" /> AI TEST OPTIMIZER
            </h3>
            <p className="text-[11px] text-foreground/80 leading-relaxed italic">
              "Detected redundancy in common setup hooks for Auth Integration tests. I recommend consolidating these into a global test harness to reduce execution time by ~15%."
            </p>
          </div>

          <div className="glass-card p-4 border border-border h-full">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> HISTORICAL TREND
            </h3>
            <div className="h-32 flex items-end gap-1 px-2">
               {[40, 60, 45, 80, 75, 90, 85].map((h, i) => (
                 <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t" style={{ height: `${h}%` }} />
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
