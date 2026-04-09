import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Clock, Play, Pause, Trash2, Plus, Edit, RefreshCw,
  Calendar, Mail, Database, Terminal, Webhook, Shield,
  CheckCircle, XCircle, Loader2, TrendingUp, Activity
} from "lucide-react";

interface Task {
  id: number;
  name: string;
  description: string;
  task_type: string;
  schedule_type: string;
  schedule_value: string;
  config: any;
  enabled: boolean;
  last_run: string;
  next_run: string;
  created_at: string;
}

interface Log {
  id: number;
  task_id: number;
  task_name: string;
  status: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  output: string;
  error_message: string;
}

const taskTypeIcons: Record<string, any> = {
  run_scan: Shield,
  send_report: Mail,
  backup_database: Database,
  send_email: Mail,
  run_script: Terminal,
  webhook: Webhook
};

const statusColors: Record<string, string> = {
  running: "text-yellow-500 bg-yellow-500/10",
  success: "text-green-500 bg-green-500/10",
  failed: "text-red-500 bg-red-500/10",
  skipped: "text-gray-500 bg-gray-500/10"
};

export default function AutomationPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "logs" | "stats">("tasks");

  // New task form state
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    task_type: "run_scan",
    schedule_type: "cron",
    schedule_value: "0 2 * * *",
    config: {}
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, logsRes, statsRes] = await Promise.all([
        fetch("http://localhost:8000/api/automation/tasks"),
        fetch("http://localhost:8000/api/automation/logs?limit=50"),
        fetch("http://localhost:8000/api/automation/stats")
      ]);
      
      setTasks(await tasksRes.json());
      setLogs(await logsRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error("Error loading automation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/automation/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });
      if (response.ok) {
        setShowCreateModal(false);
        loadData();
        setNewTask({
          name: "",
          description: "",
          task_type: "run_scan",
          schedule_type: "cron",
          schedule_value: "0 2 * * *",
          config: {}
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await fetch(`http://localhost:8000/api/automation/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !task.enabled })
      });
      loadData();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const runTaskNow = async (taskId: number) => {
    try {
      await fetch(`http://localhost:8000/api/automation/tasks/${taskId}/run`, {
        method: "POST"
      });
      setTimeout(() => loadData(), 2000);
    } catch (error) {
      console.error("Error running task:", error);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await fetch(`http://localhost:8000/api/automation/tasks/${taskId}`, {
          method: "DELETE"
        });
        loadData();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Automation Hub</h1>
          <p className="text-sm text-muted-foreground">Schedule and manage automated tasks</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-border">
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Total Tasks</span>
            </div>
            <div className="text-2xl font-bold">{stats.total_tasks}</div>
            <div className="text-xs text-green-500">{stats.enabled_tasks} enabled</div>
          </div>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Executions</span>
            </div>
            <div className="text-2xl font-bold">{stats.total_executions}</div>
            <div className="text-xs text-green-500">{stats.success_count} successful</div>
          </div>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Success Rate</span>
            </div>
            <div className="text-2xl font-bold">{stats.success_rate?.toFixed(1)}%</div>
            <div className="text-xs text-red-500">{stats.failed_count} failed</div>
          </div>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold">{formatDuration(stats.avg_duration_ms)}</div>
          </div>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs">Last Run</span>
            </div>
            <div className="text-sm font-mono truncate">
              {tasks[0]?.last_run ? formatDate(tasks[0].last_run) : "Never"}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border flex px-4">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2 text-sm transition ${activeTab === "tasks" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
        >
          📋 Scheduled Tasks
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 text-sm transition ${activeTab === "logs" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
        >
          📜 Execution Logs
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 text-sm transition ${activeTab === "stats" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
        >
          📊 Analytics
        </button>
      </div>

      {/* Tasks List */}
      {activeTab === "tasks" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = taskTypeIcons[task.task_type] || Clock;
              return (
                <div key={task.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{task.name}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span>Type: {task.task_type}</span>
                          <span>Schedule: {task.schedule_value}</span>
                          <span>Last run: {formatDate(task.last_run)}</span>
                          {task.next_run && <span>Next: {formatDate(task.next_run)}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => runTaskNow(task.id)}
                        className="p-1.5 rounded-lg hover:bg-muted transition"
                        title="Run now"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleTask(task)}
                        className={`p-1.5 rounded-lg transition ${task.enabled ? "text-green-500 hover:bg-green-500/10" : "text-gray-500 hover:bg-gray-500/10"}`}
                        title={task.enabled ? "Disable" : "Enable"}
                      >
                        {task.enabled ? <CheckCircle className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {task.config && Object.keys(task.config).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <pre className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                        {JSON.stringify(task.config, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No automation tasks yet. Create your first task!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logs List */}
      {activeTab === "logs" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${log.status === "success" ? "bg-green-500" : log.status === "failed" ? "bg-red-500" : "bg-yellow-500"}`} />
                    <div>
                      <div className="font-mono text-sm font-semibold">{log.task_name}</div>
                      <div className="text-xs text-muted-foreground">
                        Started: {formatDate(log.started_at)}
                        {log.completed_at && ` • Duration: ${formatDuration(log.duration_ms)}`}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-mono ${statusColors[log.status]}`}>
                    {log.status}
                  </div>
                </div>
                {log.output && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <pre className="text-xs text-muted-foreground bg-muted/30 p-2 rounded overflow-x-auto">
                      {log.output.substring(0, 500)}
                      {log.output.length > 500 && "..."}
                    </pre>
                  </div>
                )}
                {log.error_message && (
                  <div className="mt-2 text-red-500 text-xs">
                    Error: {log.error_message}
                  </div>
                )}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No execution logs yet. Tasks will appear here when they run.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats View */}
      {activeTab === "stats" && stats && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Task Distribution</h3>
              <div className="space-y-2">
                {Object.entries(stats.task_distribution || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{type}</span>
                    <span className="text-sm font-mono">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Performance</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="text-sm font-mono text-green-500">{stats.success_rate?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Duration</span>
                  <span className="text-sm font-mono">{formatDuration(stats.avg_duration_ms)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Executions</span>
                  <span className="text-sm font-mono">{stats.total_executions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCreateModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl z-50 p-6">
            <h2 className="text-xl font-bold mb-4">Create Automation Task</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Task Name</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="Daily Security Scan"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  rows={2}
                  placeholder="Description of what this task does"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Task Type</label>
                <select
                  value={newTask.task_type}
                  onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="run_scan">Run Security Scan</option>
                  <option value="send_report">Send Report</option>
                  <option value="backup_database">Backup Database</option>
                  <option value="send_email">Send Email</option>
                  <option value="run_script">Run Script</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Schedule Type</label>
                <select
                  value={newTask.schedule_type}
                  onChange={(e) => setNewTask({ ...newTask, schedule_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="cron">Cron (0 2 * * * = 2 AM daily)</option>
                  <option value="interval">Interval (seconds)</option>
                  <option value="once">One Time</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Schedule Value</label>
                <input
                  type="text"
                  value={newTask.schedule_value}
                  onChange={(e) => setNewTask({ ...newTask, schedule_value: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-sm"
                  placeholder="0 2 * * *"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cron format: minute hour day month day_of_week<br/>
                  Examples: "0 2 * * *" (2 AM daily), "*/30 * * * *" (every 30 minutes)
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createTask}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                Create Task
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 rounded-lg border border-border hover:bg-muted/50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
