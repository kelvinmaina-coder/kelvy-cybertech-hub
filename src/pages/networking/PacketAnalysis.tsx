import React, { useState } from 'react';
import { Activity, Search, Download, Upload, Bot, Package } from 'lucide-react';

const PacketAnalysis: React.FC = () => {
  const [packets, setPackets] = useState([
    { id: 1, time: '0.001', source: '192.168.1.1', dest: '8.8.8.8', protocol: 'TCP', length: 66, info: 'SYN' },
    { id: 2, time: '0.002', source: '8.8.8.8', dest: '192.168.1.1', protocol: 'TCP', length: 66, info: 'SYN-ACK' },
    { id: 3, time: '0.003', source: '192.168.1.1', dest: '8.8.8.8', protocol: 'TCP', length: 54, info: 'ACK' },
  ]);

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Packet Analysis</h1><p className="text-text-muted">Network traffic inspection</p></div><Package className="w-8 h-8 text-accent-purple" /></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border mb-4"><div className="flex gap-2"><input type="text" placeholder="Filter packets (e.g., tcp.port==80)" className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg" /><button className="px-4 py-2 bg-accent-green/20 rounded-lg"><Search className="w-4 h-4" /></button><button className="px-4 py-2 bg-accent-cyan/20 rounded-lg"><Upload className="w-4 h-4" /></button></div></div>
      <div className="bg-bg-card rounded-xl overflow-hidden border border-border"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-bg-secondary border-b border-border"><tr><th className="px-3 py-2 text-left text-xs">No.</th><th className="px-3 py-2 text-left text-xs">Time</th><th className="px-3 py-2 text-left text-xs">Source</th><th className="px-3 py-2 text-left text-xs">Destination</th><th className="px-3 py-2 text-left text-xs">Protocol</th><th className="px-3 py-2 text-left text-xs">Length</th><th className="px-3 py-2 text-left text-xs">Info</th></tr></thead><tbody>{packets.map(p => (<tr key={p.id} className="border-b border-border hover:bg-accent/10"><td className="px-3 py-2 text-xs">{p.id}</td><td className="px-3 py-2 text-xs">{p.time}</td><td className="px-3 py-2 text-xs font-mono">{p.source}</td><td className="px-3 py-2 text-xs font-mono">{p.dest}</td><td className="px-3 py-2 text-xs"><span className="px-1 py-0.5 bg-accent-cyan/20 rounded">{p.protocol}</span></td><td className="px-3 py-2 text-xs">{p.length}</td><td className="px-3 py-2 text-xs">{p.info}</td></tr>))}</tbody></table></div></div>
      <div className="mt-4 bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-2 flex items-center gap-2"><Bot className="w-4 h-4" />AI Analysis</h3><p className="text-sm text-text-muted">AI packet analysis will appear here. Upload a pcap file or select packets for analysis.</p></div>
    </div>
  );
};
export default PacketAnalysis;
