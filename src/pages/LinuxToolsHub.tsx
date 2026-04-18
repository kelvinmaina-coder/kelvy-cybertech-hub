import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Terminal, Play, Loader2, AlertCircle, CheckCircle,
  Shield, Wifi, Lock, Globe, Database, Server,
  Code, Radio, Network, Eye, Download, Copy, X,
  ChevronDown, ChevronRight, Zap, Brain, Search, FileText,
  Clock, History, Settings, Info
} from "lucide-react";
import { toast } from "sonner";

interface Tool {
  name: string;
  description: string;
  options?: string[];
}

interface Category {
  [key: string]: Tool[];
}

interface ScanResult {
  id: string;
  tool: string;
  target: string;
  output: string;
  analysis: any;
  created_at: string;
  method?: string;
  executionTime?: number;
}

const categoryIcons: Record<string, any> = {
  "Information Gathering": Eye,
  "Network Analysis": Wifi,
  "Vulnerability Scanning": Shield,
  "Password Attacks": Lock,
  "Exploitation": Zap,
  "Forensics": Search,
  "Web Application": Globe,
  "Wireless": Radio,
  "Cryptography": Database,
  "System Security": Server,
  "System Administration": Server,
};

const categoryDescriptions: Record<string, string> = {
  "Information Gathering": "Gather intelligence about targets, domains, and networks",
  "Network Analysis": "Analyze network traffic, connections, and infrastructure",
  "Vulnerability Scanning": "Discover security weaknesses and potential exploits",
  "Password Attacks": "Test password strength and authentication systems",
  "Exploitation": "Execute controlled attacks and penetration testing",
  "Forensics": "Analyze digital evidence and system artifacts",
  "Web Application": "Test web applications for security vulnerabilities",
  "Wireless": "Audit wireless networks and WiFi security",
  "Cryptography": "Handle encryption, encoding, and cryptographic operations",
  "System Security": "Monitor system security and perform administrative tasks",
  "System Administration": "Monitor system security and perform administrative tasks",
};

