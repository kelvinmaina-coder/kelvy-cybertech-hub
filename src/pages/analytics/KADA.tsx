import React, { useState } from 'react';
import { BarChart3, Send, Loader2, TrendingUp, PieChart, Bot } from 'lucide-react';

const KADA: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `You are KADA (Kelvy AI Data Analyst). Analyze this business intelligence question: ${query}. Provide insights, trends, and recommendations based on typical business data.`, stream: false })
      });
      const data = await res.json();
      setResponse(data.response);
    } catch(e) { setResponse('AI analysis unavailable.'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">KADA AI</h1><p className="text-text-muted">Kelvy AI Data Analyst</p></div><BarChart3 className="w-8 h-8 text-accent-cyan" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"><div className="bg-bg-card rounded-xl p-4 border border-border"><TrendingUp className="w-6 h-6 text-accent-green mb-2" /><p className="font-semibold">Revenue Insights</p><p className="text-text-muted text-sm">AI analyzes trends and forecasts</p></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><PieChart className="w-6 h-6 text-accent-purple mb-2" /><p className="font-semibold">Client Analytics</p><p className="text-text-muted text-sm">Segmentation and behavior</p></div></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><div className="flex gap-2"><input type="text" placeholder="Ask about revenue trends, client insights, or business metrics..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && analyzeData()} className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg" /><button onClick={analyzeData} disabled={loading} className="px-4 py-2 bg-accent-cyan/20 rounded-lg"><Send className="w-4 h-4" /></button></div>
      {loading && <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>}
      {response && <div className="mt-4 bg-bg-secondary rounded-lg p-3"><p className="text-sm whitespace-pre-wrap">{response}</p></div>}</div>
    </div>
  );
};
export default KADA;
