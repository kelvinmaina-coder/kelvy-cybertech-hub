import React, { useState } from 'react';
import { Code, Send, Loader2, Bug, Sparkles, Bot } from 'lucide-react';

const KACA: React.FC = () => {
  const [code, setCode] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('javascript');

  const analyzeCode = async () => {
    setLoading(true);
    try {
      const prompt = `You are KACA (Kelvy AI Code Assistant). ${query ? `Question: ${query}` : `Review this ${language} code for bugs and improvements`}\n\nCode:\n${code}`;
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt, stream: false })
      });
      const data = await res.json();
      setResponse(data.response);
    } catch(e) { setResponse('AI analysis unavailable.'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">KACA AI</h1><p className="text-text-muted">Kelvy AI Code Assistant</p></div><Code className="w-8 h-8 text-accent-purple" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl p-4 border border-border"><select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3"><option value="javascript">JavaScript</option><option value="python">Python</option><option value="typescript">TypeScript</option><option value="java">Java</option><option value="go">Go</option><option value="rust">Rust</option></select><textarea rows={10} placeholder="Paste your code here..." value={code} onChange={(e) => setCode(e.target.value)} className="w-full p-3 bg-bg-secondary border border-border rounded-lg font-mono text-sm" /></div>
        <div className="bg-bg-card rounded-xl p-4 border border-border"><div className="flex gap-2 mb-3"><input type="text" placeholder="Ask about this code (optional)..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg" /><button onClick={analyzeCode} disabled={loading} className="px-4 py-2 bg-accent-purple/20 rounded-lg"><Send className="w-4 h-4" /></button></div>
        {loading && <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>}
        {response && <div className="bg-bg-secondary rounded-lg p-3 max-h-96 overflow-auto"><p className="text-sm whitespace-pre-wrap">{response}</p></div>}</div>
      </div>
    </div>
  );
};
export default KACA;
