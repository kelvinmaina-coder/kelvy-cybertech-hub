import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Phone, PhoneOff, Video } from "lucide-react";

export default function IncomingCallModal() {
  const { user, profile, roles } = useAuth();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user || !profile) return;
    
    // Connect to global signaling websocket for receiving calls
    const ws = new WebSocket(`ws://localhost:8001/ws/${user.id}/${encodeURIComponent(profile.full_name || "User")}/${encodeURIComponent(roles[0] || "client")}`);
    wsRef.current = ws;

    // Optional ringtone
    const ringtone = new Audio('/ringtone.mp3');
    ringtone.loop = true;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "incoming_call") {
          setIncomingCall(data);
          ringtone.play().catch(e => console.log("Audio play prevented by browser policy", e));
        } else if ((data.type === "call:end" || data.type === "call:decline") && incomingCall) {
          setIncomingCall(null);
          ringtone.pause();
          ringtone.currentTime = 0;
        }
      } catch (e) {}
    };

    return () => {
      ws.close();
      ringtone.pause();
      ringtone.currentTime = 0;
    };
  }, [user, profile, roles, incomingCall]);

  const acceptCall = () => {
    if (!incomingCall) return;
    // We save the offer and call details to localStorage to be picked up by CallPage
    localStorage.setItem("incoming_call_data", JSON.stringify({
       call_id: incomingCall.call_id,
       offer: incomingCall.offer,
       call_type: incomingCall.call_type
    }));
    
    setIncomingCall(null);
    navigate(`/call/${incomingCall.from}?type=${incomingCall.call_type || 'video'}&mode=incoming`);
  };

  const declineCall = () => {
    if (!incomingCall || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: "call:decline",
      target: incomingCall.from,
      call_id: incomingCall.call_id
    }));
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-primary">
            {(incomingCall.from_name || "U").charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-display font-bold mb-1">{incomingCall.from_name}</h2>
        <p className="text-muted-foreground text-sm font-mono mb-6 pb-6 border-b border-border w-full text-center">
          Incoming {incomingCall.call_type || 'video'} call...
        </p>

        <div className="flex gap-8 w-full justify-center">
          <button 
            onClick={declineCall}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-red-500/20"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
          <button 
            onClick={acceptCall}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-green-500/20 animate-pulse"
          >
            {incomingCall.call_type === 'audio' ? <Phone className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
