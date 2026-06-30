import { useState } from "react";
import "./GitControlPanel.css";

const CHANGED_FILES = [
  { status: "M", file: "src/pages/Dashboard/AgentDashboard.jsx", additions: 12, deletions: 3 },
  { status: "M", file: "src/components/Sidebar/Sidebar.css",     additions: 5,  deletions: 1 },
  { status: "A", file: "src/pages/GitControl/GitControlPanel.jsx", additions: 98, deletions: 0 },
  { status: "D", file: "src/utils/oldHelper.js",                  additions: 0,  deletions: 22 },
];

const COMMIT_HISTORY = [
  { hash: "a3f9c2d", msg: "feat: Add Enterprise Dashboard with real-time stats", author: "Binit", time: "2h ago",  branch: "main" },
  { hash: "8b2e1f4", msg: "fix: Resolve sidebar toggle animation glitch",        author: "Binit", time: "5h ago",  branch: "main" },
  { hash: "c1d7a9b", msg: "deploy: Production release v1.9.8",                  author: "Binit", time: "1d ago",  branch: "main" },
  { hash: "f5e3c8a", msg: "refactor: Optimize API response caching",             author: "Binit", time: "2d ago",  branch: "main" },
  { hash: "9d4b2e7", msg: "feat: Voice command integration with security gate",  author: "Binit", time: "3d ago",  branch: "main" },
];

const FILE_STATUS_COLOR = { M: "#f59e0b", A: "#10b981", D: "#ef4444" };
const FILE_STATUS_LABEL = { M: "Modified", A: "Added", D: "Deleted" };

export default function GitControlPanel() {
  const [commitMsg, setCommitMsg] = useState("");
  const [branch, setBranch] = useState("main");

  return (
    <div className="git-control">
      <div className="page-header">
        <h1>🔀 Git Control Panel</h1>
        <p>Commit, push and manage your branches with full audit trail</p>
      </div>

      <div className="git-grid">
        {/* Left: Working changes */}
        <div className="git-left">
          <div className="card mb-16">
            <div className="card-header">
              <span className="card-title">📝 Working Changes</span>
              <span className="badge badge-warning">{CHANGED_FILES.length} files</span>
            </div>
            <div className="file-list">
              {CHANGED_FILES.map((f, i) => (
                <div className="file-row" key={i}>
                  <span className="file-status" style={{ color: FILE_STATUS_COLOR[f.status] }}>
                    [{f.status}]
                  </span>
                  <span className="file-path">{f.file}</span>
                  <div className="file-diff">
                    <span className="diff-add">+{f.additions}</span>
                    <span className="diff-del">-{f.deletions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">🔀 Commit & Push</span>
            </div>
            <div className="commit-form">
              <div className="form-row">
                <label className="form-label">Branch</label>
                <select className="input" value={branch} onChange={e => setBranch(e.target.value)}>
                  <option>main</option>
                  <option>develop</option>
                  <option>feature/new-ui</option>
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Commit Message</label>
                <input
                  className="input"
                  placeholder="feat: describe your changes..."
                  value={commitMsg}
                  onChange={e => setCommitMsg(e.target.value)}
                />
              </div>
              <div className="commit-actions">
                <button className="btn btn-ghost">📋 Git Status</button>
                <button className="btn btn-ghost">🔍 Diff View</button>
                <button className="btn btn-primary">🔀 Commit & Push</button>
              </div>
              <div className="auth-notice">
                🔐 Push requires: Voice + PIN + Fingerprint verification
              </div>
            </div>
          </div>
        </div>

        {/* Right: Commit history */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📜 Commit History</span>
            <span className="badge badge-info">main</span>
          </div>
          <div className="commit-history">
            {COMMIT_HISTORY.map((c, i) => (
              <div className="commit-row" key={i}>
                <div className="commit-hash">{c.hash}</div>
                <div className="commit-info">
                  <span className="commit-msg">{c.msg}</span>
                  <span className="commit-meta">{c.author} · {c.time}</span>
                </div>
                <span className="badge badge-info">{c.branch}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
