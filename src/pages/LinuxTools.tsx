import { useState } from "react";
import { Search, Play, Terminal, Globe, Lock, Key, Bomb, Fingerprint, Wifi, ShieldCheck, Eye } from "lucide-react";

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

export default function LinuxTools() {
  const [activeCategory, setActiveCategory] = useState("recon");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  const activeCat = categories.find(c => c.id === activeCategory)!;

  const runTool = (tool: string) => {
    setSelectedTool(tool);
    setRunning(true);
    setOutput(`$ ${tool} --help\n\nLoading ${tool}...\n`);
    setTimeout(() => {
      setOutput(prev => prev + `\n[Kelvy AI] Tool "${tool}" would execute in the Docker container.\nIn production, this runs via the Python backend tool_runner.\nResults are analyzed by Ollama Mistral for plain-English explanation.\n\n[STATUS] Ready to execute. Configure target and parameters.`);
      setRunning(false);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold text-primary text-glow-green">LINUX TOOLS HUB</h1>
        <p className="text-sm text-muted-foreground font-mono">{categories.reduce((a, c) => a + c.tools.length, 0)} tools • 10 categories • AI-enhanced results</p>
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className={`font-display text-sm mb-3 ${activeCat.color}`}>{activeCat.label.toUpperCase()} TOOLS</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {activeCat.tools.map(tool => (
              <button key={tool} onClick={() => runTool(tool)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-mono transition ${
                  selectedTool === tool ? "bg-primary/20 text-primary border-glow-green" : "bg-muted/30 text-foreground hover:bg-muted/50"
                }`}>
                <Terminal className="w-3 h-3 shrink-0" />
                {tool}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm text-secondary text-glow-cyan">TERMINAL OUTPUT</h3>
            {selectedTool && (
              <button onClick={() => runTool(selectedTool)} className="flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono">
                <Play className="w-3 h-3" /> RUN
              </button>
            )}
          </div>
          <div className="bg-background rounded-md p-3 min-h-[300px] font-mono text-xs text-primary/80 whitespace-pre-wrap overflow-auto">
            {output || "Select a tool to begin..."}
            {running && <span className="animate-pulse">█</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
