import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CallRoom() {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [targetUser, setTargetUser] = useState(null);
  const [callStatus, setCallStatus] = useState("connecting");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const state = location.state;
    if (state?.user) setTargetUser(state.user);
    initCall();
    return () => endCall();
  }, []);

  const initCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.ontrack = (event) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0]; };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setCallStatus("active");
    } catch (error) {
      toast.error("Could not start call");
    }
  };

  const endCall = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (pcRef.current) pcRef.current.close();
    navigate(-1);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  if (!targetUser) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute bottom-24 right-4 w-32 rounded-lg overflow-hidden border-2 border-accent">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center gap-4">
        <button onClick={toggleMute} className="p-4 rounded-full bg-white/20"><Mic className="w-6 h-6" /></button>
        <button onClick={endCall} className="p-4 rounded-full bg-red-500"><PhoneOff className="w-6 h-6" /></button>
      </div>
    </div>
  );
}
