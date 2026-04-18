import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Wifi, Bot, Gauge } from 'lucide-react';

const BandwidthMonitor: React.FC = () => {
  const [bandwidth, setBandwidth] = useState({ download: 45.2, upload: 12.8, ping: 24 });
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBandwidth({ download: 40 + Math.random() * 20, upload: 10 + Math.random() * 10, ping: 20 + Math.random() * 10 });
      setHistory(prev => [...prev.slice(-19), bandwidth.download]);
    }, 5000);
    return () => clearInterval(interval);
  }, [bandwidth.download]);

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Bandwidth Monitor</h1><p className="text-text-muted">Real-time network usage</p></div><Wifi className="w-8 h-8 text-accent-cyan" /></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><div className="bg-bg-card rounded-xl p-4 border border-border"><TrendingDown className="w-6 h-6 text-accent-cyan mb-2" /><p className="text-2xl font-bold">{bandwidth.download.toFixed(1)} Mbps</p><p className="text-text-muted text-sm">Download</p></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><TrendingUp className="w-6 h-6 text-accent-green mb-2" /><p className="text-2xl font-bold">{bandwidth.upload.toFixed(1)} Mbps</p><p className="text-text-muted text-sm">Upload</p></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><Gauge className="w-6 h-6 text-accent-orange mb-2" /><p className="text-2xl font-bold">{bandwidth.ping} ms</p><p className="text-text-muted text-sm">Latency</p></div></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3 flex items-center gap-2"><Activity className="w-4 h-4" />Bandwidth History</h3><div className="h-32 flex items-end gap-1">{history.map((val, i) => (<div key={i} className="flex-1 bg-accent-cyan/50 rounded-t" style={{ height: `${(val / 100) * 100}%` }}></div>))}</div></div>
    </div>
  );
};
export default BandwidthMonitor;
