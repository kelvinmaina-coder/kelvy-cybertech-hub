import { useState } from "react";
import { AppWindow, ShoppingBag, Star, Download, Search, Tag, ExternalLink, ShieldCheck } from "lucide-react";

export default function AppMarketplace() {
  const apps = [
    { id: 1, name: "Neural VPN", developer: "Kelvy Labs", rating: 4.9, price: "FREE", category: "Security" },
    { id: 2, name: "Task-X Flow", developer: "Vertex Systems", rating: 4.7, price: "$12/mo", category: "Productivity" },
    { id: 3, name: "CryptoVault 2.0", developer: "BlockSec", rating: 4.8, price: "FREE", category: "Finance" },
    { id: 4, name: "LogAnalyzer Pro", developer: "GreyNode", rating: 4.5, price: "$49/mo", category: "DevOps" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <AppWindow className="w-5 h-5" />
            ENTERPRISE APP MARKETPLACE
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Certified AI Plugins & Platform Extensions
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search apps & plugins..." 
            className="bg-card border border-border rounded-lg py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none w-64"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
         {['All Apps', 'Security', 'DevOps', 'AI/ML', 'Business'].map((cat, i) => (
           <button key={i} className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
             i === 0 ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/50'
           }`}>
             {cat}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {apps.map((app) => (
          <div key={app.id} className="glass-card border border-border rounded-2xl p-5 group hover:border-primary/50 transition-all hover:-translate-y-1">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 mb-4 group-hover:scale-110 transition-transform">
                <AppWindow className="w-6 h-6 text-primary" />
             </div>
             <h3 className="font-display font-bold text-lg leading-tight mb-1">{app.name}</h3>
             <p className="text-[10px] text-muted-foreground font-mono mb-4 uppercase tracking-tighter">BY {app.developer}</p>
             
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1">
                   <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                   <span className="text-xs font-bold font-mono">{app.rating}</span>
                </div>
                <div className="flex items-center gap-1.5 text-primary">
                   <Tag className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold font-mono uppercase">{app.price}</span>
                </div>
             </div>

             <div className="flex gap-2">
                <button className="flex-1 bg-muted/50 border border-border text-[10px] font-bold py-2 rounded-lg uppercase tracking-widest font-mono hover:bg-muted transition">Details</button>
                <button className="p-2 aspect-square rounded-lg bg-primary text-primary-foreground hover:shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all">
                   <Download className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 border border-border rounded-xl bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
               <h3 className="font-display font-bold text-foreground">Verified by Kelvy Security</h3>
               <p className="text-xs text-muted-foreground">All marketplace apps undergo automated static and dynamic analysis before listing.</p>
            </div>
         </div>
         <button className="px-6 py-2.5 rounded-lg border border-border bg-card text-[10px] font-bold font-mono uppercase tracking-widest hover:border-primary transition flex items-center gap-2">
            Learn More
            <ExternalLink className="w-3.5 h-3.5" />
         </button>
      </div>
    </div>
  );
}
