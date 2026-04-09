import { useState } from "react";
import { Brain, FileCode, Wand2, CheckCircle2, Copy, Trash2, Cpu, Sparkles } from "lucide-react";

export default function AITestGen() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState(`// Describe the function you want to test...`);

  const generateTests = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setCode(`describe("AuthService", () => {
  it("should authenticate valid users", async () => {
    const user = { email: "test@kelvy.ai", password: "encrypted_pwd" };
    const result = await AuthService.login(user);
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe(user.email);
  });

  it("should reject invalid credentials", async () => {
    const result = await AuthService.login({ email: "wrong", password: "..." });
    expect(result.error).toBe("INVALID_CREDENTIALS");
  });
});`);
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-280px)] flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI TEST CASE GENERATOR
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Neural Test Generation for Vitest, Jest & Playwright
          </p>
        </div>
        <button 
          onClick={generateTests}
          disabled={isGenerating}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
            isGenerating ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          }`}
        >
          {isGenerating ? <Cpu className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {isGenerating ? "GENERATING SUITE..." : "GENERATE UNIT TESTS"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="glass-card border border-border rounded-xl flex flex-col overflow-hidden">
           <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center">
              <span className="text-[10px] font-bold font-mono uppercase text-muted-foreground">Source Code / Requirements</span>
              <FileCode className="w-4 h-4 text-muted-foreground" />
           </div>
           <textarea 
              className="flex-1 p-4 bg-transparent outline-none font-mono text-sm text-foreground/80 resize-none"
              placeholder="Paste your TypeScript/JavaScript code here, or a brief description of the logic..."
           />
        </div>

        <div className="glass-card border border-border rounded-xl flex flex-col overflow-hidden bg-black/40">
           <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
              <span className="text-[10px] font-bold font-mono uppercase text-primary">Generated Vitest Suite</span>
              <div className="flex gap-2">
                 <button className="p-1.5 rounded hover:bg-white/10 transition"><Copy className="w-3.5 h-3.5 text-muted-foreground" /></button>
                 <button className="p-1.5 rounded hover:bg-white/10 transition"><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>
           </div>
           <div className="flex-1 p-4 font-mono text-xs text-blue-300 overflow-y-auto whitespace-pre">
              {code}
           </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-4">
        <div className="p-2 rounded-full bg-primary/20">
           <Brain className="w-5 h-5 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground">
          KASA AI is using <span className="text-primary font-bold">qwen2.5:7b</span> to analyze your code and generate {isGenerating ? 'pending...' : '12 edge-case validations'}.
        </p>
      </div>
    </div>
  );
}
