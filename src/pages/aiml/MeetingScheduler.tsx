import React, { useState } from 'react';
import { Calendar, Clock, Users, Send, Loader2, Bot } from 'lucide-react';

const MeetingScheduler: React.FC = () => {
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    if (!description) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Suggest optimal meeting times and prepare agenda for: ${description}. Duration: ${duration} minutes. Consider typical business hours (9 AM - 5 PM).`, stream: false })
      });
      const data = await res.json();
      setSuggestions(data.response);
    } catch(e) { setSuggestions('AI scheduler unavailable.'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">AI Meeting Scheduler</h1><p className="text-text-muted">Smart meeting planning and agenda generation</p></div><Calendar className="w-8 h-8 text-accent-cyan" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="space-y-3"><textarea rows={4} placeholder="Describe the meeting purpose, attendees, and topics..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-bg-secondary border border-border rounded-lg" /><select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option></select><button onClick={getSuggestions} disabled={loading} className="w-full py-2 bg-accent-cyan/20 rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Get Suggestions</button></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />AI Suggestions</h3><div className="bg-bg-secondary rounded-lg p-3"><p className="text-sm whitespace-pre-wrap">{suggestions || 'Enter meeting details to get AI-powered scheduling suggestions and agenda'}</p></div></div></div>
    </div>
  );
};
export default MeetingScheduler;
