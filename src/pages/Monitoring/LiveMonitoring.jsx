import { useState, useEffect } from "react";
import "./LiveMonitoring.css";

const SERVICES = [
  { name: "EnterpriseOS Frontend",  url: "https://enterprise-os.render.com", status: "UP",   ping: 42,  uptime: "99.9%" },
  { name: "BharatPay API",          url: "https://api.bharatpay.com",         status: "UP",   ping: 87,  uptime: "100%"  },
  { name: "SQL Server Database",    url: "db.internal:1433",                  status: "UP",   ping: 12,  uptime: "99.8%" },
  { name: "ASP.NET Core Backend",   url: "https://backend.render.com",        status: "UP",   ping: 55,  uptime: "99.9%" },
  { name: "Python ML API",          url: "https://ml.internal.com",           status: "DOWN", ping: null, uptime: "97.2%" },
  { name: "Redis Cache",            url: "redis.internal:6379",               status: "UP",   ping: 5,   uptime: "100%"  },
];

const LOGS = [
  { time: "10:42:31", level: "INFO",    msg: "Deployment v2.0.0 completed successfully",        service: "DeployAgent" },
  { time: "10:31:15", level: "INFO",    msg: "Git push to main — 4 files changed",              service: "GitAgent"    },
  { time: "10:15:02", level: "WARN",    msg: "Python ML API response time > 2s",                service: "Monitor"     },
  { time: "10:05:44", level: "ERROR",   msg: "Python ML API health check failed — retrying",    service: "Monitor"     },
  { time: "09:58:12", level: "INFO",    msg: "Build completed: 0 errors, 0 warnings",           service: "BuildAgent"  },
  { time: "09:44:01", level: "INFO",    msg: "Security scan complete — 0 vulnerabilities found",service: "SecAgent"    },
  { time: "09:20:33", level: "WARN",    msg: "High memory usage on backend: 82%",               service: "Monitor"     },
  { time: "08:55:00", level: "INFO",    msg: "All health checks passed",                        service: "Monitor"     },
];

const LOG_COLOR = { INFO: "badge-info", WARN: "badge-warning", ERROR: "badge-danger" };

export default function LiveMonitoring() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const upCount = SERVICES.filter(s => s.status === "UP").length;

  return (
    <div className="live-monitoring">
      <div className="page-header">
        <h1>📊 Live Monitoring</h1>
        <p>Real-time system health, service status and log streaming</p>
      </div>

      {/* Summary */}
      <div className="grid-4 mb-16">
        <div className="stat-card" style={{ borderTop: "3px solid var(--accent-green)" }}>
          <span className="stat-icon">🟢</span>
          <span className="stat-value">{upCount}/{SERVICES.length}</span>
          <span className="stat-label">Services UP</span>
          <span className="stat-change">Live</span>
        </div>
        <div className="stat-card" style={{ borderTop: "3px solid var(--accent-blue)" }}>
          <span className="stat-icon">⚡</span>
          <span className="stat-value">42ms</span>
          <span className="stat-label">Avg Response</span>
          <span className="stat-change">Normal</span>
        </div>
        <div className="stat-card" style={{ borderTop: "3px solid var(--accent-orange)" }}>
          <span className="stat-icon">💾</span>
          <span className="stat-value">68%</span>
          <span className="stat-label">Memory Usage</span>
          <span className="stat-change">Healthy</span>
        </div>
        <div className="stat-card" style={{ borderTop: "3px solid var(--accent-purple)" }}>
          <span className="stat-icon">🖥️</span>
          <span className="stat-value">24%</span>
          <span className="stat-label">CPU Usage</span>
          <span className="stat-change">Low load</span>
        </div>
      </div>

      <div className="monitor-grid">
        {/* Service Health */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🌐 Service Health</span>
            <div className="pulse-dot" />
          </div>
          <div className="service-list">
            {SERVICES.map((s, i) => (
              <div className="service-row" key={i}>
                <div className={`service-dot ${s.status === "UP" ? "up" : "down"}`} />
                <div className="service-info">
                  <span className="service-name">{s.name}</span>
                  <span className="service-url">{s.url}</span>
                </div>
                <span className="service-ping">
                  {s.ping ? `${s.ping}ms` : "—"}
                </span>
                <span className="service-uptime">{s.uptime}</span>
                <span className={`badge ${s.status === "UP" ? "badge-success" : "badge-danger"}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Log Stream */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📜 Live Log Stream</span>
            <div style={{ display: "flex", gap: 6 }}>
              <div className="pulse-dot" />
              <span className="badge badge-success">Streaming</span>
            </div>
          </div>
          <div className="log-stream">
            {LOGS.map((l, i) => (
              <div className="log-stream-row" key={i}>
                <span className="log-stream-time">{l.time}</span>
                <span className={`badge ${LOG_COLOR[l.level]}`} style={{ minWidth: 48, justifyContent: "center" }}>
                  {l.level}
                </span>
                <span className="log-stream-svc">[{l.service}]</span>
                <span className="log-stream-msg">{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
