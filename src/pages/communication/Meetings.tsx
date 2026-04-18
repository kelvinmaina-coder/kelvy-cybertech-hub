import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Users, Video, Plus, Bell, Bot } from 'lucide-react';

const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', scheduled_for: '', duration: 30 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try { const { data } = await supabase.from('meetings').select('*').order('scheduled_for', { ascending: true }); if (data) setMeetings(data); } catch(e) {}
    setLoading(false);
  };

  const scheduleMeeting = async () => {
    try {
      await supabase.from('meetings').insert([{
        title: formData.title, description: formData.description,
        scheduled_for: formData.scheduled_for, duration_minutes: formData.duration,
        meeting_link: `meet-${Date.now()}`, created_by: (await supabase.auth.getUser()).data.user?.id
      }]);
      fetchMeetings(); setShowForm(false); setFormData({ title: '', description: '', scheduled_for: '', duration: 30 });
    } catch(e) { console.error(e); }
  };

  const joinMeeting = (link: string) => { window.open(`/communication/video-calls?room=${link}`, '_blank'); };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Meetings</h1><p className="text-text-muted">Schedule and join team meetings</p></div><button onClick={() => setShowForm(true)} className="px-4 py-2 bg-accent-green/20 border border-accent-green rounded-lg"><Plus className="w-4 h-4 inline mr-1" />Schedule Meeting</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{meetings.map(m => (<div key={m.id} className="bg-bg-card rounded-xl p-4 border border-border hover:border-accent-green transition-colors"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{m.title}</h3><p className="text-text-muted text-sm mt-1">{m.description}</p><div className="flex gap-3 mt-3 text-xs text-text-muted"><div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(m.scheduled_for).toLocaleDateString()}</div><div className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.duration_minutes} min</div></div></div><button onClick={() => joinMeeting(m.meeting_link)} className="px-3 py-1 bg-accent-cyan/20 rounded-lg text-sm flex items-center gap-1"><Video className="w-3 h-3" />Join</button></div></div>))}</div>
      {showForm && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-bg-card rounded-xl p-6 w-full max-w-md"><h2 className="text-xl font-bold mb-4">Schedule Meeting</h2><input placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3" /><textarea placeholder="Description" rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3" /><input type="datetime-local" value={formData.scheduled_for} onChange={(e) => setFormData({...formData, scheduled_for: e.target.value})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3" /><select value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3"><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>60 min</option></select><div className="flex gap-3"><button onClick={scheduleMeeting} className="flex-1 py-2 bg-accent-green/20 rounded-lg">Schedule</button><button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-accent-red/20 rounded-lg">Cancel</button></div></div></div>)}
    </div>
  );
};
export default Meetings;
