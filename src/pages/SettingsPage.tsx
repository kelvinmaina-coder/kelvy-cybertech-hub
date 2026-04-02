import { useState, useEffect } from "react";
import { Settings, Users, Shield, UserCheck, UserX, Trash2, Search, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const { user, hasRole, signOut } = useAuth();
  const isSuperAdmin = hasRole("super_admin");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"pending" | "all">("pending");

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    if (!profiles) { setLoading(false); return; }

    const enriched: UserProfile[] = [];
    for (const p of profiles) {
      const { data: rolesData } = await supabase.from("user_roles").select("role").eq("user_id", p.id);
      enriched.push({
        ...p,
        roles: (rolesData || []).map((r: any) => r.role as AppRole),
      });
    }
    setUsers(enriched);
    setLoading(false);
  };

  useEffect(() => { if (isSuperAdmin) fetchUsers(); else setLoading(false); }, [isSuperAdmin]);

  const approveUser = async (userId: string) => {
    await supabase.from("profiles").update({ approved: true } as any).eq("id", userId);
    toast.success("User approved");
    fetchUsers();
  };

  const changeRole = async (userId: string, newRole: AppRole) => {
    // Delete existing roles, add new one
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole } as any);
    toast.success(`Role changed to ${newRole}`);
    fetchUsers();
  };

  const toggleApproval = async (userId: string, approved: boolean) => {
    await supabase.from("profiles").update({ approved } as any).eq("id", userId);
    toast.success(approved ? "User activated" : "User suspended");
    fetchUsers();
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
          <h3 className="font-display text-sm text-primary mb-4">MY PROFILE</h3>
          <p className="text-sm text-muted-foreground">Contact the super admin to modify your account settings.</p>
          <button onClick={signOut} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 text-destructive text-sm font-mono hover:bg-destructive/30 transition">
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
          <h1 className="text-2xl font-display font-bold text-foreground">SETTINGS</h1>
          <p className="text-sm text-muted-foreground font-mono">Super Admin • User Management & System Config</p>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs font-mono hover:bg-destructive/30 transition">
          <LogOut className="w-3 h-3" /> Sign Out
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("pending")} className={`px-4 py-2 rounded-lg text-xs font-mono transition ${tab === "pending" ? "bg-primary/20 text-primary" : "bg-card border border-border text-muted-foreground"}`}>
          PENDING APPROVALS {pendingUsers.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px]">{pendingUsers.length}</span>}
        </button>
        <button onClick={() => setTab("all")} className={`px-4 py-2 rounded-lg text-xs font-mono transition ${tab === "all" ? "bg-primary/20 text-primary" : "bg-card border border-border text-muted-foreground"}`}>
          ALL USERS ({users.length})
        </button>
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
                    <p className="text-xs text-muted-foreground font-mono">{u.phone} • {u.company || "No company"} • Registered {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select onChange={e => { approveUser(u.id); changeRole(u.id, e.target.value as AppRole); }}
                      className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground font-mono">
                      <option value="client">Approve as Client</option>
                      <option value="manager">Approve as Manager</option>
                      <option value="security_analyst">Approve as Security Analyst</option>
                      <option value="technician">Approve as Technician</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
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
                      <option value="super_admin">Super Admin</option>
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
      )}
    </div>
  );
}
