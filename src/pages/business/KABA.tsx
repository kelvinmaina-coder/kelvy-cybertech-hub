import React, { useState } from 'react';
import { Briefcase, Send, Loader2, TrendingUp, Users, DollarSign, Bot } from 'lucide-react';

const KABA: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeBusiness = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `You are KABA (Kelvy AI Business Analyst). Analyze this business question: ${query}. Provide strategic insights, financial advice, and operational recommendations.`, stream: false })
      });
      const data = await res.json();
      setResponse(data.response);
    } catch(e) { setResponse('AI analysis unavailable.'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">KABA AI</h1><p className="text-text-muted">Kelvy AI Business Analyst</p></div><Briefcase className="w-8 h-8 text-accent-green" /></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><div className="bg-bg-card rounded-xl p-4 border border-border"><DollarSign className="w-6 h-6 text-accent-green mb-2" /><p className="font-semibold">Financial Analysis</p></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><Users className="w-6 h-6 text-accent-cyan mb-2" /><p className="font-semibold">Client Strategy</p></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><TrendingUp className="w-6 h-6 text-accent-purple mb-2" /><p className="font-semibold">Growth Planning</p></div></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><div className="flex gap-2"><input type="text" placeholder="Ask about revenue, clients, strategy, or operations..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && analyzeBusiness()} className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg" /><button onClick={analyzeBusiness} disabled={loading} className="px-4 py-2 bg-accent-green/20 rounded-lg"><Send className="w-4 h-4" /></button></div>
      {loading && <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>}
      {response && <div className="mt-4 bg-bg-secondary rounded-lg p-3"><p className="text-sm whitespace-pre-wrap">{response}</p></div>}</div>
    </div>
  );
};
export default KABA;
