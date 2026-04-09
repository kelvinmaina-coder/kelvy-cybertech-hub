import { useState } from "react";
import { Mail, Target, Users, AlertCircle, BarChart, Send, ShieldAlert } from "lucide-react";

export default function PhishingCampaigns() {
  const [isLaunching, setIsLaunching] = useState(false);
  const campaigns = [
    { id: 1, name: "Q1 Security Awareness", target: "Finance Dept", clickRate: "12%", reported: "45%", status: "Active" },
    { id: 2, name: "Urgent: HR Policy Update", target: "Engineering", clickRate: "3%", reported: "85%", status: "Completed" },
    { id: 3, name: "IT Helpdesk Spoof", target: "Sales Team", clickRate: "24%", reported: "10%", status: "High Risk" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Mail className="w-5 h-5" />
            SIMULATED PHISHING CAMPAIGNS
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
            Employee Awareness & Social Engineering Defense
          </p>
        </div>
        <button 
          onClick={() => { setIsLaunching(true); setTimeout(() => setIsLaunching(false), 2000); }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all flex items-center gap-2"
        >
          {isLaunching ? <Send className="w-4 h-4 animate-bounce" /> : <Target className="w-4 h-4" />}
          LAUNCH NEW CAMPAIGN
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <div key={camp.id} className="glass-card border border-border rounded-xl overflow-hidden group hover:border-primary/50 transition-all">
            <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
               <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                 camp.status === 'Active' ? 'border-primary/50 text-primary bg-primary/5' : 
                 camp.status === 'High Risk' ? 'border-red-500/50 text-red-500 bg-red-500/5' : 
                 'border-muted text-muted-foreground'
               }`}>
                 {camp.status}
               </span>
               <BarChart className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <div className="p-5">
              <h3 className="font-display font-bold text-lg mb-1">{camp.name}</h3>
              <p className="text-[10px] text-muted-foreground font-mono mb-4 uppercase tracking-tighter">TARGET: {camp.target}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono mb-1 uppercase tracking-widest">Click Rate</p>
                  <p className={`text-xl font-bold font-mono ${parseInt(camp.clickRate) > 15 ? 'text-red-500' : 'text-foreground'}`}>{camp.clickRate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono mb-1 uppercase tracking-widest">Reported</p>
                  <p className="text-xl font-bold font-mono text-green-500">{camp.reported}</p>
                </div>
              </div>

              <div className="mt-4 w-full bg-muted/30 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-1000" style={{ width: camp.reported }} />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
               <button className="flex-1 text-[10px] font-bold py-1.5 rounded border border-border hover:bg-muted transition uppercase tracking-widest font-mono">Analytics</button>
               <button className="flex-1 text-[10px] font-bold py-1.5 rounded border border-border hover:bg-muted transition uppercase tracking-widest font-mono">Train Users</button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="text-red-500 font-bold uppercase mr-2">Critical Vulnerability:</span>
          Sales Team click rate has increased by 15% this month. Recommended immediate training module on "CEO Fraud Spoofing".
        </p>
      </div>
    </div>
  );
}
