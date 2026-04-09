import { useState } from "react";
import { Layout, Globe, Palette, ShieldCheck, ExternalLink, Settings, Eye, Zap } from "lucide-react";

export default function ClientPortal() {
  const [isPublishing, setIsPublishing] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Layout className="w-5 h-5" />
            WHITE-LABEL CLIENT PORTAL
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Custom Branding & Personalized Client Dashboards
          </p>
        </div>
        <button 
           onClick={() => { setIsPublishing(true); setTimeout(() => setIsPublishing(false), 2000); }}
           className={`px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-tighter ${isPublishing ? 'animate-pulse' : ''}`}
        >
          {isPublishing ? <Zap className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          {isPublishing ? "PUBLISHING..." : "PREVIEW PORTAL"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card border border-border rounded-xl p-6 space-y-8">
           <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground border-b border-border pb-4">Portal Configuration</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Company Name</label>
                 <input type="text" defaultValue="Acme Corp" className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 font-mono text-sm outline-none focus:border-primary" />
              </div>
              <div>
                 <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Subdomain</label>
                 <div className="flex items-center">
                    <input type="text" defaultValue="acme" className="flex-1 bg-muted/30 border border-border rounded-l-lg px-4 py-2 font-mono text-sm outline-none focus:border-primary" />
                    <span className="bg-muted border border-l-0 border-border px-3 py-2 text-[10px] font-mono rounded-r-lg">.kelvy.ai</span>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Branding & Aesthetics</label>
              <div className="grid grid-cols-3 gap-4">
                 <div className="p-4 rounded-xl border border-border bg-card flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition group">
                    <Palette className="w-6 h-6 text-muted-foreground group-hover:text-primary transition" />
                    <span className="text-[10px] font-bold font-mono uppercase">Primary Color</span>
                 </div>
                 <div className="p-4 rounded-xl border border-border bg-card flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition group">
                    <Globe className="w-6 h-6 text-muted-foreground group-hover:text-primary transition" />
                    <span className="text-[10px] font-bold font-mono uppercase">Custom Logo</span>
                 </div>
                 <div className="p-4 rounded-xl border border-border bg-card flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition group">
                    <Settings className="w-6 h-6 text-muted-foreground group-hover:text-primary transition" />
                    <span className="text-[10px] font-bold font-mono uppercase">Favicon</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-4">
           <div className="glass-card p-6 border border-border rounded-xl flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-12 h-12 text-primary opacity-20 mb-4" />
              <h4 className="font-display font-bold uppercase tracking-widest text-foreground">Secure Client Isolation</h4>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                 Each portal runs in a logically isolated container with hardware-backed encryption keys for client data protection.
              </p>
           </div>
           
           <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Portal Health</h4>
              <div className="flex justify-between items-center text-[10px] font-mono">
                 <span className="text-muted-foreground">Traffic (24h)</span>
                 <span className="text-foreground font-bold">128 Unique Hits</span>
              </div>
              <div className="mt-3 w-full bg-muted h-1 rounded-full overflow-hidden">
                 <div className="bg-primary h-full w-[45%]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
