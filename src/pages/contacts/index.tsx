import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, Phone, Video, MessageCircle, MoreVertical, User, Shield,
  Users, Briefcase, Terminal, Clock, CheckCircle, CircleOff, Mail, Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
  email: string;
  department: string | null;
}

const roleIcons: Record<string, any> = {
  super_admin: Shield,
  manager: Briefcase,
  security_analyst: Shield,
  technician: Terminal,
  client: Users,
  guest: User,
};

const roleColors: Record<string, string> = {
  super_admin: "text-purple-500 bg-purple-500/10",
  manager: "text-blue-500 bg-blue-500/10",
  security_analyst: "text-red-500 bg-red-500/10",
  technician: "text-green-500 bg-green-500/10",
  client: "text-orange-500 bg-orange-500/10",
  guest: "text-gray-500 bg-gray-500/10",
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  security_analyst: "Security Analyst",
  technician: "Technician",
  client: "Client",
  guest: "Guest",
};

export default function ContactsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const roles = ["all", "super_admin", "manager", "security_analyst", "technician", "client", "guest"];

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, avatar_url, email, department")
        .neq("id", user?.id);

      if (error) throw error;

      const { data: presence } = await supabase
        .from("user_presence")
        .select("user_id, status, last_seen");

      const presenceMap = new Map();
      presence?.forEach(p => {
        presenceMap.set(p.user_id, {
          is_online: p.status === "online",
          last_seen: p.last_seen
        });
      });

      const usersWithStatus = (data || []).map(u => ({
        ...u,
        is_online: presenceMap.get(u.id)?.is_online || false,
        last_seen: presenceMap.get(u.id)?.last_seen || null,
      }));

      setUsers(usersWithStatus);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const role = user.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {} as Record<string, Profile[]>);

  const getOnlineCount = () => users.filter(u => u.is_online).length;

  const startCall = (targetUser: Profile, type: "audio" | "video") => {
    localStorage.setItem("call_target", JSON.stringify({
      id: targetUser.id,
      name: targetUser.full_name,
      role: targetUser.role,
      type: type
    }));
    navigate(`/call/${targetUser.id}?type=${type}`);
  };

  const openChat = (targetUser: Profile) => {
    navigate(`/enhanced-chat?user=${targetUser.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {getOnlineCount()} online · {users.length} total users
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono transition whitespace-nowrap ${
                selectedRole === role
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {role === "all" ? "All" : roleLabels[role] || role}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {Object.entries(groupedUsers).map(([role, roleUsers]) => (
          <div key={role}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg ${roleColors[role]}`}>
                {(() => {
                  const Icon = roleIcons[role] || Users;
                  return <Icon className="w-4 h-4" />;
                })()}
              </div>
              <h2 className="font-semibold text-foreground">{roleLabels[role] || role}</h2>
              <span className="text-xs text-muted-foreground">({roleUsers.length})</span>
            </div>
            <div className="grid gap-3">
              {roleUsers.map(user => (
                <div key={user.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {user.full_name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card ${
                        user.is_online ? "bg-green-500 animate-pulse" : "bg-gray-500"
                      }`} />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">{user.full_name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono ${roleColors[user.role]}`}>
                          {(() => {
                            const Icon = roleIcons[user.role] || User;
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {roleLabels[user.role] || user.role}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {user.is_online ? (
                          <span className="text-xs text-green-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Online
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Last seen recently
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openChat(user)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition" title="Send Message">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => startCall(user, "audio")} className="p-2 rounded-lg hover:bg-green-500/10 text-green-500 transition" title="Audio Call">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button onClick={() => startCall(user, "video")} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition" title="Video Call">
                        <Video className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedUser(user); setShowUserDetails(true); }} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition" title="View Details">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No contacts found</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowUserDetails(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl z-50 p-6">
            <div className="text-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-primary">
                  {selectedUser.full_name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{selectedUser.full_name}</h2>
              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono mt-2 ${roleColors[selectedUser.role]}`}>
                {roleLabels[selectedUser.role] || selectedUser.role}
              </span>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm flex items-center gap-1 ${selectedUser.is_online ? "text-green-500" : "text-muted-foreground"}`}>
                  {selectedUser.is_online ? <CheckCircle className="w-3 h-3" /> : <CircleOff className="w-3 h-3" />}
                  {selectedUser.is_online ? "Online" : "Offline"}
                </span>
              </div>
              {selectedUser.department && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <span className="text-sm text-foreground">{selectedUser.department}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm text-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {selectedUser.email}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { openChat(selectedUser); setShowUserDetails(false); }} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition">
                Send Message
              </button>
              <button onClick={() => { startCall(selectedUser, "video"); setShowUserDetails(false); }} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted/50 transition">
                Call Now
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
