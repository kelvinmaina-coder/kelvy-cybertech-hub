import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  FolderTree, File, FileCode, Terminal as TerminalIcon, Save, Play,
  Plus, Trash2, Edit2, X, ChevronRight, ChevronDown,
  Copy, Download, Upload, RefreshCw, Maximize2, Minimize2,
  Settings, Search, GitBranch, Book, Coffee, HelpCircle
} from "lucide-react";

// Import Monaco Editor dynamically
import Editor from "@monaco-editor/react";

interface FileItem {
  name: string;
  path: string;
  is_directory: boolean;
  size: number;
  modified: string;
  extension: string | null;
}

interface Tab {
  path: string;
  name: string;
  content: string;
  language: string;
  is_dirty: boolean;
}

interface Language {
  name: string;
  extensions: string[];
  comment: string | null;
  run_command: string | null;
}

const LANGUAGES: Record<string, Language> = {
  python: { name: "Python", extensions: [".py"], comment: "#", run_command: "python {file}" },
  javascript: { name: "JavaScript", extensions: [".js"], comment: "//", run_command: "node {file}" },
  typescript: { name: "TypeScript", extensions: [".ts"], comment: "//", run_command: "ts-node {file}" },
  html: { name: "HTML", extensions: [".html"], comment: "<!-- -->", run_command: null },
  css: { name: "CSS", extensions: [".css"], comment: "/* */", run_command: null },
  json: { name: "JSON", extensions: [".json"], comment: null, run_command: null },
  markdown: { name: "Markdown", extensions: [".md"], comment: null, run_command: null },
  go: { name: "Go", extensions: [".go"], comment: "//", run_command: "go run {file}" },
  bash: { name: "Bash", extensions: [".sh"], comment: "#", run_command: "bash {file}" },
  sql: { name: "SQL", extensions: [".sql"], comment: "--", run_command: null },
  plaintext: { name: "Plain Text", extensions: [".txt"], comment: null, run_command: null }
};

