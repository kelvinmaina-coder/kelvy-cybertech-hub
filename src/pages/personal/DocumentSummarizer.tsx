import React, { useState } from 'react';
import { Upload, FileText, Loader2, Copy, Download, Bot } from 'lucide-react';

const DocumentSummarizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); const reader = new FileReader(); reader.onload = (ev) => setContent(ev.target?.result as string); reader.readAsText(f); }
  };

  const generateSummary = async () => {
    if (!content) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Summarize this document. Extract key points and action items:\n\n${content.substring(0, 3000)}`, stream: false })
      });
      const data = await res.json();
      setSummary(data.response);
    } catch(e) { setSummary('AI summary unavailable'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Document Summarizer</h1><p className="text-text-muted">AI-powered document analysis</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl p-4 border border-border"><div className="border-2 border-dashed border-border rounded-lg p-8 text-center"><Upload className="w-12 h-12 mx-auto mb-3 text-text-muted" /><p className="text-text-muted mb-2">Upload PDF, DOCX, or TXT</p><input type="file" accept=".txt,.pdf,.docx" onChange={handleFileUpload} className="hidden" id="file-upload" /><label htmlFor="file-upload" className="px-4 py-2 bg-accent-green/20 rounded-lg cursor-pointer">Select File</label>{file && <p className="mt-3 text-sm text-accent-green">{file.name}</p>}</div><button onClick={generateSummary} disabled={!content || loading} className="w-full mt-4 py-2 bg-accent-purple/20 rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}Summarize</button></div>
        <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3">AI Summary</h3><div className="bg-bg-secondary rounded-lg p-3 min-h-[300px] overflow-auto"><p className="text-sm whitespace-pre-wrap">{summary || 'Upload a document and click Summarize'}</p></div>{summary && <button onClick={() => navigator.clipboard.writeText(summary)} className="mt-3 px-3 py-1 bg-accent-cyan/20 rounded-lg text-sm flex items-center gap-1"><Copy className="w-3 h-3" />Copy</button>}</div>
      </div>
    </div>
  );
};
export default DocumentSummarizer;
