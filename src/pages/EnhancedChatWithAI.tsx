import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Send, Paperclip, Mic, MicOff, Image, File, X, 
  Smile, MoreVertical, Reply, Forward, Pin, Trash2,
  Check, CheckCheck, Clock, Download, Copy, Flag,
  ThumbsUp, Heart, Laugh, Sad, Angry, Star, Volume2, VolumeX,
  Sparkles, Brain, Loader2
} from "lucide-react";

interface Message {
  id: number;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  voice_message_url: string | null;
  voice_message_duration: number | null;
  reply_to_id: number | null;
  forwarded_from_id: number | null;
  is_pinned: boolean;
  ai_summary: string | null;
  sentiment: string | null;
  reactions: Reaction[];
  reply_to?: Message;
}

interface Reaction {
  id: number;
  user_id: string;
  reaction: string;
}

interface User {
  id: string;
  full_name: string;
  role: string;
  is_online: boolean;
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
const OLLAMA_URL = "http://localhost:11434";

export default function EnhancedChatWithAI() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const receiverId = searchParams.get("user");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiver, setReceiver] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showReactions, setShowReactions] = useState<number | null>(null);
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  // AI States
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageDescription, setImageDescription] = useState<string>("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load receiver info
  useEffect(() => {
    if (receiverId) {
      loadReceiver();
      loadMessages();
      loadPinnedMessages();
    } else {
      navigate("/contacts");
    }
  }, [receiverId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.sender_id === receiverId || payload.new.receiver_id === receiverId) {
            loadMessages();
            if (payload.new.sender_id !== user?.id) {
              getAISmartReplies(payload.new.content);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => loadMessages()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, receiverId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadReceiver = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", receiverId)
      .single();
    if (data) setReceiver(data);
  };

  const loadMessages = async () => {
    if (!receiverId) return;
    
    const { data } = await supabase
      .from("messages")
      .select(`
        *,
        reactions:message_reactions(*),
        reply_to:messages!reply_to_id(*)
      `)
      .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
      .or(`sender_id.eq.${receiverId},receiver_id.eq.${receiverId}`)
      .order("created_at", { ascending: true });
    
    if (data) {
      setMessages(data);
      // Mark messages as read
      const unreadMessages = data.filter(m => m.receiver_id === user?.id && !m.is_read);
      for (const msg of unreadMessages) {
        await supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
      }
    }
    setLoading(false);
  };

  const loadPinnedMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select(`*, reactions:message_reactions(*)`)
      .eq("is_pinned", true)
      .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
      .order("pinned_at", { ascending: false });
    if (data) setPinnedMessages(data);
  };

  // ============ AI FUNCTIONS ============
  
  const checkOllamaStatus = async () => {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  };

  const getAISmartReplies = async (messageContent: string) => {
    setAiLoading(true);
    try {
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen2.5:7b",
          prompt: `Suggest 3 short, natural replies to this message: "${messageContent}". Return only the 3 replies, one per line, no numbering, no extra text. Keep each reply under 30 characters.`,
          stream: false
        })
      });
      const data = await response.json();
      const suggestions = data.response.split("\n").filter((s: string) => s.trim().length > 0).slice(0, 3);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
    }
    setAiLoading(false);
  };

  const summarizeChat = async () => {
    setAiLoading(true);
    const recentMessages = messages.slice(-20).map(m => 
      `${m.sender_id === user?.id ? "Me" : receiver?.full_name}: ${m.content}`
    ).join("\n");
    
    try {
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen2.5:7b",
          prompt: `Summarize this conversation in 2-3 sentences:\n\n${recentMessages}`,
          stream: false
        })
      });
      const data = await response.json();
      setAiSummary(data.response);
      setShowSummary(true);
    } catch (error) {
      console.error("Error summarizing chat:", error);
    }
    setAiLoading(false);
  };

  const analyzeSentiment = async (content: string, messageId: number) => {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen2.5:7b",
          prompt: `Analyze the sentiment of this message and respond with only one word: positive, negative, or neutral.\n\nMessage: "${content}"`,
          stream: false
        })
      });
      const data = await response.json();
      const sentiment = data.response.trim().toLowerCase();
      await supabase.from("messages").update({ sentiment }).eq("id", messageId);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    }
  };

  const analyzeImage = async (imageFile: File) => {
    setUploadingImage(true);
    setImageDescription("");
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result?.toString().split(",")[1];
      
      try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "qwen3-vl:8b",
            prompt: "Describe this image in detail. What do you see?",
            images: [base64Image],
            stream: false
          })
        });
        const data = await response.json();
        setImageDescription(data.response);
        
        // Send description as a message
        await supabase.from("messages").insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          content: `🖼️ AI Image Analysis: ${data.response.substring(0, 500)}`,
          is_read: false
        });
        loadMessages();
      } catch (error) {
        console.error("Error analyzing image:", error);
        setImageDescription("Failed to analyze image. Make sure qwen3-vl:8b is pulled.");
      }
    };
    reader.readAsDataURL(imageFile);
    setUploadingImage(false);
  };

  const useAISuggestion = (suggestion: string) => {
    setNewMessage(suggestion);
    setShowAIPanel(false);
  };

  // ============ CHAT FUNCTIONS ============

  const sendMessage = async () => {
    if (!newMessage.trim() && !uploadingFile) return;
    if (!receiverId) return;
    
    setSending(true);
    const messageData: any = {
      sender_id: user?.id,
      receiver_id: receiverId,
      content: newMessage.trim(),
      is_read: false
    };
    
    if (replyingTo) {
      messageData.reply_to_id = replyingTo.id;
      setReplyingTo(null);
    }
    
    const { data, error } = await supabase.from("messages").insert(messageData).select();
    if (!error && data) {
      setNewMessage("");
      loadMessages();
      // Analyze sentiment for the new message
      analyzeSentiment(newMessage.trim(), data[0].id);
    }
    setSending(false);
  };

  const addReaction = async (messageId: number, reaction: string) => {
    const existing = messages.find(m => m.id === messageId)?.reactions?.find(r => r.user_id === user?.id && r.reaction === reaction);
    
    if (existing) {
      await supabase.from("message_reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("message_reactions").insert({
        message_id: messageId,
        user_id: user?.id,
        reaction: reaction
      });
    }
    loadMessages();
    setShowReactions(null);
  };

  const togglePinMessage = async (message: Message) => {
    if (message.is_pinned) {
      await supabase.from("messages").update({ is_pinned: false, pinned_by: null, pinned_at: null }).eq("id", message.id);
    } else {
      await supabase.from("messages").update({ is_pinned: true, pinned_by: user?.id, pinned_at: new Date().toISOString() }).eq("id", message.id);
    }
    loadMessages();
    loadPinnedMessages();
  };

  const deleteForEveryone = async (messageId: number) => {
    if (confirm("Delete this message for everyone?")) {
      await supabase.from("messages").update({ deleted_for_everyone: true, content: "[Message deleted]" }).eq("id", messageId);
      loadMessages();
    }
  };

  const forwardMessage = async (message: Message) => {
    const contactId = prompt("Enter user ID to forward to:");
    if (contactId) {
      await supabase.from("messages").insert({
        sender_id: user?.id,
        receiver_id: contactId,
        content: message.content,
        forwarded_from_id: message.id,
        is_read: false
      });
      alert("Message forwarded!");
    }
  };

  const uploadFile = async (file: File) => {
    setUploadingFile(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `chat_uploads/${fileName}`;
    
    const { error: uploadError } = await supabase.storage.from("chat_files").upload(filePath, file);
    if (uploadError) {
      console.error("Upload error:", uploadError);
      setUploadingFile(false);
      return;
    }
    
    const { data: urlData } = supabase.storage.from("chat_files").getPublicUrl(filePath);
    
    await supabase.from("messages").insert({
      sender_id: user?.id,
      receiver_id: receiverId,
      content: `📎 ${file.name}`,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      is_read: false
    });
    
    setUploadingFile(false);
    loadMessages();
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const fileName = `voice_${Date.now()}.webm`;
        const filePath = `voice_messages/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from("chat_files").upload(filePath, audioBlob);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("chat_files").getPublicUrl(filePath);
          await supabase.from("messages").insert({
            sender_id: user?.id,
            receiver_id: receiverId,
            content: "🎤 Voice message",
            voice_message_url: urlData.publicUrl,
            voice_message_duration: voiceDuration,
            is_read: false
          });
          loadMessages();
        }
        stream.getTracks().forEach(track => track.stop());
        setRecordingVoice(false);
        setVoiceDuration(0);
      };
      
      mediaRecorder.start();
      setRecordingVoice(true);
      
      voiceTimerRef.current = setInterval(() => {
        setVoiceDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error recording voice:", error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && recordingVoice) {
      mediaRecorderRef.current.stop();
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getReactionCount = (messageId: number, reaction: string) => {
    const msg = messages.find(m => m.id === messageId);
    return msg?.reactions?.filter(r => r.reaction === reaction).length || 0;
  };

  const hasUserReacted = (messageId: number, reaction: string) => {
    const msg = messages.find(m => m.id === messageId);
    return msg?.reactions?.some(r => r.user_id === user?.id && r.reaction === reaction) || false;
  };

  const getSentimentColor = (sentiment: string | null) => {
    if (sentiment === "positive") return "text-green-500";
    if (sentiment === "negative") return "text-red-500";
    return "text-gray-500";
  };

  const filteredMessages = searchQuery ? messages.filter(m => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) : messages;

  if (loading || !receiver) {
    return <div className="flex items-center justify-center h-full">Loading chat...</div>;
  }

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/contacts")} className="lg:hidden">← Back</button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{receiver.full_name?.charAt(0)}</span>
              </div>
              {receiver.is_online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />}
            </div>
            <div>
              <h2 className="font-semibold">{receiver.full_name}</h2>
              <p className="text-xs text-muted-foreground">{receiver.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSearch(!showSearch)} className="p-2 hover:bg-muted rounded-lg">🔍</button>
            <button onClick={() => setShowAIPanel(!showAIPanel)} className="p-2 hover:bg-muted rounded-lg text-purple-500">
              <Sparkles className="w-4 h-4" />
            </button>
            <button onClick={summarizeChat} className="p-2 hover:bg-muted rounded-lg text-blue-500">
              <Brain className="w-4 h-4" />
            </button>
            <button onClick={() => navigate(`/call/${receiverId}?type=video`)} className="p-2 hover:bg-muted rounded-lg">📹</button>
            <button onClick={() => navigate(`/call/${receiverId}?type=audio`)} className="p-2 hover:bg-muted rounded-lg">📞</button>
          </div>
        </div>

        {/* AI Summary Panel */}
        {showSummary && aiSummary && (
          <div className="border-b border-border bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-purple-500">🤖 AI Summary</p>
              <button onClick={() => setShowSummary(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm mt-1">{aiSummary}</p>
          </div>
        )}

        {/* AI Smart Replies Panel */}
        {showAIPanel && (
          <div className="border-b border-border bg-muted/30 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-500">🤖 AI Smart Replies</p>
              <button onClick={() => setShowAIPanel(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating suggestions...</div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {aiSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => useAISuggestion(suggestion)}
                    className="px-3 py-1 bg-primary/10 hover:bg-primary/20 rounded-full text-sm transition"
                  >
                    {suggestion}
                  </button>
                ))}
                {aiSuggestions.length === 0 && (
                  <p className="text-sm text-muted-foreground">Click the sparkle icon on any message to get AI suggestions</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="border-b border-border bg-muted/30 p-2">
            <p className="text-xs text-muted-foreground mb-1">📌 Pinned Messages</p>
            {pinnedMessages.map(msg => (
              <div key={msg.id} className="text-sm text-foreground">📌 {msg.content.substring(0, 50)}...</div>
            ))}
          </div>
        )}

        {/* Search Bar */}
        {showSearch && (
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Search in chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1 rounded-lg border border-border bg-background"
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredMessages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            const isDeleted = msg.deleted_for_everyone;
            const sentimentColor = getSentimentColor(msg.sentiment);
            
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3 relative group`}>
                  
                  {/* Sentiment Indicator */}
                  {msg.sentiment && (
                    <div className={`text-[10px] mb-1 ${sentimentColor}`}>
                      {msg.sentiment === "positive" && "😊 Positive"}
                      {msg.sentiment === "negative" && "😞 Negative"}
                      {msg.sentiment === "neutral" && "😐 Neutral"}
                    </div>
                  )}
                  
                  {/* Reply to */}
                  {msg.reply_to && (
                    <div className="text-xs opacity-70 mb-1 border-l-2 pl-2">
                      ↪️ {msg.reply_to.content.substring(0, 50)}
                    </div>
                  )}
                  
                  {/* Forwarded from */}
                  {msg.forwarded_from_id && (
                    <div className="text-xs opacity-70 mb-1">📎 Forwarded</div>
                  )}
                  
                  {/* File attachment */}
                  {msg.file_url && (
                    <div className="mb-2">
                      {msg.file_type?.startsWith("image/") ? (
                        <img src={msg.file_url} alt={msg.file_name || "Image"} className="max-w-full rounded max-h-48 cursor-pointer" onClick={() => window.open(msg.file_url!)} />
                      ) : (
                        <a href={msg.file_url} download className="flex items-center gap-2 p-2 bg-black/20 rounded">
                          <File className="w-4 h-4" />
                          <span className="text-sm">{msg.file_name}</span>
                          <span className="text-xs opacity-70">{formatFileSize(msg.file_size || 0)}</span>
                          <Download className="w-3 h-3 ml-auto" />
                        </a>
                      )}
                    </div>
                  )}
                  
                  {/* Voice message */}
                  {msg.voice_message_url && (
                    <div className="flex items-center gap-2">
                      <audio controls src={msg.voice_message_url} className="h-8" />
                      <span className="text-xs">{formatTime(msg.voice_message_duration || 0)}</span>
                    </div>
                  )}
                  
                  {/* Text content */}
                  {!isDeleted && msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                  {isDeleted && <p className="italic opacity-70">Message deleted</p>}
                  
                  {/* Reactions */}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {REACTIONS.map(react => {
                      const count = getReactionCount(msg.id, react);
                      if (count > 0 || hasUserReacted(msg.id, react)) {
                        return (
                          <button
                            key={react}
                            onClick={() => addReaction(msg.id, react)}
                            className={`text-xs px-1.5 py-0.5 rounded-full ${hasUserReacted(msg.id, react) ? "bg-primary/20" : "bg-black/20"} flex items-center gap-0.5`}
                          >
                            {react} {count > 0 && count}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  {/* Message actions */}
                  <div className="absolute -top-8 right-0 bg-background border border-border rounded-lg shadow-lg hidden group-hover:flex gap-1 p-1 z-10">
                    <button onClick={() => { setReplyingTo(msg); getAISmartReplies(msg.content); }} className="p-1 hover:bg-muted rounded" title="Reply"><Reply className="w-3 h-3" /></button>
                    <button onClick={() => forwardMessage(msg)} className="p-1 hover:bg-muted rounded" title="Forward"><Forward className="w-3 h-3" /></button>
                    <button onClick={() => togglePinMessage(msg)} className="p-1 hover:bg-muted rounded" title="Pin"><Pin className="w-3 h-3" /></button>
                    <button onClick={() => setShowReactions(msg.id)} className="p-1 hover:bg-muted rounded" title="React"><Smile className="w-3 h-3" /></button>
                    <button onClick={() => getAISmartReplies(msg.content)} className="p-1 hover:bg-purple-500/20 rounded text-purple-500" title="AI Reply"><Sparkles className="w-3 h-3" /></button>
                    {isOwn && (
                      <button onClick={() => deleteForEveryone(msg.id)} className="p-1 hover:bg-red-500/20 rounded text-red-500" title="Delete"><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                  
                  {/* Reaction picker */}
                  {showReactions === msg.id && (
                    <div className="absolute -top-10 left-0 bg-background border border-border rounded-lg shadow-lg flex gap-1 p-1 z-20">
                      {REACTIONS.map(react => (
                        <button key={react} onClick={() => addReaction(msg.id, react)} className="p-1 hover:bg-muted rounded text-lg">{react}</button>
                      ))}
                    </div>
                  )}
                  
                  {/* Timestamp & status */}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] opacity-70">{new Date(msg.created_at).toLocaleTimeString()}</span>
                    {isOwn && (
                      msg.is_read ? <CheckCheck className="w-3 h-3 opacity-70" /> : <Check className="w-3 h-3 opacity-70" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="border-t border-border p-2 bg-muted/50 flex items-center justify-between">
            <span className="text-sm">↪️ Replying to: {replyingTo.content.substring(0, 50)}</span>
            <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Image Analysis Result */}
        {imageDescription && (
          <div className="border-t border-border p-2 bg-blue-500/10">
            <p className="text-sm">{imageDescription}</p>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-muted rounded-lg" disabled={uploadingFile}>
              <Paperclip className="w-5 h-5" />
            </button>
            <button onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-muted rounded-lg" disabled={uploadingImage}>
              <Image className="w-5 h-5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf,.txt,.doc,.docx" className="hidden" onChange={(e) => e.target.files && uploadFile(e.target.files[0])} />
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && analyzeImage(e.target.files[0])} />
            
            {recordingVoice ? (
              <div className="flex-1 flex items-center gap-2 bg-red-500/10 rounded-lg p-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm">Recording... {formatTime(voiceDuration)}</span>
                <button onClick={stopVoiceRecording} className="ml-auto p-2 bg-red-500 text-white rounded-lg">Stop</button>
              </div>
            ) : (
              <>
                <button onClick={startVoiceRecording} className="p-2 hover:bg-muted rounded-lg"><Mic className="w-5 h-5" /></button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
