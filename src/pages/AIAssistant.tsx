import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Sparkles, Code, Shield, FileText, Settings2, Loader2, WifiOff, Image, X } from "lucide-react";
import { streamOllamaChat, listOllamaModels, OllamaMessage } from "@/lib/ollama";

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: string[]; // base64 images
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
  const [selectedModel, setSelectedModel] = useState("qwen2.5:7b");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "online" | "offline">("checking");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const checkOllama = async () => {
      setOllamaStatus("checking");
      const found = await listOllamaModels();
      if (found.length > 0) {
        setModels(found);
        setOllamaStatus("online");
        if (!found.includes(selectedModel)) setSelectedModel(found[0]);
      } else {
        setOllamaStatus("offline");
      }
    };
    checkOllama();
    const interval = setInterval(checkOllama, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setPendingImages(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { role: "user", content: text, images: pendingImages.length > 0 ? pendingImages : undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setPendingImages([]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistantContent = "";

    // Use vision model if images attached
    const model = userMsg.images?.length ? (models.find(m => m.includes("vl") || m.includes("vision")) || selectedModel) : selectedModel;

    const ollamaMessages: OllamaMessage[] = newMessages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.images ? { images: m.images } : {}),
    }));

    await streamOllamaChat({
      messages: ollamaMessages,
      model,
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
      onDone: () => { setIsStreaming(false); abortRef.current = null; },
      onError: (error) => {
        setMessages(prev => [...prev, { role: "assistant", content: `⚠️ **Error:** ${error}` }]);
        setIsStreaming(false);
        abortRef.current = null;
      },
    });
  }, [messages, isStreaming, selectedModel, pendingImages, models]);

  const isVisionModel = selectedModel.includes("vl") || selectedModel.includes("vision");

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-accent">AI ASSISTANT</h1>
          <p className="text-sm text-muted-foreground font-mono flex items-center gap-2">
            Powered by Ollama — Local LLM • 100% Private
            {ollamaStatus === "online" && <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />}
            {ollamaStatus === "offline" && <WifiOff className="w-3 h-3 text-destructive" />}
            {ollamaStatus === "checking" && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </p>
        </div>
        <div className="relative">
          <button onClick={() => setShowModelPicker(!showModelPicker)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-mono text-muted-foreground hover:border-accent/40 transition">
            <Settings2 className="w-3.5 h-3.5" /> {selectedModel}
          </button>
          {showModelPicker && models.length > 0 && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[180px]">
              {models.map(m => (
                <button key={m} onClick={() => { setSelectedModel(m); setShowModelPicker(false); }}
                  className={`block w-full text-left px-3 py-2 text-xs font-mono hover:bg-accent/10 transition ${m === selectedModel ? "text-accent" : "text-muted-foreground"}`}>
                  {m} {(m.includes("vl") || m.includes("vision")) && "👁️"}
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
              {msg.images && msg.images.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {msg.images.map((img, j) => (
                    <img key={j} src={`data:image/png;base64,${img}`} alt="Uploaded" className="w-20 h-20 object-cover rounded border border-border" />
                  ))}
                </div>
              )}
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

      {/* Pending images preview */}
      {pendingImages.length > 0 && (
        <div className="flex gap-2 mb-2 px-1">
          {pendingImages.map((img, i) => (
            <div key={i} className="relative">
              <img src={`data:image/png;base64,${img}`} alt="Pending" className="w-14 h-14 object-cover rounded border border-border" />
              <button onClick={() => setPendingImages(prev => prev.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-destructive-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-accent hover:border-accent/40 transition"
          title="Upload image for vision analysis">
          <Image className="w-4 h-4" />
        </button>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Ask Kelvy AI anything..."
          disabled={isStreaming}
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/40 font-mono disabled:opacity-50" />
        {isStreaming ? (
          <button onClick={() => { abortRef.current?.abort(); setIsStreaming(false); }}
            className="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition text-xs font-mono">Stop</button>
        ) : (
          <button onClick={() => send(input)} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition">
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
