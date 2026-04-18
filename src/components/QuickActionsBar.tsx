import React, { useState, useEffect } from 'react';
import { Command, Search, FileText, Phone, Shield, Bot, Users, DollarSign } from 'lucide-react';

const QuickActionsBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsOpen(true); }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const actions = [
    { name: 'Create Invoice', icon: <DollarSign className="w-4 h-4" />, action: () => window.location.href = '/business/erp' },
    { name: 'Run Security Scan', icon: <Shield className="w-4 h-4" />, action: () => window.location.href = '/security/linux-tools' },
    { name: 'Open AI Chat', icon: <Bot className="w-4 h-4" />, action: () => window.location.href = '/aiml/chat' },
    { name: 'New Ticket', icon: <FileText className="w-4 h-4" />, action: () => window.location.href = '/business/itsm' },
    { name: 'View Clients', icon: <Users className="w-4 h-4" />, action: () => window.location.href = '/business/crm' },
    { name: 'Start Call', icon: <Phone className="w-4 h-4" />, action: () => window.location.href = '/communication/calls' },
  ];

  const filtered = actions.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
      <div className="bg-bg-card rounded-xl w-full max-w-lg border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 p-3 border-b border-border"><Search className="w-4 h-4 text-text-muted" /><input type="text" placeholder="Type a command or search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-text-primary" autoFocus /><kbd className="px-2 py-0.5 bg-bg-secondary rounded text-xs">ESC</kbd></div>
        <div className="p-2">{filtered.map(action => (<button key={action.name} onClick={action.action} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"><span className="text-accent-green">{action.icon}</span><span>{action.name}</span></button>))}</div>
        <div className="p-2 text-xs text-text-muted border-t border-border"><Command className="w-3 h-3 inline mr-1" />K to open</div>
      </div>
    </div>
  );
};
export default QuickActionsBar;
