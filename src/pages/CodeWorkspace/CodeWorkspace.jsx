import "./CodeWorkspace.css";

const FILES = [
  { name: "AgentDashboard.jsx",   size: "4.2 KB", modified: "10m ago" },
  { name: "GitControlPanel.jsx",  size: "3.8 KB", modified: "1h ago"  },
  { name: "DeploymentCenter.jsx", size: "5.1 KB", modified: "2h ago"  },
  { name: "Sidebar.jsx",          size: "2.4 KB", modified: "3h ago"  },
  { name: "global.css",           size: "6.7 KB", modified: "2h ago"  },
];

const CODE_PREVIEW = `// AgentDashboard.jsx
import { useState, useEffect } from "react";

const STATS = [
  { icon: "📁", value: "12", label: "Active Projects" },
  { icon: "🚀", value: "8",  label: "Deployments"    },
  { icon: "🔀", value: "34", label: "Git Commits"    },
  { icon: "🟢", value: "99.8%", label: "Uptime"      },
];

export default function AgentDashboard() {
  return (
    <div className="agent-dashboard">
      <div className="page-header">
        <h1>⚡ Agent Dashboard</h1>
        <p>Enterprise AI Control Center</p>
      </div>
      {/* Stats Row */}
      <div className="grid-4">
        {STATS.map((s, i) => (
          <div className="stat-card" key={i}>
            <span>{s.icon}</span>
            <span>{s.value}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`;

export default function CodeWorkspace() {
  return (
    <div className="code-workspace">
      <div className="page-header">
        <h1>💻 Code Workspace</h1>
        <p>Browse, write and review code with AI assistance</p>
      </div>

      <div className="workspace-grid">
        <div className="file-explorer card">
          <div className="card-header">
            <span className="card-title">📂 File Explorer</span>
            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "12px" }}>＋ New</button>
          </div>
          <div className="file-list">
            {FILES.map((f, i) => (
              <div className="file-item" key={i}>
                <span className="file-icon">📄</span>
                <div className="file-meta">
                  <span className="file-name">{f.name}</span>
                  <span className="file-info">{f.size} · {f.modified}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="code-editor card">
          <div className="card-header">
            <span className="card-title">📝 AgentDashboard.jsx</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "12px" }}>🔍 Lint</button>
              <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: "12px" }}>▶ Run</button>
            </div>
          </div>
          <pre className="code-block">{CODE_PREVIEW}</pre>
        </div>

        <div className="ai-assist card">
          <div className="card-header">
            <span className="card-title">🤖 AI Assistant</span>
            <span className="badge badge-success">Ready</span>
          </div>
          <div className="ai-suggestions">
            <div className="suggestion">💡 Optimize re-renders using useMemo</div>
            <div className="suggestion">⚠️ Add error boundary for API calls</div>
            <div className="suggestion">✅ Code follows ESLint standards</div>
          </div>
          <input className="input" placeholder="Ask AI: fix this bug, explain code..." style={{ marginTop: 12 }} />
        </div>
      </div>
    </div>
  );
}
