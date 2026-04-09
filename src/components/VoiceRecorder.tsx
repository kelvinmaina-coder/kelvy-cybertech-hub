import { useState, useRef } from "react";
import { Mic, Square, Send, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onSend, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        onSend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording... Click stop when done");
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsSending(true);
      setTimeout(() => setIsSending(false), 1000);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? ${mins}: : ${secs}s;
  };

  return (
    <div className="relative">
      {isRecording && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Recording {formatDuration(duration)}
        </div>
      )}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isSending}
        className={p-2 rounded-lg transition }
      >
        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
      </button>
    </div>
  );
}
