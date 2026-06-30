import { useState } from "react";
import "./ProjectManager.css";

const PROJECTS = [
  { id: 1, name: "EnterpriseOS",     stack: "React + ASP.NET Core", status: "Live",       env: "Production", lastDeploy: "2h ago",  commits: 128, health: 99 },
  { id: 2, name: "BharatPay API",    stack: "Node.js + SQL Server",  status: "Live",       env: "Production", lastDeploy: "1d ago",  commits: 74,  health: 100 },
  { id: 3, name: "AdminPanel v3",    stack: "React.js",              status: "Staging",    env: "Staging",    lastDeploy: "3h ago",  commits: 42,  health: 97 },
  { id: 4, name: "DataSync Worker",  stack: "Python + Docker",       status: "Building",   env: "Dev",        lastDeploy: "10m ago", commits: 19,  health: null },
  { id: 5, name: "ML Prediction API",stack: "Python + FastAPI",      status: "Paused",     env: "Dev",        lastDeploy: "5d ago",  commits: 31,  health: null },
  { id: 6, name: "Report Generator", stack: "ASP.NET Core",          status: "Live",       env: "Production", lastDeploy: "4d ago",  commits: 56,  health: 100 },
];

const STATUS_BADGE = {
  "Live":     "badge-success",
  "Staging":  "badge-warning",
  "Building": "badge-info",
  "Paused":   "badge-purple",
};

export default function ProjectManager() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = PROJECTS.filter(p =>
    (filter === "All" || p.status === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="project-manager">
      <div className="page-header">
        <h1>📁 Project Manager</h1>
        <p>Manage, monitor and deploy all your projects from one place</p>
      </div>

      <div className="pm-toolbar">
        <input
          className="input"
          placeholder="🔍  Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <div className="filter-tabs">
          {["All", "Live", "Staging", "Building", "Paused"].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>
        <button className="btn btn-primary">＋ New Project</button>
      </div>

      <div className="project-table">
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Tech Stack</th>
              <th>Status</th>
              <th>Environment</th>
              <th>Last Deploy</th>
              <th>Commits</th>
              <th>Health</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><span className="project-name">{p.name}</span></td>
                <td><span className="stack-tag">{p.stack}</span></td>
                <td><span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
                <td><span className="env-tag">{p.env}</span></td>
                <td><span className="text-muted">{p.lastDeploy}</span></td>
                <td><span className="commits-count">{p.commits}</span></td>
                <td>
                  {p.health ? (
                    <div className="health-bar">
                      <div className="health-fill" style={{ width: `${p.health}%` }} />
                      <span>{p.health}%</span>
                    </div>
                  ) : <span className="text-muted">—</span>}
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "12px" }}>🚀 Deploy</button>
                    <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "12px" }}>📊 Logs</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
