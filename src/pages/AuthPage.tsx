import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import kelvyLogo from "@/assets/kelvy-logo.png";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 cyber-grid">
      <div className="scanline fixed inset-0 pointer-events-none z-50" />
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={kelvyLogo} alt="Kelvy CyberTech" className="w-16 h-16 mx-auto rounded-xl mb-3" />
          <h1 className="font-display text-2xl font-bold text-primary text-glow-green">KELVY CYBERTECH HUB</h1>
          <p className="text-xs text-muted-foreground font-mono tracking-widest mt-1">AI-POWERED ENTERPRISE PLATFORM</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex mb-6 border border-border rounded-lg overflow-hidden">
            <button onClick={() => setTab("login")} className={`flex-1 py-2 text-sm font-mono transition ${tab === "login" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              SIGN IN
            </button>
            <button onClick={() => setTab("register")} className={`flex-1 py-2 text-sm font-mono transition ${tab === "register" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              REGISTER
            </button>
          </div>

          {tab === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) toast.error(error);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground font-mono mb-1 block">EMAIL</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono" placeholder="you@example.com" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-mono mb-1 block">PASSWORD</label>
        <div className="relative">
          <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono pr-10" placeholder="••••••••" />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
        {loading ? "AUTHENTICATING..." : "SIGN IN"}
      </button>
    </form>
  );
}

function RegisterForm() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", company: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName, form.phone, form.company);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Account created! Check your email to verify your account.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground font-mono mb-1 block">FULL NAME *</label>
        <input type="text" value={form.fullName} onChange={e => update("fullName", e.target.value)} required
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono" placeholder="Your full name" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-mono mb-1 block">EMAIL *</label>
        <input type="email" value={form.email} onChange={e => update("email", e.target.value)} required
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono" placeholder="you@example.com" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-mono mb-1 block">PHONE</label>
          <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono" placeholder="0787730624" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-mono mb-1 block">COMPANY</label>
          <input type="text" value={form.company} onChange={e => update("company", e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono" placeholder="Optional" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-mono mb-1 block">PASSWORD *</label>
        <div className="relative">
          <input type={showPw ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} required
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono pr-10" placeholder="Min 6 characters" />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-mono mb-1 block">CONFIRM PASSWORD *</label>
        <input type="password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} required
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono" placeholder="Re-enter password" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
        {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
      </button>
      <p className="text-xs text-muted-foreground text-center font-mono">
        Default role: CLIENT • Admin approval required for elevated access
      </p>
    </form>
  );
}
