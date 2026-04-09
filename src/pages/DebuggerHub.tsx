import { Bug, Terminal, Play, StepForward, Activity, AlertCircle, Zap } from "lucide-react";
import { useState } from "react";

export default function DebuggerHub() {
  const [activeSession, setActiveSession] = useState(false);
  
  const stackTrace = [
    { line: 124, func: "handleRequest", file: "server.py", status: "error" },
    { line: 89, func: "processPayload", file: "data_utils.py", status: "ok" },
    { line: 45, func: "bootstrap", file: "main.py", status: "ok" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-orange-500">NEURAL DEBUGGER INTERFACE</h1>
          <p className="text-xs text-muted-foreground font-mono">Deep inspection & runtime analysis</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-muted hover:bg-muted/80 p-2 rounded-lg transition"><Play className="w-4 h-4" /></button>
           <button className="bg-muted hover:bg-muted/80 p-2 rounded-lg transition"><StepForward className="w-4 h-4" /></button>
           <button onClick={() => setActiveSession(!activeSession)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeSession ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}>
             {activeSession ? "TERMINATE SESSION" : "ATTACH TO PROCESS"}
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 border border-border">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" /> VARIABLE WATCH
            </h3>
            <div className="space-y-2 font-mono text-[10px]">
              {[
                { key: "request_id", val: "'UUID-550e8400'" },
                { key: "buffer_size", val: "1024" },
                { key: "is_authenticated", val: "True" },
                { key: "payload_checksum", val: "'0xAF33'" },
              ].map(item => (
                <div key={item.key} className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted-foreground">{item.key}</span>
                  <span className="text-orange-400">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4 border border-border">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" /> BREAKPOINTS
            </h3>
             <div className="space-y-2">
               {["main.py:45", "server.py:124", "auth.py:12"].map(bp => (
                 <div key={bp} className="flex items-center gap-2 text-[10px]">
                   <div className="w-2 h-2 rounded-full bg-red-500" />
                   <span className="font-mono text-muted-foreground">{bp}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card border border-border overflow-hidden h-[300px] flex flex-col">
            <div className="p-3 bg-muted/40 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-orange-500" /> STACK TRACE & LOGS
              </h3>
            </div>
            <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-2">
              {stackTrace.map((trace, i) => (
                <div key={i} className={`p-2 rounded ${trace.status === 'error' ? 'bg-red-500/10 border border-red-500/20' : 'bg-muted/30'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={trace.status === 'error' ? 'text-red-500 font-bold' : 'text-primary'}>
                      {trace.func}()
                    </span>
                    <span className="text-muted-foreground text-[10px]">{trace.file}:{trace.line}</span>
                  </div>
                  {trace.status === 'error' && (
                    <div className="text-red-400/80 text-[10px]">IndexError: list index out of range</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4 border border-orange-500/20 bg-orange-500/5">
            <h3 className="text-xs font-bold text-orange-500 mb-2 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> AI DEBUG ASSISTANT
            </h3>
            <p className="text-[11px] text-foreground/90 leading-relaxed italic">
              "The IndexError on line 124 suggests the user object was not found in the cache before attempting to access its properties. I recommend adding a null-check guard."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
