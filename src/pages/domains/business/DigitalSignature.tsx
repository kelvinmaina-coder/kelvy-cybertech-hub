import { useState } from "react";
import { PenTool, ShieldCheck, Mail, CheckCircle2, History, FileText, Download, X } from "lucide-react";

export default function DigitalSignature() {
  const [signatures, setSignatures] = useState([
    { id: 1, doc: "MSA_Acme_2026.pdf", status: "Signed", client: "John Doe", date: "Apr 10, 2026" },
    { id: 2, doc: "Pentesting_SOW.pdf", status: "Pending", client: "Sarah Smith", date: "Apr 12, 2026" },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            DIGITAL SIGNATURE INTEGRATION
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Cryptographically Secure Document Execution & E-Sign
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter">
          <FileText className="w-3.5 h-3.5" />
          Upload for Signing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card border border-border rounded-xl">
           <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Signature Requests</h3>
              <History className="w-3.5 h-3.5 text-muted-foreground" />
           </div>
           <div className="divide-y divide-border">
              {signatures.map((sig) => (
                <div key={sig.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                   <div className="flex items-center gap-4">
                      <div className={`p-2 rounded bg-muted ${sig.status === 'Signed' ? 'text-green-500' : 'text-orange-500'}`}>
                         {sig.status === 'Signed' ? <ShieldCheck className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
                      </div>
                      <div>
                         <p className="text-sm font-bold font-display">{sig.doc}</p>
                         <p className="text-[10px] text-muted-foreground font-mono uppercase">Request to: {sig.client} · {sig.date}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        sig.status === 'Signed' ? 'border-green-500/50 text-green-500 bg-green-500/5' : 'border-orange-500/50 text-orange-500 bg-orange-500/5'
                      }`}>
                         {sig.status.toUpperCase()}
                      </span>
                      <div className="flex gap-2">
                         <button className="p-1.5 rounded hover:bg-muted" title="Resend"><Mail className="w-3.5 h-3.5 text-muted-foreground" /></button>
                         <button className="p-1.5 rounded hover:bg-muted text-red-500" title="Cancel"><X className="w-3.5 h-3.5" /></button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-4">
           <div className="glass-card p-6 border border-border rounded-xl bg-gradient-to-br from-primary/5 to-transparent flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-12 h-12 text-primary opacity-20 mb-4" />
              <h4 className="font-display font-bold uppercase tracking-widest text-foreground">Verified Audit Trail</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2 px-8">
                 Every signature generates a unique cryptographic hash stored on the Kelvy Audit Log for legal non-repudiation.
              </p>
              <button className="mt-6 text-[10px] font-bold font-mono text-primary uppercase hover:underline">View Audit Log Security Detail →</button>
           </div>
        </div>
      </div>
    </div>
  );
}