export default function IDEPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalReady, setTerminalReady] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [creatingFile, setCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showRunPanel, setShowRunPanel] = useState(false);
  const [runOutput, setRunOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const sessionId = useRef(Math.random().toString(36).substring(7));
  
  // Load files on path change
  useEffect(() => {
    loadFiles();
  }, [currentPath]);
  
  // Setup WebSocket terminal
  useEffect(() => {
    connectTerminal();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  const connectTerminal = () => {
    const ws = new WebSocket(`ws://localhost:8000/api/ide/ws/terminal/${sessionId.current}?working_dir=${currentPath || "."}`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setTerminalReady(true);
      addTerminalOutput("Terminal ready\r\n");
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "output") {
        addTerminalOutput(data.data);
      }
    };
    
    ws.onerror = (error) => {
      addTerminalOutput(`\r\nTerminal error: ${error}\r\n`);
    };
  };
  
  const addTerminalOutput = (output: string) => {
    setTerminalOutput(prev => [...prev, output]);
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100);
  };
  
  const sendTerminalCommand = () => {
    if (!terminalInput.trim()) return;
    if (wsRef.current && terminalReady) {
      wsRef.current.send(JSON.stringify({ type: "input", data: terminalInput + "\n" }));
      addTerminalOutput(terminalInput + "\r\n");
      setTerminalInput("");
    }
  };
  
  const loadFiles = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/ide/files?path=${encodeURIComponent(currentPath)}`);
      const result = await response.json();
      if (result.success) {
        setFiles(result.data);
      }
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };
  
  const openFile = async (filePath: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/ide/file?path=${encodeURIComponent(filePath)}`);
      const result = await response.json();
      if (result.success && !result.data.is_binary) {
        const ext = filePath.substring(filePath.lastIndexOf("."));
        let language = "plaintext";
        for (const [lang, config] of Object.entries(LANGUAGES)) {
          if (config.extensions.includes(ext)) {
            language = lang;
            break;
          }
        }
        
        const existingTab = tabs.find(t => t.path === filePath);
        if (existingTab) {
          setActiveTab(filePath);
        } else {
          setTabs([...tabs, {
            path: filePath,
            name: filePath.split("/").pop() || filePath,
            content: result.data.content,
            language: language,
            is_dirty: false
          }]);
          setActiveTab(filePath);
        }
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };
  
  const saveFile = async () => {
    if (!activeTab) return;
    const tab = tabs.find(t => t.path === activeTab);
    if (!tab) return;
    
    try {
      const response = await fetch("http://localhost:8000/api/ide/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: tab.path, content: tab.content })
      });
      const result = await response.json();
      if (result.success) {
        setTabs(tabs.map(t => t.path === activeTab ? { ...t, is_dirty: false } : t));
        addTerminalOutput(`\r\n✅ Saved: ${tab.path}\r\n`);
      }
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };
  
  const updateFileContent = (content: string | undefined) => {
    if (!activeTab || !content) return;
    setTabs(tabs.map(t => t.path === activeTab ? { ...t, content: content, is_dirty: true } : t));
  };
  
  const closeTab = (path: string) => {
    const newTabs = tabs.filter(t => t.path !== path);
    setTabs(newTabs);
    if (activeTab === path && newTabs.length > 0) {
      setActiveTab(newTabs[0].path);
    } else if (newTabs.length === 0) {
      setActiveTab(null);
    }
  };
  
  const createNewFile = async () => {
    if (!newFileName) return;
    const filePath = currentPath ? `${currentPath}/${newFileName}` : newFileName;
    
    try {
      const response = await fetch("http://localhost:8000/api/ide/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath, content: getTemplateForExtension(newFileName) })
      });
      const result = await response.json();
      if (result.success) {
        setCreatingFile(false);
        setNewFileName("");
        loadFiles();
        openFile(filePath);
      }
    } catch (error) {
      console.error("Error creating file:", error);
    }
  };
  
  const createDirectory = async () => {
    if (!newFileName) return;
    const dirPath = currentPath ? `${currentPath}/${newFileName}` : newFileName;
    
    try {
      const response = await fetch("http://localhost:8000/api/ide/mkdir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: dirPath, is_directory: true })
      });
      const result = await response.json();
      if (result.success) {
        setCreatingFile(false);
        setNewFileName("");
        loadFiles();
      }
    } catch (error) {
      console.error("Error creating directory:", error);
    }
  };
  
  const deleteFile = async (filePath: string) => {
    if (confirm(`Delete ${filePath}?`)) {
      try {
        const response = await fetch(`http://localhost:8000/api/ide/file?path=${encodeURIComponent(filePath)}`, {
          method: "DELETE"
        });
        const result = await response.json();
        if (result.success) {
          loadFiles();
          closeTab(filePath);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };
  
  const runFile = async () => {
    if (!activeTab) return;
    const tab = tabs.find(t => t.path === activeTab);
    if (!tab) return;
    
    setIsRunning(true);
    setShowRunPanel(true);
    setRunOutput("Running...\n");
    
    try {
      const language = LANGUAGES[tab.language];
      if (language?.run_command) {
        const command = language.run_command.replace("{file}", tab.path);
        const response = await fetch(`http://localhost:8000/api/ide/run-command?command=${encodeURIComponent(command)}&working_dir=${encodeURIComponent(currentPath)}`);
        const result = await response.json();
        setRunOutput(result.output);
        addTerminalOutput(`\r\n$ ${command}\r\n${result.output}\r\n`);
      } else {
        setRunOutput("No run command configured for this file type");
      }
    } catch (error) {
      setRunOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };
  
  const getTemplateForExtension = (filename: string): string => {
    const ext = filename.substring(filename.lastIndexOf("."));
    const templates: Record<string, string> = {
      ".py": '# Python file\n\nprint("Hello, World!")\n',
      ".js": '// JavaScript file\n\nconsole.log("Hello, World!");\n',
      ".ts": '// TypeScript file\n\nconst message: string = "Hello, World!";\nconsole.log(message);\n',
      ".html": '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n',
      ".css": '/* CSS file */\n\nbody {\n    font-family: Arial, sans-serif;\n}\n',
      ".json": '{\n    "name": "example",\n    "version": "1.0.0"\n}\n',
      ".md": '# Markdown File\n\nHello, World!\n',
      ".sh": '#!/bin/bash\n\necho "Hello, World!"\n',
      ".sql": '-- SQL File\n\nSELECT * FROM users;\n'
    };
    return templates[ext] || '# New file\n\n';
  };
  
  const renderFileTree = (items: FileItem[], level: number = 0) => {
    return items.map((item) => (
      <div key={item.path} style={{ marginLeft: level * 16 }}>
        <div
          className="flex items-center gap-1 py-0.5 px-1 hover:bg-muted rounded cursor-pointer group"
          onClick={() => !item.is_directory && openFile(item.path)}
          onDoubleClick={() => item.is_directory && setCurrentPath(item.path)}
        >
          {item.is_directory ? (
            <FolderTree className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
          ) : (
            <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          )}
          <span className="text-xs truncate flex-1">{item.name}</span>
          {!item.is_directory && (
            <button
              onClick={(e) => { e.stopPropagation(); deleteFile(item.path); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/20 rounded"
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </button>
          )}
        </div>
        {item.is_directory && (
          <div className="ml-2">
            {renderFileTree(files.filter(f => f.path.startsWith(item.path + "/") && f.path !== item.path), level + 1)}
          </div>
        )}
      </div>
    ));
  };
  
  const activeTabContent = tabs.find(t => t.path === activeTab);
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b border-border p-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded hover:bg-muted transition"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={loadFiles} className="p-1.5 rounded hover:bg-muted transition" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setCreatingFile(true)} className="p-1.5 rounded hover:bg-muted transition" title="New File">
            <Plus className="w-4 h-4" />
          </button>
          {activeTab && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <button onClick={saveFile} className="p-1.5 rounded hover:bg-muted transition" title="Save">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={runFile} className="p-1.5 rounded hover:bg-green-500/20 text-green-500 transition" title="Run">
                <Play className="w-4 h-4" />
              </button>
            </>
          )}
          <div className="w-px h-6 bg-border mx-1" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-2 py-1 rounded border border-border bg-background text-xs"
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key}>{lang.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`p-1.5 rounded transition ${showTerminal ? "bg-primary/20 text-primary" : "hover:bg-muted"}`}
          >
            <TerminalIcon className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground">{user?.email}</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer Sidebar */}
        {!sidebarCollapsed && (
          <div className="w-64 border-r border-border overflow-y-auto p-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold">EXPLORER</span>
              <button onClick={() => setCurrentPath("")} className="text-xs text-muted-foreground hover:text-foreground">
                Root
              </button>
            </div>
            {currentPath && (
              <button
                onClick={() => setCurrentPath(currentPath.split("/").slice(0, -1).join("/"))}
                className="text-xs text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
              >
                ← .. (parent)
              </button>
            )}
            <div className="space-y-0.5">
              {renderFileTree(files)}
            </div>
          </div>
        )}
        
        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          {tabs.length > 0 && (
            <div className="border-b border-border flex overflow-x-auto">
              {tabs.map(tab => (
                <div
                  key={tab.path}
                  className={`flex items-center gap-2 px-3 py-1.5 border-r border-border cursor-pointer text-sm ${
                    activeTab === tab.path ? "bg-muted/50 border-b-2 border-b-primary" : "hover:bg-muted/30"
                  }`}
                  onClick={() => setActiveTab(tab.path)}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                  {tab.is_dirty && <span className="w-2 h-2 rounded-full bg-yellow-500" />}
                  <button onClick={(e) => { e.stopPropagation(); closeTab(tab.path); }} className="hover:bg-muted rounded p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Monaco Editor */}
          <div className="flex-1">
            {activeTabContent ? (
              <Editor
                height="100%"
                language={activeTabContent.language}
                value={activeTabContent.content}
                onChange={updateFileContent}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: "on"
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a file from the explorer to start editing</p>
                  <p className="text-sm mt-2">Create new files with the + button</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Terminal */}
      {showTerminal && (
        <div className="border-t border-border h-64 flex flex-col">
          <div className="bg-muted/50 px-3 py-1 flex items-center justify-between border-b border-border">
            <span className="text-xs font-mono">Terminal</span>
            <button onClick={() => setShowTerminal(false)} className="p-0.5 hover:bg-muted rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div ref={terminalRef} className="flex-1 overflow-y-auto p-2 bg-black text-green-400 font-mono text-xs">
            {terminalOutput.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap">{line}</div>
            ))}
            <div className="flex items-center">
              <span className="text-green-500">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendTerminalCommand()}
                className="flex-1 bg-transparent border-none outline-none ml-2 text-green-400 font-mono text-xs"
                placeholder="Type command..."
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Run Panel */}
      {showRunPanel && (
        <div className="fixed bottom-20 right-4 w-96 bg-card border border-border rounded-lg shadow-xl z-50">
          <div className="flex items-center justify-between p-2 border-b border-border">
            <span className="text-xs font-semibold">Run Output</span>
            <button onClick={() => setShowRunPanel(false)} className="p-1 hover:bg-muted rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">{runOutput}</pre>
            {isRunning && (
              <div className="flex items-center gap-2 mt-2 text-primary">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Running...</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Create File Modal */}
      {creatingFile && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setCreatingFile(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-card border border-border rounded-lg shadow-xl z-50 p-4">
            <h3 className="font-semibold mb-3">Create New</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.py"
              className="w-full px-3 py-2 rounded border border-border bg-background mb-3"
              onKeyPress={(e) => e.key === "Enter" && createNewFile()}
            />
            <div className="flex gap-2">
              <button onClick={createNewFile} className="flex-1 py-1.5 rounded bg-primary text-primary-foreground">File</button>
              <button onClick={createDirectory} className="flex-1 py-1.5 rounded border border-border hover:bg-muted">Directory</button>
              <button onClick={() => setCreatingFile(false)} className="px-3 py-1.5 rounded border border-border hover:bg-muted">Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
