import React, { useState } from 'react';
import { FileText, Upload, Loader2, AlertTriangle, CheckCircle, Bot } from 'lucide-react';

const ContractAnalyzer: React.FC = () => {
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeContract = async () => {
    if (!content) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Analyze this contract for risks, red flags, and important clauses. Provide severity assessment and recommendations:\n\n${content.substring(0, 3000)}`, stream: false })
      });
      const data = await res.json();
      setAnalysis(data.response);
    } catch(e) { setAnalysis('AI analysis unavailable.'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">AI Contract Analyzer</h1><p className="text-text-muted">Risk detection and clause analysis</p></div><FileText className="w-8 h-8 text-accent-cyan" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><textarea rows={12} placeholder="Paste contract text here..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-3 bg-bg-secondary border border-border rounded-lg font-mono text-sm" />
      <div className="bg-bg-card rounded-xl p-4 border border-border"><button onClick={analyzeContract} disabled={loading} className="w-full py-2 bg-accent-green/20 rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}Analyze Contract</button>
      {analysis && <div className="mt-4 bg-bg-secondary rounded-lg p-3 max-h-96 overflow-auto"><p className="text-sm whitespace-pre-wrap">{analysis}</p></div>}</div></div>
    </div>
  );
};
export default ContractAnalyzer;
