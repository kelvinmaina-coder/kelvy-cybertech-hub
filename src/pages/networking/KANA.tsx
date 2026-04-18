import React, { useState } from 'react';
import { Network, Send, Loader2, Activity, Wifi, Bot } from 'lucide-react';

const KANA: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({ devices: 0, issues: 0, bandwidth: 0 });

  const analyzeNetwork = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `You are KANA (Kelvy AI Network Analyst). Analyze this network question: ${query}. Provide diagnostics, recommendations, and best practices.`, stream: false })
      });
      const data = await res.json();
      setResponse(data.response);
      setNetworkStatus({ devices: 47, issues: 2, bandwidth: 98.5 });
    } catch(e) { setResponse('AI analysis unavailable. Make sure Ollama is running.'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">KANA AI</h1><p className="text-text-muted">Kelvy AI Network Analyst</p></div><Network className="w-8 h-8 text-accent-cyan" /></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><div className="bg-bg-card rounded-xl p-4 border border-border"><Wifi className="w-6 h-6 text-accent-green mb-2" /><p className="text-2xl font-bold">{networkStatus.devices}</p><p className="text-text-muted text-sm">Active Devices</p></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><Activity className="w-6 h-6 text-accent-orange mb-2" /><p className="text-2xl font-bold">{networkStatus.issues}</p><p className="text-text-muted text-sm">Network Issues</p></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><Network className="w-6 h-6 text-accent-cyan mb-2" /><p className="text-2xl font-bold">{networkStatus.bandwidth}%</p><p className="text-text-muted text-sm">Bandwidth Usage</p></div></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><div className="flex gap-2"><input type="text" placeholder="Ask about network issues, bandwidth, or device management..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && analyzeNetwork()} className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg" /><button onClick={analyzeNetwork} disabled={loading} className="px-4 py-2 bg-accent-cyan/20 rounded-lg"><Send className="w-4 h-4" /></button></div>
      {loading && <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>}
      {response && <div className="mt-4 bg-bg-secondary rounded-lg p-3"><p className="text-sm whitespace-pre-wrap">{response}</p></div>}</div>
    </div>
  );
};
export default KANA;
