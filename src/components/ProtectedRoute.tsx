import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { ShieldX, Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, roles, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // If specific roles required, check
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some(r => roles.includes(r));
    if (!hasAccess) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
          <ShieldX className="w-16 h-16 text-destructive" />
          <h2 className="text-xl font-display font-bold text-destructive">ACCESS DENIED</h2>
          <p className="text-sm text-muted-foreground font-mono max-w-md">
            You don't have permission to access this module. Contact the super admin to request access.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Your role: {roles.join(", ") || "none"} • Required: {allowedRoles.join(" or ")}
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
