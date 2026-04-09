import { useState, useEffect } from "react";
import { Brain, ShieldAlert, Activity, Zap, Lock, ShieldCheck, Database, Server, AlertCircle, Search } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SmartStamp from "@/components/SmartStamp";

export default function NeuralAttackDetector() {
  const { callAI, loading: isAnalyzing } = useAI();
  const [events, setEvents] = useState<any[]>([]);
  const [neuralInsights, setNeuralInsights] = useState<string>("");
  const [threatScore, setThreatScore] = useState(0);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    const { data } = await supabase
      .from("security_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (data) {
      setEvents(data);
      // Simulate/Calculate threat score based on critical events
      const score = data.filter(e => e.severity === "critical").length * 20 + data.filter(e => e.severity === "high").length * 10;
      setThreatScore(Math.min(score, 100));
    }
  };

  const runNeuralAnalysis = async () => {
    if (events.length === 0) return;
    try {
      const eventSummary = events.map(e => `${e.event_type} (${e.severity}): ${e.description}`).join("\n");
      const prompt = `Perform a Neural Attack Detection analysis on the following security events:
      
      ${eventSummary}
      
      Identify:
      1. Potential attack patterns (e.g., Targeted SQLi, Distributed Brute Force, Lateral Movement).
      2. Recommended immediate AI countermeasures.
      3. Predicted threat evolution for the next 4 hours.
      
      Format with professional cybersecurity terminology.`;
      
      const response = await callAI(prompt, {
        systemPrompt: "You are KASA (Kelvy AI Security Analyst), an autonomous neural system designed to detect and neutralize advanced persistent threats (APTs)."
      });
      setNeuralInsights(response);
    } catch (error) {
      console.error("Neural analysis failed", error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Brain className="w-5 h-5" />
            NEURAL ATTACK DETECTOR
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Autonomous Threat Detection & MITRE ATT&CK Mapping
          </p>
        </div>
        <button 
           onClick={runNeuralAnalysis}
           disabled={isAnalyzing}
           className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
             isAnalyzing ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
           }`}
        >
          {isAnalyzing ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isAnalyzing ? "PROCESSING..." : "RUN NEURAL SCAN"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 glass-card border border-border rounded-xl p-6 bg-black/40 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
           <h3 className="text-xs font-bold font-mono uppercase tracking-widest mb-6 flex items-center gap-2 text-primary">
              <Activity className="w-4 h-4" />
              Real-time Neural Traffic Analysis
           </h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[
                   { time: "00:00", threats: 10, attacks: 2 },
                   { time: "04:00", threats: 15, attacks: 5 },
                   { time: "08:00", threats: 8, attacks: 1 },
                   { time: "12:00", threats: 45, attacks: 12 },
                   { time: "16:00", threats: 30, attacks: 8 },
                   { time: "20:00", threats: 25, attacks: 10 },
                 ]}>
                    <defs>
                       <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" stroke="#ffffff30" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis stroke="#ffffff30" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ background: '#000', border: '1px solid #ffffff20' }} />
                    <Area type="monotone" dataKey="threats" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorThreats)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card border border-border rounded-xl p-6 flex flex-col justify-between items-center text-center">
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Threat Index</p>
           <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                 <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted/10" />
                 <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" 
                    strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * threatScore) / 100}
                    className={`${threatScore > 70 ? 'text-red-500' : threatScore > 40 ? 'text-orange-500' : 'text-primary'} transition-all duration-1000`} 
                 />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-display font-bold">{threatScore}%</span>
                 <span className="text-[8px] font-mono uppercase opacity-50">Risk Level</span>
              </div>
           </div>
           <div className={`text-[10px] font-bold font-mono px-3 py-1 rounded-full border ${
              threatScore > 70 ? 'border-red-500/50 text-red-500 bg-red-500/5' : 
              threatScore > 40 ? 'border-orange-500/50 text-orange-500 bg-orange-500/5' : 
              'border-primary/50 text-primary bg-primary/5'
           }`}>
              {threatScore > 70 ? 'CRITICAL ALERT' : threatScore > 40 ? 'ELEVATED RISK' : 'SYSTEM OPTIMAL'}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card border border-border rounded-xl flex flex-col overflow-hidden">
           <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center">
              <span className="text-[10px] font-bold font-mono uppercase text-muted-foreground">Recent Security Events (Supabase)</span>
              <Database className="w-4 h-4 text-muted-foreground" />
           </div>
           <div className="flex-1 p-2 space-y-1 overflow-y-auto max-h-[300px]">
              {events.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition text-xs font-mono">
                   <span className={`w-2 h-2 rounded-full ${e.severity === 'critical' ? 'bg-red-500' : e.severity === 'high' ? 'bg-orange-500' : 'bg-primary'}`} />
                   <span className="text-muted-foreground w-16 truncate uppercase">{e.event_type}</span>
                   <span className="flex-1 truncate">{e.description}</span>
                   <span className="text-[10px] opacity-40">{new Date(e.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
              {events.length === 0 && <p className="text-center py-8 text-xs text-muted-foreground italic">No security events found in Supabase.</p>}
           </div>
        </div>

        <div className="glass-card border border-border rounded-xl flex flex-col bg-black/60 overflow-hidden relative">
           <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
           <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
              <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-widest">Neural Analysis Dashboard</span>
              <ShieldAlert className="w-4 h-4 text-primary" />
           </div>
           <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-[300px]">
              {neuralInsights ? (
                <div className="space-y-6">
                   <div className="whitespace-pre-wrap text-xs font-mono text-muted-foreground leading-relaxed">
                      {neuralInsights}
                   </div>
                   <div className="flex gap-2">
                      <button className="flex-1 py-1.5 rounded bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:shadow-[0_0_10px_rgba(var(--primary),0.5)] transition">Deploy Countermeasures</button>
                      <button className="flex-1 py-1.5 rounded border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted">Quarantine Hosts</button>
                   </div>
                   <SmartStamp type="report" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                   <Brain className="w-12 h-12 text-primary animate-pulse" />
                   <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Awaiting Neural Signature Data...</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
