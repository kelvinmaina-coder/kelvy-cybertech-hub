import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Mic, StopCircle, Play, Loader2, Download, Copy, Save,
  FileText, Clock, Users, CheckCircle2, AlertCircle, Plus, Trash2
} from "lucide-react";
import { toast } from "sonner";

interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  completed: boolean;
}

interface Decision {
  id: string;
  description: string;
  owner: string;
}

interface Attendee {
  name: string;
  role: string;
}

export default function MeetingNotesPage() {
  const { user } = useAuth();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // State
  const [meetingTitle, setMeetingTitle] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "You", role: "Participant" }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Add attendee
  const addAttendee = () => {
    setAttendees([...attendees, { name: "", role: "Participant" }]);
  };

  const updateAttendee = (index: number, field: string, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  // Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      toast.success("Recording started");

      // Timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      mediaRecorder.onstop = () => {
        clearInterval(interval);
      };
    } catch {
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");

      // Process recording
      processRecording();
    }
  };

  const processRecording = () => {
    // Mock transcription
    const mockTranscripts = [
      "John: Let's discuss the Q4 strategy. Sarah: I think we should focus on customer retention first.",
      "Team: Today we'll review the marketing campaign results. Manager: Q3 exceeded targets by 15%.",
      "Alice: The project is on track. Bob: We need to address the resource allocation issue.",
    ];

    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    setTranscript(randomTranscript);

    // Mock AI processing
    setLoading(true);
    setTimeout(() => {
      setSummary(
        "Discussion covered strategic objectives including customer retention, campaign performance review with Q3 exceeding targets by 15%, and project timeline with resource allocation considerations. Team agreed to prioritize customer retention initiatives and address resource planning in next sprint."
      );

      setDecisions([
        { id: "1", description: "Focus on customer retention as Q4 priority", owner: "Sarah" },
        { id: "2", description: "Increase budget for marketing optimization", owner: "Manager" },
        { id: "3", description: "Allocate additional resources to project team", owner: "Bob" },
      ]);

      setActionItems([
        {
          id: "1",
          task: "Prepare customer retention strategy",
          owner: "Sarah",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          completed: false,
        },
        {
          id: "2",
          task: "Review marketing KPIs for Q4",
          owner: "John",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          completed: false,
        },
        {
          id: "3",
          task: "Resolve resource allocation issues",
          owner: "Bob",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          completed: false,
        },
      ]);

      setLoading(false);
      toast.success("Meeting notes generated!");
    }, 2000);
  };

  const toggleActionItem = (id: string) => {
    setActionItems(
      actionItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const saveMeeting = async () => {
    if (!meetingTitle.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    try {
      await supabase.from("meeting_notes").insert({
        user_id: user?.id,
        title: meetingTitle,
        transcript,
        summary,
        decisions: decisions.map((d) => ({ description: d.description, owner: d.owner })),
        action_items: actionItems.map((a) => ({
          task: a.task,
          owner: a.owner,
          due_date: a.dueDate,
          completed: a.completed,
        })),
        attendees: attendees,
        duration_minutes: recordingTime,
      });
      toast.success("Meeting notes saved!");
    } catch (error) {
      toast.error("Failed to save meeting notes");
    }
  };

  const exportAsMarkdown = () => {
    const markdown = `# Meeting Notes: ${meetingTitle}

**Meeting Date:** ${new Date().toLocaleDateString()}
**Duration:** ${recordingTime} seconds
**Attendees:** ${attendees.map((a) => `${a.name} (${a.role})`).join(", ")}

## Summary
${summary}

## Decisions
${decisions.map((d) => `- ${d.description} *(Owner: ${d.owner})*`).join("\n")}

## Action Items
${actionItems
  .map((a) => `- [ ] ${a.task} - Due: ${a.dueDate} *(Owner: ${a.owner})*`)
  .join("\n")}

## Transcript
\`\`\`
${transcript}
\`\`\`
`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-${meetingTitle.replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Meeting exported as Markdown");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Mic className="w-8 h-8" />
            Meeting Notes
          </h1>
          <p className="text-muted-foreground mt-1">
            Record, transcribe, and summarize your meetings with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recording & Attendees */}
          <div className="lg:col-span-1 space-y-4">
            {/* Meeting Title */}
            <div className="bg-card border rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Meeting Title</label>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g., Q4 Strategy Review"
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              />
            </div>

            {/* Recording Controls */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mic className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold">Recording</h3>
              </div>

              <div className="text-center mb-4">
                <div className="text-2xl font-mono font-bold text-primary">
                  {formatTime(recordingTime)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRecording ? "Recording..." : "Ready"}
                </p>
              </div>

              <div className="flex gap-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Mic className="w-4 h-4" />
                    Start
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex-1 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <StopCircle className="w-4 h-4" />
                    Stop
                  </button>
                )}
              </div>
            </div>

            {/* Attendees */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <h3 className="font-semibold">Attendees</h3>
                </div>
                <button
                  onClick={addAttendee}
                  className="p-1 hover:bg-muted rounded text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {attendees.map((attendee, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-end"
                  >
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={attendee.name}
                        onChange={(e) => updateAttendee(idx, "name", e.target.value)}
                        placeholder="Name"
                        className="w-full px-2 py-1 border rounded text-xs bg-background"
                      />
                      <input
                        type="text"
                        value={attendee.role}
                        onChange={(e) => updateAttendee(idx, "role", e.target.value)}
                        placeholder="Role"
                        className="w-full px-2 py-1 border rounded text-xs bg-background"
                      />
                    </div>
                    {idx > 0 && (
                      <button
                        onClick={() => removeAttendee(idx)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-950 rounded text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Save */}
            {summary && (
              <button
                onClick={saveMeeting}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2 font-medium text-sm"
              >
                <Save className="w-4 h-4" />
                Save Meeting
              </button>
            )}
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-card border rounded-lg p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3">Processing meeting notes...</span>
              </div>
            )}

            {summary && !loading && (
              <>
                {/* Summary */}
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-semibold">Summary</h3>
                  </div>
                  <p className="text-sm text-foreground">{summary}</p>
                </div>

                {/* Decisions */}
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-semibold">Decisions Made</h3>
                  </div>
                  <ul className="space-y-2">
                    {decisions.map((decision) => (
                      <li
                        key={decision.id}
                        className="text-sm p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800"
                      >
                        <div>{decision.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Owner: {decision.owner}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-semibold">Action Items</h3>
                  </div>
                  <ul className="space-y-2">
                    {actionItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-200 dark:border-yellow-800"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleActionItem(item.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div
                            className={`text-sm ${
                              item.completed ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {item.task}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.owner} • Due: {item.dueDate}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Transcript */}
                {transcript && (
                  <div className="bg-card border rounded-lg p-4">
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="flex items-center gap-2 font-semibold mb-3 hover:text-primary"
                    >
                      <Clock className="w-5 h-5" />
                      Meeting Transcript
                      {showTranscript ? "▼" : "▶"}
                    </button>

                    {showTranscript && (
                      <div className="bg-white dark:bg-black/20 p-3 rounded border font-mono text-xs whitespace-pre-wrap mb-3">
                        {transcript}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(transcript);
                          toast.success("Transcript copied");
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg hover:bg-muted flex items-center justify-center gap-2 text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <button
                        onClick={exportAsMarkdown}
                        className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
