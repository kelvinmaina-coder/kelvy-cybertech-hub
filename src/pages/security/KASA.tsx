import React, { useState } from 'react';
import { Bot, Send, Loader2, Shield } from 'lucide-react';

const KASA: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `You are KASA (Kelvy AI Security Analyst). Analyze this security question: ${query}. Provide threat analysis, severity, and recommendations.`, stream: false })
      });
      const data = await res.json();
      setResponse(data.response);
    } catch(e) { setResponse('AI unavailable. Make sure Ollama is running.'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">KASA AI</h1><p className="text-text-muted">Kelvy AI Security Analyst</p></div><Shield className="w-8 h-8 text-accent-green" /></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><div className="flex gap-2"><input type="text" placeholder="Ask about security threats, vulnerabilities, or best practices..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && askAI()} className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg" /><button onClick={askAI} disabled={loading} className="px-4 py-2 bg-accent-green/20 rounded-lg"><Send className="w-4 h-4" /></button></div>
      {loading && <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>}
      {response && <div className="mt-4 bg-bg-secondary rounded-lg p-3"><p className="text-sm whitespace-pre-wrap">{response}</p></div>}</div>
    </div>
  );
};
export default KASA;
