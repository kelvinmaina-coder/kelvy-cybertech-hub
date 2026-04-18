import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Bot } from 'lucide-react';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'online' | 'offline'>('checking');
  const [selectedModel, setSelectedModel] = useState('qwen2.5:7b');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkOllama();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkOllama = async () => {
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      if (res.ok) setOllamaStatus('online');
      else setOllamaStatus('offline');
    } catch { setOllamaStatus('offline'); }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || ollamaStatus !== 'online') return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel, prompt: input, stream: false })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to Ollama. Make sure it is running on port 11434.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between mb-4 p-3 bg-bg-card rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-mono">Ollama: {ollamaStatus === 'online' ? 'Online' : 'Offline'}</span>
          </div>
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="px-2 py-1 bg-bg-secondary border border-border rounded text-sm font-mono">
            <option value="qwen2.5:7b">qwen2.5:7b</option>
            <option value="qwen3-vl:8b">qwen3-vl:8b</option>
            <option value="nomic-embed-text">nomic-embed-text</option>
          </select>
        </div>
        <Bot className="w-5 h-5 text-accent-purple" />
      </div>

      <div className="flex-1 overflow-auto space-y-3 mb-4 p-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-accent-green/20 border border-accent-green' : 'bg-bg-card border border-border'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-bg-card p-3 rounded-lg"><Loader2 className="w-4 h-4 animate-spin" /></div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask anything..." className="flex-1 px-4 py-2 bg-bg-secondary border border-border rounded-lg font-mono text-sm" />
        <button onClick={sendMessage} disabled={loading || ollamaStatus !== 'online'} className="px-4 py-2 bg-accent-green/20 border border-accent-green rounded-lg">
          <Send className="w-4 h-4 text-accent-green" />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
