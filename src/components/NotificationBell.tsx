import { useState, useEffect, useCallback } from "react";
import { Bell, X, Check, CheckCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const typeIcons: Record<string, string> = {
  security: "🛡️", system: "⚙️", ticket: "🎫", chat: "💬",
  scan: "🔍", invoice: "💰", role: "👤", assignment: "📋", mention: "📢",
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data as Notification[]);
      setUnread(data.filter((n: any) => !n.is_read).length);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("notif-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const markRead = async (id: number) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    load();
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    load();
  };

  const dismiss = async (id: number) => {
    await supabase.from("notifications").update({ is_archived: true }).eq("id", id);
    load();
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-muted/50 transition text-muted-foreground hover:text-foreground">
        <Bell className="w-4.5 h-4.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-primary">NOTIFICATIONS</h3>
              <div className="flex gap-1">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-muted-foreground hover:text-primary font-mono flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" /> Mark all
                  </button>
                )}
                <Link to="/notifications" onClick={() => setOpen(false)} className="text-[10px] text-muted-foreground hover:text-primary font-mono ml-2">
                  View all
                </Link>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-3 border-b border-border/50 hover:bg-muted/20 transition cursor-pointer ${!n.is_read ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                    onClick={() => !n.is_read && markRead(n.id)}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">{typeIcons[n.type] || "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{n.message}</p>
                        <p className="text-[9px] text-muted-foreground mt-1 font-mono">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} className="p-1 hover:text-destructive text-muted-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
