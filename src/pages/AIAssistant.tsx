import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Sparkles, Code, Shield, FileText, Settings2, Loader2, WifiOff } from "lucide-react";
import { streamOllamaChat, listOllamaModels, OllamaMessage } from "@/lib/ollama";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Kelvy AI, the intelligent assistant for Kelvy CyberTech Hub — a comprehensive AI-powered enterprise computing platform. You specialize in:
- Cybersecurity analysis and guidance
- Linux security tools (nmap, metasploit, wireshark, etc.)
- Code generation and review
- Network analysis and monitoring
- Business intelligence and operations
- System administration

You are running locally via Ollama — 100% private, 100% offline capable. Be concise, technical, and actionable. Use markdown formatting for code blocks and structured output.`;

const quickActions = [
  { icon: Code, label: "Generate Code", prompt: "Write a Python script to scan open ports on a network using socket library" },
  { icon: Shield, label: "Security Scan", prompt: "What are the top 10 nmap commands for a comprehensive network security audit?" },
  { icon: FileText, label: "Summarize Logs", prompt: "How do I analyze Apache/Nginx access logs to detect suspicious activity?" },
  { icon: Sparkles, label: "AI Insights", prompt: "Explain the MITRE ATT&CK framework and how to use it for threat modeling" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to **Kelvy AI Assistant**. I'm powered by your local Ollama models — 100% private, 100% offline capable.\n\nMake sure Ollama is running: `OLLAMA_ORIGINS=* ollama serve`\n\nHow can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("llama3");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "online" | "offline">("checking");
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check Ollama connection & load models
  useEffect(() => {
    const checkOllama = async () => {
      setOllamaStatus("checking");
      const found = await listOllamaModels();
      if (found.length > 0) {
        setModels(found);
        setOllamaStatus("online");
        // Auto-select first available model
        if (!found.includes(selectedModel)) {
          setSelectedModel(found[0]);
        }
      } else {
        setOllamaStatus("offline");
      }
    };
    checkOllama();
    const interval = setInterval(checkOllama, 30000);
    return () => clearInterval(interval);
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantContent = "";

    const ollamaMessages: OllamaMessage[] = newMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    await streamOllamaChat({
      messages: ollamaMessages,
      model: selectedModel,
      systemPrompt: SYSTEM_PROMPT,
      signal: controller.signal,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > newMessages.length) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      },
      onDone: () => {
        setIsStreaming(false);
        abortRef.current = null;
      },
      onError: (error) => {
        setMessages(prev => [...prev, { role: "assistant", content: `⚠️ **Error:** ${error}` }]);
        setIsStreaming(false);
        abortRef.current = null;
      },
    });
  }, [messages, isStreaming, selectedModel]);

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-accent">AI ASSISTANT</h1>
          <p className="text-sm text-muted-foreground font-mono flex items-center gap-2">
            Powered by Ollama — Local LLM • 100% Private
            {ollamaStatus === "online" && <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Ollama connected" />}
            {ollamaStatus === "offline" && <WifiOff className="w-3 h-3 text-destructive" title="Ollama not reachable" />}
            {ollamaStatus === "checking" && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-mono text-muted-foreground hover:border-accent/40 transition"
          >
            <Settings2 className="w-3.5 h-3.5" />
            {selectedModel}
          </button>
          {showModelPicker && models.length > 0 && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[180px]">
              {models.map(m => (
                <button
                  key={m}
                  onClick={() => { setSelectedModel(m); setShowModelPicker(false); }}
                  className={`block w-full text-left px-3 py-2 text-xs font-mono hover:bg-accent/10 transition ${m === selectedModel ? "text-accent" : "text-muted-foreground"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {messages.length === 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {quickActions.map((a, i) => (
            <button key={i} onClick={() => send(a.prompt)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-card hover:border-accent/40 hover:glow-purple transition text-center">
              <a.icon className="w-5 h-5 text-accent" />
              <span className="text-xs text-muted-foreground">{a.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-accent" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              msg.role === "user" ? "bg-primary/20 text-foreground" : "bg-card border border-border text-foreground"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-accent animate-pulse" />
            </div>
            <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Ask Kelvy AI anything..."
          disabled={isStreaming}
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/40 font-mono disabled:opacity-50"
        />
        {isStreaming ? (
          <button onClick={stopStreaming} className="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition text-xs font-mono">
            Stop
          </button>
        ) : (
          <button onClick={() => send(input)} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition">
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
