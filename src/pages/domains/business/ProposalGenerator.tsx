import { useState } from "react";
import { FileText, Wand2, Sparkles, Send, Download, Users, Briefcase, Zap } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import SmartStamp from "@/components/SmartStamp";

export default function ProposalGenerator() {
  const { callAI, loading: isGenerating } = useAI();
  const [proposal, setProposal] = useState("");
  const [clientName, setClientName] = useState("");
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [budget, setBudget] = useState("KES 500k - 1M");

  const generate = async () => {
    if (!clientName) return;
    try {
      const prompt = `Generate a professional cybersecurity services proposal for ${clientName}. 
      Selected Packages: ${selectedPackages.join(", ") || "General Security Consultation"}. 
      Budget Range: ${budget}. 
      Use a formal professional tone. Include sections for Executive Summary, Scope of Work, and Value Proposition.
      Format with Markdown.`;
      
      const response = await callAI(prompt, {
        systemPrompt: "You are KABA (Kelvy AI Business Analyst), an expert in scoping cybersecurity projects and drafting professional business proposals."
      });
      setProposal(response);
    } catch (error) {
      console.error("Proposal generation failed", error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-280px)] flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            AUTOMATED PROPOSAL GENERATOR
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            AI-Driven Sales Enablement & Technical Scoping
          </p>
        </div>
        <button 
           onClick={generate}
           disabled={isGenerating}
           className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter"
        >
          {isGenerating ? <Zap className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {isGenerating ? "CRAFTING..." : "GENERATE PROPOSAL"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="glass-card border border-border rounded-xl p-6 space-y-6 overflow-y-auto">
           <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Subject Client</label>
              <div className="relative">
                 <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                 <input 
                    type="text" 
                    placeholder="e.g. Acme Corp" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-muted/30 border border-border rounded-lg pl-10 pr-4 py-2 font-mono text-sm outline-none" 
                 />
              </div>
           </div>
           <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Service Packages</label>
              <div className="grid grid-cols-1 gap-2">
                 {['Managed SOC', 'Pentesting', 'GDPR Audit', 'Cloud Migration'].map((pkg) => (
                   <label key={pkg} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        className="accent-primary" 
                        checked={selectedPackages.includes(pkg)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedPackages([...selectedPackages, pkg]);
                          else setSelectedPackages(selectedPackages.filter(p => p !== pkg));
                        }}
                      />
                      <span className="text-xs font-mono">{pkg}</span>
                   </label>
                 ))}
              </div>
           </div>
           <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Budget Range</label>
              <select 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 font-mono text-sm outline-none appearance-none cursor-pointer"
              >
                 <option>KES 100k - 500k</option>
                 <option>KES 500k - 2M</option>
                 <option>KES 2M+</option>
              </select>
           </div>
        </div>

        <div className="md:col-span-2 glass-card border border-border rounded-xl flex flex-col bg-white/5 overflow-hidden">
           <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
              <span className="text-[10px] font-bold font-mono uppercase text-muted-foreground">Proposal Draft</span>
              <div className="flex gap-2">
                 <button className="p-1.5 rounded hover:bg-white/10 transition"><Download className="w-3.5 h-3.5 text-muted-foreground" /></button>
                 <button className="p-1.5 rounded hover:bg-white/10 transition"><Send className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>
           </div>
           <div className="flex-1 p-8 font-mono text-sm overflow-y-auto whitespace-pre-wrap leading-relaxed opacity-80">
              {proposal ? (
                <>
                  {proposal}
                  <SmartStamp type="proposal" />
                </>
              ) : (
                "Select a client and service packages to generate a professional proposal."
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
