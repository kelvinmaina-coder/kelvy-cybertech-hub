import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Shield, Smartphone, Fingerprint, Key, Lock, Unlock,
  CheckCircle, XCircle, AlertTriangle, Loader2,
  Phone, Mail, Globe, Clock, History, Brain,
  ArrowRight, ChevronRight, ShieldCheck, ShieldAlert,
  Fingerprint as FingerprintIcon, QrCode, Scan, UserPlus
} from "lucide-react";

export default function SecuritySettingsPage() {
  const { user, profile, roles } = useAuth();
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "history">("profile");

  useEffect(() => {
    checkBiometricSupport();
    loadSecurityStatus();
    loadLoginHistory();
  }, []);

  const checkBiometricSupport = () => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      setBiometricSupported(true);
      // Check if already registered
      checkBiometricRegistered();
    }
  };

  const checkBiometricRegistered = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/security-status");
      const result = await response.json();
      if (result.success) {
        setBiometricRegistered(result.data.biometric_enabled);
      }
    } catch (error) {
      console.error("Error checking biometric status:", error);
    }
  };

  const loadSecurityStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/security-status");
      const result = await response.json();
      if (result.success) {
        setSecurityStatus(result.data);
        if (result.data.phone) setPhone(result.data.phone);
      }
    } catch (error) {
      console.error("Error loading security status:", error);
    }
  };

  const loadLoginHistory = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/login-history");
      const result = await response.json();
      if (result.success) {
        setLoginHistory(result.data);
        setAiInsights(result.ai_insights);
      }
    } catch (error) {
      console.error("Error loading login history:", error);
    }
  };

  const sendVerificationCode = async () => {
    if (!phone || phone.length < 9) {
      alert("Please enter a valid phone number");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/phone/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone, country_code: "+254" })
      });
      const result = await response.json();
      if (result.success) {
        setCodeSent(true);
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert(result.message || "Failed to send code");
      }
    } catch (error) {
      alert("Error sending verification code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      alert("Please enter the verification code");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone, code: verificationCode })
      });
      const result = await response.json();
      if (result.success) {
        alert("Phone verified successfully!");
        setCodeSent(false);
        setVerificationCode("");
        loadSecurityStatus();
      } else {
        alert(result.message || "Invalid code");
      }
    } catch (error) {
      alert("Error verifying code");
    } finally {
      setLoading(false);
    }
  };

  const registerBiometric = async () => {
    if (!biometricSupported) {
      alert("Biometric authentication is not supported on this device");
      return;
    }
    
    // WebAuthn registration
    try {
      // Create credential
      const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: { name: "Kelvy CyberTech Hub", id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(user?.id || "user"),
          name: user?.email || "",
          displayName: profile?.full_name || "User"
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform" as AuthenticatorAttachment,
          userVerification: "required" as UserVerificationRequirement
        },
        timeout: 60000,
        attestation: "none" as AttestationConveyancePreference
      };
      
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });
      
      if (credential) {
        const response = await fetch("http://localhost:8000/api/auth/biometric/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credential_id: btoa(String.fromCharCode(...new Uint8Array((credential as any).rawId))),
            public_key: btoa(String.fromCharCode(...new Uint8Array((credential as any).response.getPublicKey()))),
            device_name: navigator.platform,
            device_type: "webauthn"
          })
        });
        const result = await response.json();
        if (result.success) {
          alert("Biometric authentication enabled!");
          setBiometricRegistered(true);
          loadSecurityStatus();
        }
      }
    } catch (error) {
      console.error("Biometric registration error:", error);
      alert("Biometric registration failed. Please try again.");
    }
  };

  const disableBiometric = async () => {
    if (confirm("Are you sure you want to disable biometric authentication?")) {
      try {
        const response = await fetch("http://localhost:8000/api/auth/disable-biometric", {
          method: "POST"
        });
        const result = await response.json();
        if (result.success) {
          alert("Biometric authentication disabled");
          setBiometricRegistered(false);
          loadSecurityStatus();
        }
      } catch (error) {
        alert("Error disabling biometric");
      }
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getSecurityScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20";
    if (score >= 50) return "bg-yellow-500/20";
    return "bg-red-500/20";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Security Settings
          </h1>
          <p className="text-sm text-muted-foreground">Manage your authentication methods and security</p>
        </div>
      </div>

      {/* Security Score Card */}
      {securityStatus && (
        <div className="m-4 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-full ${getSecurityScoreBg(securityStatus.security_score)} flex items-center justify-center`}>
                <ShieldCheck className={`w-8 h-8 ${getSecurityScoreColor(securityStatus.security_score)}`} />
              </div>
              <div>
                <h3 className="font-semibold">Security Score</h3>
                <p className="text-2xl font-bold">{securityStatus.security_score}/100</p>
                <p className="text-sm capitalize">Strength: {securityStatus.strength}</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${getSecurityScoreBg(securityStatus.security_score)}`} style={{ width: `${securityStatus.security_score}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Based on your security settings and login history</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border flex px-4">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm transition flex items-center gap-2 ${
            activeTab === "profile" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <FingerprintIcon className="w-4 h-4" />
          My Profile
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 text-sm transition flex items-center gap-2 ${
            activeTab === "security" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <Lock className="w-4 h-4" />
          Security Methods
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm transition flex items-center gap-2 ${
            activeTab === "history" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <History className="w-4 h-4" />
          Login History
        </button>
      </div>

      {/* User Profile Tab */}
      {activeTab === "profile" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.2)] overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">{(profile?.full_name || "U")[0].toUpperCase()}</span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                  <UserPlus className="w-6 h-6 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {/* Handle upload logic */}} />
                </label>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-bold text-foreground">{profile?.full_name || "User Profile"}</h2>
                <p className="text-muted-foreground font-mono text-sm">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                    ROLE: {roles[0] || "CLIENT"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                    ID: {user?.id?.slice(0, 8)}...
                  </span>
                  <button className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider border border-border hover:text-foreground transition">
                    Change Photo
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-bold">Registration Data</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="font-medium">{profile?.full_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Email Address</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Registered On</span>
                    <span className="font-medium font-mono text-xs">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-bold">Permissions & Access</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Primary Role</span>
                    <span className="font-medium text-secondary">{roles[0]?.replace("_", " ").toUpperCase() || "CLIENT"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Service Level</span>
                    <span className="font-medium">Enterprise Hub v2</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">MFA Status</span>
                    <span className={`font-medium ${securityStatus?.phone_verified ? "text-green-500" : "text-yellow-500"}`}>
                      {securityStatus?.phone_verified ? "ENFORCED" : "INCOMPLETE"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-500 uppercase tracking-wider">Account Security Notice</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This profile contains sensitive enterprise registration data. Ensure your session is locked when leaving your workstation. 
                  Any changes to critical identity markers require Super Admin approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === "security" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Phone Verification */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Smartphone className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Phone Verification</h3>
                <p className="text-sm text-muted-foreground">Verify your phone number for added security</p>
                {securityStatus?.phone_verified ? (
                  <div className="mt-2 flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Phone verified: {securityStatus.phone}</span>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <input
                      type="tel"
                      placeholder="Phone number (e.g., 712345678)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full max-w-xs px-3 py-2 rounded-lg border border-border bg-background text-sm"
                      disabled={codeSent}
                    />
                    {!codeSent ? (
                      <button
                        onClick={sendVerificationCode}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition text-sm flex items-center gap-2"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                        Send Verification Code
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="w-full max-w-xs px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={verifyCode}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition text-sm"
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                          </button>
                          {countdown > 0 ? (
                            <span className="text-sm text-muted-foreground">Resend in {countdown}s</span>
                          ) : (
                            <button
                              onClick={sendVerificationCode}
                              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition text-sm"
                            >
                              Resend Code
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Biometric Authentication */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Fingerprint className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Biometric Authentication</h3>
                <p className="text-sm text-muted-foreground">Use fingerprint or face recognition to log in</p>
                {!biometricSupported ? (
                  <div className="mt-2 flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Biometric not supported on this device</span>
                  </div>
                ) : biometricRegistered ? (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Biometric enabled</span>
                    </div>
                    <button
                      onClick={disableBiometric}
                      className="px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition text-sm"
                    >
                      Disable Biometric
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={registerBiometric}
                    className="mt-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition text-sm flex items-center gap-2"
                  >
                    <FingerprintIcon className="w-4 h-4" />
                    Enable Biometric Login
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* AI Security Recommendations */}
          {securityStatus?.ai_recommendations?.length > 0 && (
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">AI Security Recommendations</h3>
                  <ul className="mt-2 space-y-1">
                    {securityStatus.ai_recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 mt-0.5 text-purple-500" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Login History Tab */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* AI Insights */}
          {aiInsights && (
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-500" />
                <div>
                  <h3 className="font-semibold">AI Security Analysis</h3>
                  <p className="text-sm mt-1">{aiInsights.summary}</p>
                  {aiInsights.suspicious_activities?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-yellow-500">Suspicious Activities:</p>
                      <ul className="mt-1 space-y-1">
                        {aiInsights.suspicious_activities.map((activity: string, i: number) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.recommendations?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-green-500">Recommendations:</p>
                      <ul className="mt-1 space-y-1">
                        {aiInsights.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <Shield className="w-3 h-3 text-green-500" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Login History List */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Login Activity
            </h3>
            <div className="space-y-3">
              {loginHistory.map((login) => (
                <div key={login.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {login.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium capitalize">{login.login_type}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(login.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{login.ip_address}</p>
                    {login.risk_score > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        login.risk_score > 70 ? "bg-red-500/20 text-red-500" : 
                        login.risk_score > 30 ? "bg-yellow-500/20 text-yellow-500" : 
                        "bg-green-500/20 text-green-500"
                      }`}>
                        Risk: {login.risk_score}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {loginHistory.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No login history available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
