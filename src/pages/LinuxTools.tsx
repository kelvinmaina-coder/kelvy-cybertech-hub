import { useState, useEffect } from "react";
import { Terminal, Play, Loader2, Shield, Wifi, Database, Key, Lock, Globe, Zap, HardDrive, Cpu, Eye, Scan } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const toolCategories = [
  { 
    name: "🔍 NETWORK SCANNING", icon: Wifi, color: "border-cyan-500/30 bg-cyan-500/10",
    tools: [
      { name: "nmap", command: "nmap -sV", description: "Network discovery & security scanning" },
      { name: "netstat", command: "netstat -tulpn", description: "Network connections & ports" },
      { name: "traceroute", command: "traceroute google.com", description: "Trace network path" },
      { name: "ping", command: "ping -c 4 google.com", description: "Test network connectivity" }
    ]
  },
  { 
    name: "🛡️ VULNERABILITY", icon: Shield, color: "border-red-500/30 bg-red-500/10",
    tools: [
      { name: "nikto", command: "nikto -h localhost", description: "Web server vulnerability scanner" },
      { name: "sqlmap", command: "sqlmap --version", description: "SQL injection detection" },
      { name: "nuclei", command: "nuclei -version", description: "Fast vulnerability scanner" },
      { name: "gobuster", command: "gobuster --help", description: "Directory/file brute-forcing" }
    ]
  },
  { 
    name: "💻 SYSTEM", icon: Cpu, color: "border-green-500/30 bg-green-500/10",
    tools: [
      { name: "htop", command: "htop", description: "Process monitoring" },
      { name: "df", command: "df -h", description: "Disk space usage" },
      { name: "free", command: "free -h", description: "Memory usage" },
      { name: "top", command: "top -n 1", description: "System processes" }
    ]
  },
  { 
    name: "🔐 SECURITY", icon: Lock, color: "border-purple-500/30 bg-purple-500/10",
    tools: [
      { name: "fail2ban-client", command: "fail2ban-client status", description: "Ban status" },
      { name: "iptables", command: "iptables -L -n", description: "Firewall rules" },
      { name: "lynis", command: "lynis --version", description: "Security auditing" },
      { name: "rkhunter", command: "rkhunter --version", description: "Rootkit hunter" }
    ]
  },
  { 
    name: "🔑 CRYPTO", icon: Key, color: "border-yellow-500/30 bg-yellow-500/10",
    tools: [
      { name: "openssl", command: "openssl version", description: "Cryptography toolkit" },
      { name: "gpg", command: "gpg --version", description: "Encryption" },
      { name: "hashcat", command: "hashcat --version", description: "Password cracking" },
      { name: "john", command: "john --version", description: "Password security" }
    ]
  },
  { 
    name: "🌐 WEB", icon: Globe, color: "border-blue-500/30 bg-blue-500/10",
    tools: [
      { name: "curl", command: "curl -I google.com", description: "HTTP requests" },
      { name: "wget", command: "wget --version", description: "File downloading" },
      { name: "ffuf", command: "ffuf -h", description: "Web fuzzing" },
      { name: "wfuzz", command: "wfuzz --help", description: "Web bruteforcing" }
    ]
  },
  { 
    name: "📊 DATABASE", icon: Database, color: "border-orange-500/30 bg-orange-500/10",
    tools: [
      { name: "psql", command: "psql --version", description: "PostgreSQL client" },
      { name: "mysql", command: "mysql --version", description: "MySQL client" },
      { name: "redis-cli", command: "redis-cli --version", description: "Redis client" },
      { name: "mongosh", command: "mongosh --version", description: "MongoDB client" }
    ]
  },
  { 
    name: "⚡ PERFORMANCE", icon: Zap, color: "border-pink-500/30 bg-pink-500/10",
    tools: [
      { name: "iperf3", command: "iperf3 --version", description: "Network performance" },
      { name: "ab", command: "ab --version", description: "Apache benchmark" },
      { name: "stress", command: "stress --version", description: "System stress test" },
      { name: "vmstat", command: "vmstat 1 5", description: "Virtual memory stats" }
    ]
  }
];

