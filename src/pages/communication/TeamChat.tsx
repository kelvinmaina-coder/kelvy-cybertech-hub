import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Smile, Paperclip, User, Bot } from 'lucide-react';

const TeamChat: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
    fetchMessages();
    const subscription = supabase.channel('messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages()).subscribe();
    return () => { subscription.unsubscribe(); };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchUser = async () => { const { data } = await supabase.auth.getUser(); if (data?.user) setUser(data.user); };
  const fetchMessages = async () => { const { data } = await supabase.from('messages').select('*, profiles(full_name)').order('created_at', { ascending: true }); if (data) setMessages(data); };

  const sendMessage = async () => {
    if (!input.trim()) return;
    await supabase.from('messages').insert([{ content: input, user_id: user?.id }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="bg-bg-card rounded-t-xl p-3 border-b border-border flex justify-between items-center"><h2 className="font-semibold">Team Chat</h2><Bot className="w-5 h-5 text-accent-purple" /></div>
      <div className="flex-1 overflow-auto p-4 space-y-3 bg-bg-secondary/30">
        {messages.map(msg => (<div key={msg.id} className="flex items-start gap-2"><div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center"><User className="w-4 h-4" /></div><div><p className="text-xs text-text-muted">{msg.profiles?.full_name || 'User'}</p><div className="bg-bg-card rounded-lg p-2 max-w-md"><p className="text-sm">{msg.content}</p></div></div></div>))}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-bg-card rounded-b-xl p-3 border-t border-border flex gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg text-sm" /><button onClick={sendMessage} className="px-4 py-2 bg-accent-green/20 rounded-lg"><Send className="w-4 h-4" /></button></div>
    </div>
  );
};
export default TeamChat;
