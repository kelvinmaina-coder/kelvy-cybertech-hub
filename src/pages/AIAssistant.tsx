import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Sparkles, Code, Shield, FileText, Loader2, WifiOff, Image, X, Cpu, Copy, Check, Mic, MicOff, Search, Bug, BookOpen } from "lucide-react";
import { streamOllamaChat, listOllamaModels, OllamaMessage } from "@/lib/ollama";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: string[];
}

const PRESETS: { id: string; label: string; icon: any; prompt: string }[] = [
  { id: "general", label: "General", icon: Bot, prompt: `You are Kelvy AI, the intelligent assistant for Kelvy CyberTech Hub. Be concise, technical, and actionable. Use markdown for code blocks and structured output.` },
  { id: "security", label: "Security Analyst", icon: Shield, prompt: `You are a cybersecurity expert AI assistant. You specialize in vulnerability analysis, threat detection, penetration testing guidance, and security best practices. Always categorize risks as Critical/High/Medium/Low. Provide actionable remediation steps.` },
  { id: "coder", label: "Code Assistant", icon: Code, prompt: `You are an expert software engineer AI. You write clean, secure, well-documented code. You review code for bugs, security issues, and performance. You support Python, JavaScript, TypeScript, Bash, Go, Rust, and more. Always use code blocks with language tags.` },
  { id: "business", label: "Business Advisor", icon: FileText, prompt: `You are a business intelligence AI advisor for a tech company in Kenya. You help with financial analysis, client management, M-Pesa integration, KRA compliance, project planning, and strategic decisions. Give practical, actionable advice.` },
];

const quickActions = [
  { icon: Code, label: "Explain Code", prompt: "Explain this code snippet and describe what it does step by step:" },
  { icon: Search, label: "Analyze Log", prompt: "Analyze this log output for errors, warnings, and suspicious activity:" },
  { icon: FileText, label: "Summarize Doc", prompt: "Summarize this document and extract the key points:" },
  { icon: Shield, label: "Security Scan", prompt: "What are the top 10 nmap commands for a comprehensive network security audit?" },
  { icon: Bug, label: "Find Bugs", prompt: "Review this code for bugs, security vulnerabilities, and performance issues:" },
  { icon: BookOpen, label: "Generate Docs", prompt: "Generate documentation with docstrings and comments for this code:" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to **Kelvy AI Assistant**. I'm powered by your local Ollama models — 100% private, 100% offline.\n\nMake sure Ollama is running: `OLLAMA_ORIGINS=* ollama serve`\n\nSelect a persona above or ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("qwen2.5:7b");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "online" | "offline">("checking");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState("general");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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

  const copyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
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

    const model = userMsg.images?.length ? (models.find(m => m.includes("vl") || m.includes("vision")) || selectedModel) : selectedModel;
    const preset = PRESETS.find(p => p.id === activePreset);

    const ollamaMessages: OllamaMessage[] = newMessages.map(m => ({
      role: m.role, content: m.content,
      ...(m.images ? { images: m.images } : {}),
    }));

    await streamOllamaChat({
      messages: ollamaMessages, model,
      systemPrompt: preset?.prompt,
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
  }, [messages, isStreaming, selectedModel, pendingImages, models, activePreset]);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-accent">AI ASSISTANT</h1>
          <p className="text-sm text-muted-foreground font-mono flex items-center gap-2">
            Ollama — Local LLM • 100% Private
            {ollamaStatus === "online" && <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> <span className="text-primary text-[10px]">Connected</span></span>}
            {ollamaStatus === "offline" && <span className="inline-flex items-center gap-1"><WifiOff className="w-3 h-3 text-destructive" /> <span className="text-destructive text-[10px]">Offline</span></span>}
            {ollamaStatus === "checking" && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </p>
        </div>
        <div className="relative">
          <button onClick={() => setShowModelPicker(!showModelPicker)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-mono text-muted-foreground hover:border-accent/40 transition">
            <Cpu className="w-3.5 h-3.5" /> {selectedModel}
          </button>
          {showModelPicker && models.length > 0 && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl z-10 min-w-[200px] p-1 animate-fade-in">
              {models.map(m => (
                <button key={m} onClick={() => { setSelectedModel(m); setShowModelPicker(false); }}
                  className={`block w-full text-left px-3 py-2 text-xs font-mono rounded hover:bg-accent/10 transition ${m === selectedModel ? "text-accent bg-accent/5" : "text-muted-foreground"}`}>
                  {m} {(m.includes("vl") || m.includes("vision")) && "👁️"} {m.includes("embed") && "📐"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {PRESETS.map(p => (
          <button key={p.id} onClick={() => setActivePreset(p.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition ${
              activePreset === p.id ? "bg-accent/20 text-accent border border-accent/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}>
            <p.icon className="w-3 h-3" /> {p.label}
          </button>
        ))}
      </div>

      {messages.length === 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
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
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} group`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-accent" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm relative ${
              msg.role === "user" ? "bg-primary/20 text-foreground" : "bg-card border border-border text-foreground"
            }`}>
              {msg.images && msg.images.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {msg.images.map((img, j) => (
                    <img key={j} src={`data:image/png;base64,${img}`} alt="Uploaded" className="w-20 h-20 object-cover rounded border border-border" />
                  ))}
                </div>
              )}
              <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background [&_pre]:border [&_pre]:border-border [&_pre]:rounded [&_pre]:p-2 [&_code]:text-primary [&_code]:text-xs [&_code]:font-mono [&_a]:text-secondary [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.role === "assistant" && i > 0 && (
                <button onClick={() => copyMessage(msg.content, i)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded bg-muted/50 hover:bg-muted transition"
                  title="Copy response">
                  {copiedIdx === i ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                </button>
              )}
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
          title="Upload image for vision analysis (qwen3-vl:8b)">
          <Image className="w-4 h-4" />
        </button>
        <button onClick={toggleVoice}
          className={`px-3 py-2 rounded-lg border transition ${isListening ? "border-destructive bg-destructive/10 text-destructive animate-pulse" : "border-border bg-card text-muted-foreground hover:text-accent hover:border-accent/40"}`}
          title="Voice input">
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder={isListening ? "Listening..." : "Ask Kelvy AI anything..."}
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
