import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send, Mic, MicOff, Image, File, Smile, Pin, Forward, Trash2, Download, Loader2, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: number;
  content: string;
  sender_id: string;
  created_at: string;
  file_url: string | null;
  is_voice_message: boolean;
  reactions: Record<string, string[]>;
  is_pinned: boolean;
  sender_name?: string;
}

export default function EnhancedChat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("user");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [targetUser, setTargetUser] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (targetUserId) loadTargetUser();
    loadMessages();
    
    const channel = supabase.channel("chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => loadMessages())
      .subscribe();
      
    return () => { channel.unsubscribe(); };
  }, [targetUserId]);

  const loadTargetUser = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, role").eq("id", targetUserId).single();
    setTargetUser(data);
  };

  const loadMessages = async () => {
    if (!targetUserId) return;
    
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user?.id})`)
      .order("created_at", { ascending: true });
      
    const { data: profiles } = await supabase.from("profiles").select("id, full_name");
    const nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
    
    setMessages((data || []).map(m => ({ ...m, sender_name: nameMap[m.sender_id] })));
    setLoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
  };

  const sendMessage = async (content: string, fileUrl?: string, isVoice = false) => {
    if (!content.trim() && !fileUrl) return;
    setSending(true);
    
    const { error } = await supabase.from("chat_messages").insert({
      sender_id: user?.id,
      receiver_id: targetUserId,
      content: content || null,
      file_url: fileUrl || null,
      is_voice_message: isVoice,
      reactions: {},
      is_pinned: false,
    });
    
    if (error) toast.error("Failed to send");
    setNewMessage("");
    setSending(false);
    loadMessages();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], "voice.webm", { type: "audio/webm" });
        
        const { data, error } = await supabase.storage.from("chat_audio").upload(`${Date.now()}.webm`, file);
        if (data) {
          const { data: urlData } = supabase.storage.from("chat_audio").getPublicUrl(data.path);
          await sendMessage("", urlData.publicUrl, true);
        }
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setTimeout(() => mediaRecorder.stop(), 5000);
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  const addReaction = async (messageId: number, reaction: string) => {
    const message = messages.find(m => m.id === messageId);
    const reactions = message?.reactions || {};
    const users = reactions[reaction] || [];
    
    if (!users.includes(user?.id || "")) {
      users.push(user?.id || "");
      reactions[reaction] = users;
      await supabase.from("chat_messages").update({ reactions }).eq("id", messageId);
      loadMessages();
    }
  };

  const togglePin = async (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    await supabase.from("chat_messages").update({ is_pinned: !message?.is_pinned }).eq("id", messageId);
    loadMessages();
  };

  const deleteMessage = async (messageId: number) => {
    await supabase.from("chat_messages").update({ is_deleted: true }).eq("id", messageId);
    loadMessages();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div className="flex items-center justify-center h-[calc(100vh-7rem)]"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  if (!targetUser) return <div className="text-center py-12">Select a contact to start chatting</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-lg font-bold text-accent">{targetUser.full_name?.charAt(0)}</span>
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background"></div>
        </div>
        <div>
          <h3 className="font-mono font-bold text-foreground">{targetUser.full_name}</h3>
          <p className="text-xs text-muted-foreground">{targetUser.role?.replace("_", " ")}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.filter(m => !m.is_deleted).map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"} group`}>
            <div className={`max-w-[70%] rounded-lg px-3 py-2 ${msg.sender_id === user?.id ? "bg-accent/20" : "bg-card border border-border"}`}>
              {msg.is_voice_message ? (
                <audio controls src={msg.file_url || ""} className="h-8" />
              ) : msg.file_url ? (
                <a href={msg.file_url} target="_blank" className="text-accent text-sm flex items-center gap-2">
                  <File className="w-4 h-4" /> Download file
                </a>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                {msg.sender_id === user?.id && <CheckCheck className="w-3 h-3 text-muted-foreground" />}
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 ml-2">
              <button onClick={() => addReaction(msg.id, "👍")} className="p-1 hover:bg-accent/10 rounded">👍</button>
              <button onClick={() => addReaction(msg.id, "❤️")} className="p-1 hover:bg-accent/10 rounded">❤️</button>
              <button onClick={() => addReaction(msg.id, "😂")} className="p-1 hover:bg-accent/10 rounded">😂</button>
              <button onClick={() => togglePin(msg.id)} className="p-1 hover:bg-accent/10 rounded"><Pin className="w-3 h-3" /></button>
              <button onClick={() => deleteMessage(msg.id)} className="p-1 hover:bg-accent/10 rounded"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex gap-2">
        <input type="file" ref={fileInputRef} className="hidden" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const { data } = await supabase.storage.from("chat_files").upload(`${Date.now()}_${file.name}`, file);
            if (data) {
              const { data: urlData } = supabase.storage.from("chat_files").getPublicUrl(data.path);
              await sendMessage("", urlData.publicUrl);
            }
          }
        }} />
        <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-accent">
          <Image className="w-4 h-4" />
        </button>
        <button onClick={isRecording ? () => mediaRecorderRef.current?.stop() : startRecording} className={`p-2 rounded-lg transition ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-card border border-border text-muted-foreground hover:text-accent"}`}>
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(newMessage)} placeholder="Type a message..." className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-accent/40" />
        <button onClick={() => sendMessage(newMessage)} disabled={sending} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
