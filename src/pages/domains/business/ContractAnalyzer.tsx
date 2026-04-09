import { useState } from "react";
import { FileSearch, ShieldCheck, Scale, AlertTriangle, FileText, Brain, Sparkles, Wand2 } from "lucide-react";
import { useAI } from "@/hooks/useAI";

export default function ContractAnalyzer() {
  const { callAI, loading: isAnalyzing } = useAI();
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState<string>("");

  const handleAnalyze = async () => {
    if (!contractText) return;
    try {
      const prompt = `Analyze this contract text for legal risks and clause optimization:
      
      Contract Text:
      ${contractText}
      
      Identify:
      1. High-risk clauses (e.g., liability, indemnity).
      2. Missing critical clauses.
      3. Summary of intent.
      
      Provide actionable neural insights and recommendations for Kelvy CyberTech Hub clients.`;
      
      const response = await callAI(prompt, {
        systemPrompt: "You are KABA (Kelvy AI Business Analyst), an expert legal technology analyst specialized in commercial contracts and risk assessment."
      });
      setAnalysis(response);
    } catch (error) {
      console.error("Analysis failed", error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-280px)] flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Scale className="w-5 h-5" />
            AI CONTRACT ANALYZER
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Neural Risk Assessment & Clause Optimization
          </p>
        </div>
        <button 
           onClick={handleAnalyze}
           disabled={isAnalyzing}
           className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
             isAnalyzing ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
           }`}
        >
          {isAnalyzing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {isAnalyzing ? "ANALYZING..." : "SCAN CONTRACT"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="glass-card border border-border rounded-xl flex flex-col overflow-hidden">
           <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center">
              <span className="text-[10px] font-bold font-mono uppercase text-muted-foreground">Original Document (PDF/Text)</span>
              <FileText className="w-4 h-4 text-muted-foreground" />
           </div>
           <textarea 
              className="flex-1 p-4 bg-transparent outline-none font-mono text-sm text-foreground/80 resize-none"
              placeholder="Paste contract text or drag-and-drop file here..."
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
           />
        </div>

        <div className="glass-card border border-border rounded-xl flex flex-col bg-black/40 overflow-hidden">
           <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
              <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-widest">Neural Insights & Risks</span>
              <ShieldCheck className="w-4 h-4 text-primary" />
           </div>
           <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {!isAnalyzing ? (
                <div className="space-y-6">
                   {analysis ? (
                     <div className="whitespace-pre-wrap text-sm font-mono text-muted-foreground leading-relaxed">
                       {analysis}
                     </div>
                   ) : (
                     <div className="space-y-6 opacity-40 grayscale">
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                           <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="text-xs font-bold font-mono text-red-500 uppercase">High Risk Clause Found</span>
                           </div>
                           <p className="text-xs italic leading-relaxed">
                             "Example: Section 8.2: Indefinite liability for data breaches without a cap..."
                           </p>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                           <div className="flex items-center gap-2 mb-2">
                              <Scale className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold font-mono text-primary uppercase">Summary of Intent</span>
                           </div>
                           <p className="text-xs leading-relaxed">
                             Paste a contract and click Scan to see AI insights.
                           </p>
                        </div>
                     </div>
                   )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                   <Brain className="w-12 h-12 text-primary animate-pulse" />
                   <p className="text-[10px] font-mono text-muted-foreground animate-pulse">EXTRACTING ENTITIES...</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
         <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">K</span>
            <p className="text-xs text-muted-foreground">KABA AI is using <span className="text-primary font-bold">qwen2.5:7b</span> optimized for legal/business analysis.</p>
         </div>
      </div>
    </div>
  );
}
