import { useState } from "react";
import "./SecurityVault.css";

const ACCESS_LOGS = [
  { time: "10:42", action: "Deploy authorized",      ip: "192.168.1.1", status: "Allowed" },
  { time: "10:31", action: "Git push authorized",    ip: "192.168.1.1", status: "Allowed" },
  { time: "09:58", action: "Voice verified",         ip: "192.168.1.1", status: "Allowed" },
  { time: "09:20", action: "PIN attempt failed",     ip: "Unknown",      status: "Blocked" },
  { time: "08:55", action: "Fingerprint verified",   ip: "192.168.1.1", status: "Allowed" },
  { time: "08:30", action: "Unauthorized access try",ip: "203.0.113.5",  status: "Blocked" },
];

const SECURITY_CHECKS = [
  { label: "SSL Certificate",        status: "Valid",   expiry: "90 days left",  icon: "🔒" },
  { label: "API Keys Rotated",       status: "OK",      expiry: "15 days ago",   icon: "🔑" },
  { label: "Secrets Vault",          status: "Locked",  expiry: "0 exposed",     icon: "🏦" },
  { label: "Vulnerability Scan",     status: "Clean",   expiry: "0 issues",      icon: "🛡️" },
  { label: "2FA Status",             status: "Active",  expiry: "All methods ON",icon: "📱" },
  { label: "Database Encryption",    status: "AES-256", expiry: "Enabled",       icon: "🗄️" },
];

const AUTH_METHODS = [
  { name: "Voice Recognition",  icon: "🎙️", enabled: true  },
  { name: "Deployment PIN",     icon: "🔢", enabled: true  },
  { name: "Mobile Fingerprint", icon: "👆", enabled: true  },
  { name: "IP Whitelist",       icon: "🌐", enabled: true  },
  { name: "Phone Guard Mode",   icon: "📱", enabled: false },
];

export default function SecurityVault() {
  const [phoneGuard, setPhoneGuard] = useState(false);

  return (
    <div className="security-vault">
      <div className="page-header">
        <h1>🔐 Security Vault</h1>
        <p>Authorization control, access logs and system security monitoring</p>
      </div>

      {/* Security Score */}
      <div className="security-score-bar card mb-16">
        <div className="score-left">
          <span className="score-title">🛡️ Security Score</span>
          <span className="score-sub">Enterprise Grade Protection Active</span>
        </div>
        <div className="score-right">
          <div className="score-ring">
            <span className="score-value">98</span>
            <span className="score-max">/100</span>
          </div>
          <span className="badge badge-success">Excellent</span>
        </div>
      </div>

      <div className="vault-grid">
        {/* Auth Methods */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔑 Authorization Methods</span>
            <span className="badge badge-success">All Active</span>
          </div>
          <div className="auth-list">
            {AUTH_METHODS.map((a, i) => (
              <div className="auth-row" key={i}>
                <span className="auth-icon">{a.icon}</span>
                <span className="auth-name">{a.name}</span>
                <div className={`toggle ${a.enabled ? "on" : "off"}`}>
                  <div className="toggle-knob" />
                </div>
              </div>
            ))}
          </div>

          {/* Phone Guard */}
          <div className="phone-guard-box">
            <div className="guard-info">
              <span className="guard-title">📱 Phone Guard Mode</span>
              <span className="guard-desc">Monitors unauthorized phone access</span>
            </div>
            <button
              className={`btn ${phoneGuard ? "btn-danger" : "btn-success"}`}
              onClick={() => setPhoneGuard(!phoneGuard)}
            >
              {phoneGuard ? "🔴 Guard OFF" : "🟢 Guard ON"}
            </button>
          </div>
        </div>

        {/* Security Checks */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">✅ Security Checks</span>
            <span className="badge badge-success">All Clear</span>
          </div>
          <div className="checks-list">
            {SECURITY_CHECKS.map((c, i) => (
              <div className="check-row" key={i}>
                <span className="check-item-icon">{c.icon}</span>
                <div className="check-details">
                  <span className="check-item-label">{c.label}</span>
                  <span className="check-expiry">{c.expiry}</span>
                </div>
                <span className="badge badge-success">{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Access Logs */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <span className="card-title">📋 Access Logs</span>
            <span className="badge badge-info">{ACCESS_LOGS.length} events</span>
          </div>
          <div className="access-table">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>IP Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ACCESS_LOGS.map((l, i) => (
                  <tr key={i}>
                    <td className="log-time-cell">{l.time}</td>
                    <td>{l.action}</td>
                    <td><span className="ip-tag">{l.ip}</span></td>
                    <td>
                      <span className={`badge ${l.status === "Allowed" ? "badge-success" : "badge-danger"}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