export default function LinuxTools() {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState(null);
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase.from("scans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    setScanHistory(data || []);
  };

  const runTool = async () => {
    if (!selectedTool) { toast.error("Select a tool first"); return; }
    if (!command.trim()) { toast.error("Enter command or use the default"); return; }
    
    setLoading(true);
    setOutput("Running...");
    setAiAnalysis("");

    try {
      const res = await fetch("http://localhost:8000/api/security/run-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: selectedTool.name, args: command.split(" ") }),
      });
      
      const data = await res.json();
      setOutput(data.raw_output || data.output || "No output");
      setAiAnalysis(data.ai_analysis || "Analysis complete");
      setSeverity(data.severity || "info");

      // Save to database
      await supabase.from("scans").insert({
        user_id: user?.id,
        tool_name: selectedTool.name,
        target: command,
        output: (data.raw_output || "").substring(0, 1000),
        ai_analysis: data.ai_analysis,
        severity: data.severity,
        duration_ms: data.duration_ms || 0,
      });
      loadHistory();
      toast.success("Scan completed");
    } catch (error) {
      setOutput("❌ Backend not running. Start with: python kelvy_backend.py");
      toast.error("Backend not reachable");
    }
    setLoading(false);
  };

  const getSeverityColor = (sev) => {
    if (sev === "critical") return "bg-red-500 text-white";
    if (sev === "high") return "bg-orange-500 text-white";
    if (sev === "medium") return "bg-yellow-500 text-black";
    return "bg-blue-500 text-white";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-accent">🛠️ LINUX TOOLS HUB</h1>
        <p className="text-sm text-muted-foreground font-mono">70+ real security tools with AI-powered analysis</p>
      </div>

      {/* Horizontal categories - scrollable */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {toolCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className={`rounded-xl border ${cat.color} p-3 min-w-[200px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold">{cat.name}</span>
                </div>
                <div className="space-y-1">
                  {cat.tools.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => { setSelectedTool(tool); setCommand(tool.command); }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-all ${selectedTool?.name === tool.name ? "bg-accent/30 text-accent" : "hover:bg-accent/10 text-muted-foreground"}`}
                    >
                      <span className="font-bold">${tool.name}</span>
                      <p className="text-[9px] opacity-70">{tool.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Run panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Command */}
        <div className="glass rounded-xl p-5 border border-accent/20">
          <h3 className="font-mono font-bold text-foreground mb-3 flex items-center gap-2"><Terminal className="w-4 h-4 text-accent" /> Execute Command</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-border">
              <span className="text-accent font-mono text-sm">$</span>
              <input type="text" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Enter command..." className="flex-1 bg-transparent border-none text-sm font-mono text-green-400 focus:outline-none" />
            </div>
            <button onClick={runTool} disabled={loading} className="w-full py-2.5 rounded-lg bg-accent text-accent-foreground font-mono text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run {selectedTool?.name || "Tool"}
            </button>
            {selectedTool && (
              <div className="text-xs text-muted-foreground font-mono p-2 rounded-lg bg-accent/5">
                <span className="text-accent">ℹ️</span> {selectedTool.description}
              </div>
            )}
          </div>
        </div>

        {/* Right - Output & AI Analysis */}
        <div className="space-y-4">
          <div className="glass rounded-xl p-5">
            <h3 className="font-mono font-bold text-foreground mb-2">📋 Raw Output</h3>
            <pre className="bg-black/50 rounded-lg p-3 text-xs text-green-400 font-mono overflow-x-auto max-h-48">{output || "Output will appear here..."}</pre>
          </div>
          
          <div className={`glass rounded-xl p-5 border ${severity ? (severity === "critical" ? "border-red-500" : severity === "high" ? "border-orange-500" : "border-accent/20") : "border-accent/20"}`}>
            <h3 className="font-mono font-bold text-foreground mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /> 🤖 AI Analysis</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiAnalysis || "AI analysis will appear after running a tool"}</p>
            {severity && <div className={`mt-3 inline-block px-2 py-1 rounded text-xs font-mono ${getSeverityColor(severity)}`}>Severity: {severity.toUpperCase()}</div>}
          </div>
        </div>
      </div>

      {/* Scan History */}
      <div className="glass rounded-xl p-5">
        <h3 className="font-mono font-bold text-foreground mb-3">📜 Scan History (Last 20)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
          {scanHistory.map((scan) => (
            <div key={scan.id} className="p-2 rounded-lg bg-background border border-border text-center">
              <p className="text-xs font-mono text-accent">{scan.tool_name}</p>
              <p className="text-[9px] text-muted-foreground">{new Date(scan.created_at).toLocaleString()}</p>
              <span className={`text-[8px] px-1 py-0.5 rounded ${scan.severity === "critical" ? "bg-red-500" : "bg-blue-500"} text-white`}>{scan.severity}</span>
            </div>
          ))}
          {scanHistory.length === 0 && <p className="text-xs text-muted-foreground col-span-full text-center">No scans yet. Run a tool above!</p>}
        </div>
      </div>
    </div>
  );
}
