import React, { useState, useEffect } from 'react';
import { Phone, Video, PhoneMissed, PhoneCall, PhoneIncoming, Bot, Calendar } from 'lucide-react';

const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState([
    { id: 1, type: 'video', with: 'John Doe', duration: '15:23', timestamp: new Date(Date.now() - 3600000), status: 'missed' },
    { id: 2, type: 'audio', with: 'Jane Smith', duration: '08:45', timestamp: new Date(Date.now() - 86400000), status: 'completed' },
    { id: 3, type: 'video', with: 'Security Team', duration: '32:10', timestamp: new Date(Date.now() - 172800000), status: 'completed' },
  ]);

  const getStatusIcon = (status: string, type: string) => {
    if (status === 'missed') return <PhoneMissed className="w-4 h-4 text-accent-red" />;
    if (type === 'video') return <Video className="w-4 h-4 text-accent-purple" />;
    return <Phone className="w-4 h-4 text-accent-green" />;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Call History</h1><p className="text-text-muted">Recent calls and missed calls</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      <div className="space-y-3">{calls.map(call => (<div key={call.id} className="bg-bg-card rounded-xl p-4 border border-border flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">{getStatusIcon(call.status, call.type)}</div><div><p className="font-semibold">{call.with}</p><p className="text-xs text-text-muted">{formatDate(call.timestamp)} • {call.duration}</p></div></div><div className="flex gap-2"><button className="p-2 rounded-lg bg-accent-green/20"><Phone className="w-4 h-4" /></button>{call.type === 'video' && <button className="p-2 rounded-lg bg-accent-purple/20"><Video className="w-4 h-4" /></button>}</div></div>))}</div>
      <div className="mt-6 bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" />Call Statistics</h3><div className="grid grid-cols-3 gap-4 text-center"><div><p className="text-2xl font-bold text-accent-cyan">{calls.length}</p><p className="text-xs text-text-muted">Total Calls</p></div><div><p className="text-2xl font-bold text-accent-red">{calls.filter(c => c.status === 'missed').length}</p><p className="text-xs text-text-muted">Missed</p></div><div><p className="text-2xl font-bold text-accent-green">56:18</p><p className="text-xs text-text-muted">Total Time</p></div></div></div>
    </div>
  );
};
export default CallHistory;
