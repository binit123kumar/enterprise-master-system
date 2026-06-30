import { useState } from "react";

// ── Mock Data (API se aayega real mein) ──────────────
const ORIGINALS = [
  {
    id: 1, projectName: "EnterpriseOS", fileName: "AgentDashboard.jsx",
    filePath: "src/pages/Dashboard/", version: "v1.0.0",
    createdAt: "15 Jan 2024  10:00:00", createdBy: "Binit",
    fileSizeBytes: 512, description: "Initial version of Agent Dashboard",
    folderPath: "snapshots/EnterpriseOS/originals/2024-01-15/",
  },
  {
    id: 2, projectName: "EnterpriseOS", fileName: "GitControlPanel.jsx",
    filePath: "src/pages/GitControl/", version: "v1.0.0",
    createdAt: "15 Jan 2024  10:05:00", createdBy: "Binit",
    fileSizeBytes: 256, description: "Initial Git Control Panel",
    folderPath: "snapshots/EnterpriseOS/originals/2024-01-15/",
  },
  {
    id: 3, projectName: "EnterpriseOS", fileName: "SecurityVault.jsx",
    filePath: "src/pages/SecurityVault/", version: "v1.0.0",
    createdAt: "15 Jan 2024  10:10:00", createdBy: "Binit",
    fileSizeBytes: 890, description: "Initial Security Vault page",
    folderPath: "snapshots/EnterpriseOS/originals/2024-01-15/",
  },
];

const CHANGES = [
  {
    id: 1, snapshotId: 1, projectName: "EnterpriseOS",
    fileName: "AgentDashboard.jsx", filePath: "src/pages/Dashboard/",
    changeType: "Modified", diffSummary: "+12 lines added, -2 deleted, ~3 modified",
    linesAdded: 12, linesDeleted: 2, linesModified: 3,
    commitMessage: "feat: Add stats grid to Agent Dashboard",
    branch: "main", changedBy: "Binit",
    changedAt: "15 Jan 2024  14:30:22",
    storageFolderPath: "snapshots/EnterpriseOS/changes/2024-01-15/14-30-22/AgentDashboard.jsx",
    isDeployed: true,
  },
  {
    id: 2, snapshotId: 1, projectName: "EnterpriseOS",
    fileName: "AgentDashboard.jsx", filePath: "src/pages/Dashboard/",
    changeType: "Modified", diffSummary: "+8 lines added, -1 deleted, ~5 modified",
    linesAdded: 8, linesDeleted: 1, linesModified: 5,
    commitMessage: "feat: Add real-time activity feed",
    branch: "main", changedBy: "Binit",
    changedAt: "16 Jan 2024  09:15:44",
    storageFolderPath: "snapshots/EnterpriseOS/changes/2024-01-16/09-15-44/AgentDashboard.jsx",
    isDeployed: true,
  },
  {
    id: 3, snapshotId: 2, projectName: "EnterpriseOS",
    fileName: "GitControlPanel.jsx", filePath: "src/pages/GitControl/",
    changeType: "Modified", diffSummary: "+34 lines added, -5 deleted, ~8 modified",
    linesAdded: 34, linesDeleted: 5, linesModified: 8,
    commitMessage: "feat: Add commit history table",
    branch: "main", changedBy: "Binit",
    changedAt: "16 Jan 2024  11:45:10",
    storageFolderPath: "snapshots/EnterpriseOS/changes/2024-01-16/11-45-10/GitControlPanel.jsx",
    isDeployed: false,
  },
  {
    id: 4, snapshotId: 3, projectName: "EnterpriseOS",
    fileName: "SecurityVault.jsx", filePath: "src/pages/SecurityVault/",
    changeType: "Modified", diffSummary: "+22 lines added, -0 deleted, ~4 modified",
    linesAdded: 22, linesDeleted: 0, linesModified: 4,
    commitMessage: "feat: Add phone guard toggle",
    branch: "feature/security", changedBy: "Binit",
    changedAt: "17 Jan 2024  08:20:33",
    storageFolderPath: "snapshots/EnterpriseOS/changes/2024-01-17/08-20-33/SecurityVault.jsx",
    isDeployed: false,
  },
  {
    id: 5, snapshotId: 1, projectName: "EnterpriseOS",
    fileName: "AgentDashboard.jsx", filePath: "src/pages/Dashboard/",
    changeType: "Modified", diffSummary: "+19 lines added, -3 deleted, ~7 modified",
    linesAdded: 19, linesDeleted: 3, linesModified: 7,
    commitMessage: "feat: Add quick actions panel",
    branch: "main", changedBy: "Binit",
    changedAt: "17 Jan 2024  15:55:01",
    storageFolderPath: "snapshots/EnterpriseOS/changes/2024-01-17/15-55-01/AgentDashboard.jsx",
    isDeployed: true,
  },
];

