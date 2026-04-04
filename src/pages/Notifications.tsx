import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, CheckCheck, Trash2, Filter, Megaphone, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const types = ["all", "security", "system", "ticket", "chat", "scan", "invoice", "role", "assignment"];
const typeIcons: Record<string, string> = {
  security: "🛡️", system: "⚙️", ticket: "🎫", chat: "💬",
  scan: "🔍", invoice: "💰", role: "👤", assignment: "📋", mention: "📢",
};

export default function Notifications() {
  const { user, hasRole } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcast, setBroadcast] = useState({ title: "", message: "", priority: "normal" });
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    let q = supabase.from("notifications").select("*").eq("user_id", user.id).eq("is_archived", false).order("created_at", { ascending: false }).limit(50);
    if (filter !== "all") q = q.eq("type", filter);
    const { data } = await q;
    setNotifications((data || []) as Notification[]);
    setLoading(false);
  }, [user, filter]);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    load();
  };

  const deleteAll = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_archived: true }).eq("user_id", user.id);
    load();
  };

  const sendBroadcast = async () => {
    if (!broadcast.title || !broadcast.message) return;
    setSending(true);
    // Get all user IDs
    const { data: users } = await supabase.from("profiles").select("id");
    if (users) {
      const notifs = users.map((u: any) => ({
        user_id: u.id,
        type: "system",
        title: `📢 ${broadcast.title}`,
        message: broadcast.message,
      }));
      await supabase.from("notifications").insert(notifs);
      // Also save broadcast notice
      await supabase.from("broadcast_notices").insert({
        title: broadcast.title,
        message: broadcast.message,
        priority: broadcast.priority,
        created_by: user?.id,
      });
    }
    toast.success("Broadcast sent to all users!");
    setBroadcast({ title: "", message: "", priority: "normal" });
    setShowBroadcast(false);
    setSending(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-primary text-glow-green flex items-center gap-2">
            <Bell className="w-5 h-5" /> NOTIFICATIONS
          </h1>
          <p className="text-xs text-muted-foreground font-mono">All your alerts and updates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-primary transition flex items-center gap-1">
            <CheckCheck className="w-3 h-3" /> Mark All Read
          </button>
          <button onClick={deleteAll} className="px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-destructive transition flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Clear All
          </button>
          {hasRole("super_admin") && (
            <button onClick={() => setShowBroadcast(!showBroadcast)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono flex items-center gap-1">
              <Megaphone className="w-3 h-3" /> Broadcast
            </button>
          )}
        </div>
      </div>

      {/* Broadcast form for super_admin */}
      {showBroadcast && hasRole("super_admin") && (
        <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3">
          <h3 className="text-sm font-mono font-bold text-primary">📢 SEND BROADCAST NOTICE</h3>
          <input value={broadcast.title} onChange={e => setBroadcast(p => ({ ...p, title: e.target.value }))} placeholder="Notice title"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50" />
          <textarea value={broadcast.message} onChange={e => setBroadcast(p => ({ ...p, message: e.target.value }))} placeholder="Notice message..." rows={3}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50 resize-none" />
          <div className="flex items-center gap-3">
            <select value={broadcast.priority} onChange={e => setBroadcast(p => ({ ...p, priority: e.target.value }))}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button onClick={sendBroadcast} disabled={sending} className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono flex items-center gap-1 disabled:opacity-50">
              {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Send to All Users
            </button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex gap-1 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition ${filter === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
            {t === "all" ? "ALL" : `${typeIcons[t] || "🔔"} ${t.toUpperCase()}`}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">No notifications</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`p-3 border-b border-border/50 hover:bg-muted/10 transition ${!n.is_read ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">{typeIcons[n.type] || "🔔"}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
