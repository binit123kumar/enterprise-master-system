import "./Changelog.css";

const RELEASES = [
  {
    version: "v3.0.0",
    date: "17 Jan 2024",
    type: "Major",
    highlights: ["Real WebRTC Voice Recording", "JWT Authentication", "WebSocket Live Logs", "Dark/Light Theme", "Mobile Responsive", "GitHub API Integration", "Render.com API Integration", "Global Search (Ctrl+K)"],
    added:    ["GlobalSearch with keyboard navigation", "ToastContainer notification system", "ErrorBoundary for crash recovery", "Role-based access control", "Keyboard shortcuts (Alt+1-9, Ctrl+K/B/T)", "Changelog page", "Audit Log page", "Docker compose support", "GitHub Actions CI/CD"],
    fixed:    ["Sidebar toggle animation", "Mobile layout overflow", "WebSocket reconnect logic"],
    changed:  ["Upgraded to React 18.2", "Migrated to Vite 4.4", "Improved dark theme contrast"],
    removed:  ["Legacy mock API service", "Old helper utilities"],
  },
  {
    version: "v2.0.0",
    date: "15 Jan 2024",
    type: "Major",
    highlights: ["Version History system", "ASP.NET Core Backend", "Python AI Agent", "SQL Server integration"],
    added:    ["VersionHistoryPage with timeline", "OriginalSnapshots table", "ChangeHistory table", "FileVersionFolders table", "vw_FileTimeline SQL view", "Python FastAPI AI agent", "Claude API integration", "8 REST API controllers"],
    fixed:    ["Project health bar display", "Deployment checklist state"],
    changed:  ["Database schema upgraded", "API response format standardized"],
    removed:  [],
  },
  {
    version: "v1.0.0",
    date: "10 Jan 2024",
    type: "Initial",
    highlights: ["11 pages built", "Full sidebar navigation", "Dark theme UI"],
    added:    ["AgentDashboard", "ProjectManager", "CodeWorkspace", "GitControlPanel", "DeploymentCenter", "LiveMonitoring", "VoiceCommandCenter", "SystemPromptLibrary", "SecurityVault", "SystemSettings"],
    fixed:    [],
    changed:  [],
    removed:  [],
  },
];

const TYPE_CONFIG = {
  Major:   { badge: "b-success", label: "🚀 Major Release" },
  Minor:   { badge: "b-info",    label: "✨ Minor Release" },
  Patch:   { badge: "b-warning", label: "🔧 Patch"        },
  Initial: { badge: "b-purple",  label: "🌱 Initial"      },
};

export default function Changelog() {
  return (
    <div className="changelog">
      <div className="page-header">
        <h1>📋 Changelog</h1>
        <p>Auto-generated release notes — har version ki changes yahan milti hain</p>
      </div>

      {/* Stats */}
      <div className="cl-stats">
        {[
          { icon:"🚀", val: RELEASES.length,                                               lbl:"Total Releases" },
          { icon:"✅", val: RELEASES.reduce((a,r)=>a+r.added.length,0),                    lbl:"Features Added" },
          { icon:"🔧", val: RELEASES.reduce((a,r)=>a+r.fixed.length,0),                    lbl:"Bugs Fixed" },
          { icon:"📅", val: RELEASES[0].date,                                               lbl:"Latest Release" },
        ].map((s,i)=>(
          <div className="stat" key={i}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-val">{s.val}</span>
            <span className="stat-lbl">{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* Releases */}
      <div className="releases">
        {RELEASES.map((r, ri) => (
          <div className="release-card card" key={ri}>
            {/* Release Header */}
            <div className="release-header">
              <div className="release-left">
                <span className="release-version">{r.version}</span>
                <span className={`badge ${TYPE_CONFIG[r.type]?.badge}`}>
                  {TYPE_CONFIG[r.type]?.label}
                </span>
                {ri === 0 && <span className="badge b-success">Latest</span>}
              </div>
              <span className="release-date">📅 {r.date}</span>
            </div>

            {/* Highlights */}
            {r.highlights.length > 0 && (
              <div className="release-highlights">
                <div className="section-label">⭐ Highlights</div>
                <div className="highlight-chips">
                  {r.highlights.map((h,i) => (
                    <span key={i} className="highlight-chip">{h}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Changes Grid */}
            <div className="changes-grid">
              {r.added.length > 0 && (
                <div className="changes-col">
                  <div className="changes-label added">➕ Added ({r.added.length})</div>
                  <ul className="changes-list">
                    {r.added.map((item,i) => <li key={i} className="change-item added">{item}</li>)}
                  </ul>
                </div>
              )}
              {r.fixed.length > 0 && (
                <div className="changes-col">
                  <div className="changes-label fixed">🔧 Fixed ({r.fixed.length})</div>
                  <ul className="changes-list">
                    {r.fixed.map((item,i) => <li key={i} className="change-item fixed">{item}</li>)}
                  </ul>
                </div>
              )}
              {r.changed.length > 0 && (
                <div className="changes-col">
                  <div className="changes-label changed">🔄 Changed ({r.changed.length})</div>
                  <ul className="changes-list">
                    {r.changed.map((item,i) => <li key={i} className="change-item changed">{item}</li>)}
                  </ul>
                </div>
              )}
              {r.removed.length > 0 && (
                <div className="changes-col">
                  <div className="changes-label removed">🗑️ Removed ({r.removed.length})</div>
                  <ul className="changes-list">
                    {r.removed.map((item,i) => <li key={i} className="change-item removed">{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
