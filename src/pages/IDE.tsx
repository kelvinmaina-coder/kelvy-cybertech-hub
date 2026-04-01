import { useState } from "react";
import { Code, Play, Save, GitBranch, Terminal, FileCode } from "lucide-react";

const files = ["main.py", "api/auth.py", "security/scanner.py", "config.yaml", "README.md"];

const sampleCode = `# Kelvy CyberTech Hub — Security Scanner
# Powered by Ollama AI + Nmap

import nmap
from ai.ollama_gateway import OllamaGateway

class SecurityScanner:
    def __init__(self):
        self.nm = nmap.PortScanner()
        self.ai = OllamaGateway(model="mistral")
    
    async def scan_network(self, target: str):
        """Scan target and analyze with AI"""
        self.nm.scan(target, arguments='-sV -sC')
        
        results = []
        for host in self.nm.all_hosts():
            for port in self.nm[host].all_tcp():
                results.append({
                    'host': host,
                    'port': port,
                    'state': self.nm[host]['tcp'][port]['state'],
                    'service': self.nm[host]['tcp'][port]['name']
                })
        
        # AI-powered analysis
        analysis = self.ai.generate(
            f"Analyze these scan results: {results}"
        )
        
        return {
            'raw_results': results,
            'ai_analysis': analysis,
            'risk_score': self._calculate_risk(results)
        }`;

export default function IDE() {
  const [activeFile, setActiveFile] = useState("security/scanner.py");

  return (
    <div className="space-y-4 h-[calc(100vh-7rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-display font-bold text-accent">CLOUD IDE</h1>
        <p className="text-sm text-muted-foreground font-mono">Browser-Based Development • AI Code Assistant</p>
      </div>

      <div className="flex-1 flex flex-col rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-muted/30 overflow-x-auto">
          {files.map(f => (
            <button key={f} onClick={() => setActiveFile(f)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono whitespace-nowrap transition ${
                activeFile === f ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              <FileCode className="w-3 h-3" /> {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border">
          <button className="flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono hover:bg-primary/30">
            <Play className="w-3 h-3" /> Run
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50 text-muted-foreground text-xs font-mono hover:text-foreground">
            <Save className="w-3 h-3" /> Save
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50 text-muted-foreground text-xs font-mono hover:text-foreground">
            <GitBranch className="w-3 h-3" /> main
          </button>
          <div className="ml-auto flex items-center gap-1 text-xs text-accent font-mono">
            <Code className="w-3 h-3" /> AI Assistant Active
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-background">
          <pre className="font-mono text-xs text-foreground/90 leading-relaxed">
            {sampleCode.split("\n").map((line, i) => (
              <div key={i} className="flex">
                <span className="w-8 text-right pr-3 text-muted-foreground/40 select-none">{i + 1}</span>
                <span>{line}</span>
              </div>
            ))}
          </pre>
        </div>

        <div className="h-28 border-t border-border bg-background p-2 font-mono text-xs text-primary/70">
          <div className="flex items-center gap-1 mb-1 text-muted-foreground">
            <Terminal className="w-3 h-3" /> Terminal
          </div>
          <div>$ python security/scanner.py</div>
          <div className="text-primary">→ Scanner initialized. Ollama model loaded.</div>
          <div className="text-muted-foreground">Ready for input...</div>
        </div>
      </div>
    </div>
  );
}
