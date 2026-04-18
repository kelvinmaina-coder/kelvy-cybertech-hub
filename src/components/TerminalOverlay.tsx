import React, { useEffect, useState, useRef } from 'react';
import { Terminal, X, Play, Shield, Users, Zap, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CLUSTER_COMMANDS = ['help', 'clients list', 'security score', 'scan', 'portal', 'reports'];

const TerminalOverlay: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState('help');
  const [output, setOutput] = useState('Welcome to Kelvy Terminal Mode. Type "help" for commands.');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '`') {
        event.preventDefault();
        setOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const handleRun = async () => {
    const commandText = command.trim();
    if (!commandText) return;
    setBusy(true);

    try {
      if (commandText === 'help') {
        setOutput(
          `Commands:\n- help\n- clients list\n- security score\n- scan nmap <target>\n- portal\n- reports\n- exit`
        );
      } else if (commandText === 'clients list') {
        const { data, error } = await supabase.from('clients').select('id, name, company').limit(20);
        if (error) throw error;
        setOutput(data?.length ? data.map((item: any) => `${item.id} | ${item.name || item.company || 'Unknown'}`).join('\n') : 'No clients found.');
      } else if (commandText === 'security score') {
        const { data: events } = await supabase.from('security_events').select('severity');
        const counts = (events || []).reduce((acc: Record<string, number>, e: any) => {
          acc[e.severity] = (acc[e.severity] || 0) + 1;
          return acc;
        }, {});
        const score = Math.max(40, Math.min(98, 100 - ((counts.critical || 0) * 12 + (counts.high || 0) * 8 + (counts.medium || 0) * 4)));
        setOutput(`Live security posture: ${score}/100\nCritical: ${counts.critical || 0} High: ${counts.high || 0} Medium: ${counts.medium || 0}`);
      } else if (commandText.startsWith('scan ')) {
        const parts = commandText.split(' ');
        const tool = parts[1];
        const args = parts.slice(2);
        setOutput(`Running ${tool} ${args.join(' ')}...`);
        const res = await fetch('http://localhost:8000/api/security/run-tool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool, args }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Tool execution failed');
        setOutput(`OUTPUT:\n${data.raw_output || 'No response'}\n\nAI Analysis:\n${data.ai_analysis || 'Unavailable'}`);
      } else if (commandText === 'portal') {
        navigate('/portal');
        setOutput('Opening client portal...');
      } else if (commandText === 'reports') {
        navigate('/data-analytics/executive');
        setOutput('Opening executive reports...');
      } else {
        setOutput(`Unknown command: ${commandText}. Type "help" for available commands.`);
      }
    } catch (error: any) {
      setOutput(`Error: ${error?.message || 'Unable to execute command.'}`);
      toast.error('Terminal command failed.');
    }

    setBusy(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm text-green-200 font-mono">
      <div className="flex items-center justify-between border-b border-green-500/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-sm font-semibold">TERMINAL MODE</p>
            <p className="text-[11px] text-green-300/80">Ctrl+` to close. Type help for commands.</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="rounded-full border border-green-500/40 px-3 py-1 text-sm hover:bg-green-500/10 transition">
          <X className="w-4 h-4" /> Close
        </button>
      </div>
      <div className="flex h-[calc(100vh-72px)] flex-col px-6 py-4">
        <div className="flex-1 overflow-y-auto rounded-3xl border border-green-500/20 bg-[#040a05]/90 p-4 shadow-inner shadow-green-500/10">
          <pre className="whitespace-pre-wrap break-words text-sm leading-6">{output}</pre>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-green-300">$</span>
          <input
            ref={inputRef}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRun(); }}
            className="flex-1 rounded-2xl border border-green-500/40 bg-[#031005] px-4 py-3 text-sm text-green-100 outline-none transition focus:border-green-400"
            placeholder="Type a command..."
          />
          <button
            onClick={handleRun}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-green-400 disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> Run
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminalOverlay;
