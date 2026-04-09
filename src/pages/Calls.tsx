import { useState, useEffect } from "react";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, RotateCcw, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface CallRecord {
  id: number;
  caller_id: string;
  receiver_id: string;
  call_type: string;
  status: string;
  duration_seconds: number;
  created_at: string;
  caller_name?: string;
  receiver_name?: string;
}

export default function Calls() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "missed" | "incoming" | "outgoing">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, missed: 0, totalDuration: 0 });

  useEffect(() => {
    loadCalls();
  }, [user]);

  const loadCalls = async () => {
    if (!user) return;

    // Fix: Use proper Supabase filter syntax
    const { data: callsData } = await supabase
      .from("calls")
      .select("*")
      .eq("caller_id", user.id)
      .order("created_at", { ascending: false });

    const { data: callsData2 } = await supabase
      .from("calls")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false });

    const allCalls = [...(callsData || []), ...(callsData2 || [])];
    const uniqueCalls = allCalls.filter((call, index, self) => 
      index === self.findIndex((c) => c.id === call.id)
    );
    uniqueCalls.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const { data: profilesData } = await supabase.from("profiles").select("id, full_name");
    const profileMap: Record<string, string> = {};
    (profilesData || []).forEach((p: any) => { profileMap[p.id] = p.full_name || p.id.slice(0, 8); });

    const enriched = uniqueCalls.map((call: any) => ({
      ...call,
      caller_name: profileMap[call.caller_id],
      receiver_name: profileMap[call.receiver_id],
    }));

    setCalls(enriched);
    applyFilters(enriched, filter, search);
    
    const missed = enriched.filter(c => c.status === "missed" && c.receiver_id === user.id).length;
    const totalDuration = enriched.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
    setStats({ total: enriched.length, missed, totalDuration });
    setLoading(false);
  };

  const applyFilters = (data: CallRecord[], f: string, s: string) => {
    let filtered = [...data];
    if (f === "missed") filtered = filtered.filter(c => c.status === "missed");
    if (f === "incoming") filtered = filtered.filter(c => c.receiver_id === user?.id);
    if (f === "outgoing") filtered = filtered.filter(c => c.caller_id === user?.id);
    if (s) {
      filtered = filtered.filter(c => 
        (c.caller_name?.toLowerCase().includes(s.toLowerCase()) ||
         c.receiver_name?.toLowerCase().includes(s.toLowerCase()))
      );
    }
    setFilteredCalls(filtered);
  };

  const handleFilter = (f: typeof filter) => {
    setFilter(f);
    applyFilters(calls, f, search);
  };

  const handleSearch = (s: string) => {
    setSearch(s);
    applyFilters(calls, filter, s);
  };

  const callBack = (userId: string) => {
    navigate(`/call/${userId}`);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getCallIcon = (call: CallRecord) => {
    if (call.status === "missed") return <PhoneMissed className="w-4 h-4 text-red-400" />;
    if (call.caller_id === user?.id) return <PhoneOutgoing className="w-4 h-4 text-green-400" />;
    return <PhoneIncoming className="w-4 h-4 text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-accent">CALL HISTORY</h1>
        <p className="text-sm text-muted-foreground font-mono">
          {stats.total} total calls • {stats.missed} missed • {Math.floor(stats.totalDuration / 60)} min total
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-xl p-3 text-center">
          <Phone className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Total Calls</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <PhoneMissed className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{stats.missed}</p>
          <p className="text-[10px] text-muted-foreground">Missed</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{Math.floor(stats.totalDuration / 60)}m</p>
          <p className="text-[10px] text-muted-foreground">Total Time</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/40 font-mono"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "incoming", "outgoing", "missed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition ${
                filter === f ? "bg-accent/20 text-accent border border-accent/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredCalls.map((call) => (
          <div
            key={call.id}
            className={`flex items-center justify-between p-3 rounded-xl bg-card border transition hover:border-accent/40 ${
              call.status === "missed" && call.receiver_id === user?.id ? "border-red-500/30 bg-red-500/5" : "border-border"
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                {getCallIcon(call)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground">
                    {call.caller_id === user?.id ? call.receiver_name : call.caller_name}
                  </span>
                  {call.status === "missed" && call.receiver_id === user?.id && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Missed</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {call.call_type === "video" ? "📹 Video" : "📞 Audio"} • {formatDuration(call.duration_seconds)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">• {formatDate(call.created_at)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => callBack(call.caller_id === user?.id ? call.receiver_id : call.caller_id)}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
              title="Call back"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ))}
        {filteredCalls.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No calls found</p>
          </div>
        )}
      </div>
    </div>
  );
}
