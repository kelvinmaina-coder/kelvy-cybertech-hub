import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, 
  Hand, Users, X, ChevronUp, ChevronDown, Volume2, VolumeX
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  handRaised: boolean;
  isSpeaking: boolean;
}

export default function GroupCallPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speakingAnalyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    setupWebSocket();
    getMedia();
    return () => cleanup();
  }, []);

  const setupWebSocket = () => {
    if (!user?.id) return;
    const ws = new WebSocket(`ws://localhost:8001/ws/${user.id}/${profile?.full_name || "User"}/${profile?.role || "client"}`);
    wsRef.current = ws;
    
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "group-call:participant-joined":
          addParticipant(data.user_id, data.user_name, data.user_role);
          break;
          
        case "group-call:participant-left":
          removeParticipant(data.user_id);
          break;
          
        case "group-call:hand-raised":
          updateHandRaised(data.user_id, true);
          break;
          
        case "group-call:hand-lowered":
          updateHandRaised(data.user_id, false);
          break;
          
        case "call:offer":
          handleOffer(data);
          break;
          
        case "call:answer":
          handleAnswer(data);
          break;
          
        case "call:ice-candidate":
          handleIceCandidate(data);
          break;
      }
    };
  };

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: !isVideoOff 
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Setup audio analysis for speaker detection
      setupAudioAnalysis(stream);
      
      // Add self to participants
      const selfParticipant: Participant = {
        id: user?.id || "",
        name: profile?.full_name || "You",
        role: profile?.role || "User",
        stream: stream,
        isMuted: false,
        isVideoOff: false,
        handRaised: false,
        isSpeaking: false
      };
      setParticipants(new Map([[selfParticipant.id, selfParticipant]]));
      
      // Broadcast that we joined
      wsRef.current?.send(JSON.stringify({
        type: "group-call:join",
        room_id: roomId,
        user_id: user?.id,
        user_name: profile?.full_name,
        user_role: profile?.role
      }));
      
      setCallStatus("connected");
      startCallTimer();
    } catch (error) {
      console.error("Error getting media:", error);
    }
  };

  const setupAudioAnalysis = (stream: MediaStream) => {
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      speakingAnalyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(speakingAnalyserRef.current);
      
      // Check for speaking every 100ms
      const checkSpeaking = setInterval(() => {
        if (speakingAnalyserRef.current) {
          const dataArray = new Uint8Array(speakingAnalyserRef.current.frequencyBinCount);
          speakingAnalyserRef.current.getByteTimeDomainData(dataArray);
          let maxSample = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const sample = Math.abs(dataArray[i] - 128);
            if (sample > maxSample) maxSample = sample;
          }
          const isCurrentlySpeaking = maxSample > 15;
          if (isCurrentlySpeaking !== participants.get(user?.id || "")?.isSpeaking) {
            updateSpeakingStatus(user?.id || "", isCurrentlySpeaking);
          }
        }
      }, 100);
      
      return () => clearInterval(checkSpeaking);
    }
  };

  const addParticipant = async (userId: string, userName: string, userRole: string) => {
    if (userId === user?.id) return;
    
    const pc = createPeerConnection(userId);
    peerConnectionsRef.current.set(userId, pc);
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    wsRef.current?.send(JSON.stringify({
      type: "call:offer",
      target: userId,
      offer: offer,
      call_type: "video"
    }));
    
    const newParticipant: Participant = {
      id: userId,
      name: userName,
      role: userRole,
      stream: null,
      isMuted: false,
      isVideoOff: false,
      handRaised: false,
      isSpeaking: false
    };
    
    setParticipants(prev => new Map(prev.set(userId, newParticipant)));
  };

  const removeParticipant = (userId: string) => {
    const pc = peerConnectionsRef.current.get(userId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(userId);
    }
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  };

  const createPeerConnection = (userId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "call:ice-candidate",
          target: userId,
          candidate: event.candidate
        }));
      }
    };
    
    pc.ontrack = (event) => {
      setParticipants(prev => {
        const participant = prev.get(userId);
        if (participant) {
          participant.stream = event.streams[0];
          return new Map(prev.set(userId, participant));
        }
        return prev;
      });
    };
    
    return pc;
  };

  const handleOffer = async (data: any) => {
    const pc = createPeerConnection(data.from);
    peerConnectionsRef.current.set(data.from, pc);
    
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    wsRef.current?.send(JSON.stringify({
      type: "call:answer",
      target: data.from,
      answer: answer
    }));
  };

  const handleAnswer = async (data: any) => {
    const pc = peerConnectionsRef.current.get(data.from);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  };

  const handleIceCandidate = async (data: any) => {
    const pc = peerConnectionsRef.current.get(data.from);
    if (pc && data.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const updateSpeakingStatus = (userId: string, isSpeaking: boolean) => {
    setParticipants(prev => {
      const participant = prev.get(userId);
      if (participant) {
        participant.isSpeaking = isSpeaking;
        return new Map(prev.set(userId, participant));
      }
      return prev;
    });
  };

  const updateHandRaised = (userId: string, raised: boolean) => {
    setParticipants(prev => {
      const participant = prev.get(userId);
      if (participant) {
        participant.handRaised = raised;
        return new Map(prev.set(userId, participant));
      }
      return prev;
    });
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
        
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find(s => s.track?.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
        });
        
        videoTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } else {
        const originalStream = localStreamRef.current;
        const videoTrack = originalStream?.getVideoTracks()[0];
        if (videoTrack) {
          peerConnectionsRef.current.forEach((pc) => {
            const sender = pc.getSenders().find(s => s.track?.kind === "video");
            if (sender) sender.replaceTrack(videoTrack);
          });
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  const toggleHandRaise = () => {
    const newState = !handRaised;
    setHandRaised(newState);
    wsRef.current?.send(JSON.stringify({
      type: newState ? "group-call:raise-hand" : "group-call:lower-hand",
      room_id: roomId,
      user_id: user?.id
    }));
  };

  const leaveCall = () => {
    wsRef.current?.send(JSON.stringify({
      type: "group-call:leave",
      room_id: roomId,
      user_id: user?.id
    }));
    endCall();
  };

  const endCall = () => {
    if (peerConnectionsRef.current) {
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setCallStatus("ended");
    setTimeout(() => navigate("/contacts"), 1500);
  };

  const startCallTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const cleanup = () => {
    if (peerConnectionsRef.current) {
      peerConnectionsRef.current.forEach(pc => pc.close());
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const participantsList = Array.from(participants.values());

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Main Video Grid */}
      <div className="flex-1 relative p-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
          {participantsList.map((p) => (
            <div key={p.id} className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
              {p.stream ? (
                <video
                  autoPlay
                  playsInline
                  muted={p.id === user?.id}
                  ref={(video) => { if (video && p.stream) video.srcObject = p.stream; }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-primary">{p.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="text-white text-sm">{p.name}</p>
                    <p className="text-white/50 text-xs">{p.role}</p>
                  </div>
                </div>
              )}
              
              {/* Speaker detection highlight */}
              {p.isSpeaking && (
                <div className="absolute inset-0 border-4 border-green-500 rounded-xl animate-pulse" />
              )}
              
              {/* Hand raised indicator */}
              {p.handRaised && (
                <div className="absolute top-2 left-2 bg-yellow-500 rounded-full p-1">
                  <Hand className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Name and status overlay */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/50 rounded-lg px-2 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs">{p.name}</span>
                  <div className="flex gap-1">
                    {p.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                    {p.isVideoOff && <VideoOff className="w-3 h-3 text-red-400" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call ended overlay */}
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
      
      {/* Control Bar */}
      <div className="bg-black/80 backdrop-blur-sm py-4 px-6 flex items-center justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
        </button>
        
        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-full transition ${isScreenSharing ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          <Monitor className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={toggleHandRaise}
          className={`p-4 rounded-full transition ${handRaised ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          <Hand className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={leaveCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
        
        {/* Participants list toggle */}
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition"
        >
          <Users className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {participantsList.length}
          </span>
        </button>
        
        {/* Call timer */}
        <div className="bg-black/50 rounded-lg px-4 py-2">
          <span className="text-green-400 text-sm font-mono">{formatDuration(callDuration)}</span>
        </div>
      </div>
      
      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-sm border-l border-white/20 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Participants ({participantsList.length})</h3>
            <button onClick={() => setShowParticipants(false)} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {participantsList.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-white font-bold">{p.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{p.name}</p>
                  <p className="text-white/50 text-xs">{p.role}</p>
                </div>
                <div className="flex gap-1">
                  {p.isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                  {p.handRaised && <Hand className="w-4 h-4 text-yellow-400" />}
                  {p.isSpeaking && <Volume2 className="w-4 h-4 text-green-400 animate-pulse" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
