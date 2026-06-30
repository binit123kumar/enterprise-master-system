import "./Sidebar.css";

const NAV_ITEMS = [
  { id: "AgentDashboard",     icon: "⚡", label: "Agent Dashboard",      group: "MAIN" },
  { id: "ProjectManager",     icon: "📁", label: "Project Manager",       group: "MAIN" },
  { id: "CodeWorkspace",      icon: "💻", label: "Code Workspace",        group: "DEVELOPMENT" },
  { id: "GitControlPanel",    icon: "🔀", label: "Git Control Panel",     group: "DEVELOPMENT" },
  { id: "DeploymentCenter",   icon: "🚀", label: "Deployment Center",     group: "OPERATIONS" },
  { id: "LiveMonitoring",     icon: "📊", label: "Live Monitoring",       group: "OPERATIONS" },
  { id: "VoiceCommandCenter", icon: "🎙️", label: "Voice Command Center",  group: "AI" },
  { id: "SystemPromptLibrary",icon: "🤖", label: "System Prompt Library", group: "AI" },
  { id: "SecurityVault",      icon: "🔐", label: "Security Vault",        group: "SECURITY" },
  { id: "SystemSettings",     icon: "⚙️", label: "System Settings",       group: "SYSTEM" },
];

export default function Sidebar({ activePage, onNavigate, isOpen }) {
  const groups = [...new Set(NAV_ITEMS.map(i => i.group))];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-brand">
        <span className="brand-icon">🛡️</span>
        <div className="brand-text">
          <span className="brand-name">EnterpriseOS</span>
          <span className="brand-sub">Binit's Master System</span>
        </div>
      </div>

      <div className="sidebar-status">
        <div className="pulse-dot"></div>
        <span>All Systems Operational</span>
      </div>

      <nav className="sidebar-nav">
        {groups.map(group => (
          <div key={group} className="nav-group">
            <span className="nav-group-label">{group}</span>
            {NAV_ITEMS.filter(i => i.group === group).map(item => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {activePage === item.id && <span className="nav-active-bar" />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="owner-badge">
          <span className="owner-avatar">B</span>
          <div>
            <div className="owner-name">Binit</div>
            <div className="owner-role">System Owner</div>
          </div>
          <span className="owner-verified">✓</span>
        </div>
      </div>
    </aside>
  );
}
