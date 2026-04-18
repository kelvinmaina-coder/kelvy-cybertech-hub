import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, Save, Smile, Frown, Meh, TrendingUp, Bot } from 'lucide-react';

const PersonalJournal: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(5);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    try { const { data } = await supabase.from('journal_entries').select('*').order('created_at', { ascending: false }); if (data) setEntries(data); } catch(e) {}
    setLoading(false);
  };

  const saveEntry = async () => {
    if (!content.trim()) return;
    await supabase.from('journal_entries').insert([{ content, mood }]);
    setContent('');
    setMood(5);
    fetchEntries();
    getAIInsight();
  };

  const getAIInsight = async () => {
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Based on journal entry mood (${mood}/10) and content: "${content}". Provide brief insight and mood pattern analysis.`, stream: false })
      });
      const data = await res.json();
      setAiInsight(data.response);
    } catch(e) { setAiInsight('AI insight unavailable'); }
  };

  const moodEmoji = (val: number) => { if (val <= 3) return <Frown className="w-5 h-5 text-red-500" />; if (val <= 7) return <Meh className="w-5 h-5 text-yellow-500" />; return <Smile className="w-5 h-5 text-green-500" />; };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Personal Journal</h1><p className="text-text-muted">AI-powered mood tracking</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl p-4 border border-border"><textarea rows={6} placeholder="How are you feeling today?" value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-3 bg-bg-secondary border border-border rounded-lg" /><div className="flex items-center justify-between mt-3"><div className="flex items-center gap-2"><span>Mood:</span><input type="range" min="1" max="10" value={mood} onChange={(e) => setMood(parseInt(e.target.value))} className="w-32" />{moodEmoji(mood)}<span className="text-sm">{mood}/10</span></div><button onClick={saveEntry} className="px-4 py-2 bg-accent-green/20 rounded-lg flex items-center gap-2"><Save className="w-4 h-4" />Save</button></div></div>
        <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-2">AI Insights</h3>{aiInsight ? <p className="text-text-muted text-sm">{aiInsight}</p> : <p className="text-text-muted text-sm">Save an entry to get AI insights about your mood patterns</p>}</div>
      </div>
      <div className="mt-6"><h3 className="font-semibold mb-3">Recent Entries</h3><div className="space-y-2">{entries.slice(0, 5).map(entry => (<div key={entry.id} className="bg-bg-card rounded-lg p-3 border border-border"><div className="flex justify-between items-center mb-1"><div className="flex items-center gap-2">{moodEmoji(entry.mood)}<span className="text-xs text-text-muted">{new Date(entry.created_at).toLocaleString()}</span></div><span className="text-xs">Mood: {entry.mood}/10</span></div><p className="text-sm">{entry.content.substring(0, 100)}...</p></div>))}</div></div>
    </div>
  );
};
export default PersonalJournal;
