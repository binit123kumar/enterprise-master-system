import { useState } from "react";
import "./SystemPromptLibrary.css";

const PROMPTS = [
  {
    id: 1, name: "Master AI Agent",
    agent: "Claude / GPT-4 / Gemini",
    category: "Core",
    tags: ["deployment", "coding", "security"],
    status: "Active",
    lastUsed: "2h ago",
    description: "Full enterprise workflow: code → build → test → deploy with auth gates.",
  },
  {
    id: 2, name: "Code Review Agent",
    agent: "Claude Sonnet",
    category: "Development",
    tags: ["code", "review", "lint"],
    status: "Active",
    lastUsed: "1d ago",
    description: "Reviews PRs, checks code quality, suggests improvements.",
  },
  {
    id: 3, name: "Deployment Guard",
    agent: "AutoGen",
    category: "Operations",
    tags: ["deploy", "security", "rollback"],
    status: "Active",
    lastUsed: "2d ago",
    description: "Handles production deployments with triple-factor auth.",
  },
  {
    id: 4, name: "Security Scanner",
    agent: "Gemini CLI",
    category: "Security",
    tags: ["scan", "vulnerabilities", "audit"],
    status: "Standby",
    lastUsed: "5d ago",
    description: "Scans codebase for security issues and secret exposure.",
  },
  {
    id: 5, name: "Voice Command Handler",
    agent: "LangGraph",
    category: "AI",
    tags: ["voice", "commands", "nlu"],
    status: "Active",
    lastUsed: "10m ago",
    description: "Processes voice commands and routes to correct agent.",
  },
];

export default function SystemPromptLibrary() {
  const [selected, setSelected] = useState(PROMPTS[0]);
  const [search, setSearch] = useState("");

  const filtered = PROMPTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="prompt-library">
      <div className="page-header">
        <h1>🤖 System Prompt Library</h1>
        <p>Manage and deploy AI agent system prompts across all platforms</p>
      </div>

      <div className="library-grid">
        {/* Prompt List */}
        <div className="card prompt-list-card">
          <div className="card-header">
            <span className="card-title">📚 Saved Prompts</span>
            <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: "12px" }}>＋ New</button>
          </div>
          <input
            className="input"
            placeholder="🔍 Search prompts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <div className="prompt-items">
            {filtered.map(p => (
              <div
                key={p.id}
                className={`prompt-item ${selected?.id === p.id ? "active" : ""}`}
                onClick={() => setSelected(p)}
              >
                <div className="prompt-item-top">
                  <span className="prompt-item-name">{p.name}</span>
                  <span className={`badge ${p.status === "Active" ? "badge-success" : "badge-warning"}`}>
                    {p.status}
                  </span>
                </div>
                <span className="prompt-item-agent">{p.agent}</span>
                <div className="prompt-tags">
                  {p.tags.map((t, i) => <span key={i} className="prompt-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Detail */}
        {selected && (
          <div className="card prompt-detail-card">
            <div className="card-header">
              <span className="card-title">🤖 {selected.name}</span>
              <span className={`badge ${selected.status === "Active" ? "badge-success" : "badge-warning"}`}>
                {selected.status}
              </span>
            </div>

            <div className="detail-meta">
              <div className="meta-row"><span>Platform</span><span>{selected.agent}</span></div>
              <div className="meta-row"><span>Category</span><span>{selected.category}</span></div>
              <div className="meta-row"><span>Last Used</span><span>{selected.lastUsed}</span></div>
            </div>

            <p className="detail-desc">{selected.description}</p>

            <div className="prompt-tags" style={{ marginBottom: 16 }}>
              {selected.tags.map((t, i) => <span key={i} className="prompt-tag">{t}</span>)}
            </div>

            <textarea
              className="prompt-textarea"
              defaultValue={`You are an Enterprise AI Agent for ${selected.name}.\n\nYour mission is to assist with:\n- ${selected.tags.join("\n- ")}\n\nAlways follow security protocols.\nRequire authorization for protected operations.\nNever expose secrets or credentials.`}
              rows={10}
            />

            <div className="detail-actions">
              <button className="btn btn-ghost">📋 Copy</button>
              <button className="btn btn-ghost">✏️ Edit</button>
              <button className="btn btn-ghost">🗑️ Delete</button>
              <button className="btn btn-primary">🚀 Deploy to Agent</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