const LinuxToolsHub = memo(() => {
  const { user, roles } = useAuth();
  const [categories, setCategories] = useState<Category>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [target, setTarget] = useState("");
  const [options, setOptions] = useState("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"output" | "analysis">("output");
  const [loading, setLoading] = useState(true);

  // Check permissions
  const canRunTools = useMemo(() => {
    return roles.some(role => ["super_admin", "security_analyst", "technician"].includes(role));
  }, [roles]);

  useEffect(() => {
    loadTools();
    checkOllamaStatus();
    loadScanHistory();
    
    // Refresh Ollama status every 30 seconds
    const interval = setInterval(checkOllamaStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTools = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/security/tools");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setCategories(data);
      // Auto-expand first category
      const firstCategory = Object.keys(data)[0];
      if (firstCategory) {
        setExpandedCategories(new Set([firstCategory]));
      }
      toast.success(`Loaded ${Object.keys(data).length} tool categories`);
    } catch (error) {
      console.error("Error loading tools:", error);
      toast.error("Failed to load security tools");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkOllamaStatus = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/api/security/check-ollama");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setOllamaStatus(data.running);
    } catch (error) {
      setOllamaStatus(false);
    }
  }, []);

  const loadScanHistory = useCallback(async () => {
    try {
      const saved = localStorage.getItem("scan_history");
      if (saved) {
        setScanHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading scan history:", error);
    }
  }, []);

  const saveToHistory = useCallback((result: ScanResult) => {
    const newHistory = [result, ...scanHistory].slice(0, 20);
    setScanHistory(newHistory);
    localStorage.setItem("scan_history", JSON.stringify(newHistory));
  }, [scanHistory]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const selectTool = useCallback((tool: Tool) => {
    setSelectedTool(tool);
    setTarget("");
    setOptions("");
    setOutput("");
    setAnalysis(null);
    setActiveTab("output");
  }, []);

  const runTool = useCallback(async () => {
    if (!selectedTool || !canRunTools) {
      toast.error("Invalid tool or permission denied");
      return;
    }

    // Check if target is required
    const toolsNoTarget = ["ps", "netstat", "ss", "htop", "btop", "top", "df", "free", "mount"];
    if (!target && !toolsNoTarget.includes(selectedTool.name)) {
      toast.error("Please enter a target (IP, domain, or path)");
      return;
    }

    setRunning(true);
    setOutput("");
    setAnalysis(null);
    setActiveTab("output");

    try {
      const startTime = Date.now();
      const response = await fetch("http://localhost:8000/api/security/run-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: selectedTool.name,
          target: target || "default",
          args: options ? options.split(" ") : []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const runResult = await response.json();
      const executionTime = Date.now() - startTime;

      setOutput(runResult.raw_output || "(no output)");
      
      if (runResult.ai_analysis) {
        setAnalysis({
          summary: runResult.ai_analysis,
          severity: runResult.severity || "Info",
          findings: [],
          recommendations: []
        });
      }

      // Save to history
      saveToHistory({
        id: Date.now().toString(),
        tool: selectedTool.name,
        target: target || "default",
        output: (runResult.raw_output || "").substring(0, 2000),
        analysis: runResult.ai_analysis,
        method: "direct",
        created_at: new Date().toISOString(),
        executionTime
      });

      toast.success(`Tool executed in ${(executionTime / 1000).toFixed(2)}s`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setOutput(`Error: ${errorMsg}`);
      toast.error(`Failed to run tool: ${errorMsg}`);
    } finally {
      setRunning(false);
    }
  }, [selectedTool, target, options, canRunTools, saveToHistory]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  }, []);

  const totalTools = useMemo(() => {
    return Object.values(categories).reduce((sum, tools) => sum + tools.length, 0);
  }, [categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading security tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Terminal className="w-8 h-8" />
              Linux Tools Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalTools} tools • Cross-platform execution • Real-time AI analysis
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${ollamaStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {ollamaStatus ? 'AI Ready' : 'AI Offline'}
              </span>
            </div>
            {!canRunTools && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                Read-only mode
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-0 divide-x divide-border">
          
          {/* Tools Sidebar */}
          <div className="lg:col-span-1 overflow-y-auto border-r bg-muted/30">
            <div className="p-4 border-b sticky top-0 bg-background z-10">
              <h2 className="font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Categories
              </h2>
            </div>

            <div className="p-2 space-y-1">
              {Object.entries(categories).map(([category, tools]) => {
                const Icon = categoryIcons[category] || Shield;
                const isExpanded = expandedCategories.has(category);

                return (
                  <div key={category} className="space-y-1">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{category}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{tools.length}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {tools.map((tool) => (
                          <button
                            key={tool.name}
                            onClick={() => selectTool(tool)}
                            className={`w-full text-left p-2 rounded text-sm transition-colors ${
                              selectedTool?.name === tool.name
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted/60 text-foreground'
                            }`}
                            title={tool.description}
                          >
                            <div className="font-mono font-medium">{tool.name}</div>
                            <div className="text-xs opacity-70 line-clamp-1">
                              {tool.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 flex flex-col">
            {selectedTool ? (
              <>
                {/* Tool Header */}
                <div className="border-b p-4 bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-primary">{selectedTool.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTool.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input Panel */}
                {canRunTools && (
                  <div className="border-b p-4 bg-muted/30 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium block mb-1">Target / IP / Domain</label>
                        <input
                          type="text"
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          placeholder="192.168.1.1, example.com, file.txt"
                          className="w-full px-3 py-2 border rounded-lg bg-background font-mono text-sm"
                          disabled={running}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Additional Options</label>
                        <input
                          type="text"
                          value={options}
                          onChange={(e) => setOptions(e.target.value)}
                          placeholder="-sV -p- --script vuln"
                          className="w-full px-3 py-2 border rounded-lg bg-background font-mono text-sm"
                          disabled={running}
                        />
                      </div>
                    </div>
                    <button
                      onClick={runTool}
                      disabled={running}
                      className="w-full max-w-xs px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                    >
                      {running ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Run Tool
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Output Tabs */}
                {(output || analysis) && (
                  <>
                    <div className="border-b flex">
                      <button
                        onClick={() => setActiveTab("output")}
                        className={`px-4 py-2 font-medium text-sm transition ${
                          activeTab === "output"
                            ? "border-b-2 border-primary text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        📄 Raw Output
                      </button>
                      {analysis && (
                        <button
                          onClick={() => setActiveTab("analysis")}
                          className={`px-4 py-2 font-medium text-sm transition ${
                            activeTab === "analysis"
                              ? "border-b-2 border-primary text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          🤖 AI Analysis
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                      {activeTab === "output" && (
                        <div className="space-y-2">
                          <button
                            onClick={() => copyToClipboard(output)}
                            className="px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Output
                          </button>
                          <pre className="bg-black/80 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-xs whitespace-pre-wrap break-words">
                            {output}
                          </pre>
                        </div>
                      )}

                      {activeTab === "analysis" && analysis && (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-lg border ${
                            analysis.severity === "Critical" ? "bg-red-50 border-red-200" :
                            analysis.severity === "High" ? "bg-orange-50 border-orange-200" :
                            analysis.severity === "Medium" ? "bg-yellow-50 border-yellow-200" :
                            "bg-green-50 border-green-200"
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-5 h-5 text-primary" />
                              <span className="font-semibold">AI Analysis</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                analysis.severity === "Critical" ? "bg-red-200 text-red-800" :
                                analysis.severity === "High" ? "bg-orange-200 text-orange-800" :
                                analysis.severity === "Medium" ? "bg-yellow-200 text-yellow-800" :
                                "bg-green-200 text-green-800"
                              }`}>
                                {analysis.severity || "Info"}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{analysis.summary}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === "analysis" && !analysis && !running && (
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                          <div className="text-center">
                            <Brain className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Run a tool to see AI analysis</p>
                            {!ollamaStatus && (
                              <p className="text-xs text-red-500 mt-2">
                                Start Ollama: ollama serve
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!output && !running && (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div>
                      <Terminal className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {canRunTools ? "Run the tool to see output" : "You don't have permission to run tools"}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h2 className="text-xl font-semibold mb-2">Select a Tool</h2>
                  <p className="text-muted-foreground">
                    Choose a security tool from the left sidebar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="hidden lg:block lg:col-span-1 border-l bg-muted/30 overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-background z-10">
              <h2 className="font-semibold flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Recent
              </h2>
            </div>

            <div className="p-2 space-y-2">
              {scanHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No scans yet
                </p>
              ) : (
                scanHistory.map((scan) => (
                  <div key={scan.id} className="p-2 border rounded-lg bg-card hover:bg-muted/50 cursor-pointer transition text-xs">
                    <div className="font-medium truncate">{scan.tool}</div>
                    <div className="text-muted-foreground truncate">Target: {scan.target}</div>
                    <div className="text-muted-foreground">
                      {new Date(scan.created_at).toLocaleTimeString()}
                    </div>
                    {scan.executionTime && (
                      <div className="text-muted-foreground">
                        {(scan.executionTime / 1000).toFixed(2)}s
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Stats */}
            <div className="p-4 border-t space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Tools</span>
                  <span className="font-medium">{totalTools}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categories</span>
                  <span className="font-medium">{Object.keys(categories).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scans</span>
                  <span className="font-medium">{scanHistory.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

LinuxToolsHub.displayName = 'LinuxToolsHub';

export default LinuxToolsHub;
