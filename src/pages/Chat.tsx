import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Send, Users, Plus, Search, Hash, User, Loader2 } from "lucide-react";

interface Conversation {
  id: number;
  type: string;
  name: string | null;
  created_at: string;
  participants?: { user_id: string; profiles?: { full_name: string | null } }[];
  last_message?: string;
  unread?: number;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  sender_name?: string;
}

export default function Chat() {
  const { user, profile, roles } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [allUsers, setAllUsers] = useState<{ id: string; full_name: string | null; roles: string[] }[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);
    if (!parts || parts.length === 0) { setConversations([]); setLoading(false); return; }

    const ids = parts.map(p => p.conversation_id);
    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false });

    if (convos) {
      const enriched = await Promise.all(convos.map(async (c: any) => {
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", c.id);
        const otherIds = (participants || []).filter((p: any) => p.user_id !== user.id).map((p: any) => p.user_id);
        let displayName = c.name;
        if (c.type === "direct" && otherIds.length > 0) {
          const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", otherIds[0]).single();
          displayName = prof?.full_name || "Unknown User";
        }
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1);
        return { ...c, name: displayName, last_message: lastMsg?.[0]?.content || "" };
      }));
      setConversations(enriched);
    }
    setLoading(false);
  }, [user]);

  const loadMessages = useCallback(async (convoId: number) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) {
      const senderIds = [...new Set(data.map((m: any) => m.sender_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", senderIds);
      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p.full_name]));
      setMessages(data.map((m: any) => ({ ...m, sender_name: profileMap[m.sender_id] || "Unknown" })));
      setTimeout(scrollToBottom, 100);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("id, full_name");
    if (data) {
      const usersWithRoles = await Promise.all(data.filter((p: any) => p.id !== user?.id).map(async (p: any) => {
        const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", p.id);
        return { ...p, roles: (r || []).map((x: any) => x.role) };
      }));
      setAllUsers(usersWithRoles);
    }
  }, [user]);

  useEffect(() => { loadConversations(); loadUsers(); }, [loadConversations, loadUsers]);

  useEffect(() => {
    if (activeConvo) loadMessages(activeConvo);
  }, [activeConvo, loadMessages]);

  // Realtime messages
  useEffect(() => {
    const channel = supabase.channel("chat-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as any;
        if (msg.conversation_id === activeConvo) {
          (async () => {
            const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", msg.sender_id).single();
            setMessages(prev => [...prev, { ...msg, sender_name: prof?.full_name || "Unknown" }]);
            setTimeout(scrollToBottom, 100);
          })();
        }
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo, loadConversations]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvo || !user) return;
    setSending(true);
    await supabase.from("messages").insert({
      conversation_id: activeConvo,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  const startDirectChat = async (targetUserId: string) => {
    if (!user) return;
    // Check if direct conversation already exists
    const { data: myConvos } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", user.id);
    const { data: theirConvos } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", targetUserId);
    if (myConvos && theirConvos) {
      const myIds = new Set(myConvos.map((c: any) => c.conversation_id));
      const shared = theirConvos.filter((c: any) => myIds.has(c.conversation_id));
      for (const s of shared) {
        const { data: conv } = await supabase.from("conversations").select("type").eq("id", s.conversation_id).single();
        if (conv?.type === "direct") {
          setActiveConvo(s.conversation_id);
          setShowNewChat(false);
          return;
        }
      }
    }
    // Create new
    const { data: newConvo } = await supabase.from("conversations").insert({ type: "direct", created_by: user.id }).select().single();
    if (newConvo) {
      await supabase.from("conversation_participants").insert([
        { conversation_id: newConvo.id, user_id: user.id, role: "admin" },
        { conversation_id: newConvo.id, user_id: targetUserId, role: "member" },
      ]);
      setActiveConvo(newConvo.id);
      loadConversations();
    }
    setShowNewChat(false);
  };

  const activeConversation = conversations.find(c => c.id === activeConvo);
  const filteredUsers = allUsers.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()));

  const roleGroups = [
    { label: "Team", roles: ["super_admin", "manager", "security_analyst", "technician"], icon: Users },
    { label: "Clients", roles: ["client"], icon: User },
  ];

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0 rounded-xl border border-border overflow-hidden bg-card">
      {/* Conversations sidebar */}
      <div className="w-72 border-r border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-primary">MESSAGES</h2>
          <button onClick={() => setShowNewChat(!showNewChat)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showNewChat ? (
          <div className="flex-1 overflow-y-auto p-2">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono mb-2 focus:outline-none focus:border-primary/50" />
            {roleGroups.map(group => {
              const users = filteredUsers.filter(u => u.roles.some(r => group.roles.includes(r)));
              if (users.length === 0) return null;
              return (
                <div key={group.label} className="mb-3">
                  <p className="text-[10px] text-muted-foreground font-mono px-2 mb-1 uppercase tracking-wider">{group.label}</p>
                  {users.map(u => (
                    <button key={u.id} onClick={() => startDirectChat(u.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted/50 transition text-left">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {(u.full_name || "?")[0].toUpperCase()}
                      </div>
                      <span className="truncate text-foreground">{u.full_name || "Unknown"}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No conversations yet.<br />Click + to start chatting.
              </div>
            ) : (
              conversations.map(c => (
                <button key={c.id} onClick={() => setActiveConvo(c.id)}
                  className={`w-full flex items-center gap-2 p-3 border-b border-border/50 text-left transition hover:bg-muted/30
                    ${activeConvo === c.id ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    {c.type === "group" ? <Hash className="w-3.5 h-3.5 text-primary" /> :
                      <span className="text-xs font-bold text-primary">{(c.name || "?")[0].toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{c.name || "Chat"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{c.last_message || "No messages"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activeConvo ? (
          <>
            <div className="p-3 border-b border-border flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{(activeConversation?.name || "?")[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{activeConversation?.name || "Chat"}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{activeConversation?.type === "group" ? "Group" : "Direct"}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] ${isMe ? "bg-primary/20 border-primary/30" : "bg-muted/30 border-border"} border rounded-lg px-3 py-2`}>
                      {!isMe && <p className="text-[10px] text-primary font-mono mb-0.5">{msg.sender_name}</p>}
                      <p className="text-sm text-foreground whitespace-pre-wrap">{msg.is_deleted ? <i className="text-muted-foreground">Message deleted</i> : msg.content}</p>
                      <p className="text-[9px] text-muted-foreground mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {msg.is_edited && " â€¢ edited"}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50" />
                <button onClick={sendMessage} disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm hover:opacity-90 transition disabled:opacity-50">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-mono">Select a conversation or start a new chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

