import { useState, useEffect } from "react";
import { Search, Play, Terminal, Globe, Lock, Key, Bomb, Fingerprint, Wifi, ShieldCheck, Eye, Loader2, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { analyzeWithOllama } from "@/lib/ollama";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BACKEND_URL = "http://localhost:8000";

const categories = [
  { id: "recon", label: "Recon", icon: Search, color: "text-secondary",
    tools: ["nmap", "whois", "dig", "theHarvester", "amass", "subfinder", "dnsx", "shodan-cli"] },
  { id: "network", label: "Network", icon: Globe, color: "text-primary",
    tools: ["wireshark", "tcpdump", "netdiscover", "arp-scan", "masscan", "hping3", "ettercap", "bettercap"] },
  { id: "vuln", label: "Vuln Scan", icon: Eye, color: "text-warning",
    tools: ["nikto", "openvas", "sqlmap", "wpscan", "nuclei", "gobuster", "ffuf", "dirb"] },
  { id: "password", label: "Password", icon: Key, color: "text-destructive",
    tools: ["hydra", "john", "hashcat", "crunch", "medusa", "patator", "cewl"] },
  { id: "exploit", label: "Exploit", icon: Bomb, color: "text-destructive",
    tools: ["metasploit", "msfvenom", "beef", "searchsploit"] },
  { id: "forensics", label: "Forensics", icon: Fingerprint, color: "text-accent",
    tools: ["autopsy", "volatility", "binwalk", "foremost", "strings", "exiftool"] },
  { id: "webapp", label: "Web App", icon: Globe, color: "text-secondary",
    tools: ["burpsuite", "zaproxy", "wfuzz", "arjun", "dalfox", "commix"] },
  { id: "wireless", label: "Wireless", icon: Wifi, color: "text-primary",
    tools: ["aircrack-ng", "airmon-ng", "airodump-ng", "reaver", "wifite"] },
  { id: "crypto", label: "Crypto", icon: Lock, color: "text-accent",
    tools: ["openssl", "gpg", "steghide", "stegcracker", "base64"] },
  { id: "admin", label: "Sys Admin", icon: ShieldCheck, color: "text-primary",
    tools: ["htop", "ss", "iptables", "fail2ban", "lynis", "rkhunter", "chkrootkit"] },
];

interface ScanResult {
  id: number;
  tool: string;
  target: string | null;
  raw_output: string | null;
  ai_analysis: string | null;
  severity: string | null;
  created_at: string;
}

export default function LinuxTools() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("recon");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [args, setArgs] = useState("");
  const [output, setOutput] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [running, setRunning] = useState(false);
  const [outputTab, setOutputTab] = useState<"raw" | "ai">("raw");
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const activeCat = categories.find(c => c.id === activeCategory)!;

  // Check backend status
  useEffect(() => {
    fetch(`${BACKEND_URL}/health`).then(() => setBackendOnline(true)).catch(() => setBackendOnline(false));
  }, []);

  // Load scan history
  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(20);
      if (data) setScanHistory(data as ScanResult[]);
    };
    loadHistory();
  }, []);

  const runTool = async (tool: string) => {
    setSelectedTool(tool);
    setRunning(true);
    setOutput(`$ ${tool} ${args} ${target}\n\nExecuting...\n`);
    setAiAnalysis("");

    try {
      // Try backend first
      const res = await fetch(`${BACKEND_URL}/api/security/run-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, args: args.split(" ").filter(Boolean), target }),
      });

      if (res.ok) {
        const data = await res.json();
        setOutput(data.raw_output || "No output");
        setAiAnalysis(data.ai_analysis || "");

        // Save to Supabase
        await supabase.from("scans").insert({
          tool,
          target: target || null,
          args: { args: args.split(" ").filter(Boolean) },
          raw_output: data.raw_output,
          ai_analysis: data.ai_analysis,
          severity: data.severity,
          created_by: user?.id,
        } as any);

        toast.success(`${tool} scan complete`);
      } else {
        throw new Error("Backend unavailable");
      }
    } catch {
      // Fallback: simulate + use Ollama for analysis
      const simOutput = `[Kelvy CyberTech Hub]\nTool: ${tool}\nTarget: ${target || "localhost"}\nArgs: ${args || "default"}\n\n⚠️ Backend server not running at ${BACKEND_URL}\n\nTo run real tools, start the Python backend:\n  cd backend && python main.py\n\nThe backend will execute Linux tools and return real results.\nMeanwhile, requesting AI analysis...`;
      setOutput(simOutput);

      // Get AI analysis from Ollama
      const analysis = await analyzeWithOllama(tool, `Tool: ${tool}, Target: ${target}, Args: ${args}. Provide general guidance about this tool and what it typically finds.`);
      setAiAnalysis(analysis);

      // Still save to Supabase
      await supabase.from("scans").insert({
        tool,
        target: target || null,
        args: { args: args.split(" ").filter(Boolean) },
        raw_output: simOutput,
        ai_analysis: analysis,
        severity: "info",
        created_by: user?.id,
      } as any);
    }

    setRunning(false);
    // Refresh history
    const { data } = await supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(20);
    if (data) setScanHistory(data as ScanResult[]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary text-glow-green">LINUX TOOLS HUB</h1>
          <p className="text-sm text-muted-foreground font-mono">
            {categories.reduce((a, c) => a + c.tools.length, 0)} tools • 10 categories • AI-enhanced results
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${backendOnline ? "bg-primary" : backendOnline === false ? "bg-destructive" : "bg-muted-foreground"}`} />
          <span className="text-xs text-muted-foreground font-mono">{backendOnline ? "Backend Online" : "Backend Offline"}</span>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition ${
              activeCategory === cat.id ? "bg-primary/20 text-primary" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}>
            <cat.icon className="w-3 h-3" /> {cat.label}
          </button>
        ))}
      </div>

      {/* Target & args input */}
      <div className="flex gap-2">
        <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Target (IP, domain, URL...)"
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50" />
        <input value={args} onChange={e => setArgs(e.target.value)} placeholder="Additional args..."
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Tool list */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className={`font-display text-sm mb-3 ${activeCat.color}`}>{activeCat.label.toUpperCase()} TOOLS</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {activeCat.tools.map(tool => (
              <button key={tool} onClick={() => runTool(tool)} disabled={running}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-mono transition disabled:opacity-50 ${
                  selectedTool === tool ? "bg-primary/20 text-primary border-glow-green" : "bg-muted/30 text-foreground hover:bg-muted/50"
                }`}>
                <Terminal className="w-3 h-3 shrink-0" />
                {tool}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button onClick={() => setOutputTab("raw")}
                className={`px-2 py-1 rounded text-xs font-mono ${outputTab === "raw" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
                Raw Output
              </button>
              <button onClick={() => setOutputTab("ai")}
                className={`px-2 py-1 rounded text-xs font-mono ${outputTab === "ai" ? "bg-accent/20 text-accent" : "text-muted-foreground"}`}>
                AI Analysis
              </button>
            </div>
            {running && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          </div>
          <div className="bg-background rounded-md p-3 min-h-[300px] max-h-[400px] font-mono text-xs text-primary/80 whitespace-pre-wrap overflow-auto">
            {outputTab === "raw" ? (output || "Select a tool and target to begin...") : (aiAnalysis || "AI analysis will appear after running a tool...")}
            {running && <span className="animate-pulse">█</span>}
          </div>
        </div>

        {/* Scan history */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">SCAN HISTORY</h3>
          <div className="space-y-2 max-h-[380px] overflow-y-auto">
            {scanHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono text-center py-4">No scans yet</p>
            ) : scanHistory.map(scan => (
              <button key={scan.id} onClick={() => { setOutput(scan.raw_output || ""); setAiAnalysis(scan.ai_analysis || ""); setSelectedTool(scan.tool); }}
                className="w-full text-left p-2 rounded bg-muted/20 hover:bg-muted/40 transition">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-foreground font-mono">{scan.tool}</span>
                  {scan.severity && (
                    <span className={`text-[10px] px-1 rounded ${
                      scan.severity === "critical" ? "bg-destructive/20 text-destructive" :
                      scan.severity === "high" ? "bg-warning/20 text-warning" :
                      "bg-muted text-muted-foreground"
                    }`}>{scan.severity}</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{scan.target || "localhost"} • {new Date(scan.created_at).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
