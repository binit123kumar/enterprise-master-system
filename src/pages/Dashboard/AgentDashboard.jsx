import "./AgentDashboard.css";

const STATS = [
  { icon: "📁", value: "12", label: "Active Projects", change: "+2 this week", color: "#3b82f6" },
  { icon: "🚀", value: "8",  label: "Deployments",     change: "Last: 2h ago",  color: "#10b981" },
  { icon: "🔀", value: "34", label: "Git Commits",     change: "+5 today",      color: "#8b5cf6" },
  { icon: "🟢", value: "99.8%", label: "Uptime",       change: "30 days",       color: "#f59e0b" },
];

const RECENT_ACTIVITY = [
  { time: "10:42", msg: "Deployment successful → production", type: "success" },
  { time: "10:31", msg: "Git push → main branch", type: "success" },
  { time: "09:58", msg: "Build completed: EnterpriseOS v2.0.0", type: "success" },
  { time: "09:44", msg: "Security scan passed — 0 issues", type: "success" },
  { time: "09:20", msg: "Voice command received: Deploy production", type: "info" },
  { time: "08:55", msg: "Health check passed — all services UP", type: "success" },
  { time: "08:30", msg: "Database backup completed", type: "success" },
];

const AGENT_STATUS = [
  { name: "AI Code Agent",       status: "Active",  task: "Reviewing pull requests" },
  { name: "Deployment Agent",    status: "Standby", task: "Waiting for approval" },
  { name: "Monitoring Agent",    status: "Active",  task: "Watching 4 services" },
  { name: "Security Agent",      status: "Active",  task: "Running vulnerability scan" },
  { name: "Voice Command Agent", status: "Active",  task: "Listening for commands" },
];

const QUICK_ACTIONS = [
  { icon: "💻", label: "New Code Task",   color: "#3b82f6" },
  { icon: "🚀", label: "Deploy Now",      color: "#10b981" },
  { icon: "🔀", label: "Git Commit",      color: "#8b5cf6" },
  { icon: "📊", label: "View Logs",       color: "#f59e0b" },
  { icon: "🔐", label: "Security Check",  color: "#ef4444" },
  { icon: "🎙️", label: "Voice Command",   color: "#06b6d4" },
];

export default function AgentDashboard() {
  return (
    <div className="agent-dashboard">
      <div className="page-header">
        <h1>⚡ Agent Dashboard</h1>
        <p>Enterprise AI Control Center — Real-time system overview</p>
      </div>

      {/* Stats Row */}
      <div className="grid-4 mb-20">
        {STATS.map((s, i) => (
          <div className="stat-card" key={i} style={{ borderTop: `3px solid ${s.color}` }}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
            <span className="stat-change">{s.change}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Activity Feed */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Recent Activity</span>
            <span className="badge badge-success">Live</span>
          </div>
          {RECENT_ACTIVITY.map((a, i) => (
            <div className="log-entry" key={i}>
              <span className="log-time">{a.time}</span>
              <span className={`log-msg log-${a.type}`}>{a.msg}</span>
            </div>
          ))}
        </div>

        {/* Agent Status */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🤖 Agent Status</span>
            <span className="badge badge-info">5 Agents</span>
          </div>
          <div className="agent-list">
            {AGENT_STATUS.map((a, i) => (
              <div className="agent-row" key={i}>
                <div className="agent-info">
                  <span className="agent-name">{a.name}</span>
                  <span className="agent-task">{a.task}</span>
                </div>
                <span className={`badge ${a.status === "Active" ? "badge-success" : "badge-warning"}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-20">
        <div className="card-header">
          <span className="card-title">⚡ Quick Actions</span>
        </div>
        <div className="quick-actions">
          {QUICK_ACTIONS.map((a, i) => (
            <button className="quick-action-btn" key={i} style={{ "--action-color": a.color }}>
              <span>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
