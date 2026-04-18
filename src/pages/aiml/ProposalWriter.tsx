import React, { useState } from 'react';
import { FileText, Send, Loader2, Sparkles, Bot } from 'lucide-react';

const ProposalWriter: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [client, setClient] = useState('');
  const [budget, setBudget] = useState('');
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(false);

  const generateProposal = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Write a professional business proposal for: ${topic}. Client: ${client || 'New Client'}. ${budget ? `Budget: ${budget}` : ''}. Include executive summary, scope of work, timeline, pricing, and terms.`, stream: false })
      });
      const data = await res.json();
      setProposal(data.response);
    } catch(e) { setProposal('AI proposal generator unavailable.'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">AI Proposal Writer</h1><p className="text-text-muted">Generate professional proposals</p></div><FileText className="w-8 h-8 text-accent-green" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="space-y-3"><input type="text" placeholder="Proposal topic (e.g., Cybersecurity Audit Services)" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg" /><input type="text" placeholder="Client name (optional)" value={client} onChange={(e) => setClient(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg" /><input type="text" placeholder="Budget range (optional)" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg" /><button onClick={generateProposal} disabled={loading} className="w-full py-2 bg-accent-green/20 rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Generate Proposal</button></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3">Generated Proposal</h3><div className="bg-bg-secondary rounded-lg p-3 max-h-96 overflow-auto"><p className="text-sm whitespace-pre-wrap">{proposal || 'Your proposal will appear here'}</p></div></div></div>
    </div>
  );
};
export default ProposalWriter;
