import { useState, useEffect } from "react";
import { Check, X, Loader2, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PendingUser {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  role: string;
  created_at: string;
}

export default function AdminApprovalsPage() {
  const { hasRole } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRole('super_admin')) return;
    fetchPendingUsers();
  }, [hasRole]);

  const fetchPendingUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        company,
        created_at,
        user_roles!inner(role)
      `)
      .eq('approved', false)
      .eq('user_roles.role', 'manager')
      .or('user_roles.role.eq.security_analyst,user_roles.role.eq.technician');

    if (error) {
      toast.error('Failed to fetch pending users');
      console.error(error);
      return;
    }

    // Get emails from auth.users (this might need RLS adjustment)
    const usersWithEmails = await Promise.all(
      data.map(async (user) => {
        const { data: authData } = await supabase.auth.admin.getUserById(user.id);
        return {
          ...user,
          email: authData?.user?.email || 'Unknown',
          role: user.user_roles?.[0]?.role || 'Unknown'
        };
      })
    );

    setPendingUsers(usersWithEmails);
    setLoading(false);
  };

  const handleApproval = async (userId: string, approve: boolean) => {
    setActionLoading(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ approved: approve })
      .eq('id', userId);

    if (error) {
      toast.error(`Failed to ${approve ? 'approve' : 'reject'} user`);
      console.error(error);
    } else {
      toast.success(`User ${approve ? 'approved' : 'rejected'}`);
      fetchPendingUsers(); // Refresh list
    }

    setActionLoading(null);
  };

  if (!hasRole('super_admin')) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-muted-foreground">Access Denied</h2>
          <p className="text-muted-foreground">You need super admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-accent">ADMIN APPROVALS</h1>
        <p className="text-sm text-muted-foreground font-mono">Review and approve pending user registrations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-muted-foreground">No Pending Approvals</h3>
          <p className="text-muted-foreground">All user registrations have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((user) => (
            <div key={user.id} className="glass rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display font-bold text-foreground">{user.full_name || 'Unknown'}</h3>
                    <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 text-xs font-mono capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono mb-1">{user.email}</p>
                  {user.phone && <p className="text-sm text-muted-foreground font-mono mb-1">📞 {user.phone}</p>}
                  {user.company && <p className="text-sm text-muted-foreground font-mono mb-1">🏢 {user.company}</p>}
                  <p className="text-xs text-muted-foreground font-mono">
                    Applied: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproval(user.id, true)}
                    disabled={actionLoading === user.id}
                    className="p-2 rounded-lg bg-green-500/20 text-green-600 hover:bg-green-500/30 transition disabled:opacity-50"
                  >
                    {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleApproval(user.id, false)}
                    disabled={actionLoading === user.id}
                    className="p-2 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 transition disabled:opacity-50"
                  >
                    {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}