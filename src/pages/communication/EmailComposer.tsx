import React, { useState } from 'react';
import { Send, Copy, Loader2, Sparkles, Mail, Bot } from 'lucide-react';

const EmailComposer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);

  const generateEmail = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Write a ${tone} email based on: ${prompt}. Include subject line, greeting, body, and closing.`, stream: false })
      });
      const data = await res.json();
      setGeneratedEmail(data.response);
    } catch(e) { setGeneratedEmail('Error generating email. Make sure Ollama is running.'); }
    setLoading(false);
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(generatedEmail); alert('Copied!'); };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Email Composer</h1><p className="text-text-muted">AI-powered email generation</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl p-4 border border-border"><textarea rows={4} placeholder="What email do you want to write? e.g., 'Draft email to client about overdue payment'" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full p-3 bg-bg-secondary border border-border rounded-lg mb-3" /><select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3"><option value="professional">Professional</option><option value="friendly">Friendly</option><option value="urgent">Urgent</option><option value="persuasive">Persuasive</option></select><button onClick={generateEmail} disabled={loading} className="w-full py-2 bg-accent-green/20 border border-accent-green rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Generate Email</button></div>
        <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3 flex items-center gap-2"><Mail className="w-4 h-4" />Generated Email</h3><div className="bg-bg-secondary rounded-lg p-3 min-h-[300px]"><p className="text-sm whitespace-pre-wrap">{generatedEmail || 'Your generated email will appear here'}</p></div>{generatedEmail && <button onClick={copyToClipboard} className="mt-3 px-3 py-1 bg-accent-cyan/20 rounded-lg text-sm flex items-center gap-1"><Copy className="w-3 h-3" />Copy to Clipboard</button>}</div>
      </div>
    </div>
  );
};
export default EmailComposer;
