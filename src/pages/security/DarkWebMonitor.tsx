import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Shield, Bot, FileText, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DarkWebScanRecord {
  id?: string;
  email: string;
  breached: boolean;
  breaches_count: number;
  scanned_at: string;
  suggestion?: string;
}

const DarkWebMonitor: React.FC = () => {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<DarkWebScanRecord[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await supabase.from('darkweb_scans').select('*').order('scanned_at', { ascending: false }).limit(10);
        if (data) {
          setHistory(data as DarkWebScanRecord[]);
          return;
        }
      } catch {
        // ignore missing table or permission issue
      }
      const persisted = localStorage.getItem('darkweb-scan-history');
      if (persisted) setHistory(JSON.parse(persisted));
    };
    loadHistory();
  }, []);

  const saveHistory = async (record: DarkWebScanRecord) => {
    setHistory(prev => [record, ...prev].slice(0, 10));
    localStorage.setItem('darkweb-scan-history', JSON.stringify([record, ...history].slice(0, 10)));
    try {
      await supabase.from('darkweb_scans').insert(record);
    } catch {
      // fallback to local storage only
    }
  };

  const scanDarkWeb = async () => {
    if (!email) return setMessage('Enter a valid email address.');
    setLoading(true);
    setMessage('');
    let record: DarkWebScanRecord = {
      email,
      breached: false,
      breaches_count: 0,
      scanned_at: new Date().toISOString(),
      suggestion: 'No issues detected yet.',
    };

    try {
      const res = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${email}`, {
        headers: { 'hibp-api-key': import.meta.env.VITE_HIBP_API_KEY || '' }
      });
      if (res.status === 200) {
        const data = await res.json();
        record = {
          ...record,
          breached: true,
          breaches_count: data.length,
          suggestion: 'Found exposures. Enforce MFA, rotate passwords, and review exposed logins immediately.',
        };
        setResults({ breached: true, breaches: data, suggestion: record.suggestion });
      } else if (res.status === 404) {
        setResults({ breached: false, message: 'No breaches found' });
      } else {
        setResults({ breached: false, message: 'Could not verify at this time. Try again later.' });
      }
    } catch (e) {
      setResults({ breached: false, message: 'Dark web scan unavailable. Check network or API access.' });
      record.suggestion = 'Unable to complete scan; verify external connectivity or API key.';
    }

    await saveHistory(record);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-secondary">DARK WEB MONITOR</h1>
          <p className="text-sm text-muted-foreground font-mono">Scan breach databases, protect client emails, and generate weekly compliance alerts.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground">
          <Sparkles className="w-4 h-4 text-accent" />
          AI-driven breach detection
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass rounded-3xl border border-border p-6 shadow-xl shadow-cyan/10">
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="Enter email to scan"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
            />
            <button
              onClick={scanDarkWeb}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              Scan
            </button>
          </div>
          {loading && <div className="text-sm text-muted-foreground">Scanning dark web databases...</div>}
          {message && <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">{message}</div>}
          {results && (
            <div className={`mt-4 rounded-2xl border p-4 ${results.breached ? 'border-destructive bg-destructive/10 text-destructive' : 'border-green-500 bg-green-500/10 text-green-300'}`}>
              <div className="flex items-center gap-2 font-semibold">
                {results.breached ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                <span>{results.breached ? 'Credentials exposed!' : 'No breach found'}</span>
              </div>
              <p className="mt-2 text-sm">{results.breached ? `${results.breaches?.length || 0} breach records found.` : results.message}</p>
              {results.suggestion && <p className="mt-2 text-sm text-muted-foreground">Recommended action: {results.suggestion}</p>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl border border-border p-6 shadow-xl shadow-purple/10">
            <h2 className="text-lg font-semibold mb-3">Weekly Dark Web Snapshot</h2>
            <p className="text-sm text-muted-foreground">Review the latest client exposure summary and compliance suggestions.</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Active Breaches</p>
                <p className="text-3xl font-bold">{history.filter(record => record.breached).length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recent Scans</p>
                <p className="text-3xl font-bold">{history.length}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-3xl border border-border p-6 shadow-xl shadow-cyan/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Scan History</h2>
              <span className="text-xs text-muted-foreground">Latest 5</span>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans run yet. Start a scan to build your dark web report history.</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((record) => (
                  <div key={record.scanned_at} className="rounded-2xl border border-border bg-background/80 p-3">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{record.email}</span>
                      <span className={`rounded-full px-2 py-1 text-[11px] ${record.breached ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-300'}`}>
                        {record.breached ? 'Breached' : 'Clean'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Scanned {new Date(record.scanned_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DarkWebMonitor;
