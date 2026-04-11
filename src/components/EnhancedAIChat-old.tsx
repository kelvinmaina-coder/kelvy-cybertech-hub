import { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  Bot, Send, Mic, MicOff, Link2,
  Loader2, Trash2, WifiOff, Wifi, X, Paperclip
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: Date;
}

interface EnhancedAIChatProps {
  storageKey?: string;
  systemPrompt?: string;
  title?: string;
  className?: string;
}

// Direct Ollama call - no backend needed
async function callOllama(
  messages: { role: string; content: string }[],
  model = "qwen2.5:7b",
  systemPrompt = "You are a helpful AI assistant for Kelvy CyberTech Hub, an enterprise security platform in Kenya.",
  image?: string
): Promise<string> {
  const OLLAMA_URL = "http://localhost:11434";

  if (image) {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3-vl:8b",
        prompt: messages[messages.length - 1]?.content || "Describe this image",
        images: [image],
        stream: false
      })
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
    const data = await res.json();
    return data.response || "No description available.";
  }

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      stream: false
    })
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
  const data = await res.json();
  return data.message?.content || "No response.";
}

async function fetchWithRetry(fn: () => Promise<string>, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries reached");
}

async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "text/plain") {
    return await file.text();
  }
  if (file.type === "application/pdf") {
    return `[PDF file: ${file.name} - ${(file.size / 1024).toFixed(1)}KB. Please describe what you need from this PDF.]`;
  }
  if (file.type.includes("word") || file.name.endsWith(".docx")) {
    return `[Word document: ${file.name} - ${(file.size / 1024).toFixed(1)}KB. Please describe what you need from this document.]`;
  }
  return `[File: ${file.name} (${file.type || "unknown type"}) - ${(file.size / 1024).toFixed(1)}KB]`;
}

async function fetchWebpageContent(url: string): Promise<string> {
  try {
    // Use a CORS proxy or direct fetch
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error("Failed to fetch");
    const html = await res.text();
    // Strip HTML tags
    const text = html.replace(/<style[^>]*>.*?<\/style>/gs, "")
      .replace(/<script[^>]*>.*?<\/script>/gs, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);
    return text;
  } catch {
    return `[Could not fetch URL: ${url}. The page may be blocked by CORS or unavailable.]`;
  }
}

