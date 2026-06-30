import { useState, useEffect } from "react";
import "./Header.css";

const PAGE_TITLES = {
  AgentDashboard:      { title: "Agent Dashboard",       icon: "⚡", desc: "AI Agent Control Center" },
  ProjectManager:      { title: "Project Manager",        icon: "📁", desc: "Manage all your projects" },
  CodeWorkspace:       { title: "Code Workspace",         icon: "💻", desc: "Write, edit and review code" },
  GitControlPanel:     { title: "Git Control Panel",      icon: "🔀", desc: "Commit, push and manage branches" },
  DeploymentCenter:    { title: "Deployment Center",      icon: "🚀", desc: "Deploy and manage production" },
  LiveMonitoring:      { title: "Live Monitoring",        icon: "📊", desc: "System health and logs" },
  VoiceCommandCenter:  { title: "Voice Command Center",   icon: "🎙️", desc: "Voice-driven operations" },
  SystemPromptLibrary: { title: "System Prompt Library",  icon: "🤖", desc: "Manage AI agent prompts" },
  SecurityVault:       { title: "Security Vault",         icon: "🔐", desc: "Auth, keys and access control" },
  SystemSettings:      { title: "System Settings",        icon: "⚙️", desc: "Configure system preferences" },
};

export default function Header({ activePage, onToggleSidebar }) {
  const [time, setTime] = useState(new Date());
  const info = PAGE_TITLES[activePage] || {};

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onToggleSidebar}>☰</button>
        <div className="breadcrumb">
          <span className="breadcrumb-icon">{info.icon}</span>
          <div>
            <span className="breadcrumb-title">{info.title}</span>
            <span className="breadcrumb-desc">{info.desc}</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-clock">
          <span className="clock-time">
            {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <span className="clock-date">
            {time.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        <div className="header-badges">
          <span className="badge badge-success">🟢 Live</span>
          <span className="badge badge-info">v2.0.0</span>
        </div>

        <div className="header-avatar">B</div>
      </div>
    </header>
  );
}
