import { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  Bot, Send, Mic, MicOff, Link2,
  Loader2, Trash2, WifiOff, Wifi, X, Paperclip, FileText, Image as ImageIcon, Zap
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: Date;
  modelUsed?: string;
  processingType?: "ocr" | "vision" | "chat" | "embed";
}

interface EnhancedAIChatProps {
  storageKey?: string;
  systemPrompt?: string;
  title?: string;
  className?: string;
}

// Intelligent model-based Ollama calls with backend integration
async function callOllamaWithIntelligentRouting(
  messages: { role: string; content: string }[],
  model = "qwen2.5:7b",
  systemPrompt = "You are a helpful AI assistant for Kelvy CyberTech Hub, an enterprise security platform in Kenya.",
  image?: string,
  processingType?: "ocr" | "vision"
): Promise<{ response: string; modelUsed: string }> {
  const OLLAMA_URL = "http://localhost:11434";
  const BACKEND_URL = "http://localhost:8000/api/ollama";

  // Route based on processing type and image content
  if (image && processingType === "ocr") {
    // Use glm-ocr:bf16 for text extraction from documents
    try {
      const res = await fetch(`${BACKEND_URL}/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      });
      if (res.ok) {
        const data = await res.json();
        return { response: `📄 **OCR Extracted Text:**\n\n${data.extracted_text}`, modelUsed: "glm-ocr:bf16" };
      }
    } catch (e) {
      console.error("Backend OCR failed, trying direct Ollama:", e);
    }
    
    // Fallback to direct Ollama
    try {
      const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "glm-ocr:bf16",
          prompt: "Extract ALL text from this image. Include details, structure, formatting, and any written content you can read.",
          images: [image],
          stream: false
        })
      });
      if (!res.ok) throw new Error("OCR failed");
      const data = await res.json();
      return { response: `📄 **OCR Extracted Text:**\n\n${data.response}`, modelUsed: "glm-ocr:bf16" };
    } catch (e) {
      throw new Error(`OCR extraction failed: ${e}`);
    }
  }

  if (image && processingType === "vision") {
    // Use qwen3-vl:8b for visual analysis (non-text images)
    try {
      const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen3-vl:8b",
          prompt: messages[messages.length - 1]?.content || "Analyze and describe this image in detail",
          images: [image],
          stream: false
        })
      });
      if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
      const data = await res.json();
      return { response: `🖼️ **Image Analysis:**\n\n${data.response}`, modelUsed: "qwen3-vl:8b" };
    } catch (e) {
      throw new Error(`Vision analysis failed: ${e}`);
    }
  }

  // Default: Use qwen2.5:7b for chat
  try {
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
    return { response: data.message?.content || "No response.", modelUsed: model };
  } catch (e) {
    throw e;
  }
}

async function fetchWithRetry(
  fn: () => Promise<{ response: string; modelUsed: string }>,
  retries = 3
): Promise<{ response: string; modelUsed: string }> {
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

// Detect if image contains text (for OCR) or is visual content (for vision)
async function detectImageType(file: File): Promise<"text" | "visual"> {
  // Heuristic based on filename
  const name = file.name.toLowerCase();
  if (
    name.includes("receipt") || name.includes("invoice") ||
    name.includes("document") || name.includes("id") ||
    name.includes("scan") || name.includes("pdf") ||
    name.includes("form") || name.includes("text") ||
    name.includes("letter") || name.includes("ticket") ||
    name.includes("card")
  ) {
    return "text";
  }
  // Default to visual for photos, screenshots, diagrams
  return "visual";
}

async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "text/plain") {
    return await file.text();
  }
  if (file.type === "application/pdf") {
    return `[PDF file: ${file.name} - ${(file.size / 1024).toFixed(1)}KB]\n\nNote: PDF text extraction requires server-side processing. Try uploading as an image for OCR.`;
  }
  if (file.type.includes("word") || file.name.endsWith(".docx")) {
    return `[Word document: ${file.name} - ${(file.size / 1024).toFixed(1)}KB]\n\nFor detailed analysis, convert to PDF and upload as image.`;
  }
  return `[File: ${file.name} (${file.type || "unknown type"}) - ${(file.size / 1024).toFixed(1)}KB]`;
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
    } catch { }
    return [
      {
        role: "assistant" as const,
        content: "🚀 **Kelvy AI Assistant - Multi-Model Edition**\n\nI can now use 4 specialized models:\n• **glm-ocr:bf16** - Extract text from documents, receipts, IDs\n• **qwen3-vl:8b** - Analyze photos, screenshots, diagrams\n• **qwen2.5:7b** - Answer questions, security analysis\n• **nomic-embed-text** - Find similar incidents\n\nUpload files or ask anything!",
        timestamp: new Date(),
        modelUsed: "system"
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
  const [processingStatus, setProcessingStatus] = useState("");
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
    } catch { }
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
        try {
          const res2 = await fetch("http://localhost:8000/health", { signal: AbortSignal.timeout(3000) });
          setOllamaStatus(res2.ok ? "online" : "offline");
        } catch {
          setOllamaStatus("offline");
        }
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const addMessage = (role: "user" | "assistant", content: string, image?: string, modelUsed?: string, processingType?: "ocr" | "vision" | "chat" | "embed") => {
    setMessages(prev => [...prev, { role, content, image, timestamp: new Date(), modelUsed, processingType }]);
  };

  const sendMessage = async (text?: string, image?: string, processingType?: "ocr" | "vision") => {
    const msg = text || input.trim();
    if (!msg && !image) return;
    if (!text) setInput("");

    // Show user message
    const userContent = msg || (processingType === "ocr" ? "📎 Document - extracting text..." : "📸 Image uploaded");
    addMessage("user", userContent, image);
    setLoading(true);
    setRetryInfo("");
    setProcessingStatus(processingType === "ocr" ? "Extracting text with OCR..." : processingType === "vision" ? "Analyzing image..." : "Processing...");

    try {
      const history = [...historyForOllama, { role: "user", content: msg || "Analyze this" }];
      let attempt = 0;
      
      const { response, modelUsed } = await fetchWithRetry(async () => {
        attempt++;
        if (attempt > 1) setRetryInfo(`Retrying... (attempt ${attempt}/3)`);
        return callOllamaWithIntelligentRouting(history, "qwen2.5:7b", systemPrompt, image, processingType);
      }, 3);
      
      setRetryInfo("");
      setProcessingStatus("");
      addMessage("assistant", response, undefined, modelUsed, processingType || "chat");
    } catch (err) {
      setRetryInfo("");
      setProcessingStatus("");
      const errorMsg = `⚠️ ${err instanceof Error ? err.message : "Could not process request"}\n\n**To fix:**\n1. Run: \`ollama serve\`\n2. Install models:\n   - \`ollama pull glm-ocr:bf16\`\n   - \`ollama pull qwen3-vl:8b\`\n   - \`ollama pull qwen2.5:7b\`\n   - \`ollama pull nomic-embed-text\`\n3. Check: http://localhost:11434/api/tags`;
      addMessage("assistant", errorMsg);
    }
    setLoading(false);
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.type.startsWith("image/")) {
      // Detect image type and route appropriately
      const imageType = await detectImageType(file);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const processingType = imageType === "text" ? "ocr" : "vision";
        const statusMsg = processingType === "ocr"
          ? `📄 Extracting text from ${file.name}...`
          : `🖼️ Analyzing image ${file.name}...`;
        toast.info(statusMsg);
        await sendMessage(undefined, base64, processingType);
      };
      reader.readAsDataURL(file);
      return;
    }

    if (file.type === "application/pdf" || file.type.includes("word")) {
      toast.info(`Reading file: ${file.name}`);
      const text = await extractTextFromFile(file);
      await sendMessage(`I uploaded: ${file.name}\n\n${text}\n\nCan you help me with this?`);
      return;
    }

    toast.info(`File: ${file.name}`);
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
      content: "Chat cleared. Ready to help!",
      timestamp: new Date(),
      modelUsed: "system"
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
                <><Wifi className="w-3 h-3 text-green-500" /><span className="text-[10px] text-green-500 font-mono">Ready</span></>
              ) : ollamaStatus === "offline" ? (
                <><WifiOff className="w-3 h-3 text-red-500" /><span className="text-[10px] text-red-500 font-mono">Offline</span></>
              ) : (
                <><Loader2 className="w-3 h-3 animate-spin text-yellow-500" /><span className="text-[10px] text-yellow-500 font-mono">Checking</span></>
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
          <div key={`msg-${i}`} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
              <div className="flex items-center justify-between mt-1 gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
                {msg.modelUsed && msg.modelUsed !== "system" && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap ${
                    msg.modelUsed.includes("glm-ocr") ? "bg-blue-500/20 text-blue-600" :
                    msg.modelUsed.includes("qwen3-vl") ? "bg-purple-500/20 text-purple-600" :
                    msg.modelUsed.includes("qwen2.5") ? "bg-green-500/20 text-green-600" :
                    "bg-amber-500/20 text-amber-600"
                  }`}>
                    {msg.modelUsed}
                  </span>
                )}
              </div>
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
                <span className="text-xs text-muted-foreground font-mono">{processingStatus || retryInfo || "Processing..."}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0">
        <div className="flex gap-1 mb-1.5">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile}
            accept="image/*,.pdf,.docx,.txt,.doc,.csv,.json" />
          <button onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition" title="Upload file (images, PDFs, documents)">
            <Paperclip className="w-3.5 h-3.5" />
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
