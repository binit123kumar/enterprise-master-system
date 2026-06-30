import { useState } from "react";
import "./DeploymentCenter.css";

const DEPLOYMENTS = [
  { version: "v2.0.0", project: "EnterpriseOS",  env: "Production", status: "Success", time: "2h ago",   duration: "4m 12s", by: "Binit" },
  { version: "v1.9.8", project: "BharatPay API", env: "Production", status: "Success", time: "1d ago",   duration: "2m 45s", by: "Binit" },
  { version: "v1.9.7", project: "AdminPanel v3", env: "Staging",    status: "Success", time: "3h ago",   duration: "3m 01s", by: "Binit" },
  { version: "v1.9.6", project: "EnterpriseOS",  env: "Production", status: "Rolled Back", time: "2d ago", duration: "—",    by: "Binit" },
  { version: "v1.9.5", project: "EnterpriseOS",  env: "Production", status: "Success", time: "3d ago",   duration: "4m 55s", by: "Binit" },
];

const CHECKLIST = [
  { label: "Build Successful",     done: true  },
  { label: "Tests Passed",          done: true  },
  { label: "No Critical Errors",    done: true  },
  { label: "No Secret Exposure",    done: true  },
  { label: "Environment Ready",     done: true  },
  { label: "Rollback Available",    done: true  },
  { label: "Voice Verified",        done: false },
  { label: "PIN Verified",          done: false },
  { label: "Fingerprint Approved",  done: false },
];

const STATUS_BADGE = {
  "Success":      "badge-success",
  "Rolled Back":  "badge-danger",
  "Running":      "badge-info",
};

export default function DeploymentCenter() {
  const [approvalStep, setApprovalStep] = useState(0);

  return (
    <div className="deployment-center">
      <div className="page-header">
        <h1>🚀 Deployment Center</h1>
        <p>Deploy, monitor and rollback production with full authorization control</p>
      </div>

      <div className="deploy-grid">
        {/* Pre-deployment checklist */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">✅ Pre-Deployment Checklist</span>
            <span className="badge badge-warning">Auth Pending</span>
          </div>
          <div className="checklist">
            {CHECKLIST.map((item, i) => (
              <div className="checklist-item" key={i}>
                <span className={`check-icon ${item.done ? "done" : "pending"}`}>
                  {item.done ? "✓" : "○"}
                </span>
                <span className={`check-label ${item.done ? "done" : ""}`}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="deploy-actions">
            <button className="btn btn-ghost">🎙️ Verify Voice</button>
            <button className="btn btn-ghost">🔢 Enter PIN</button>
            <button className="btn btn-ghost">👆 Fingerprint</button>
          </div>
          <button className="btn btn-primary deploy-main-btn" disabled>
            🚀 Approve & Deploy
          </button>
          <button className="btn btn-danger rollback-btn">
            ↩️ Rollback Last
          </button>
        </div>

        {/* Deployment History */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📜 Deployment History</span>
            <span className="badge badge-info">{DEPLOYMENTS.length} records</span>
          </div>
          <div className="deploy-history">
            {DEPLOYMENTS.map((d, i) => (
              <div className="deploy-row" key={i}>
                <div className="deploy-version">{d.version}</div>
                <div className="deploy-info">
                  <span className="deploy-project">{d.project}</span>
                  <span className="deploy-meta">{d.env} · {d.time} · {d.duration}</span>
                </div>
                <span className={`badge ${STATUS_BADGE[d.status] || "badge-warning"}`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
