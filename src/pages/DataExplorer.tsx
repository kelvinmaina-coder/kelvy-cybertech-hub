import { Search, Database, Filter, Download, Zap, Loader2, Table } from "lucide-react";
import { useState } from "react";

export default function DataExplorer() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  
  const results = [
    { id: 1, name: "User Activity Log", size: "124 MB", type: "JSON", modified: "1h ago" },
    { id: 2, name: "Financial Transactions Q1", size: "1.2 GB", type: "Parquet", modified: "4h ago" },
    { id: 3, name: "System Telemetry - Node 4", size: "450 MB", type: "CSV", modified: "12h ago" },
    { id: 4, name: "Client Feedback Raw", size: "12 KB", type: "Text", modified: "1d ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-primary">DATA LAKE EXPLORER</h1>
          <p className="text-xs text-muted-foreground font-mono">Unstructured data discovery & schema inference</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-muted hover:bg-muted/80 p-2 rounded-lg transition"><Filter className="w-4 h-4" /></button>
           <button className="bg-muted hover:bg-muted/80 p-2 rounded-lg transition"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="glass-card p-4 border border-border">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SQL Query or Natural Language (e.g., 'Show me transactions over $500')..."
              className="w-full bg-background border border-border pl-10 pr-4 py-2 rounded-lg text-sm font-mono focus:outline-none focus:border-primary/40"
            />
          </div>
          <button 
            onClick={() => { setSearching(true); setTimeout(() => setSearching(false), 1500); }}
            disabled={searching}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {searching ? "EXECUTING..." : "QUERY DATA"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="glass-card border border-border overflow-hidden">
             <div className="bg-muted/40 p-3 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Search Results
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-muted/20 border-b border-border text-muted-foreground uppercase text-[9px]">
                  <tr>
                    <th className="p-3">File / Dataset</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Last Access</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((res) => (
                    <tr key={res.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 flex items-center gap-2">
                        <Table className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium text-foreground">{res.name}</span>
                      </td>
                      <td className="p-3 text-muted-foreground font-mono">{res.size}</td>
                      <td className="p-3 text-muted-foreground">{res.type}</td>
                      <td className="p-3 text-muted-foreground">{res.modified}</td>
                      <td className="p-3 text-right">
                        <button className="text-primary hover:underline font-bold">PREVIEW</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 border border-primary/20 bg-primary/5">
            <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> AI INSIGHTS (KADA)
            </h3>
            <p className="text-[11px] text-foreground/80 leading-relaxed italic">
              "Based on your query, I found a 15% correlation between system latency and the 'Financial Transactions' Parquet file size increase. Would you like me to generate a regression model?"
            </p>
          </div>

          <div className="glass-card p-4 border border-border">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2 text-muted-foreground">
              <Filter className="w-4 h-4" /> RECENT QUERIES
            </h3>
            <div className="space-y-2 text-[10px] font-mono text-muted-foreground">
               {["SELECT * FROM logs WHERE severity='ERROR'", "GROUP BY country COUNT(*)", "FIND transactions > 1000"].map(q => (
                 <div key={q} className="truncate p-1 hover:text-foreground cursor-pointer">
                   {q}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
