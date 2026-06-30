import { useState } from "react";
import "./VoiceCommandCenter.css";

const COMMAND_HISTORY = [
  { time: "10:42", cmd: "Deploy production",           status: "Executed", result: "Deployment started" },
  { time: "10:31", cmd: "Push to GitHub",               status: "Executed", result: "Pushed to main" },
  { time: "09:58", cmd: "Run build",                    status: "Executed", result: "Build successful" },
  { time: "09:44", cmd: "Show project status",          status: "Executed", result: "12 projects active" },
  { time: "09:20", cmd: "Rollback deployment",          status: "Blocked",  result: "Auth required" },
];

const EXAMPLE_COMMANDS = [
  "Create a new page", "Fix this bug", "Build project",
  "Show preview", "Commit changes", "Push to GitHub",
  "Deploy production", "Rollback deployment", "Run tests",
  "Show logs", "Security scan", "Git status",
];

export default function VoiceCommandCenter() {
  const [listening, setListening] = useState(false);
  const [typed, setTyped] = useState("");

  return (
    <div className="voice-center">
      <div className="page-header">
        <h1>🎙️ Voice Command Center</h1>
        <p>Issue commands via voice or text — AI agent executes with authorization</p>
      </div>

      <div className="voice-grid">
        <div className="voice-left">
          {/* Mic visualizer */}
          <div className="card voice-card">
            <div className={`mic-circle ${listening ? "active" : ""}`}>
              <span className="mic-icon">🎙️</span>
              {listening && <div className="mic-waves"><span/><span/><span/></div>}
            </div>
            <div className="voice-status">
              {listening ? "🔴 Listening..." : "⚪ Click to speak"}
            </div>
            <button
              className={`btn ${listening ? "btn-danger" : "btn-primary"} mic-btn`}
              onClick={() => setListening(!listening)}
            >
              {listening ? "⏹ Stop" : "🎙️ Start Voice"}
            </button>
          </div>

          {/* Text fallback */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⌨️ Text Command</span>
            </div>
            <input
              className="input"
              placeholder="Type a command..."
              value={typed}
              onChange={e => setTyped(e.target.value)}
            />
            <button className="btn btn-primary" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>
              ▶ Execute Command
            </button>
          </div>

          {/* Example commands */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">💡 Example Commands</span>
            </div>
            <div className="cmd-chips">
              {EXAMPLE_COMMANDS.map((c, i) => (
                <span key={i} className="cmd-chip" onClick={() => setTyped(c)}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Command History */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Command History</span>
            <span className="badge badge-info">{COMMAND_HISTORY.length} commands</span>
          </div>
          <div className="cmd-history">
            {COMMAND_HISTORY.map((c, i) => (
              <div className="cmd-row" key={i}>
                <span className="log-time">{c.time}</span>
                <div className="cmd-info">
                  <span className="cmd-text">"{c.cmd}"</span>
                  <span className="cmd-result">{c.result}</span>
                </div>
                <span className={`badge ${c.status === "Executed" ? "badge-success" : "badge-danger"}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
