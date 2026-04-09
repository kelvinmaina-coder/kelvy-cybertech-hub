import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";

export default function CallPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, profile, roles } = useAuth();
  const [targetUser, setTargetUser] = useState(null);
  const [callType, setCallType] = useState("video");
  const [callStatus, setCallStatus] = useState("connecting");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isIncoming = new URLSearchParams(window.location.search).get("mode") === "incoming";
  const incomingData = useRef(JSON.parse(localStorage.getItem("incoming_call_data") || "null"));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type === "audio" || type === "video") setCallType(type);
    
    const storedTarget = localStorage.getItem("call_target");
    if (storedTarget) {
      setTargetUser(JSON.parse(storedTarget));
      localStorage.removeItem("call_target");
    } else if (userId) {
      loadTargetUser(userId);
    }
    setupWebSocket();
    getMedia();
    return () => cleanup();
  }, [userId]);

  const loadTargetUser = async (id) => {
    const { data } = await supabase.from("profiles").select("id, full_name, role, email").eq("id", id).single();
    if (data) setTargetUser(data);
  };

  const setupWebSocket = () => {
    if (!user || !profile) return;
    const ws = new WebSocket(`ws://localhost:8001/ws/${user.id}/${encodeURIComponent(profile.full_name || "User")}/${encodeURIComponent(roles[0] || "client")}`);
    wsRef.current = ws;
    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "call:answer":
            if (data.answer && peerConnectionRef.current) {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
              setCallStatus("connected");
              startCallTimer();
            }
            break;
          case "call:ice-candidate":
            if (data.candidate && peerConnectionRef.current) {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
            break;
          case "call:end":
            endCall(false);
            break;
          case "call:decline":
            setCallStatus("ended");
            setTimeout(() => navigate("/contacts"), 2000);
            break;
        }
      } catch (e) {}
    };
  };

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: callType === "video" && !isVideoOff 
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      createPeerConnection();
      if (isIncoming && incomingData.current) {
        answerCall();
      } else {
        startCall();
      }
    } catch (error) {
      console.error("Error getting media:", error);
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({ 
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }] 
    });
    peerConnectionRef.current = pc;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ 
          type: "call:ice-candidate", 
          target: targetUser?.id, 
          candidate: event.candidate 
        }));
      }
    };
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };
  };

  const startCall = async () => {
    if (!peerConnectionRef.current || !targetUser) return;
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      wsRef.current?.send(JSON.stringify({ 
        type: "call:offer", 
        target: targetUser.id, 
        offer: offer, 
        call_type: callType 
      }));
      setCallStatus("ringing");
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const answerCall = async () => {
    if (!peerConnectionRef.current || !incomingData.current) return;
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingData.current.offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      wsRef.current?.send(JSON.stringify({ 
        type: "call:answer", 
        target: userId, 
        answer: answer 
      }));
      setCallStatus("connected");
      startCallTimer();
      // Clear the temporary data
      localStorage.removeItem("incoming_call_data");
    } catch (error) {
      console.error("Error answering call:", error);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) { 
        track.enabled = !track.enabled; 
        setIsMuted(!track.enabled); 
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) { 
        track.enabled = !track.enabled; 
        setIsVideoOff(!track.enabled); 
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === "video");
        if (sender) sender.replaceTrack(videoTrack);
        videoTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } else {
        const originalStream = localStreamRef.current;
        const videoTrack = originalStream?.getVideoTracks()[0];
        if (videoTrack && peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  const endCall = (notify: boolean | React.MouseEvent = true) => {
    const shouldNotify = typeof notify === "boolean" ? notify : true;
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (shouldNotify) {
      wsRef.current?.send(JSON.stringify({ 
        type: "call:end", 
        target: userId,
        call_id: incomingData.current?.call_id 
      }));
    }
    setCallStatus("ended");
    localStorage.removeItem("incoming_call_data");
    setTimeout(() => navigate("/contacts"), 1500);
  };

  const startCallTimer = () => {
    durationIntervalRef.current = setInterval(() => { 
      setCallDuration(prev => prev + 1); 
    }, 1000);
  };

  const cleanup = () => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (wsRef.current) wsRef.current.close();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!targetUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading call information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative">
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute bottom-6 right-6 w-48 h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
            <h2 className="text-white font-semibold">{targetUser.full_name}</h2>
            <p className="text-white/70 text-sm">{targetUser.role}</p>
          </div>
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
            {callStatus === "connected" && <span className="text-green-400 text-sm font-mono">{formatDuration(callDuration)}</span>}
            {callStatus === "ringing" && <span className="text-yellow-400 text-sm font-mono animate-pulse">Ringing...</span>}
            {callStatus === "connecting" && <span className="text-blue-400 text-sm font-mono">Connecting...</span>}
          </div>
        </div>
        {callStatus === "ended" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center">
              <PhoneOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">Call Ended</h3>
              <p className="text-white/70">Redirecting to contacts...</p>
            </div>
          </div>
        )}
      </div>
      <div className="bg-black/80 backdrop-blur-sm py-4 px-6 flex items-center justify-center gap-4">
        <button onClick={toggleMute} className={`p-4 rounded-full transition ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}>
          {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </button>
        {callType === "video" && (
          <>
            <button onClick={toggleVideo} className={`p-4 rounded-full transition ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}>
              {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
            </button>
            <button onClick={toggleScreenShare} className={`p-4 rounded-full transition ${isScreenSharing ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"}`}>
              <Monitor className="w-6 h-6 text-white" />
            </button>
          </>
        )}
        <button onClick={endCall} className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition">
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
