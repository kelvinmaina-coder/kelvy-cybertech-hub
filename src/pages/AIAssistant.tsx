import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, Code, Shield, FileText } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { icon: Code, label: "Generate Code", prompt: "Write a Python script to scan open ports on a network" },
  { icon: Shield, label: "Security Scan", prompt: "Run a security audit on our web application" },
  { icon: FileText, label: "Summarize Logs", prompt: "Analyze and summarize the latest security logs" },
  { icon: Sparkles, label: "AI Insights", prompt: "What are the key business insights from this week?" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to Kelvy AI Assistant. I'm powered by local Ollama models — 100% private, 100% offline capable. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: "I've processed your request. In the full system, this would be handled by Ollama running locally with Llama3 or Mistral models. All processing stays on your device — zero data leaves your system.\n\n```\n// AI processing pipeline\nOllama → Local LLM → Response\nNo API calls. No cloud. 100% private.\n```",
      };
      setMessages(prev => [...prev, { role: "assistant", content: responses.default }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold text-accent">AI ASSISTANT</h1>
        <p className="text-sm text-muted-foreground font-mono">Powered by Ollama — Local LLM • 100% Private</p>
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
        {isTyping && (
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
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Ask Kelvy AI anything..."
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/40 font-mono"
        />
        <button onClick={() => send(input)} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
