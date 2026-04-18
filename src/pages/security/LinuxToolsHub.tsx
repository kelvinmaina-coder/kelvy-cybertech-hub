import React, { useState, useEffect } from 'react';
import { Play, History, Loader2 } from 'lucide-react';

const categories = {
  'Information Gathering': ['nmap', 'whois', 'dig', 'theHarvester', 'amass', 'subfinder'],
  'Network Analysis': ['wireshark', 'tcpdump', 'arp-scan', 'masscan', 'hping3'],
  'Vulnerability Scanning': ['nikto', 'sqlmap', 'wpscan', 'nuclei', 'gobuster', 'ffuf'],
  'Password Attacks': ['hydra', 'john', 'hashcat', 'crunch', 'medusa', 'cewl'],
  'Exploitation': ['metasploit', 'msfvenom', 'beef', 'searchsploit'],
  'Forensics': ['autopsy', 'volatility', 'binwalk', 'foremost', 'strings', 'exiftool'],
  'Web Testing': ['burpsuite', 'zaproxy', 'dalfox', 'commix'],
  'Wireless': ['aircrack-ng', 'reaver', 'wifite'],
  'Cryptography': ['openssl', 'gpg', 'base64'],
  'System Admin': ['iptables', 'fail2ban', 'lynis', 'rkhunter', 'ping', 'curl']
};

const LinuxToolsHub: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('nmap');
  const [target, setTarget] = useState('');
  const [args, setArgs] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ raw: string; analysis: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'analysis'>('raw');
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/security/scans');
      if (response.ok) {
        const data = await response.json();
        setScanHistory(data);
      }
    } catch (e) { console.error(e); }
  };

  const runTool = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/security/run-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: selectedTool, target, args: args.split(' ') })
      });
      const data = await response.json();
      setResult({ raw: data.raw_output, analysis: data.ai_analysis || 'AI analysis pending...' });
      fetchScanHistory();
    } catch (error) {
      setResult({ raw: String(error), analysis: 'Failed to connect to backend. Make sure backend is running on port 8000.' });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-2">
        {Object.entries(categories).map(([cat, tools]) => (
          <div key={cat} className="bg-bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-3 py-2 bg-bg-secondary font-mono text-sm text-accent-cyan">{cat}</div>
            <div className="p-2 space-y-1">
              {tools.map(tool => (
                <button
                  key={tool}
                  onClick={() => setSelectedTool(tool)}
                  className={`w-full text-left px-2 py-1 rounded text-sm font-mono transition-colors ${selectedTool === tool ? 'bg-accent-green/20 text-accent-green' : 'hover:bg-accent/20'}`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="col-span-6 space-y-4">
        <div className="bg-bg-card rounded-lg border border-border p-4">
          <div className="flex gap-3 mb-4">
            <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target (IP/Hostname)" className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg font-mono text-sm" />
            <input type="text" value={args} onChange={(e) => setArgs(e.target.value)} placeholder="Arguments (-sV -O)" className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg font-mono text-sm" />
            <button onClick={runTool} disabled={loading} className="px-4 py-2 bg-accent-green/20 border border-accent-green rounded-lg text-accent-green font-mono text-sm flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              RUN
            </button>
          </div>

          {result && (
            <div>
              <div className="flex border-b border-border mb-3">
                <button onClick={() => setActiveTab('raw')} className={`px-3 py-1 text-sm font-mono ${activeTab === 'raw' ? 'border-b-2 border-accent-green text-accent-green' : 'text-text-muted'}`}>Raw Output</button>
                <button onClick={() => setActiveTab('analysis')} className={`px-3 py-1 text-sm font-mono ${activeTab === 'analysis' ? 'border-b-2 border-accent-green text-accent-green' : 'text-text-muted'}`}>AI Analysis</button>
              </div>
              <pre className="bg-black/50 p-4 rounded-lg overflow-auto max-h-96 font-mono text-xs text-text-primary whitespace-pre-wrap">
                {activeTab === 'raw' ? result.raw : result.analysis}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-3 space-y-2">
        <h3 className="font-mono text-sm text-accent-cyan mb-2 flex items-center gap-2"><History className="w-4 h-4" /> Scan History</h3>
        <div className="space-y-2 max-h-96 overflow-auto">
          {scanHistory.map(scan => (
            <div key={scan.id} className="bg-bg-card rounded-lg border border-border p-2 text-xs">
              <div className="flex justify-between"><span className="text-accent-green">{scan.tool}</span><span className="text-text-muted">{new Date(scan.created_at).toLocaleTimeString()}</span></div>
              <div className="text-text-muted truncate">{scan.target}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LinuxToolsHub;
