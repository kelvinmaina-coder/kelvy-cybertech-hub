import { useState, useCallback } from "react";
import { Code, Play, Save, GitBranch, Terminal, FileCode, Bot, Loader2 } from "lucide-react";
import { streamOllamaChat, listOllamaModels, OllamaMessage } from "@/lib/ollama";

const defaultFiles: Record<string, string> = {
  "main.py": `# Kelvy CyberTech Hub — Main Entry
import uvicorn
from fastapi import FastAPI

app = FastAPI(title="Kelvy CyberTech Hub API")

@app.get("/health")
def health():
    return {"status": "online", "version": "1.0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`,
  "scanner.py": `# Security Scanner Module
import nmap
from ai.ollama_gateway import OllamaGateway

class SecurityScanner:
    def __init__(self):
        self.nm = nmap.PortScanner()
        self.ai = OllamaGateway(model="mistral")
    
    async def scan_network(self, target: str):
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
        analysis = self.ai.generate(
            f"Analyze these scan results: {results}"
        )
        return {'raw_results': results, 'ai_analysis': analysis}`,
  "config.yaml": `# Kelvy CyberTech Hub Configuration
server:
  host: 0.0.0.0
  port: 8000
  debug: true

ollama:
  host: http://localhost:11434
  default_model: qwen2.5:7b
  vision_model: qwen3-vl:8b

security:
  tool_timeout: 60
  max_concurrent_scans: 3
  whitelist_enabled: true`,
};

export default function IDE() {
  const [activeFile, setActiveFile] = useState("scanner.py");
  const [files, setFiles] = useState(defaultFiles);
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState("$ Ready for input...");

  const analyzeCode = useCallback(async () => {
    const code = files[activeFile];
    if (!code || aiLoading) return;
    setAiLoading(true);
    setAiOutput("Analyzing code with Ollama...\n");

    const messages: OllamaMessage[] = [{
      role: "user",
      content: `Review this code file "${activeFile}" for bugs, security issues, and improvements:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide:\n1. Security vulnerabilities\n2. Bug risks\n3. Performance suggestions\n4. Best practices`
    }];

    let result = "";
    await streamOllamaChat({
      messages,
      model: "qwen2.5:7b",
      systemPrompt: "You are a senior security-focused code reviewer. Be concise and actionable.",
      onDelta: (chunk) => { result += chunk; setAiOutput(result); },
      onDone: () => setAiLoading(false),
      onError: (err) => { setAiOutput(`Error: ${err}`); setAiLoading(false); },
    });
  }, [activeFile, files, aiLoading]);

  const handleCodeChange = (value: string) => {
    setFiles(prev => ({ ...prev, [activeFile]: value }));
  };

  return (
    <div className="space-y-4 h-[calc(100vh-7rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-accent">CLOUD IDE</h1>
          <p className="text-sm text-muted-foreground font-mono">Browser-Based Development • AI Code Review</p>
        </div>
        <button onClick={analyzeCode} disabled={aiLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-xs font-mono hover:bg-accent/30 transition disabled:opacity-50">
          {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
          AI Review
        </button>
      </div>

      <div className="flex-1 flex flex-col rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-muted/30 overflow-x-auto">
          {Object.keys(files).map(f => (
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
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            <textarea
              value={files[activeFile]}
              onChange={e => handleCodeChange(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 bg-background font-mono text-xs text-foreground/90 leading-relaxed resize-none focus:outline-none"
            />
          </div>
          {aiOutput && (
            <div className="w-80 border-l border-border bg-background p-3 overflow-y-auto">
              <div className="flex items-center gap-1 mb-2 text-xs text-accent font-mono">
                <Bot className="w-3 h-3" /> AI Review
                {aiLoading && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
              </div>
              <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono">{aiOutput}</pre>
            </div>
          )}
        </div>

        <div className="h-24 border-t border-border bg-background p-2 font-mono text-xs text-primary/70 overflow-auto">
          <div className="flex items-center gap-1 mb-1 text-muted-foreground">
            <Terminal className="w-3 h-3" /> Terminal
          </div>
          <div className="whitespace-pre-wrap">{terminalOutput}</div>
        </div>
      </div>
    </div>
  );
}
