import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Terminal, Play, Loader2, AlertCircle, CheckCircle,
  Shield, Wifi, Lock, Globe, Database, Server,
  Code, Radio, Network, Eye, Download, Copy,
  ChevronDown, ChevronRight, Zap, Brain, Search, FileText
} from "lucide-react";

interface Tool {
  name: string;
  description: string;
  options: string[];
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
  "System Security": Server
};

export default function LinuxToolsHub() {
  const { user } = useAuth();
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

  useEffect(() => {
    loadTools();
    checkOllamaStatus();
    loadScanHistory();
  }, []);

  const loadTools = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/security/tools");
      const data = await response.json();
      setCategories(data);
      const firstCategory = Object.keys(data)[0];
      if (firstCategory) {
        setExpandedCategories(new Set([firstCategory]));
      }
    } catch (error) {
      console.error("Error loading tools:", error);
    }
  };

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/security/check-ollama");
      const data = await response.json();
      setOllamaStatus(data.running);
    } catch (error) {
      setOllamaStatus(false);
    }
  };

  const loadScanHistory = async () => {
    const saved = localStorage.getItem("scan_history");
    if (saved) {
      setScanHistory(JSON.parse(saved));
    }
  };

  const saveToHistory = (result: ScanResult) => {
    const newHistory = [result, ...scanHistory].slice(0, 20);
    setScanHistory(newHistory);
    localStorage.setItem("scan_history", JSON.stringify(newHistory));
  };

  const runTool = async () => {
    if (!selectedTool) return;
    if (!target && selectedTool.name !== "ps" && selectedTool.name !== "netstat") {
      alert("Please enter a target (IP, domain, or port)");
      return;
    }

    setRunning(true);
    setOutput("");
    setAnalysis(null);
    setActiveTab("output");

    try {
      const runResponse = await fetch("http://localhost:8000/api/security/run-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: selectedTool.name,
          target: target || "default",
          options: options
        })
      });
      const runResult = await runResponse.json();

      if (runResult.success) {
        setOutput(runResult.output);
        
        if (ollamaStatus) {
          const analyzeResponse = await fetch("http://localhost:8000/api/security/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tool: selectedTool.name,
              output: runResult.output
            })
          });
          const analyzeResult = await analyzeResponse.json();
          setAnalysis(analyzeResult);
        }
        
        saveToHistory({
          id: Date.now().toString(),
          tool: selectedTool.name,
          target: target || "system",
          output: runResult.output.substring(0, 1000),
          analysis: analysis,
          created_at: new Date().toISOString()
        });
      } else {
        setOutput(`Error: ${runResult.output}`);
      }
    } catch (error) {
      setOutput(`Error running tool: ${error}`);
    } finally {
      setRunning(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-100 text-red-600";
      case "high": return "bg-orange-100 text-orange-600";
      case "medium": return "bg-yellow-100 text-yellow-600";
      case "low": return "bg-blue-100 text-blue-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (!categories || Object.keys(categories).length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-border overflow-y-auto shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Security Tools
          </h2>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${ollamaStatus ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-muted-foreground">
              Ollama: {ollamaStatus ? "Connected" : "Not running"}
            </span>
          </div>
        </div>

        <div className="p-2">
          {Object.entries(categories).map(([category, tools]) => {
            const Icon = categoryIcons[category] || Shield;
            const isExpanded = expandedCategories.has(category);
            
            return (
              <div key={category} className="mb-2">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-xs text-muted-foreground">({tools.length})</span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {isExpanded && (
                  <div className="ml-6 space-y-1 mt-1">
                    {tools.map((tool: Tool) => (
                      <button
                        key={tool.name}
                        onClick={() => {
                          setSelectedTool(tool);
                          setOptions("");
                        }}
                        className={`w-full text-left p-2 rounded-lg text-sm transition ${
                          selectedTool?.name === tool.name
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="font-mono text-xs">{tool.name}</div>
                        <div className="text-[10px] opacity-70 truncate">{tool.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedTool ? (
          <>
            <div className="border-b border-border p-4">
              <h1 className="text-xl font-display font-bold">{selectedTool.name}</h1>
              <p className="text-sm text-muted-foreground">{selectedTool.description}</p>
            </div>

            <div className="p-4 border-b border-border space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Target / Arguments</label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g., 192.168.1.1, example.com, 80"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-sm"
                />
              </div>
              
              {selectedTool.options && selectedTool.options.length > 0 && (
                <div>
                  <label className="text-sm font-medium block mb-1">Additional Options</label>
                  <select
                    value={options}
                    onChange={(e) => setOptions(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="">No options</option>
                    {selectedTool.options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <button
                onClick={runTool}
                disabled={running}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {running ? "Running..." : "Run Tool"}
              </button>
            </div>

            <div className="border-b border-border flex">
              <button
                onClick={() => setActiveTab("output")}
                className={`px-4 py-2 text-sm transition ${activeTab === "output" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
              >
                📄 Raw Output
              </button>
              <button
                onClick={() => setActiveTab("analysis")}
                className={`px-4 py-2 text-sm transition ${activeTab === "analysis" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
              >
                🤖 AI Analysis
                {!ollamaStatus && <span className="ml-1 text-xs text-red-500">(Offline)</span>}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "output" && (
                <pre className="bg-black/90 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-xs">
                  {output || "Click 'Run Tool' to see output..."}
                </pre>
              )}
              
              {activeTab === "analysis" && analysis && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${getSeverityColor(analysis.severity)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {analysis.severity?.toLowerCase() === "critical" && <AlertCircle className="w-5 h-5" />}
                      {analysis.severity?.toLowerCase() === "high" && <AlertCircle className="w-5 h-5" />}
                      {analysis.severity?.toLowerCase() === "medium" && <AlertCircle className="w-5 h-5" />}
                      {analysis.severity?.toLowerCase() === "low" && <CheckCircle className="w-5 h-5" />}
                      <span className="font-bold">Severity: {analysis.severity || "Info"}</span>
                    </div>
                    <p className="text-sm">{analysis.summary}</p>
                  </div>
                  
                  {analysis.findings && analysis.findings.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">📋 Key Findings</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.findings.map((finding: string, i: number) => (
                          <li key={i} className="text-sm">{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">💡 Recommendations</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "analysis" && !analysis && !running && (
                <div className="text-center text-muted-foreground py-12">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Run a tool first, then AI analysis will appear here</p>
                  {!ollamaStatus && (
                    <p className="text-xs mt-2 text-red-500">Ollama is not running. Start with: ollama serve</p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <Terminal className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Select a Tool</h2>
              <p className="text-muted-foreground">Choose a security tool from the left sidebar</p>
            </div>
          </div>
        )}
      </div>

      {/* History Sidebar */}
      <div className="w-64 border-l border-border overflow-y-auto shrink-0">
        <div className="p-3 border-b border-border">
          <h3 className="text-sm font-semibold">📜 Scan History</h3>
        </div>
        <div className="p-2 space-y-2">
          {scanHistory.map((scan) => (
            <div key={scan.id} className="p-2 rounded-lg bg-muted/30 text-sm">
              <div className="font-mono text-xs font-bold">{scan.tool}</div>
              <div className="text-xs text-muted-foreground truncate">{scan.target}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {new Date(scan.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {scanHistory.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No scans yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