export default function EnhancedAIChat({
  storageKey = "kelvy-public-chat",
  systemPrompt = "You are a helpful AI assistant for Kelvy CyberTech Hub, an enterprise security platform based in Kenya. You help with cybersecurity, networking, cloud security, compliance, and business continuity questions.",
  title = "AI Assistant",
  className = ""
}: EnhancedAIChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch {}
    return [
      {
        role: "assistant" as const,
        content: "Hello! I'm the Kelvy CyberTech AI Assistant. I can help you with cybersecurity, networking, cloud security, compliance, and more. You can also send me images, documents, or paste URLs for analysis!",
        timestamp: new Date()
      }
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "online" | "offline">("checking");
  const [retryInfo, setRetryInfo] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const historyForOllama = messages.map(m => ({ role: m.role, content: m.content }));

  useEffect(() => {
    try {
      const toSave = messages.slice(-50).map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString()
      }));
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch {}
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(3000) });
        setOllamaStatus(res.ok ? "online" : "offline");
      } catch {
        // Try via backend health
        try {
          const res2 = await fetch("http://localhost:8000/health", { signal: AbortSignal.timeout(3000) });
          const data = await res2.json();
          setOllamaStatus(data.ollama ? "online" : "offline");
        } catch {
          setOllamaStatus("offline");
        }
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const addMessage = (role: "user" | "assistant", content: string, image?: string) => {
    setMessages(prev => [...prev, { role, content, image, timestamp: new Date() }]);
  };

  const sendMessage = async (text?: string, image?: string) => {
    const msg = text || input.trim();
    if (!msg && !image) return;
    if (!text) setInput("");
    addMessage("user", msg || "📎 Sent an image", image);
    setLoading(true);
    setRetryInfo("");

    try {
      const history = [...historyForOllama, { role: "user", content: msg || "Analyze this image" }];
      let attempt = 0;
      const response = await fetchWithRetry(async () => {
        attempt++;
        if (attempt > 1) setRetryInfo(`Retrying... (attempt ${attempt}/3)`);
        return callOllama(history, "qwen2.5:7b", systemPrompt, image);
      }, 3);
      setRetryInfo("");
      addMessage("assistant", response);
    } catch (err) {
      setRetryInfo("");
      addMessage("assistant", "⚠️ Could not connect to Ollama AI.\n\n**To fix:**\n1. Open terminal and run: `ollama serve`\n2. If not installed: [ollama.ai](https://ollama.ai)\n3. Pull model: `ollama pull qwen2.5:7b`\n\nOllama runs locally on port 11434 — no internet needed.");
    }
    setLoading(false);
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await sendMessage("Please analyze and describe this image in detail.", base64);
      };
      reader.readAsDataURL(file);
      return;
    }

    if (file.type.startsWith("video/")) {
      addMessage("assistant", `📹 Video received: **${file.name}** (${(file.size / 1024 / 1024).toFixed(1)}MB)\n\nNote: Video frame extraction requires server-side processing. For now, please describe what you need analyzed in the video and I'll help based on your description.`);
      return;
    }

    toast.info(`Reading ${file.name}...`);
    const text = await extractTextFromFile(file);
    await sendMessage(`I've uploaded a file: ${file.name}\n\nContent:\n${text}\n\nPlease analyze this and provide a summary.`);
  };

  const handleLink = async () => {
    const url = linkInput.trim();
    if (!url) return;
    setShowLinkInput(false);
    setLinkInput("");
    toast.info("Fetching webpage...");
    addMessage("user", `🔗 Analyze this URL: ${url}`);
    setLoading(true);
    const content = await fetchWebpageContent(url);
    try {
      const history = [...historyForOllama, {
        role: "user",
        content: `Please analyze and summarize this webpage content from ${url}:\n\n${content}`
      }];
      const response = await fetchWithRetry(() => callOllama(history, "qwen2.5:7b", systemPrompt), 3);
      addMessage("assistant", response);
    } catch {
      addMessage("assistant", "⚠️ Failed to analyze the URL. Please ensure Ollama is running.");
    }
    setLoading(false);
  };

  const startVoice = () => {
    const SpeechRecognition = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input not supported in this browser. Try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition failed");
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared. How can I help you?",
      timestamp: new Date()
    }]);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-foreground">{title}</h3>
            <div className="flex items-center gap-1">
              {ollamaStatus === "online" ? (
                <><Wifi className="w-3 h-3 text-green-500" /><span className="text-[10px] text-green-500 font-mono">Ollama Online</span></>
              ) : ollamaStatus === "offline" ? (
                <><WifiOff className="w-3 h-3 text-red-500" /><span className="text-[10px] text-red-500 font-mono">Ollama Offline</span></>
              ) : (
                <><Loader2 className="w-3 h-3 animate-spin text-yellow-500" /><span className="text-[10px] text-yellow-500 font-mono">Checking...</span></>
              )}
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition" title="Clear chat">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary/20 text-foreground rounded-tr-sm"
                : "bg-card border border-border text-foreground rounded-tl-sm"
            }`}>
              {msg.image && (
                <img src={`data:image/jpeg;base64,${msg.image}`} alt="Uploaded" className="max-w-[200px] rounded mb-2" />
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-xl rounded-tl-sm px-3 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground font-mono">{retryInfo || "Thinking..."}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="flex gap-2 mb-2 shrink-0">
          <input
            type="url"
            value={linkInput}
            onChange={e => setLinkInput(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50"
            onKeyDown={e => e.key === "Enter" && handleLink()}
            autoFocus
          />
          <button onClick={handleLink} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-mono font-bold">Fetch</button>
          <button onClick={() => setShowLinkInput(false)} className="p-2 rounded-lg border border-border hover:bg-muted/50">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0">
        <div className="flex gap-1 mb-1.5">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile}
            accept="image/*,video/*,.pdf,.docx,.txt,.doc,.csv,.json,.md" />
          <button onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition" title="Upload file">
            <Paperclip className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowLinkInput(!showLinkInput)}
            className="p-1.5 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition" title="Analyze URL">
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={isListening ? stopVoice : startVoice}
            className={`p-1.5 rounded-lg border transition ${isListening ? "border-red-500 bg-red-500/20 text-red-500 animate-pulse" : "border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"}`}
            title={isListening ? "Stop recording" : "Voice input"}>
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything... (Enter to send, Shift+Enter for newline)"
            rows={2}
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono resize-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || (!input.trim())}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center self-end"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}