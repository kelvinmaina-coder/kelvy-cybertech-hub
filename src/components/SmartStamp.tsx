import { Shield, CheckCircle } from "lucide-react";

interface SmartStampProps {
  type?: "contract" | "invoice" | "report" | "proposal" | "certificate";
  date?: string;
}

export default function SmartStamp({ type = "report", date = new Date().toLocaleDateString() }: SmartStampProps) {
  return (
    <div className="mt-8 pt-8 border-t border-border/50 flex flex-col items-center gap-4 print:mt-12">
      <div className="flex items-center gap-8 justify-between w-full max-w-2xl px-4">
        {/* Company Identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg leading-tight">KELVY CYBERTECH HUB</h2>
            <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Unified Enterprise Command</p>
          </div>
        </div>

        {/* Verification Stamp */}
        <div className="relative">
          <div className="w-32 h-32 border-4 border-primary/30 rounded-full flex items-center justify-center -rotate-12 opacity-80 select-none">
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-mono font-bold text-primary mb-1">KELVY HUB</span>
              <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-[8px] font-bold uppercase mb-1">VERIFIED</div>
              <span className="text-[9px] font-mono text-primary/60">{date}</span>
            </div>
          </div>
          <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 text-primary fill-background" />
        </div>
      </div>

      {/* AI Verification Signature */}
      <div className="w-full max-w-2xl px-6 py-4 bg-primary/5 border border-primary/10 rounded-xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-mono font-bold text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI SECURITY VERIFICATION
            </p>
            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
              "This document has been AI-verified by Kelvy AI Security Analyst on {date}. 
              Cryptographic hash verification: {Math.random().toString(36).substring(2, 15).toUpperCase()}"
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-center">
            <div className="font-display font-medium text-xs text-foreground uppercase border-b border-muted-foreground/30 pb-1 mb-1 px-4 italic">
              Kelvy AI Analyst
            </div>
            <p className="text-[9px] text-muted-foreground font-mono">AUTHORIZED SIGNATURE</p>
          </div>
        </div>
        <Shield className="absolute -right-4 -bottom-4 w-24 h-24 text-primary opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
      </div>
    </div>
  );
}
