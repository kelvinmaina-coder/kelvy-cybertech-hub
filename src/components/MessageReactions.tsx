import { useState } from "react";
import { Heart, ThumbsUp, Laugh, Sad, Angry, Star } from "lucide-react";

const reactions = [
  { emoji: "❤️", icon: Heart, label: "love" },
  { emoji: "👍", icon: ThumbsUp, label: "like" },
  { emoji: "😂", icon: Laugh, label: "laugh" },
  { emoji: "😮", icon: Sad, label: "wow" },
  { emoji: "😢", icon: Sad, label: "sad" },
  { emoji: "⭐", icon: Star, label: "star" },
];

interface MessageReactionsProps {
  messageId: number;
  onReact: (messageId: number, reaction: string) => void;
  existingReactions?: Record<string, string[]>;
}

export function MessageReactions({ messageId, onReact, existingReactions = {} }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="text-xs text-muted-foreground hover:text-accent transition"
      >
        😊
      </button>
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-lg shadow-xl p-1 flex gap-1 z-10 animate-fade-in">
          {reactions.map((r) => (
            <button
              key={r.label}
              onClick={() => {
                onReact(messageId, r.label);
                setShowPicker(false);
              }}
              className="p-1.5 hover:bg-accent/10 rounded transition text-lg"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