const TYPE_BADGE = {
  Modified: { cls: "b-warning", icon: "✏️" },
  Added:    { cls: "b-success", icon: "➕" },
  Deleted:  { cls: "b-danger",  icon: "🗑️" },
  Restored: { cls: "b-purple",  icon: "↩️" },
};

export default function VersionHistoryPage() {
  const [tab,    setTab]    = useState("timeline");   // timeline | originals | changes
  const [selFile,setSelFile]= useState("All");
  const [search, setSearch] = useState("");

  const files = ["All", ...new Set([
    ...ORIGINALS.map(o=>o.fileName),
    ...CHANGES.map(c=>c.fileName)
  ])];

  const filteredOriginals = ORIGINALS.filter(o =>
    (selFile==="All" || o.fileName===selFile) &&
    o.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredChanges = CHANGES.filter(c =>
    (selFile==="All" || c.fileName===selFile) &&
    (c.fileName.toLowerCase().includes(search.toLowerCase()) ||
     (c.commitMessage||"").toLowerCase().includes(search.toLowerCase()))
  );

  // Timeline: merge originals + changes sorted by date
  const timeline = [
    ...ORIGINALS.map(o=>({...o, _type:"original", _date:o.createdAt})),
    ...CHANGES.map(c=>({...c, _type:"change", _date:c.changedAt})),
  ].filter(e =>
    (selFile==="All" || e.fileName===selFile) &&
    e.fileName.toLowerCase().includes(search.toLowerCase())
  ).sort((a,b)=> a._date.localeCompare(b._date));

  return (
    <div style={{maxWidth:1400}}>
      {/* Header */}
      <div style={{marginBottom:22}}>
        <h1 style={{fontSize:20,fontWeight:700,marginBottom:3}}>🗂️ Version History</h1>
        <p style={{fontSize:12,color:"var(--text-muted)"}}>
          Original snapshots + all changes — date & time ke saath alag folders mein stored
        </p>
      </div>

      {/* Stats Row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {[
          {icon:"📁",val:ORIGINALS.length,lbl:"Original Snapshots",c:"#3b82f6"},
          {icon:"✏️",val:CHANGES.length,  lbl:"Total Changes",     c:"#f59e0b"},
          {icon:"✅",val:CHANGES.filter(c=>c.isDeployed).length,lbl:"Deployed",c:"#10b981"},
          {icon:"📅",val:"Today",         lbl:"Last Activity",     c:"#8b5cf6"},
        ].map((s,i)=>(
          <div key={i} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:16,borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:24,fontWeight:700,color:"var(--text-primary)"}}>{s.val}</div>
            <div style={{fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:.5}}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input
          style={{background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:6,padding:"7px 11px",fontSize:12,color:"var(--text-primary)",fontFamily:"inherit",outline:"none",maxWidth:240}}
          placeholder="🔍 Search file or commit..."
          value={search} onChange={e=>setSearch(e.target.value)}
        />
        <select
          style={{background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:6,padding:"7px 11px",fontSize:12,color:"var(--text-primary)",fontFamily:"inherit",outline:"none"}}
          value={selFile} onChange={e=>setSelFile(e.target.value)}
        >
          {files.map(f=><option key={f}>{f}</option>)}
        </select>
        <div style={{display:"flex",gap:4}}>
          {["timeline","originals","changes"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{padding:"6px 14px",borderRadius:6,border:"1px solid var(--border)",
                background:tab===t?"var(--accent-blue)":"none",
                color:tab===t?"white":"var(--text-secondary)",
                fontSize:11,fontFamily:"inherit",cursor:"pointer",
                textTransform:"capitalize",fontWeight:500}}>
              {t==="timeline"?"📋 Timeline":t==="originals"?"📁 Originals":"✏️ Changes"}
            </button>
          ))}
        </div>
      </div>

      {/* ── TIMELINE TAB ── */}
      {tab==="timeline" && (
        <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>
            <span style={{fontSize:13,fontWeight:600}}>📋 Complete File Timeline</span>
            <span style={{fontSize:10,color:"var(--text-muted)"}}>{timeline.length} events — oldest first</span>
          </div>
          <div style={{position:"relative"}}>
            {/* Vertical line */}
            <div style={{position:"absolute",left:16,top:0,bottom:0,width:2,background:"var(--border)"}}/>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {timeline.map((e,i)=>(
                <div key={i} style={{display:"flex",gap:16,paddingBottom:20,position:"relative"}}>
                  {/* Dot */}
                  <div style={{
                    width:34,height:34,borderRadius:"50%",flexShrink:0,
                    background:e._type==="original"?"rgba(59,130,246,.15)":"rgba(245,158,11,.15)",
                    border:`2px solid ${e._type==="original"?"var(--accent-blue)":"var(--accent-orange)"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:14,zIndex:1,position:"relative"
                  }}>
                    {e._type==="original"?"📁":"✏️"}
                  </div>
                  {/* Content */}
                  <div style={{flex:1,background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:8,padding:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{
                        fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,
                        background:e._type==="original"?"rgba(59,130,246,.15)":"rgba(245,158,11,.15)",
                        color:e._type==="original"?"var(--accent-blue)":"var(--accent-orange)"
                      }}>
                        {e._type==="original"?"ORIGINAL":"CHANGE"}
                      </span>
                      <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--accent-cyan)"}}>{e.fileName}</span>
                      {e._type==="change" && e.isDeployed &&
                        <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(16,185,129,.15)",color:"var(--accent-green)",fontWeight:600}}>✅ DEPLOYED</span>
                      }
                      {e._type==="change" && e.branch &&
                        <span style={{fontSize:10,color:"var(--accent-purple)",fontFamily:"var(--font-mono)"}}>🔀 {e.branch}</span>
                      }
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:4}}>
                      {e._type==="original" ? e.description : e.commitMessage}
                    </div>
                    {e._type==="change" && (
                      <div style={{display:"flex",gap:12,marginBottom:6}}>
                        <span style={{fontSize:11,color:"var(--accent-green)"}}>+{e.linesAdded} added</span>
                        <span style={{fontSize:11,color:"var(--accent-red)"}}>-{e.linesDeleted} deleted</span>
                        <span style={{fontSize:11,color:"var(--accent-orange)"}}>~{e.linesModified} modified</span>
                      </div>
                    )}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
                      <div style={{fontSize:10,color:"var(--text-muted)"}}>
                        📁 {e._type==="original" ? e.folderPath : e.storageFolderPath}
                      </div>
                      <div style={{fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>
                        🕐 {e._date} &nbsp;·&nbsp; 👤 {e._type==="original" ? e.createdBy : e.changedBy}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,marginTop:8}}>
                      <button style={{padding:"3px 10px",fontSize:11,borderRadius:5,border:"1px solid var(--border)",background:"none",color:"var(--text-secondary)",cursor:"pointer",fontFamily:"inherit"}}>
                        👁 View Content
                      </button>
                      <button style={{padding:"3px 10px",fontSize:11,borderRadius:5,border:"1px solid var(--border)",background:"none",color:"var(--accent-orange)",cursor:"pointer",fontFamily:"inherit"}}>
                        ↩️ Restore This
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ORIGINALS TAB ── */}
      {tab==="originals" && (
        <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:600}}>📁 Original Snapshots — Pehli baar save ki gayi files</span>
            <span style={{fontSize:10,color:"var(--text-muted)"}}>{filteredOriginals.length} files</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"var(--bg-secondary)"}}>
                {["File Name","Path","Version","Date & Time","Folder Path","Size","Actions"].map(h=>(
                  <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:.5,borderBottom:"1px solid var(--border)"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOriginals.map((o,i)=>(
                <tr key={i} style={{borderBottom:"1px solid var(--border)"}}>
                  <td style={{padding:"12px 14px"}}>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--accent-cyan)"}}>{o.fileName}</span>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <span style={{fontSize:11,color:"var(--text-muted)"}}>{o.filePath}</span>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(59,130,246,.15)",color:"var(--accent-blue)",fontWeight:600}}>{o.version}</span>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text-secondary)"}}>{o.createdAt}</span>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>{o.folderPath}</span>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <span style={{fontSize:11,color:"var(--text-muted)"}}>{(o.fileSizeBytes/1024).toFixed(1)} KB</span>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",gap:5}}>
                      <button style={{padding:"3px 8px",fontSize:11,borderRadius:5,border:"1px solid var(--border)",background:"none",color:"var(--text-secondary)",cursor:"pointer",fontFamily:"inherit"}}>👁</button>
                      <button style={{padding:"3px 8px",fontSize:11,borderRadius:5,border:"1px solid rgba(245,158,11,.3)",background:"rgba(245,158,11,.08)",color:"var(--accent-orange)",cursor:"pointer",fontFamily:"inherit"}}>↩️ Restore</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CHANGES TAB ── */}
      {tab==="changes" && (
        <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:600}}>✏️ Change History — Nayi changes date+time ke alag folders mein</span>
            <span style={{fontSize:10,color:"var(--text-muted)"}}>{filteredChanges.length} changes</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"var(--bg-secondary)"}}>
                {["File","Type","Diff","Commit Message","Branch","Date & Time","Folder Path","Deploy","Actions"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:.5,borderBottom:"1px solid var(--border)"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredChanges.map((c,i)=>(
                <tr key={i} style={{borderBottom:"1px solid var(--border)"}}>
                  <td style={{padding:"11px 12px"}}>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--accent-cyan)"}}>{c.fileName}</span>
                  </td>
                  <td style={{padding:"11px 12px"}}>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,
                      background:TYPE_BADGE[c.changeType]?"rgba(245,158,11,.15)":"rgba(59,130,246,.15)",
                      color:"var(--accent-orange)",fontWeight:600}}>
                      {TYPE_BADGE[c.changeType]?.icon} {c.changeType}
                    </span>
                  </td>
                  <td style={{padding:"11px 12px"}}>
                    <div style={{fontSize:11}}>
                      <span style={{color:"var(--accent-green)"}}>+{c.linesAdded}</span>
                      <span style={{color:"var(--text-muted)",margin:"0 4px"}}>/</span>
                      <span style={{color:"var(--accent-red)"}}>-{c.linesDeleted}</span>
                    </div>
                  </td>
                  <td style={{padding:"11px 12px"}}>
                    <span style={{fontSize:11,color:"var(--text-secondary)"}}>{c.commitMessage}</span>
                  </td>
                  <td style={{padding:"11px 12px"}}>
                    <span style={{fontSize:10,color:"var(--accent-purple)",fontFamily:"var(--font-mono)"}}>🔀 {c.branch}</span>
                  </td>
                  <td style={{padding:"11px 12px"}}>
                    <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--text-secondary)"}}>{c.changedAt}</span>
                  </td>
                  <td style={{padding:"11px 12px"}}>
                    <span style={{fontSize:9,color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>{c.storageFolderPath}</span>
                  </td>
                  <td style={{padding:"11px 12px"}}>
                    {c.isDeployed
                      ? <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(16,185,129,.15)",color:"var(--accent-green)",fontWeight:600}}>✅ Deployed</span>
                      : <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(100,116,139,.15)",color:"var(--text-muted)",fontWeight:600}}>Pending</span>
                    }
                  </td>
                  <td style={{padding:"11px 12px"}}>
                    <div style={{display:"flex",gap:4}}>
                      <button style={{padding:"3px 7px",fontSize:10,borderRadius:5,border:"1px solid var(--border)",background:"none",color:"var(--text-secondary)",cursor:"pointer",fontFamily:"inherit"}}>👁</button>
                      <button style={{padding:"3px 7px",fontSize:10,borderRadius:5,border:"1px solid rgba(245,158,11,.3)",background:"rgba(245,158,11,.08)",color:"var(--accent-orange)",cursor:"pointer",fontFamily:"inherit"}}>↩️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* API Reference */}
      <div style={{marginTop:20,background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:18}}>
        <div style={{fontSize:13,fontWeight:600,marginBottom:12,paddingBottom:10,borderBottom:"1px solid var(--border)"}}>
          🔌 Backend API Endpoints
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            ["GET",  "/api/version/originals",           "Saare original snapshots"],
            ["POST", "/api/version/originals",           "Naya original snapshot save karo"],
            ["GET",  "/api/version/changes",             "Saari changes (filter by project/file)"],
            ["POST", "/api/version/changes",             "Nayi change save karo (auto-diff)"],
            ["GET",  "/api/version/changes/by-date",     "Specific date ki changes"],
            ["POST", "/api/version/compare/{id}",        "Original vs new content diff"],
            ["GET",  "/api/version/timeline",            "File ki poori history"],
            ["POST", "/api/version/originals/{id}/restore","Original pe wapas jao"],
          ].map(([method, path, desc], i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"var(--bg-secondary)",borderRadius:6}}>
              <span style={{
                padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:700,minWidth:38,textAlign:"center",
                background:method==="GET"?"rgba(16,185,129,.15)":"rgba(59,130,246,.15)",
                color:method==="GET"?"var(--accent-green)":"var(--accent-blue)"
              }}>{method}</span>
              <span style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--accent-cyan)",flex:1}}>{path}</span>
              <span style={{fontSize:10,color:"var(--text-muted)"}}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
