import { Link } from "react-router-dom";
import NeuralNetworkBackground from "@/components/NeuralNetworkBackground";
import { Shield, Bot, BarChart3, Users, Network, Server, FileText, Code } from "lucide-react";
import EnhancedAIChat from "@/components/EnhancedAIChat";
import ThreeScene from "@/components/ThreeScene";

const features = [
  { icon: Shield, title: "Cybersecurity", desc: "Threat detection, SOC, SIEM, vulnerability scanning, incident response" },
  { icon: Network, title: "Networking", desc: "Infrastructure monitoring, device discovery, bandwidth analysis, VPN management" },
  { icon: Server, title: "Cloud Security", desc: "AWS, Azure, GCP security posture, compliance monitoring, cloud access management" },
  { icon: FileText, title: "Compliance", desc: "GDPR, ISO27001, Kenya DPA compliance tracking, audit reports, risk assessments" },
  { icon: BarChart3, title: "Business Continuity", desc: "DRP, BCP planning, disaster recovery testing, backup management" },
  { icon: Users, title: "E-Sign & Referral", desc: "Digital contracts, electronic signatures, referral tracking, commission management" },
  { icon: Bot, title: "AI/ML Center", desc: "Chat, analytics, predictions, automated reporting, intelligent insights" },
  { icon: Code, title: "Training Hub", desc: "Security awareness training, certifications, compliance courses, knowledge base" },
];

const stats = [
  { value: "8", label: "Core Domains" },
  { value: "100%", label: "Local AI" },
  { value: "KES 0", label: "To Start" },
  { value: "24/7", label: "Support" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-lg bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              🛡️
            </div>
            <span className="font-display text-sm font-bold text-primary">KELVY CYBERTECH HUB</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://wa.me/254787730624?text=Hello,%20I%20need%20help%20with%20Kelvy%20CyberTech%20Hub" target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition">
              📞 Contact Us
            </a>
            <Link to="/auth" className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-32 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono mb-6 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> AI-POWERED • LOCAL • ENTERPRISE READY
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 text-glow-green">
            <span className="text-primary">KELVY CYBERTECH HUB</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-body">
            AI-Powered Enterprise Security Platform for Kenyan Businesses. All domains of computing — one unified platform.
          </p>
          <div className="flex items-center justify-center gap-4 mb-12">
            <Link to="/auth" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:opacity-90 transition glow-border">
              🚀 Launch Dashboard
            </Link>
            <a href="#features" className="px-6 py-3 rounded-lg border border-border text-sm font-mono text-muted-foreground hover:text-foreground transition">
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="glass rounded-xl p-4 text-center">
                <p className="text-2xl font-display font-bold text-primary text-glow-green">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-mono tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> 3D SECURITY VISUALIZATION
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Realtime topology and threat signal awareness</h2>
            <p className="text-sm text-muted-foreground max-w-xl leading-7">
              Explore a live interactive 3D model of your enterprise security posture. See attack surface, risk signals, and AI-driven response flows.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Local AI, local control",
                "KES-native security metrics",
                "Role-based team approvals",
                "Enterprise-ready operations"
              ].map(item => (
                <div key={item} className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">{item}</div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl border border-border p-4">
            <ThreeScene />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Enterprise Domains</h2>
          <p className="text-sm text-muted-foreground font-mono">Complete cybersecurity and business solutions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className="glass rounded-xl p-5 hover:border-primary/30 transition group">
              <f.icon className={`w-8 h-8 text-primary mb-3 group-hover:scale-110 transition`} />
              <h3 className="font-display text-sm font-bold text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Chat Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Try Our AI Assistant</h2>
          <p className="text-sm text-muted-foreground font-mono">Ask anything - completely free, no limits, powered by local Ollama AI</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <EnhancedAIChat
            storageKey="kelvy-public-chat"
            title="Kelvy Security AI"
            systemPrompt="You are the Kelvy CyberTech Hub AI assistant — expert in cybersecurity, networking, cloud security, Kenya Data Protection Act, GDPR, ISO 27001, business continuity, and enterprise IT. Provide helpful, accurate, professional answers."
            className="min-h-[520px]"
          />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-border/50 bg-muted/5">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">100% Free Tech Stack</h2>
          <p className="text-sm text-muted-foreground font-mono mb-8">Enterprise-grade tools at zero cost</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Ollama AI", "Supabase", "React", "Tailwind", "FastAPI", "Docker", "PostgreSQL", "Recharts", "TypeScript", "Vite"].map(t => (
              <span key={t} className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-mono text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="glass rounded-2xl p-8 md:p-12 border border-primary/20">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">Ready to Take Control?</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
            Join Kelvy CyberTech Hub and access the most comprehensive AI-powered enterprise platform. Built in Kenya, for the world.
          </p>
          <Link to="/auth" className="inline-flex px-8 py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:opacity-90 transition">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-mono">© 2026 Kelvy CyberTech Hub. All rights reserved.</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">Built by Kelvin • Powered by Ollama AI • Made in Kenya 🇰🇪</p>
        </div>
      </footer>
    </div>
  );
}
