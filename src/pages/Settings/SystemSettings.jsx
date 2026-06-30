import { useState } from "react";
import "./SystemSettings.css";

const SETTINGS_SECTIONS = [
  { id: "general",    icon: "⚙️",  label: "General" },
  { id: "agents",     icon: "🤖",  label: "AI Agents" },
  { id: "deployment", icon: "🚀",  label: "Deployment" },
  { id: "security",   icon: "🔐",  label: "Security" },
  { id: "notifications", icon: "🔔", label: "Notifications" },
];

export default function SystemSettings() {
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState({
    ownerName: "Binit",
    systemName: "EnterpriseOS",
    language: "Hindi / English",
    timezone: "Asia/Kolkata",
    theme: "Dark",
    defaultBranch: "main",
    autoBuild: true,
    autoTest: true,
    autoDeploy: false,
    voiceVerify: true,
    pinVerify: true,
    fingerprintVerify: true,
    notifyDeploy: true,
    notifyError: true,
    notifyGit: false,
    defaultAgent: "claude-sonnet-4-6",
    maxTokens: "1000",
    agentLanguage: "Hindi + English",
  });

  const toggle = key => setSettings(s => ({ ...s, [key]: !s[key] }));
  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  return (
    <div className="system-settings">
      <div className="page-header">
        <h1>⚙️ System Settings</h1>
        <p>Configure all system preferences, agents and security settings</p>
      </div>

      <div className="settings-layout">
        {/* Settings Nav */}
        <div className="settings-nav card">
          {SETTINGS_SECTIONS.map(s => (
            <button
              key={s.id}
              className={`settings-nav-item ${activeSection === s.id ? "active" : ""}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content card">

          {activeSection === "general" && (
            <div>
              <div className="card-header"><span className="card-title">⚙️ General Settings</span></div>
              <div className="settings-form">
                <Setting label="Owner Name" type="input" value={settings.ownerName} onChange={v => update("ownerName", v)} />
                <Setting label="System Name" type="input" value={settings.systemName} onChange={v => update("systemName", v)} />
                <Setting label="Language" type="select" value={settings.language} options={["Hindi / English", "English Only", "Hindi Only"]} onChange={v => update("language", v)} />
                <Setting label="Timezone" type="select" value={settings.timezone} options={["Asia/Kolkata", "UTC", "Asia/Dubai"]} onChange={v => update("timezone", v)} />
                <Setting label="Theme" type="select" value={settings.theme} options={["Dark", "Light", "Auto"]} onChange={v => update("theme", v)} />
              </div>
            </div>
          )}

          {activeSection === "agents" && (
            <div>
              <div className="card-header"><span className="card-title">🤖 AI Agent Settings</span></div>
              <div className="settings-form">
                <Setting label="Default Model" type="select" value={settings.defaultAgent} options={["claude-sonnet-4-6", "claude-opus-4-6", "gpt-4o", "gemini-pro"]} onChange={v => update("defaultAgent", v)} />
                <Setting label="Max Tokens" type="input" value={settings.maxTokens} onChange={v => update("maxTokens", v)} />
                <Setting label="Agent Language" type="select" value={settings.agentLanguage} options={["Hindi + English", "English Only", "Hindi Only"]} onChange={v => update("agentLanguage", v)} />
              </div>
            </div>
          )}

          {activeSection === "deployment" && (
            <div>
              <div className="card-header"><span className="card-title">🚀 Deployment Settings</span></div>
              <div className="settings-form">
                <Setting label="Default Branch" type="input" value={settings.defaultBranch} onChange={v => update("defaultBranch", v)} />
                <Setting label="Auto Build on Commit" type="toggle" value={settings.autoBuild} onChange={() => toggle("autoBuild")} />
                <Setting label="Auto Test on Build" type="toggle" value={settings.autoTest} onChange={() => toggle("autoTest")} />
                <Setting label="Auto Deploy (Disabled for safety)" type="toggle" value={settings.autoDeploy} onChange={() => toggle("autoDeploy")} danger />
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div>
              <div className="card-header"><span className="card-title">🔐 Security Settings</span></div>
              <div className="settings-form">
                <Setting label="Voice Verification" type="toggle" value={settings.voiceVerify} onChange={() => toggle("voiceVerify")} />
                <Setting label="PIN Verification" type="toggle" value={settings.pinVerify} onChange={() => toggle("pinVerify")} />
                <Setting label="Fingerprint Approval" type="toggle" value={settings.fingerprintVerify} onChange={() => toggle("fingerprintVerify")} />
                <div className="settings-warning">
                  ⚠️ Disabling any security method will block all protected operations
                </div>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <div className="card-header"><span className="card-title">🔔 Notification Settings</span></div>
              <div className="settings-form">
                <Setting label="Notify on Deployment" type="toggle" value={settings.notifyDeploy} onChange={() => toggle("notifyDeploy")} />
                <Setting label="Notify on Error" type="toggle" value={settings.notifyError} onChange={() => toggle("notifyError")} />
                <Setting label="Notify on Git Push" type="toggle" value={settings.notifyGit} onChange={() => toggle("notifyGit")} />
              </div>
            </div>
          )}

          <div className="settings-footer">
            <button className="btn btn-ghost">↩️ Reset</button>
            <button className="btn btn-primary">💾 Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Setting({ label, type, value, options, onChange, danger }) {
  return (
    <div className="setting-row">
      <span className={`setting-label ${danger ? "danger" : ""}`}>{label}</span>
      {type === "input" && (
        <input className="input" value={value} onChange={e => onChange(e.target.value)} style={{ maxWidth: 260 }} />
      )}
      {type === "select" && (
        <select className="input" value={value} onChange={e => onChange(e.target.value)} style={{ maxWidth: 260 }}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      )}
      {type === "toggle" && (
        <div className={`toggle ${value ? "on" : "off"}`} onClick={onChange} style={{ cursor: "pointer" }}>
          <div className="toggle-knob" />
        </div>
      )}
    </div>
  );
}
