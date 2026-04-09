import { useState } from "react";
import { FileText, Calculator, ShieldCheck, AlertCircle, Download, ExternalLink, ArrowRight, Table, RefreshCw } from "lucide-react";

export default function TaxAutomation() {
  const [isCalculating, setIsCalculating] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            TAX AUTOMATION (KRA & GLOBAL)
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Automated VAT, Income Tax & Regulatory Filing Engine
          </p>
        </div>
        <button 
           onClick={() => { setIsCalculating(true); setTimeout(() => setIsCalculating(false), 2000); }}
           className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter"
        >
          {isCalculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
          {isCalculating ? "CALCULATING..." : "RE-CALCULATE TAX"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card border border-border rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
           <h3 className="text-xs font-bold font-mono uppercase tracking-widest mb-6 text-muted-foreground">KRA Compliance Status</h3>
           <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                 <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
              <div>
                 <p className="text-lg font-display font-bold text-foreground">Fully Compliant</p>
                 <p className="text-[10px] text-muted-foreground font-mono uppercase">Last Filing: Mar 2026</p>
              </div>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono">
                 <span className="text-muted-foreground uppercase">Estimated VAT (Q2)</span>
                 <span className="text-foreground font-bold">$12,450.00</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                 <span className="text-muted-foreground uppercase">Income Tax Reserve</span>
                 <span className="text-foreground font-bold">$34,800.00</span>
              </div>
           </div>
        </div>

        <div className="md:col-span-2 glass-card border border-border rounded-xl overflow-hidden">
           <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Scheduled Filings & Deadlines</h3>
              <Table className="w-4 h-4 text-muted-foreground" />
           </div>
           <div className="divide-y divide-border">
              {[
                { name: "VAT Return (Kenya)", deadline: "Apr 20, 2026", type: "Monthly", status: "Ready" },
                { name: "PAYE Returns", deadline: "Apr 9, 2026", type: "Payroll", status: "Filed" },
                { name: "WHT Certificate Generation", deadline: "Continuous", type: "Operational", status: "Automation Active" },
              ].map((tax, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                   <div className="flex items-center gap-4">
                      <div className={`p-2 rounded bg-muted ${tax.status === 'Filed' ? 'opacity-50' : ''}`}>
                         <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                         <p className="text-sm font-bold font-display">{tax.name}</p>
                         <p className="text-[10px] text-muted-foreground font-mono uppercase">Deadline: {tax.deadline} · {tax.type}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        tax.status === 'Filed' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 
                         tax.status === 'Ready' ? 'border-primary/50 text-primary bg-primary/5' : 'border-muted text-muted-foreground'
                      }`}>
                         {tax.status.toUpperCase()}
                      </span>
                      <button className="p-1 px-3 rounded border border-border text-[10px] font-bold font-mono uppercase hover:border-primary transition group">
                         {tax.status === 'Filed' ? <Download className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-start gap-4">
         <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
         <div>
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1">New Regulatory Alert</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
               Changes to KRA Digital Service Tax (DST) regulations effective May 1st. Kelvy's Tax Engine has been updated automatically to apply 1.5% levy to applicable cross-border transactions.
            </p>
         </div>
         <button className="ml-auto flex items-center gap-2 text-[10px] font-bold font-mono text-orange-500 hover:underline uppercase whitespace-nowrap">
            View Policy Change
            <ExternalLink className="w-3.5 h-3.5" />
         </button>
      </div>
    </div>
  );
}
