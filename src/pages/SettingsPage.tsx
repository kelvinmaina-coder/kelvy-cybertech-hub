import { useState, useEffect } from "react";
import { Settings, Users, Shield, UserCheck, UserX, Search, Loader2, LogOut, Send, Bell, Camera, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import { useTheme } from "@/hooks/useTheme";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  approved: boolean;
  created_at: string;
  roles: AppRole[];
  email?: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, profile, hasRole, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const isSuperAdmin = hasRole("super_admin");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"pending" | "all" | "broadcast" | "profile">("pending");
  const [broadcastForm, setBroadcastForm] = useState({ title: "", message: "", priority: "normal", target_roles: "" });

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    if (!profiles) { setLoading(false); return; }

    const enriched: UserProfile[] = [];
    for (const p of profiles) {
      const { data: rolesData } = await supabase.from("user_roles").select("role").eq("user_id", p.id);
      enriched.push({ ...p, roles: (rolesData || []).map((r: any) => r.role as AppRole) });
    }
    setUsers(enriched);
    setLoading(false);
  };

  useEffect(() => { if (isSuperAdmin) fetchUsers(); else setLoading(false); }, [isSuperAdmin]);

  const approveUser = async (userId: string, role: AppRole = "client") => {
    await supabase.from("profiles").update({ approved: true } as any).eq("id", userId);
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role } as any);
    // Send notification to user
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "approval",
      title: "Account Approved",
      message: `Your account has been approved with role: ${role}. Welcome to Kelvy CyberTech Hub!`,
    } as any);
    toast.success(`User approved as ${role}`);
    fetchUsers();
  };

  const changeRole = async (userId: string, newRole: AppRole) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole } as any);
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "role",
      title: "Role Updated",
      message: `Your role has been changed to ${newRole}.`,
    } as any);
    toast.success(`Role changed to ${newRole}`);
    fetchUsers();
  };

  const toggleApproval = async (userId: string, approved: boolean) => {
    await supabase.from("profiles").update({ approved } as any).eq("id", userId);
    toast.success(approved ? "User activated" : "User suspended");
    fetchUsers();
  };

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoles = broadcastForm.target_roles ? broadcastForm.target_roles.split(",").map(r => r.trim()) : null;
    const { error } = await supabase.from("broadcast_notices").insert({
      title: broadcastForm.title,
      message: broadcastForm.message,
      priority: broadcastForm.priority,
      target_roles: targetRoles,
      created_by: user?.id,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Broadcast sent!");
    setBroadcastForm({ title: "", message: "", priority: "normal", target_roles: "" });
  };

  const pendingUsers = users.filter(u => !u.approved && u.id !== user?.id);
  const filteredUsers = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    u.roles.some(r => r.includes(search.toLowerCase()))
  );

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">SETTINGS</h1>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-display text-sm text-primary mb-6">MY PROFILE</h3>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-inner">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-14 h-14 text-primary opacity-50" />
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] hover:scale-110 transition-all">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Full Name</p>
                  <p className="text-sm font-semibold">{profile?.full_name || "Kelvy Operator"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Email Address</p>
                  <p className="text-sm font-semibold">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Phone Number</p>
                  <p className="text-sm font-semibold">{profile?.phone || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Organization</p>
                  <p className="text-sm font-semibold">{profile?.company || "Kelvy CyberTech Hub"}</p>
                </div>
              </div>
              flex-col gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Shield className="w-4 h-4" />
                    <span className="text-[11px] font-bold font-mono uppercase tracking-widest">AI-Verified Identity Operator</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Theme</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Dark', value: 'dark' },
                        { label: 'Light', value: 'light' },
                        { label: 'Cyberpunk', value: 'cyberpunk' },
                        { label: 'Sunset', value: 'sunset' },
                        { label: 'Forest', value: 'forest' },
                        { label: 'Ocean', value: 'ocean' },
                        { label: 'Royal', value: 'royal' },
                        { label: 'Matrix', value: 'matrix' },
                        { label: 'Midnight', value: 'midnight' },
                        { label: 'Aurora', value: 'aurora' },
                      ].map((themeOption) => (
                        <button
                          key={themeOption.value}
                          type="button"
                          onClick={() => setTheme(themeOption.value as any)}
                          className={`rounded-lg border px-3 py-2 text-xs transition ${theme === themeOption.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground hover:bg-muted'}`}
                        >
                          {themeOption.label}
                        </button>
                      ))}
                    </div>
                  </div
                  <div className="flex items-center gap-2 text-primary">
                    <Shield className="w-4 h-4" />
                    <span className="text-[11px] font-bold font-mono uppercase tracking-widest">AI-Verified Identity Operator</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Theme</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Dark', value: 'dark' },
                        { label: 'Light', value: 'light' },
                        { label: 'Cyberpunk', value: 'cyberpunk' },
                        { label: 'Sunset', value: 'sunset' },
                        { label: 'Forest', value: 'forest' },
                        { label: 'Ocean', value: 'ocean' },
                        { label: 'Royal', value: 'royal' },
                        { label: 'Matrix', value: 'matrix' },
                        { label: 'Midnight', value: 'midnight' },
                        { label: 'Aurora', value: 'aurora' },
                      ].map((themeOption) => (
                        <button
                          key={themeOption.value}
                          type="button"
                          onClick={() => setTheme(themeOption.value as any)}
                          className={`rounded-lg border px-3 py-2 text-xs transition ${theme === themeOption.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground hover:bg-muted'}`}
                        >
                          {themeOption.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button onClick={signOut} className="mt-8 flex items-center gap-2 px-6 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-widest hover:bg-destructive/20 transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">SYSTEM SETTINGS</h1>
          <p className="text-sm text-muted-foreground font-mono">Super Admin • User Management & Broadcasts</p>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs font-mono hover:bg-destructive/30 transition">
          <LogOut className="w-3 h-3" /> Sign Out
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["pending", "all", "broadcast"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-mono transition ${tab === t ? "bg-primary/20 text-primary" : "bg-card border border-border text-muted-foreground"}`}>
            {t === "pending" ? `PENDING (${pendingUsers.length})` : t === "all" ? `ALL USERS (${users.length})` : "BROADCAST"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : tab === "pending" ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-warning mb-3">PENDING APPROVALS</h3>
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono py-4 text-center">No pending approvals</p>
          ) : (
            <div className="space-y-2">
              {pendingUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
                  <div>
                    <p className="text-sm text-foreground font-medium">{u.full_name || "No name"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{u.phone || "No phone"} • {u.company || "No company"} • {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select onChange={e => approveUser(u.id, e.target.value as AppRole)} defaultValue=""
                      className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground font-mono">
                      <option value="" disabled>Approve as...</option>
                      <option value="client">Client</option>
                      <option value="manager">Manager</option>
                      <option value="security_analyst">Security Analyst</option>
                      <option value="technician">Technician</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === "all" ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono" />
            </div>
          </div>
          <div className="space-y-2">
            {filteredUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${u.approved ? "bg-primary" : "bg-destructive"}`} />
                  <div>
                    <p className="text-sm text-foreground font-medium">{u.full_name || "No name"}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {u.roles.join(", ")} • {u.approved ? "Active" : "Suspended"} • {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {u.id !== user?.id && (
                  <div className="flex items-center gap-2">
                    <select value={u.roles[0] || "client"} onChange={e => changeRole(u.id, e.target.value as AppRole)}
                      className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground font-mono">
                      <option value="manager">Manager</option>
                      <option value="security_analyst">Security Analyst</option>
                      <option value="technician">Technician</option>
                      <option value="client">Client</option>
                      <option value="guest">Guest</option>
                    </select>
                    <button onClick={() => toggleApproval(u.id, !u.approved)}
                      className={`p-1.5 rounded ${u.approved ? "text-destructive hover:bg-destructive/20" : "text-primary hover:bg-primary/20"} transition`}
                      title={u.approved ? "Suspend" : "Activate"}>
                      {u.approved ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-primary mb-3 flex items-center gap-2"><Bell className="w-4 h-4" /> SEND BROADCAST NOTICE</h3>
          <form onSubmit={sendBroadcast} className="space-y-3">
            <input value={broadcastForm.title} onChange={e => setBroadcastForm(p => ({ ...p, title: e.target.value }))} required
              placeholder="Notice Title *" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono" />
            <textarea value={broadcastForm.message} onChange={e => setBroadcastForm(p => ({ ...p, message: e.target.value }))} required
              placeholder="Message content..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono min-h-[80px]" />
            <div className="grid grid-cols-2 gap-3">
              <select value={broadcastForm.priority} onChange={e => setBroadcastForm(p => ({ ...p, priority: e.target.value }))}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono">
                <option value="low">Low Priority</option>
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <input value={broadcastForm.target_roles} onChange={e => setBroadcastForm(p => ({ ...p, target_roles: e.target.value }))}
                placeholder="Target roles (optional, comma-sep)" className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm hover:opacity-90 transition">
              <Send className="w-4 h-4" /> Send Broadcast
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
