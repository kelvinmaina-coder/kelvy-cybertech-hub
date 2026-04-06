import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Plus, X, Video, Loader2, Link as LinkIcon, Copy } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Meeting {
  id: number;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  status: string | null;
  host_id: string;
  meeting_link: string | null;
  created_at: string;
}

export default function Meetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", scheduled_at: "", duration_minutes: "30" });

  const loadData = async () => {
    if (!user) return;
    const { data } = await supabase.from("meetings").select("*").order("scheduled_at", { ascending: true });
    setMeetings((data as Meeting[]) || []);
    const { data: profs } = await supabase.from("profiles").select("id, full_name");
    const map: Record<string, string> = {};
    (profs || []).forEach((p: any) => { map[p.id] = p.full_name || p.id.slice(0, 8); });
    setProfiles(map);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const scheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const meetingLink = `${window.location.origin}/meeting/${crypto.randomUUID().slice(0, 8)}`;
    const { error } = await supabase.from("meetings").insert({
      title: form.title,
      description: form.description || null,
      scheduled_at: form.scheduled_at,
      duration_minutes: Number(form.duration_minutes),
      host_id: user.id,
      meeting_link: meetingLink,
      status: "scheduled",
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Meeting scheduled");
    setForm({ title: "", description: "", scheduled_at: "", duration_minutes: "30" });
    setShowSchedule(false);
    loadData();
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied");
  };

  const upcoming = meetings.filter(m => new Date(m.scheduled_at) > new Date() && m.status === "scheduled");
  const past = meetings.filter(m => new Date(m.scheduled_at) <= new Date() || m.status === "completed");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-accent">MEETINGS</h1>
          <p className="text-sm text-muted-foreground font-mono">Schedule • Join • Video Calls</p>
        </div>
        <button onClick={() => setShowSchedule(!showSchedule)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-xs font-mono hover:bg-accent/30 transition">
          {showSchedule ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showSchedule ? "Cancel" : "Schedule Meeting"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Calendar} title="Upcoming" value={String(upcoming.length)} variant="purple" />
        <MetricCard icon={Clock} title="Total" value={String(meetings.length)} variant="cyan" />
        <MetricCard icon={Users} title="Past" value={String(past.length)} variant="green" />
        <MetricCard icon={Video} title="Today" value={String(meetings.filter(m => new Date(m.scheduled_at).toDateString() === new Date().toDateString()).length)} variant="orange" />
      </div>

      {showSchedule && (
        <form onSubmit={scheduleMeeting} className="rounded-lg border border-accent/30 bg-card p-4 space-y-3 animate-fade-in">
          <h3 className="font-display text-sm text-accent">SCHEDULE NEW MEETING</h3>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Meeting Title *"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono" />
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono min-h-[60px]" />
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} required
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono" />
            <select value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-mono text-sm hover:opacity-90 transition">Schedule</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-display text-sm text-accent mb-3">UPCOMING MEETINGS</h3>
              <div className="space-y-2">
                {upcoming.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border animate-border-glow">
                    <Video className="w-5 h-5 text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {new Date(m.scheduled_at).toLocaleString()} • {m.duration_minutes}min • Host: {profiles[m.host_id] || "You"}
                      </p>
                    </div>
                    {m.meeting_link && (
                      <button onClick={() => copyLink(m.meeting_link!)} className="px-2 py-1 rounded bg-muted/50 text-muted-foreground hover:text-foreground transition" title="Copy link">
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                    <a href={m.meeting_link || "#"} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-xs font-mono hover:bg-accent/30 transition">
                      Join
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-sm text-muted-foreground mb-3">PAST MEETINGS ({past.length})</h3>
            {past.length === 0 ? (
              <p className="text-sm text-muted-foreground font-mono text-center py-6">No past meetings</p>
            ) : (
              <div className="space-y-1">
                {past.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-2 rounded bg-muted/10 text-sm">
                    <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-foreground truncate">{m.title}</span>
                    <span className="text-xs text-muted-foreground font-mono">{new Date(m.scheduled_at).toLocaleDateString()}</span>
                    <span className="text-xs text-muted-foreground font-mono">{m.duration_minutes}min</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
