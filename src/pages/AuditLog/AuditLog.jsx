import { useState } from "react";
import "./AuditLog.css";

const AUDIT_EVENTS = [
  { id:1,  user:"Binit", action:"deploy",        target:"EnterpriseOS → Production",  result:"Success",  ip:"192.168.1.1",  time:"17 Jan 2024  15:42:10", category:"Deployment", risk:"High"   },
  { id:2,  user:"Binit", action:"git_push",       target:"main branch — 4 files",      result:"Success",  ip:"192.168.1.1",  time:"17 Jan 2024  15:31:05", category:"Git",        risk:"Medium" },
  { id:3,  user:"Binit", action:"login",          target:"EnterpriseOS Dashboard",     result:"Success",  ip:"192.168.1.1",  time:"17 Jan 2024  09:00:00", category:"Auth",       risk:"Low"    },
  { id:4,  user:"Unknown",action:"login_failed",  target:"Admin Panel",                result:"Blocked",  ip:"203.0.113.5",  time:"16 Jan 2024  22:15:33", category:"Auth",       risk:"High"   },
  { id:5,  user:"Binit", action:"rollback",       target:"EnterpriseOS v1.9.6",        result:"Success",  ip:"192.168.1.1",  time:"16 Jan 2024  18:20:11", category:"Deployment", risk:"High"   },
  { id:6,  user:"Binit", action:"voice_command",  target:"Deploy production",          result:"Executed", ip:"192.168.1.1",  time:"16 Jan 2024  14:30:00", category:"Command",    risk:"High"   },
  { id:7,  user:"Binit", action:"settings_change",target:"Auto Deploy → OFF",         result:"Success",  ip:"192.168.1.1",  time:"16 Jan 2024  11:05:44", category:"Settings",   risk:"Medium" },
  { id:8,  user:"Binit", action:"prompt_deploy",  target:"Master AI Agent prompt",     result:"Success",  ip:"192.168.1.1",  time:"15 Jan 2024  16:40:22", category:"AI Agent",   risk:"Low"    },
  { id:9,  user:"Binit", action:"pin_verify",     target:"Deployment authorization",   result:"Success",  ip:"192.168.1.1",  time:"15 Jan 2024  14:28:55", category:"Auth",       risk:"Low"    },
  { id:10, user:"Binit", action:"db_backup",      target:"EnterpriseOS Database",      result:"Success",  ip:"Internal",     time:"15 Jan 2024  08:00:00", category:"Database",   risk:"Low"    },
  { id:11, user:"Unknown",action:"scan_attempt",  target:"Port 443",                   result:"Blocked",  ip:"198.51.100.9", time:"14 Jan 2024  03:22:11", category:"Security",   risk:"High"   },
  { id:12, user:"Binit", action:"create_project", target:"ML Prediction API",          result:"Success",  ip:"192.168.1.1",  time:"13 Jan 2024  10:15:00", category:"Project",    risk:"Low"    },
];

const ACTION_ICONS = {
  deploy:"🚀", git_push:"🔀", login:"🔑", login_failed:"🚫", rollback:"↩️",
  voice_command:"🎙️", settings_change:"⚙️", prompt_deploy:"🤖", pin_verify:"🔢",
  db_backup:"🗄️", scan_attempt:"🛡️", create_project:"📁",
};

const RISK_BADGE = {
  High:   "b-danger",
  Medium: "b-warning",
  Low:    "b-success",
};

const RESULT_BADGE = {
  Success:  "b-success",
  Blocked:  "b-danger",
  Executed: "b-info",
  Failed:   "b-danger",
};

const CATEGORIES = ["All", "Deployment", "Git", "Auth", "Command", "Settings", "AI Agent", "Database", "Security", "Project"];

