import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Video, Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Meeting {
  id: number;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  host_id: string;
  status: string;
  invitees: string[];
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

export default function Meetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduled_at: "",
    duration_minutes: 30,
    invitees: [] as string[],
  });

  useEffect(() => {
    loadMeetings();
    loadUsers();
  }, [user]);

  const loadMeetings = async () => {
    if (!user) return;
    
    // Fix: Get meetings where user is host
    const { data: hosted } = await supabase
      .from("meetings")
      .select("*")
      .eq("host_id", user.id)
      .order("scheduled_at", { ascending: true });
    
    // Get meetings where user is invited
    const { data: invited } = await supabase
      .from("meetings")
      .select("*")
      .order("scheduled_at", { ascending: true });
    
    const filteredInvited = (invited || []).filter(meeting => {
      const invitees = meeting.invitees as string[];
      return invitees && invitees.includes(user.id);
    });
    
    const allMeetings = [...(hosted || []), ...filteredInvited];
    const uniqueMeetings = allMeetings.filter((meeting, index, self) => 
      index === self.findIndex((m) => m.id === meeting.id)
    );
    uniqueMeetings.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    
    setMeetings(uniqueMeetings);
    setLoading(false);
  };

  const loadUsers = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, role");
    setUsers(data || []);
  };

  const scheduleMeeting = async () => {
    if (!formData.title || !formData.scheduled_at) {
      toast.error("Title and time required");
      return;
    }

    const { error } = await supabase.from("meetings").insert({
      title: formData.title,
      description: formData.description,
      scheduled_at: formData.scheduled_at,
      duration_minutes: formData.duration_minutes,
      host_id: user?.id,
      invitees: formData.invitees,
      status: "scheduled",
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Meeting scheduled!");
      setShowSchedule(false);
      setFormData({ title: "", description: "", scheduled_at: "", duration_minutes: 30, invitees: [] });
      loadMeetings();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string, scheduledAt: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const endTime = new Date(scheduled.getTime() + 30 * 60000);
    
    if (status === "cancelled") return <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">Cancelled</span>;
    if (now < scheduled) return <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">Upcoming</span>;
    if (now >= scheduled && now <= endTime) return <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 animate-pulse">Live</span>;
    return <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">Ended</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-accent">MEETINGS</h1>
          <p className="text-sm text-muted-foreground font-mono">Schedule and join video meetings</p>
        </div>
        <button
          onClick={() => setShowSchedule(true)}
          className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-mono flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      <div className="space-y-3">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="glass rounded-xl p-4 border border-border hover:border-accent/40 transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-mono font-bold text-foreground">{meeting.title}</h3>
                  {getStatusBadge(meeting.status, meeting.scheduled_at)}
                </div>
                {meeting.description && (
                  <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatTime(meeting.scheduled_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {meeting.duration_minutes} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {meeting.invitees?.length || 0} participants
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = `/call/${meeting.host_id}`}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-mono hover:bg-green-500/30 transition"
              >
                <Video className="w-3 h-3 inline mr-1" /> Join
              </button>
            </div>
          </div>
        ))}
        {meetings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No meetings scheduled</p>
            <button onClick={() => setShowSchedule(true)} className="mt-2 text-accent text-sm">Schedule one</button>
          </div>
        )}
      </div>

      {showSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-mono font-bold text-foreground">Schedule Meeting</h2>
              <button onClick={() => setShowSchedule(false)} className="p-1 hover:bg-accent/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Meeting title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/40"
              />
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/40"
                rows={2}
              />
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/40"
              />
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent/40"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
              </select>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Invite users</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.invitees.map((id) => {
                    const u = users.find(u => u.id === id);
                    return (
                      <span key={id} className="text-xs px-2 py-0.5 rounded bg-accent/20 flex items-center gap-1">
                        {u?.full_name}
                        <button onClick={() => setFormData({ ...formData, invitees: formData.invitees.filter(i => i !== id) })}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value && !formData.invitees.includes(e.target.value)) {
                      setFormData({ ...formData, invitees: [...formData.invitees, e.target.value] });
                    }
                    e.target.value = "";
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="">Select users to invite</option>
                  {users.filter(u => u.id !== user?.id && !formData.invitees.includes(u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <button
                onClick={scheduleMeeting}
                className="w-full py-2 rounded-lg bg-accent text-accent-foreground text-sm font-mono hover:opacity-90 transition"
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
