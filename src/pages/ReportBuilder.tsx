import { FileText, Download, Send, Plus, BarChart, Zap, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ReportBuilder() {
  const [generating, setGenerating] = useState(false);
  const reports = [
    { title: "Monthly Security Audit - Q1", date: "2024-03-01", type: "Security", status: "Ready" },
    { title: "Revenue Analysis Summary", date: "2024-02-15", type: "Finance", status: "Ready" },
    { title: "Incident Response Feedback", date: "2024-02-10", type: "SOC", status: "Ready" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-accent">ENTERPRISE REPORT BUILDER</h1>
          <p className="text-xs text-muted-foreground font-mono">AI-assisted reporting & data storytelling</p>
        </div>
        <button 
          onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
          disabled={generating}
          className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {generating ? "COMPILING DATA..." : "CREATE NEW REPORT"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card border border-border p-5">
            <h3 className="text-sm font-bold mb-4">RECENTLY GENERATED REPORTS</h3>
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.title} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-accent/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{report.title}</div>
                      <div className="text-[10px] text-muted-foreground">{report.type} • {report.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-accent transition-colors"><Download className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-accent transition-colors"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 border border-border flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                 <BarChart className="w-5 h-5" />
               </div>
               <div>
                 <div className="text-xs font-bold uppercase text-muted-foreground">Active Subscriptions</div>
                 <div className="text-xl font-mono font-bold">128</div>
               </div>
            </div>
            <div className="glass-card p-4 border border-border flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                 <FileText className="w-5 h-5" />
               </div>
               <div>
                 <div className="text-xs font-bold uppercase text-muted-foreground">Scheduled Exports</div>
                 <div className="text-xl font-mono font-bold">14</div>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 border border-accent/20 bg-accent/5">
            <h3 className="text-xs font-bold text-accent mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> AI REPORT ANALYST
            </h3>
            <p className="text-[11px] text-foreground/80 leading-relaxed italic border-l-2 border-accent pl-3 mb-4">
              "Your last Security Audit shows a 12% drift in compliance across the European nodes. I can auto-generate a remedial actions slide deck for the board meeting."
            </p>
            <button className="w-full bg-accent/10 border border-accent/20 text-accent py-1.5 rounded text-[10px] font-bold hover:bg-accent hover:text-accent-foreground transition">
              ACCEPT RECOMMENDATION
            </button>
          </div>

          <div className="glass-card p-4 border border-border">
             <h3 className="text-xs font-bold mb-3 uppercase tracking-wider text-muted-foreground">Templates</h3>
             <div className="space-y-2">
               {["Financial Metrics", "SOC Incident Summary", "DevOps Velocity", "Pentest Outcome"].map(temp => (
                 <div key={temp} className="text-[11px] font-medium p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border">
                   {temp}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
