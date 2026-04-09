import { useState } from "react";
import { FolderUp, File, Shield, Download, Trash2, Search, Filter, Lock, Plus, Globe } from "lucide-react";

export default function FileExchange() {
  const [files, setFiles] = useState([
    { id: 1, name: "Audit_Report_Q1_2026.pdf", size: "12.4 MB", status: "Encrypted", date: "Apr 8, 2026" },
    { id: 2, name: "Network_Topology_v2.png", size: "4.8 MB", status: "Secure", date: "Apr 10, 2026" },
    { id: 3, name: "Pentest_Findings.xlsx", size: "2.1 MB", status: "Encrypted", date: "Apr 12, 2026" },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <FolderUp className="w-5 h-5" />
            SECURE CLIENT FILE EXCHANGE
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            End-to-End Encrypted Document Sharing & Storage
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter">
          <Plus className="w-3.5 h-3.5" />
          Secure Upload
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Storage", value: "1.2 TB", icon: Globe, color: "text-blue-500" },
          { label: "Encrypted Files", value: "248", icon: Lock, color: "text-primary" },
          { label: "Active Shares", value: "15", icon: FolderUp, color: "text-green-500" },
          { label: "Security Level", value: "MIL-SPEC", icon: Shield, color: "text-primary" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 border border-border rounded-xl">
             <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</span>
             </div>
             <p className="text-lg font-mono font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card border border-border rounded-xl">
        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider">Secure Repository</h3>
              <div className="relative">
                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                 <input type="text" placeholder="Search files..." className="bg-muted/50 border-none rounded py-1 pl-7 pr-4 text-[10px] outline-none w-48" />
              </div>
           </div>
           <Filter className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
        </div>
        <div className="divide-y divide-border">
           {files.map((file) => (
             <div key={file.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition group">
                <div className="flex items-center gap-4">
                   <div className="p-2.5 rounded bg-muted">
                      <File className="w-5 h-5 text-muted-foreground" />
                   </div>
                   <div>
                      <p className="text-sm font-bold font-display">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{file.size} · Uploaded {file.date}</p>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-primary/30 text-primary bg-primary/5 uppercase tracking-widest">{file.status}</span>
                   <div className="flex gap-2">
                      <button className="p-2 rounded hover:bg-muted transition text-primary"><Download className="w-4 h-4" /></button>
                      <button className="p-2 rounded hover:bg-muted transition text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
