import { useState } from "react";
import { Play, CheckCircle2, XCircle, Clock, RotateCcw, ShieldCheck, Bug, Activity } from "lucide-react";

export default function RegressionTesting() {
  const [suiteStatus, setSuiteStatus] = useState("IDLE");
  const tests = [
    { id: 1, name: "Auth Flow Regression", status: "Passed", duration: "1.2s", coverage: "98%" },
    { id: 2, name: "Payment Gateway Integration", status: "Passed", duration: "4.5s", coverage: "94%" },
    { id: 3, name: "Data Encryption Layer", status: "Failed", duration: "0.8s", coverage: "100%" },
    { id: 4, name: "Session Persistence", status: "Passed", duration: "1.1s", coverage: "92%" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            AUTOMATED REGRESSION TESTING
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Continuous Quality Assurance & Code Integrity
          </p>
        </div>
        <button 
          onClick={() => { setSuiteStatus("RUNNING"); setTimeout(() => setSuiteStatus("COMPLETED"), 3000); }}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
            suiteStatus === "RUNNING" ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          }`}
        >
          {suiteStatus === "RUNNING" ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {suiteStatus === "RUNNING" ? "RUNNING SUITE..." : "RUN FULL REGRESSION"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card border border-border rounded-xl">
           <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Test Suite execution</h3>
              <div className="flex gap-2 text-[10px] font-mono">
                 <span className="text-green-500">3 PASSED</span>
                 <span className="text-red-500">1 FAILED</span>
              </div>
           </div>
           <div className="divide-y divide-border">
              {tests.map((test) => (
                <div key={test.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                  <div className="flex items-center gap-3">
                    {test.status === 'Passed' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    <div>
                      <p className="text-sm font-bold font-display">{test.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">Duration: {test.duration} · Coverage: {test.coverage}</p>
                    </div>
                  </div>
                  {test.status === 'Failed' && (
                    <button className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded hover:bg-red-500/20 transition">
                      View Logs
                    </button>
                  )}
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-4">
           <div className="glass-card p-4 border border-border rounded-xl">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase mb-4">Pipeline Metrics</h3>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                       <span>Total Coverage</span>
                       <span className="text-primary font-bold">96.4%</span>
                    </div>
                    <div className="w-full bg-muted/50 h-1 rounded-full overflow-hidden">
                       <div className="bg-primary h-full w-[96%]" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-2 rounded bg-muted/30 border border-border text-center">
                       <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Pass Rate</p>
                       <p className="text-lg font-mono font-bold text-green-500">92%</p>
                    </div>
                    <div className="p-2 rounded bg-muted/30 border border-border text-center">
                       <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Avg. Time</p>
                       <p className="text-lg font-mono font-bold text-primary">8.2s</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-card p-4 border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                 <Bug className="w-4 h-4 text-primary" />
                 <h3 className="text-[10px] font-bold text-foreground uppercase">AI Debugger Insight</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "The failure in 'Data Encryption Layer' is likely caused by a mismatch in the crypto-buffer size introduced in PR #412."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
