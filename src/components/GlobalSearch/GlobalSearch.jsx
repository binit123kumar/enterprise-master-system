import { useState, useEffect, useRef } from "react";
import "./GlobalSearch.css";

const SEARCH_INDEX = [
  { label:"Agent Dashboard",       page:"AgentDashboard",     icon:"⚡", type:"page" },
  { label:"Project Manager",        page:"ProjectManager",     icon:"📁", type:"page" },
  { label:"Code Workspace",         page:"CodeWorkspace",      icon:"💻", type:"page" },
  { label:"Git Control Panel",      page:"GitControlPanel",    icon:"🔀", type:"page" },
  { label:"Deployment Center",      page:"DeploymentCenter",   icon:"🚀", type:"page" },
  { label:"Live Monitoring",        page:"LiveMonitoring",     icon:"📊", type:"page" },
  { label:"Voice Command Center",   page:"VoiceCommandCenter", icon:"🎙️", type:"page" },
  { label:"System Prompt Library",  page:"SystemPromptLibrary",icon:"🤖", type:"page" },
  { label:"Security Vault",         page:"SecurityVault",      icon:"🔐", type:"page" },
  { label:"Version History",        page:"VersionHistory",     icon:"🗂️", type:"page" },
  { label:"Changelog",              page:"Changelog",          icon:"📋", type:"page" },
  { label:"Audit Log",              page:"AuditLog",           icon:"📜", type:"page" },
  { label:"System Settings",        page:"SystemSettings",     icon:"⚙️", type:"page" },
  // Actions
  { label:"Deploy to Production",   page:"DeploymentCenter",   icon:"🚀", type:"action" },
  { label:"Git Commit & Push",      page:"GitControlPanel",    icon:"🔀", type:"action" },
  { label:"Start Voice Command",    page:"VoiceCommandCenter", icon:"🎙️", type:"action" },
  { label:"Security Scan",          page:"SecurityVault",      icon:"🛡️", type:"action" },
  { label:"View Live Logs",         page:"LiveMonitoring",     icon:"📊", type:"action" },
  { label:"Rollback Deployment",    page:"DeploymentCenter",   icon:"↩️", type:"action" },
  // Projects
  { label:"EnterpriseOS",           page:"ProjectManager",     icon:"📦", type:"project" },
  { label:"BharatPay API",          page:"ProjectManager",     icon:"📦", type:"project" },
  { label:"AdminPanel v3",          page:"ProjectManager",     icon:"📦", type:"project" },
];

export default function GlobalSearch({ open, onClose, onNavigate }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [selIdx,  setSelIdx]  = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery(""); setSelIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults(SEARCH_INDEX.slice(0, 8)); return; }
    const q = query.toLowerCase();
    setResults(
      SEARCH_INDEX.filter(i =>
        i.label.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q)
      ).slice(0, 10)
    );
    setSelIdx(0);
  }, [query]);

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelIdx(i => Math.min(i+1, results.length-1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelIdx(i => Math.max(i-1, 0)); }
    if (e.key === "Enter")     { if (results[selIdx]) select(results[selIdx]); }
    if (e.key === "Escape")    { onClose(); }
  };

  const select = (item) => {
    onNavigate(item.page);
    onClose();
  };

  const TYPE_BADGE = {
    page:    { label:"Page",    color:"#3b82f6" },
    action:  { label:"Action",  color:"#10b981" },
    project: { label:"Project", color:"#8b5cf6" },
  };

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search pages, actions, projects... (Ctrl+K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          <kbd className="search-esc" onClick={onClose}>ESC</kbd>
        </div>
        <div className="search-results">
          {results.length === 0 ? (
            <div className="search-empty">No results for "{query}"</div>
          ) : results.map((r, i) => (
            <button
              key={i}
              className={`search-result ${i === selIdx ? "active" : ""}`}
              onClick={() => select(r)}
              onMouseEnter={() => setSelIdx(i)}
            >
              <span className="search-result-icon">{r.icon}</span>
              <span className="search-result-label">{r.label}</span>
              <span className="search-result-type" style={{ color: TYPE_BADGE[r.type]?.color }}>
                {TYPE_BADGE[r.type]?.label}
              </span>
              <span className="search-result-enter">↵</span>
            </button>
          ))}
        </div>
        <div className="search-footer">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
          <span>Ctrl+K Open</span>
        </div>
      </div>
    </div>
  );
}
