import { useState, useEffect, useRef } from "react";
import { Bot, Send, Image as ImageIcon, Loader2, Cpu, WifiOff, Camera } from "lucide-react";
import { toast } from "sonner";
import { useAI } from "@/hooks/useAI";

export default function AIAssistant({ title = "AI ASSISTANT" }: { title?: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string; image?: string }[]>([
    { role: "assistant", content: `Hello! I'm ${title}. I can analyze images, answer questions, and help with tasks. Upload an image or ask me anything!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { callAI, checkHealth, loading: aiLoading } = useAI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "online" | "offline">("checking");

  const checkConnectivity = async () => {
    const health = await checkHealth();
    setOllamaStatus(health.ollama ? "online" : "offline");
  };

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setMessages(prev => [...prev, { role: "user", content: "📷 Uploaded an image", image: base64 }]);
      setLoading(true);
      
      try {
        const response = await callAI("Analyze this image and describe it in detail. If this is a screenshot of a technical error, explain the cause.", {
          image: base64,
          model: "qwen3-vl:8b"
        });
        setMessages(prev => [...prev, { role: "assistant", content: response }]);
      } catch (error) {
        // useAI already handles toast notification
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);
    
    try {
      const response = await callAI(userMsg, {
        model: "qwen2.5:7b",
        systemPrompt: `You are ${title}, a specialized AI assistant in the Kelvy CyberTech Hub. Provide expert technical assistance related to this domain.`
      });
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Backend AI gateway is not responding. Please ensure 'cd backend && python main.py' and 'ollama serve' are running locally." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-accent">{title.toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground font-mono flex items-center gap-2">
            Ollama — Local LLM • 100% Private
            {ollamaStatus === "online" && <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> <span className="text-green-500 text-[10px]">Connected</span></span>}
            {ollamaStatus === "offline" && <span className="inline-flex items-center gap-1"><WifiOff className="w-3 h-3 text-red-500" /> <span className="text-red-500 text-[10px]">Offline</span></span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">qwen2.5:7b • qwen3-vl:8b</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-accent" /></div>}
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary/20" : "bg-card border border-border"}`}>
              {msg.image && <img src={`data:image/png;base64,${msg.image}`} alt="Uploaded" className="max-w-[200px] rounded mb-2" />}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && <div className="flex gap-3"><Bot className="w-7 h-7 text-accent" /><div className="bg-card border border-border rounded-lg px-3 py-2"><Loader2 className="w-4 h-4 animate-spin" /></div></div>}
      </div>

      <div className="flex gap-2">
        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-accent"><Camera className="w-4 h-4" /></button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask Kelvy AI anything..." className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/40" />
        <button onClick={sendMessage} disabled={loading} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