export default function AuditLog() {
  const [filter,   setFilter]   = useState("All");
  const [risk,     setRisk]     = useState("All");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = AUDIT_EVENTS.filter(e =>
    (filter === "All" || e.category === filter) &&
    (risk   === "All" || e.risk === risk) &&
    (e.action.includes(search.toLowerCase()) ||
     e.target.toLowerCase().includes(search.toLowerCase()) ||
     e.user.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total:   AUDIT_EVENTS.length,
    high:    AUDIT_EVENTS.filter(e=>e.risk==="High").length,
    blocked: AUDIT_EVENTS.filter(e=>e.result==="Blocked").length,
    today:   3,
  };

  return (
    <div className="audit-log">
      <div className="page-header">
        <h1>📜 Audit Log</h1>
        <p>Poora record — kisne kya kiya, kab kiya, kahan se kiya</p>
      </div>

      {/* Stats */}
      <div className="g4 mb">
        {[
          { icon:"📜", val:stats.total,   lbl:"Total Events",  c:"#3b82f6" },
          { icon:"🔴", val:stats.high,    lbl:"High Risk",     c:"#ef4444" },
          { icon:"🚫", val:stats.blocked, lbl:"Blocked",       c:"#f59e0b" },
          { icon:"📅", val:stats.today,   lbl:"Today",         c:"#10b981" },
        ].map((s,i)=>(
          <div className="stat" key={i} style={{borderTop:`3px solid ${s.c}`}}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-val">{s.val}</span>
            <span className="stat-lbl">{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="audit-toolbar">
        <input className="inp" placeholder="🔍 Search action, target, user..."
          value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:260}}/>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setFilter(c)}
              className={`filter-btn ${filter===c?"active":""}`}>{c}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:4}}>
          {["All","High","Medium","Low"].map(r=>(
            <button key={r} onClick={()=>setRisk(r)}
              className={`filter-btn ${risk===r?"active":""}`}>{r}</button>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={()=>{
          const csv = ["ID,User,Action,Target,Result,IP,Time,Category,Risk",
            ...AUDIT_EVENTS.map(e=>`${e.id},${e.user},${e.action},"${e.target}",${e.result},${e.ip},"${e.time}",${e.category},${e.risk}`)
          ].join("\n");
          const a=document.createElement("a");
          a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
          a.download="audit-log.csv"; a.click();
        }}>📥 Export CSV</button>
      </div>

      {/* Table */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th><th>User</th><th>Action</th><th>Target</th>
              <th>Result</th><th>Risk</th><th>IP Address</th><th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e=>(
              <tr key={e.id} onClick={()=>setSelected(e)} style={{cursor:"pointer"}}>
                <td style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-muted)"}}>{e.id}</td>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,var(--accent-blue),var(--accent-purple))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>
                      {e.user[0]}
                    </div>
                    <span style={{fontSize:12,fontWeight:500,color:"var(--text-primary)"}}>{e.user}</span>
                  </div>
                </td>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span>{ACTION_ICONS[e.action]||"📌"}</span>
                    <span style={{fontSize:12,fontFamily:"var(--font-mono)",color:"var(--accent-cyan)"}}>{e.action}</span>
                  </div>
                </td>
                <td style={{fontSize:12,color:"var(--text-secondary)",maxWidth:200}}>{e.target}</td>
                <td><span className={`badge ${RESULT_BADGE[e.result]}`}>{e.result}</span></td>
                <td><span className={`badge ${RISK_BADGE[e.risk]}`}>{e.risk}</span></td>
                <td><span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text-muted)"}}>{e.ip}</span></td>
                <td><span style={{fontSize:11,color:"var(--text-muted)"}}>{e.time}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={()=>setSelected(null)}>
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:14,padding:28,width:480,maxWidth:"95vw"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
              <span style={{fontSize:16,fontWeight:700,color:"var(--text-primary)"}}>
                {ACTION_ICONS[selected.action]} Audit Event #{selected.id}
              </span>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"var(--text-muted)"}}>✕</button>
            </div>
            {[
              ["User",     selected.user],
              ["Action",   selected.action],
              ["Target",   selected.target],
              ["Result",   selected.result],
              ["Risk",     selected.risk],
              ["IP",       selected.ip],
              ["Category", selected.category],
              ["Time",     selected.time],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
                <span style={{color:"var(--text-muted)"}}>{k}</span>
                <span style={{color:"var(--text-primary)",fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
