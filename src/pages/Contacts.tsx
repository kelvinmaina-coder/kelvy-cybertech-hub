import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, Phone, Video, MessageCircle, User, Shield, Briefcase, Wrench, Star, Circle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Contacts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("profiles").select("id, full_name, role").neq("id", user.id);
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  const startCall = (targetUser, type) => {
    navigate(`/call/${targetUser.id}`, { state: { user: targetUser, callType: type } });
  };

  const openChat = (targetUser) => {
    navigate(`/chat?user=${targetUser.id}`);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-accent mb-4">CONTACTS</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card" />
      </div>
      <div className="space-y-2">
        {users.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map((contact) => (
          <div key={contact.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-lg font-bold text-accent">{contact.full_name?.charAt(0) || "?"}</span>
              </div>
              <div>
                <p className="font-mono font-bold">{contact.full_name}</p>
                <p className="text-xs text-muted-foreground">{contact.role?.replace("_", " ")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openChat(contact)} className="p-2 rounded-lg bg-primary/10"><MessageCircle className="w-4 h-4" /></button>
              <button onClick={() => startCall(contact, "audio")} className="p-2 rounded-lg bg-green-500/10"><Phone className="w-4 h-4" /></button>
              <button onClick={() => startCall(contact, "video")} className="p-2 rounded-lg bg-purple-500/10"><Video className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
