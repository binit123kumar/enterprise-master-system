import { api } from './api.js';
import { useState, useEffect, useRef, useCallback, createContext, useContext, Component } from "react";

// ════════════════════════════════════════════════════
// 1. CONTEXTS
// ════════════════════════════════════════════════════
const ThemeCtx = createContext();
const AuthCtx  = createContext();
const NotifCtx = createContext();
const AppCtx   = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  return <ThemeCtx.Provider value={{ theme, toggle: () => setTheme(t => t==="dark"?"light":"dark") }}>{children}</ThemeCtx.Provider>;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login  = (u, p) => { if (u==="Binit"&&p==="admin123"){setUser({name:"Binit",role:"owner"});return true;}return false; };
  const logout = () => setUser(null);
  return <AuthCtx.Provider value={{ user, login, logout, isAuth:!!user }}>{children}</AuthCtx.Provider>;
}

function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type="info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t=>t.id!==id)), 4000);
  }, []);
  const notify = { success:m=>add(m,"success"), error:m=>add(m,"error"), warning:m=>add(m,"warning"), info:m=>add(m,"info"), deploy:m=>add(m,"deploy") };
  return <NotifCtx.Provider value={{ notify, toasts, remove:(id)=>setToasts(p=>p.filter(t=>t.id!==id)) }}>{children}</NotifCtx.Provider>;
}

function AppProvider({ children }) {
  const [activeProject, setActiveProject] = useState("EnterpriseOS");
  const [role] = useState("owner");
  const projects = ["EnterpriseOS","BharatPay API","AdminPanel v3","DataSync Worker","ML Prediction API"];
  return <AppCtx.Provider value={{ activeProject, setActiveProject, projects, role }}>{children}</AppCtx.Provider>;
}

const useTheme  = () => useContext(ThemeCtx);
const useAuth   = () => useContext(AuthCtx);
const useNotif  = () => useContext(NotifCtx);
const useApp    = () => useContext(AppCtx);

// ════════════════════════════════════════════════════
// 2. ERROR BOUNDARY
// ════════════════════════════════════════════════════
class ErrorBoundary extends Component {
  state = { hasError:false, error:null };
  static getDerivedStateFromError(e) { return { hasError:true, error:e }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:16,textAlign:"center",padding:24}}>
        <div style={{fontSize:56}}>💥</div>
        <h2 style={{fontSize:20,fontWeight:700,color:"var(--accent-red)"}}>Kuch Galat Ho Gaya!</h2>
        <p style={{fontSize:13,color:"var(--text-muted)",maxWidth:400}}>{this.state.error?.message}</p>
        <button onClick={()=>this.setState({hasError:false,error:null})}
          style={{padding:"10px 24px",background:"var(--accent-blue)",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>
          🔄 Dobara Try Karo
        </button>
      </div>
    );
  }
}

// ════════════════════════════════════════════════════
// 3. HOOKS
// ════════════════════════════════════════════════════
function useWebSocket() {
  const [logs, setLogs]       = useState([]);
  const [connected, setConn]  = useState(false);
  useEffect(() => {
    setConn(true);
    const t = [
      {level:"INFO", msg:"Health check passed — all services UP",    svc:"Monitor"},
      {level:"INFO", msg:"Git pull completed — branch: main",         svc:"GitAgent"},
      {level:"WARN", msg:"Memory usage at 78%",                       svc:"Monitor"},
      {level:"INFO", msg:"API request processed in 42ms",            svc:"Backend"},
      {level:"ERROR",msg:"Python ML API timeout — retrying",         svc:"Monitor"},
      {level:"INFO", msg:"Security scan — 0 vulnerabilities found",  svc:"SecAgent"},
      {level:"INFO", msg:"Deployment pipeline triggered",             svc:"DeployAgent"},
      {level:"INFO", msg:"Database backup completed",                 svc:"Database"},
    ];
    const i = setInterval(() => {
      const tpl = t[Math.floor(Math.random()*t.length)];
      setLogs(p => [{...tpl, time:new Date().toLocaleTimeString("en-IN"), id:Date.now()}, ...p].slice(0,100));
    }, 2500);
    return () => clearInterval(i);
  },[]);
  return { logs, connected };
}

function useVoiceRecorder() {
  const [recording,  setRecording]  = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volume,     setVolume]     = useState(0);
  const [error,      setError]      = useState(null);
  const recRef = useRef(null); const volRef = useRef(null);
  const start = useCallback(async () => {
    setError(null); setTranscript("");
    try {
      const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
      if (!SR){setError("Speech recognition not supported. Use text input.");return;}
      recRef.current = new SR();
      recRef.current.continuous=true; recRef.current.interimResults=true; recRef.current.lang="en-IN";
      recRef.current.onresult=(e)=>{ let f=""; for(let i=e.resultIndex;i<e.results.length;i++) if(e.results[i].isFinal) f+=e.results[i][0].transcript+" "; if(f) setTranscript(p=>p+f); };
      recRef.current.onerror=(e)=>setError("Mic error: "+e.error);
      recRef.current.start();
      setRecording(true);
      volRef.current=setInterval(()=>setVolume(20+Math.random()*60),150);
    } catch(e){setError(e.message);}
  },[]);
  const stop = useCallback(()=>{ recRef.current?.stop(); clearInterval(volRef.current); setRecording(false); setVolume(0); },[]);
  return { recording, transcript, volume, error, start, stop, setTranscript };
}

function useKeyboardShortcuts(navigate, toggleSidebar, toggleTheme, openSearch) {
  useEffect(()=>{
    const h=(e)=>{
      if(["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;
      const ctrl=e.ctrlKey||e.metaKey;
      if(ctrl&&e.key==="k"){e.preventDefault();openSearch();}
      if(ctrl&&e.key==="b"){e.preventDefault();toggleSidebar();}
      if(ctrl&&e.key==="t"){e.preventDefault();toggleTheme();}
      if(e.altKey){
        const m={"1":"AgentDashboard","2":"ProjectManager","3":"CodeWorkspace","4":"GitControlPanel","5":"DeploymentCenter","6":"LiveMonitoring","7":"VoiceCommandCenter","8":"SecurityVault","9":"SystemSettings"};
        if(m[e.key]){e.preventDefault();navigate(m[e.key]);}
      }
    };
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[navigate,toggleSidebar,toggleTheme,openSearch]);
}

// ════════════════════════════════════════════════════
// 4. CSS (Theme-aware)
// ════════════════════════════════════════════════════
const getCSS=(theme)=>`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{
  --bg-primary:${theme==="dark"?"#0a0e1a":"#f1f5f9"};
  --bg-secondary:${theme==="dark"?"#0f1629":"#e2e8f0"};
  --bg-card:${theme==="dark"?"#131d35":"#ffffff"};
  --bg-hover:${theme==="dark"?"#1a2540":"#f8fafc"};
  --border:${theme==="dark"?"#1e2d4a":"#cbd5e1"};
  --border-light:${theme==="dark"?"#243352":"#94a3b8"};
  --text-primary:${theme==="dark"?"#e2e8f0":"#0f172a"};
  --text-secondary:${theme==="dark"?"#94a3b8":"#475569"};
  --text-muted:${theme==="dark"?"#64748b":"#94a3b8"};
  --accent-blue:#3b82f6;--accent-cyan:#06b6d4;--accent-green:#10b981;
  --accent-orange:#f59e0b;--accent-red:#ef4444;--accent-purple:#8b5cf6;
  --font-main:'Inter',sans-serif;--font-mono:'JetBrains Mono',monospace;
  --radius-sm:6px;--radius-md:10px;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:var(--font-main);background:var(--bg-primary);color:var(--text-primary);overflow:hidden;height:100vh;transition:background .3s,color .3s;}
.app{display:flex;height:100vh;overflow:hidden;}
.sidebar{position:fixed;left:0;top:0;bottom:0;width:252px;background:var(--bg-secondary);border-right:1px solid var(--border);display:flex;flex-direction:column;z-index:100;transition:transform .3s;}
.sidebar.closed{transform:translateX(-100%);}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;margin-left:252px;transition:margin-left .3s;}
.main.full{margin-left:0;}
.header{height:58px;background:var(--bg-secondary);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 20px;flex-shrink:0;}
.page{flex:1;overflow-y:auto;padding:20px;}
.page-header{margin-bottom:20px;}
.page-header h1{font-size:20px;font-weight:700;margin-bottom:3px;}
.page-header p{font-size:12px;color:var(--text-muted);}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:18px;}
.card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:11px;border-bottom:1px solid var(--border);}
.card-title{font-size:13px;font-weight:600;color:var(--text-primary);}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
.mb{margin-bottom:14px;}
.stat{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;}
.stat-icon{font-size:20px;margin-bottom:6px;display:block;}
.stat-val{font-size:24px;font-weight:700;display:block;}
.stat-lbl{font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;display:block;}
.stat-chg{font-size:11px;color:var(--accent-green);display:block;margin-top:2px;}
.badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;}
.b-success{background:rgba(16,185,129,.15);color:var(--accent-green);}
.b-warning{background:rgba(245,158,11,.15);color:var(--accent-orange);}
.b-danger{background:rgba(239,68,68,.15);color:var(--accent-red);}
.b-info{background:rgba(59,130,246,.15);color:var(--accent-blue);}
.b-purple{background:rgba(139,92,246,.15);color:var(--accent-purple);}
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;cursor:pointer;border:none;transition:all .2s;font-family:var(--font-main);}
.btn-primary{background:var(--accent-blue);color:#fff;}.btn-primary:hover{background:#2563eb;}
.btn-success{background:var(--accent-green);color:#fff;}
.btn-danger{background:var(--accent-red);color:#fff;}
.btn-ghost{background:transparent;color:var(--text-secondary);border:1px solid var(--border);}.btn-ghost:hover{background:var(--bg-hover);}
.btn:disabled{opacity:.4;cursor:not-allowed;}
.inp{background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 11px;font-size:12px;color:var(--text-primary);font-family:var(--font-main);width:100%;outline:none;transition:border-color .2s;}
.inp:focus{border-color:var(--accent-blue);}
.inp::placeholder{color:var(--text-muted);}
.tbl{width:100%;border-collapse:collapse;}
.tbl th{padding:10px 14px;text-align:left;font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;background:var(--bg-secondary);border-bottom:1px solid var(--border);}
.tbl td{padding:11px 14px;border-bottom:1px solid var(--border);font-size:12px;color:var(--text-secondary);}
.tbl tr:last-child td{border-bottom:none;}
.tbl tr:hover td{background:var(--bg-hover);}
.log-row{display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;align-items:center;}
.log-row:last-child{border-bottom:none;}
.log-t{color:var(--text-muted);font-family:var(--font-mono);font-size:10px;min-width:58px;}
.tog{width:38px;height:21px;border-radius:11px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;}
.tog.on{background:var(--accent-green);}.tog.off{background:var(--border-light);}
.tok{position:absolute;top:3px;width:15px;height:15px;border-radius:50%;background:#fff;transition:left .2s;}
.tog.on .tok{left:20px;}.tog.off .tok{left:3px;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:var(--bg-primary);}
::-webkit-scrollbar-thumb{background:var(--border-light);border-radius:3px;}
/* LOGIN */
.login-wrap{display:flex;align-items:center;justify-content:center;height:100vh;background:var(--bg-primary);}
.login-card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:36px;width:360px;text-align:center;}
/* TOAST */
.toast-wrap{position:fixed;top:70px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;max-width:380px;}
.toast{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;border:1px solid;animation:slideIn .25s ease;box-shadow:0 8px 32px rgba(0,0,0,.3);font-size:13px;font-family:var(--font-main);}
@keyframes slideIn{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
.t-success{background:rgba(16,185,129,.15);border-color:var(--accent-green);}
.t-error{background:rgba(239,68,68,.15);border-color:var(--accent-red);}
.t-warning{background:rgba(245,158,11,.15);border-color:var(--accent-orange);}
.t-info{background:rgba(59,130,246,.15);border-color:var(--accent-blue);}
.t-deploy{background:rgba(139,92,246,.15);border-color:var(--accent-purple);}
/* GLOBAL SEARCH */
.s-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9000;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;backdrop-filter:blur(4px);}
.s-modal{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;width:560px;max-width:95vw;box-shadow:0 24px 80px rgba(0,0,0,.5);overflow:hidden;}
.s-input-wrap{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--border);}
.s-input{flex:1;background:none;border:none;outline:none;font-size:15px;color:var(--text-primary);font-family:var(--font-main);}
.s-input::placeholder{color:var(--text-muted);}
.s-result{display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;background:none;border:none;border-radius:8px;cursor:pointer;text-align:left;font-family:var(--font-main);}
.s-result:hover,.s-result.active{background:var(--bg-hover);}
/* SHORTCUT */
.shortcut-panel{position:fixed;bottom:20px;right:20px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:16px;z-index:500;width:240px;box-shadow:0 8px 32px rgba(0,0,0,.3);}
/* MOBILE */
@media(max-width:768px){
  .sidebar{width:100%;transform:translateX(-100%);}
  .sidebar.open-mobile{transform:translateX(0);}
  .main{margin-left:0!important;}
  .g4{grid-template-columns:1fr 1fr;}
  .g2,.g3{grid-template-columns:1fr;}
  .page{padding:12px;}
  .tbl th:nth-child(n+5),.tbl td:nth-child(n+5){display:none;}
}
@media(max-width:480px){.g4{grid-template-columns:1fr;}}
/* PULSE */
.pulse{width:7px;height:7px;border-radius:50%;background:var(--accent-green);animation:pulse 1.5s infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(1.3);}}
.svc-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.svc-dot.up{background:var(--accent-green);box-shadow:0 0 6px var(--accent-green);}
.svc-dot.dn{background:var(--accent-red);}
.mic-circ{border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .3s;}
.mic-circ.active{animation:mic-p 1s infinite;}
@keyframes mic-p{0%{box-shadow:0 0 0 0 rgba(239,68,68,.4);}70%{box-shadow:0 0 0 18px rgba(239,68,68,0);}100%{box-shadow:0 0 0 0 rgba(239,68,68,0);}}
.quick-actions{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;}
.qa-btn{display:flex;flex-direction:column;align-items:center;gap:5px;padding:13px 8px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-md);cursor:pointer;font-size:11px;font-family:var(--font-main);color:var(--text-secondary);font-weight:500;transition:all .2s;}
.qa-btn:hover{background:var(--bg-hover);transform:translateY(-2px);}
.qa-btn span:first-child{font-size:20px;}
/* TIMELINE */
.tl-dot{width:34px;height:34px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;z-index:1;position:relative;}
/* FILTER BTN */
.fbtn{padding:5px 11px;border-radius:6px;border:1px solid var(--border);background:none;color:var(--text-secondary);font-size:11px;font-family:var(--font-main);cursor:pointer;transition:all .15s;}
.fbtn:hover{background:var(--bg-hover);color:var(--text-primary);}
.fbtn.active{background:var(--accent-blue);border-color:var(--accent-blue);color:#fff;}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
`;

// ════════════════════════════════════════════════════
// 5. NAV
// ════════════════════════════════════════════════════
const NAV=[
  {id:"AgentDashboard",     icon:"⚡",label:"Agent Dashboard",     group:"MAIN"},
  {id:"ProjectManager",     icon:"📁",label:"Project Manager",      group:"MAIN"},
  {id:"CodeWorkspace",      icon:"💻",label:"Code Workspace",       group:"DEV"},
  {id:"GitControlPanel",    icon:"🔀",label:"Git Control Panel",    group:"DEV"},
  {id:"DeploymentCenter",   icon:"🚀",label:"Deployment Center",    group:"OPS"},
  {id:"LiveMonitoring",     icon:"📊",label:"Live Monitoring",      group:"OPS"},
  {id:"VoiceCommandCenter", icon:"🎙️",label:"Voice Command Center", group:"AI"},
  {id:"SystemPromptLibrary",icon:"🤖",label:"System Prompt Library",group:"AI"},
  {id:"SecurityVault",      icon:"🔐",label:"Security Vault",       group:"SEC"},
  {id:"VersionHistory",     icon:"🗂️",label:"Version History",      group:"SEC"},
  {id:"Changelog",          icon:"📋",label:"Changelog",            group:"SEC"},
  {id:"AuditLog",           icon:"📜",label:"Audit Log",            group:"SEC"},
  {id:"SystemSettings",     icon:"⚙️",label:"System Settings",      group:"SYS"},
];
const META={AgentDashboard:{title:"Agent Dashboard",icon:"⚡"},ProjectManager:{title:"Project Manager",icon:"📁"},CodeWorkspace:{title:"Code Workspace",icon:"💻"},GitControlPanel:{title:"Git Control Panel",icon:"🔀"},DeploymentCenter:{title:"Deployment Center",icon:"🚀"},LiveMonitoring:{title:"Live Monitoring",icon:"📊"},VoiceCommandCenter:{title:"Voice Command Center",icon:"🎙️"},SystemPromptLibrary:{title:"System Prompt Library",icon:"🤖"},SecurityVault:{title:"Security Vault",icon:"🔐"},VersionHistory:{title:"Version History",icon:"🗂️"},Changelog:{title:"Changelog",icon:"📋"},AuditLog:{title:"Audit Log",icon:"📜"},SystemSettings:{title:"System Settings",icon:"⚙️"}};

// ════════════════════════════════════════════════════
// 6. TOAST CONTAINER
// ════════════════════════════════════════════════════
function ToastContainer() {
  const { toasts, remove } = useNotif();
  const ICONS={success:"✅",error:"❌",warning:"⚠️",info:"ℹ️",deploy:"🚀"};
  return (
    <div className="toast-wrap">
      {toasts.map(t=>(
        <div key={t.id} className={`toast t-${t.type}`}>
          <span style={{fontSize:16}}>{ICONS[t.type]}</span>
          <span style={{flex:1,color:"var(--text-primary)",fontWeight:500}}>{t.message}</span>
          <button onClick={()=>remove(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:12}}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════
// 7. GLOBAL SEARCH
// ════════════════════════════════════════════════════
const SEARCH_IDX=[
  ...NAV.map(n=>({label:n.label,page:n.id,icon:n.icon,type:"page"})),
  {label:"Deploy to Production",page:"DeploymentCenter",icon:"🚀",type:"action"},
  {label:"Git Commit & Push",page:"GitControlPanel",icon:"🔀",type:"action"},
  {label:"Start Voice Command",page:"VoiceCommandCenter",icon:"🎙️",type:"action"},
  {label:"Rollback Deployment",page:"DeploymentCenter",icon:"↩️",type:"action"},
  {label:"Security Scan",page:"SecurityVault",icon:"🛡️",type:"action"},
  {label:"EnterpriseOS",page:"ProjectManager",icon:"📦",type:"project"},
  {label:"BharatPay API",page:"ProjectManager",icon:"📦",type:"project"},
];
function GlobalSearch({ open, onClose, onNavigate }) {
  const [q,setQ]=useState(""); const [sel,setSel]=useState(0); const iRef=useRef();
  useEffect(()=>{ if(open){setQ("");setSel(0);setTimeout(()=>iRef.current?.focus(),50);} },[open]);
  const results=!q.trim()?SEARCH_IDX.slice(0,8):SEARCH_IDX.filter(i=>i.label.toLowerCase().includes(q.toLowerCase())||i.type.includes(q.toLowerCase())).slice(0,10);
  const pick=(r)=>{onNavigate(r.page);onClose();};
  const TYPE_C={page:"#3b82f6",action:"#10b981",project:"#8b5cf6"};
  if(!open) return null;
  return (
    <div className="s-overlay" onClick={onClose}>
      <div className="s-modal" onClick={e=>e.stopPropagation()}>
        <div className="s-input-wrap">
          <span style={{fontSize:18}}>🔍</span>
          <input ref={iRef} className="s-input" placeholder="Search pages, actions, projects... (Ctrl+K)" value={q} onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{if(e.key==="ArrowDown"){e.preventDefault();setSel(i=>Math.min(i+1,results.length-1));}if(e.key==="ArrowUp"){e.preventDefault();setSel(i=>Math.max(i-1,0));}if(e.key==="Enter"&&results[sel])pick(results[sel]);if(e.key==="Escape")onClose();}}/>
          <kbd style={{padding:"3px 8px",background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:5,fontSize:11,color:"var(--text-muted)",cursor:"pointer",fontFamily:"inherit"}} onClick={onClose}>ESC</kbd>
        </div>
        <div style={{maxHeight:360,overflowY:"auto",padding:6}}>
          {results.length===0?<div style={{padding:24,textAlign:"center",color:"var(--text-muted)",fontSize:13}}>No results for "{q}"</div>
          :results.map((r,i)=>(
            <button key={i} className={`s-result ${i===sel?"active":""}`} onClick={()=>pick(r)} onMouseEnter={()=>setSel(i)}>
              <span style={{fontSize:18,width:24,textAlign:"center"}}>{r.icon}</span>
              <span style={{flex:1,fontSize:13,fontWeight:500,color:"var(--text-primary)"}}>{r.label}</span>
              <span style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:TYPE_C[r.type],padding:"2px 8px",background:"rgba(255,255,255,.05)",borderRadius:10}}>{r.type}</span>
              {i===sel&&<span style={{fontSize:14,color:"var(--text-muted)"}}>↵</span>}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:16,padding:"10px 16px",borderTop:"1px solid var(--border)",fontSize:11,color:"var(--text-muted)",justifyContent:"center"}}>
          <span>↑↓ Navigate</span><span>↵ Select</span><span>ESC Close</span><span>Ctrl+K Open</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// 8. SIDEBAR + HEADER
// ════════════════════════════════════════════════════
function Sidebar({ active, onNav, open, isMobile }) {
  const { user, logout } = useAuth();
  const groups=[...new Set(NAV.map(n=>n.group))];
  return (
    <aside className={`sidebar ${open?"":(isMobile?"":"closed")} ${open&&isMobile?"open-mobile":""}`}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:16,borderBottom:"1px solid var(--border)"}}>
        <span style={{fontSize:22}}>🛡️</span>
        <div><span style={{display:"block",fontSize:13,fontWeight:700,color:"var(--text-primary)"}}>EnterpriseOS</span><span style={{display:"block",fontSize:10,color:"var(--text-muted)"}}>Binit's Master System</span></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",background:"rgba(16,185,129,.06)",borderBottom:"1px solid var(--border)",fontSize:11,color:"var(--accent-green)"}}>
        <div className="pulse"/><span>All Systems Operational</span>
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"6px 0"}}>
        {groups.map(g=>(
          <div key={g}>
            <span style={{display:"block",fontSize:10,fontWeight:700,color:"var(--text-muted)",letterSpacing:1,padding:"10px 16px 3px",textTransform:"uppercase"}}>{g}</span>
            {NAV.filter(n=>n.group===g).map(n=>(
              <button key={n.id} onClick={()=>onNav(n.id)}
                style={{position:"relative",display:"flex",alignItems:"center",gap:10,width:"100%",padding:"8px 16px",background:active===n.id?"rgba(59,130,246,.1)":"none",border:"none",cursor:"pointer",color:active===n.id?"var(--accent-blue)":"var(--text-secondary)",fontSize:12.5,fontFamily:"var(--font-main)",fontWeight:500,textAlign:"left",transition:"all .15s"}}>
                <span style={{fontSize:15,width:20,textAlign:"center"}}>{n.icon}</span>
                <span>{n.label}</span>
                {active===n.id&&<span style={{position:"absolute",right:0,top:0,bottom:0,width:3,background:"var(--accent-blue)",borderRadius:"2px 0 0 2px"}}/>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px 14px",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:30,height:30,background:"linear-gradient(135deg,var(--accent-blue),var(--accent-purple))",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>B</div>
        <div><div style={{fontSize:12,fontWeight:600,color:"var(--text-primary)"}}>{user?.name}</div><div style={{fontSize:10,color:"var(--text-muted)"}}>System Owner</div></div>
        <button onClick={logout} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:14,color:"var(--text-muted)"}}>🚪</button>
      </div>
    </aside>
  );
}

function Header({ active, onToggle, sidebarOpen, onSearch }) {
  const { toggle, theme } = useTheme();
  const { activeProject, projects, setActiveProject } = useApp();
  const [t, setT] = useState(new Date());
  useEffect(()=>{const i=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(i);},[]);
  const m=META[active]||{};
  return (
    <header className="header">
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onToggle} style={{background:"none",border:"1px solid var(--border)",color:"var(--text-secondary)",borderRadius:6,width:32,height:32,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
          {sidebarOpen?"✕":"☰"}
        </button>
        <span style={{fontSize:18}}>{m.icon}</span>
        <span style={{fontSize:14,fontWeight:600,color:"var(--text-primary)"}}>{m.title}</span>
        <select value={activeProject} onChange={e=>setActiveProject(e.target.value)}
          style={{background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:6,padding:"4px 8px",fontSize:11,color:"var(--accent-cyan)",fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
          {projects.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onSearch} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px",background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer",color:"var(--text-muted)",fontSize:12,fontFamily:"inherit"}}>
          🔍 Search <kbd style={{background:"var(--border)",borderRadius:3,padding:"1px 5px",fontSize:10}}>Ctrl+K</kbd>
        </button>
        <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text-muted)"}}>{t.toLocaleTimeString("en-IN")}</span>
        <span className="badge b-success">🟢 Live</span>
        <span className="badge b-info">v4.0.0</span>
        <button onClick={toggle} style={{background:"none",border:"1px solid var(--border)",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:14,color:"var(--text-secondary)",transition:"all .2s"}}>
          {theme==="dark"?"☀️":"🌙"}
        </button>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════
// 9. STYLISH LOGIN PAGE
// ════════════════════════════════════════════════════
function LoginPage() {
  const { login } = useAuth();
  const [u,setU]=useState(""); 
  const [p,setP]=useState(""); 
  const [err,setErr]=useState("");
  const [showPass, setShowPass] = useState(false);
  const go=()=>{ if(!login(u,p)) setErr("❌ Wrong credentials"); };
  
  return (
    <div style={{
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      height:"100vh",
      background:"linear-gradient(135deg, #0a0e1a 0%, #1a2540 50%, #131d35 100%)",
      position:"relative",
      overflow:"hidden"
    }}>
      {/* Decorative circles */}
      <div style={{position:"absolute",top:"-100px",right:"-100px",width:"300px",height:"300px",background:"rgba(59,130,246,.1)",borderRadius:"50%"}}/>
      <div style={{position:"absolute",bottom:"-50px",left:"-50px",width:"250px",height:"250px",background:"rgba(139,92,246,.1)",borderRadius:"50%"}}/>
      
      <div style={{
        background:"rgba(19,29,53,0.8)",
        backdropFilter:"blur(10px)",
        border:"1px solid rgba(59,130,246,0.2)",
        borderRadius:"20px",
        padding:"48px 40px",
        width:"420px",
        maxWidth:"95vw",
        textAlign:"center",
        boxShadow:"0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.1)",
        position:"relative",
        zIndex:1
      }}>
        <div style={{fontSize:64,marginBottom:16,animation:"float 3s ease-in-out infinite"}}>🛡️</div>
        <div style={{fontSize:28,fontWeight:800,marginBottom:6,background:"linear-gradient(135deg, #3b82f6, #06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>EnterpriseOS</div>
        <div style={{fontSize:13,color:"#94a3b8",marginBottom:28,letterSpacing:"0.5px"}}>Binit's Master System — Secure Access</div>
        
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Username */}
          <div style={{position:"relative"}}>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:"#94a3b8",marginBottom:6,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.5px"}}>Username</label>
            <input 
              placeholder="Enter username" 
              value={u} 
              onChange={e=>setU(e.target.value)} 
              onKeyDown={e=>e.key==="Enter"&&go()}
              style={{
                width:"100%",
                padding:"12px 16px",
                background:"rgba(15,22,41,0.8)",
                border:"1.5px solid rgba(59,130,246,0.3)",
                borderRadius:"12px",
                fontSize:14,
                color:"#e2e8f0",
                fontFamily:"inherit",
                outline:"none",
                transition:"all 0.3s",
                boxSizing:"border-box"
              }}
              onFocus={e=>e.target.style.borderColor="rgba(59,130,246,0.8)"}
              onBlur={e=>e.target.style.borderColor="rgba(59,130,246,0.3)"}
            />
          </div>

          {/* Password */}
          <div style={{position:"relative"}}>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:"#94a3b8",marginBottom:6,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.5px"}}>Password</label>
            <div style={{position:"relative"}}>
              <input 
                placeholder="Enter password" 
                type={showPass?"text":"password"}
                value={p} 
                onChange={e=>setP(e.target.value)} 
                onKeyDown={e=>e.key==="Enter"&&go()}
                style={{
                  width:"100%",
                  padding:"12px 16px 12px 16px",
                  paddingRight:"45px",
                  background:"rgba(15,22,41,0.8)",
                  border:"1.5px solid rgba(59,130,246,0.3)",
                  borderRadius:"12px",
                  fontSize:14,
                  color:"#e2e8f0",
                  fontFamily:"inherit",
                  outline:"none",
                  transition:"all 0.3s",
                  boxSizing:"border-box"
                }}
                onFocus={e=>e.target.style.borderColor="rgba(59,130,246,0.8)"}
                onBlur={e=>e.target.style.borderColor="rgba(59,130,246,0.3)"}
              />
              <button
                onClick={()=>setShowPass(!showPass)}
                style={{
                  position:"absolute",
                  right:"12px",
                  top:"50%",
                  transform:"translateY(-50%)",
                  background:"none",
                  border:"none",
                  color:"#64748b",
                  cursor:"pointer",
                  fontSize:18,
                  transition:"color 0.2s"
                }}
                onMouseEnter={e=>e.target.style.color="#94a3b8"}
                onMouseLeave={e=>e.target.style.color="#64748b"}
              >
                {showPass?"👁️":"👁️"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {err&&<div style={{fontSize:12,color:"#ef4444",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:10,padding:12,animation:"shake 0.5s"}}>{err}</div>}

          {/* Login Button */}
          <button 
            onClick={go}
            style={{
              padding:"13px 24px",
              background:"linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
              color:"#fff",
              border:"none",
              borderRadius:"12px",
              fontSize:14,
              fontWeight:600,
              cursor:"pointer",
              transition:"all 0.3s",
              boxShadow:"0 10px 25px rgba(59,130,246,0.3)",
              marginTop:8
            }}
            onMouseEnter={e=>e.target.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.target.style.transform="translateY(0)"}
          >
            🔐 Login to EnterpriseOS
          </button>
        </div>

        {/* Hint */}
        <div style={{
          marginTop:24,
          paddingTop:20,
          borderTop:"1px solid rgba(59,130,246,0.2)",
          fontSize:11,
          color:"#64748b"
        }}>
          💡 Hint: Demo account available
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// REST OF PAGES (AgentDashboard, ProjectManager, etc...)
// ════════════════════════════════════════════════════

function AgentDashboard() {
  const { logs } = useWebSocket();
  const { notify } = useNotif();
  const stats=[{icon:"📁",val:"12",lbl:"Active Projects",chg:"+2 this week",c:"#3b82f6"},{icon:"🚀",val:"8",lbl:"Deployments",chg:"Last: 2h ago",c:"#10b981"},{icon:"🔀",val:"34",lbl:"Git Commits",chg:"+5 today",c:"#8b5cf6"},{icon:"🟢",val:"99.8%",lbl:"Uptime",chg:"30 days",c:"#f59e0b"}];
  const agents=[{n:"AI Code Agent",s:"Active",t:"Reviewing pull requests"},{n:"Deployment Agent",s:"Standby",t:"Waiting for approval"},{n:"Monitoring Agent",s:"Active",t:"Watching 4 services"},{n:"Security Agent",s:"Active",t:"Running vulnerability scan"},{n:"Voice Command Agent",s:"Active",t:"Listening for commands"}];
  const qa=[{icon:"💻",lbl:"New Code Task",fn:()=>notify.info("New code task created!")},{icon:"🚀",lbl:"Deploy Now",fn:()=>notify.deploy("Deploy request sent! Auth required.")},{icon:"🔀",lbl:"Git Commit",fn:()=>notify.success("Git commit initiated!")},{icon:"📊",lbl:"View Logs",fn:()=>notify.info("Opening live logs...")},{icon:"🔐",lbl:"Security Check",fn:()=>notify.warning("Security scan started!")},{icon:"🎙️",lbl:"Voice Command",fn:()=>notify.info("Voice command center opening...")}];
  return (
    <div>
      <div className="page-header"><h1>⚡ Agent Dashboard</h1><p>Enterprise AI Control Center — Real-time overview</p></div>
      <div className="g4 mb">{stats.map((s,i)=><div className="stat" key={i} style={{borderTop:`3px solid ${s.c}`}}><span className="stat-icon">{s.icon}</span><span className="stat-val">{s.val}</span><span className="stat-lbl">{s.lbl}</span><span className="stat-chg">{s.chg}</span></div>)}</div>
      <div className="g2 mb">
        <div className="card">
          <div className="card-header"><span className="card-title">📋 Live Activity Stream</span><span className="badge b-success">⚡ WebSocket</span></div>
          <div style={{maxHeight:240,overflowY:"auto"}}>
            {logs.slice(0,12).map((l,i)=>(
              <div className="log-row" key={i}>
                <span className="log-t">{l.time}</span>
                <span className={`badge ${l.level==="INFO"?"b-info":l.level==="WARN"?"b-warning":"b-danger"}`} style={{minWidth:40,justifyContent:"center",fontSize:9}}>{l.level}</span>
                <span style={{fontSize:10,color:"var(--accent-purple)",minWidth:80,fontFamily:"var(--font-mono)"}}>[{l.svc}]</span>
                <span style={{fontSize:11,color:"var(--text-secondary)"}}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">🤖 Agent Status</span><span className="badge b-info">5 Agents</span></div>
          {agents.map((a,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)"}}><div><div style={{fontSize:12,fontWeight:500,color:"var(--text-primary)"}}>{a.n}</div><div style={{fontSize:10,color:"var(--text-muted)"}}>{a.t}</div></div><span className={`badge ${a.s==="Active"?"b-success":"b-warning"}`}>{a.s}</span></div>)}
        </div>
      </div>
      <div className="card"><div className="card-header"><span className="card-title">⚡ Quick Actions</span></div>
        <div className="quick-actions">{qa.map((a,i)=><button className="qa-btn" key={i} onClick={a.fn}><span>{a.icon}</span><span>{a.lbl}</span></button>)}</div>
      </div>
    </div>
  );
}

// [All other page functions remain the same...]
// ProjectManager, CodeWorkspace, GitControlPanel, DeploymentCenter, 
// LiveMonitoring, VoiceCommandCenter, SecurityVault, SystemPromptLibrary,
// VersionHistory, Changelog, AuditLog, SystemSettings

function ProjectManager() {
  const { notify } = useNotif();
  const [search,setSearch]=useState(""); 
  const [filter,setFilter]=useState("All");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then(data => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const stB={Live:"b-success",Active:"b-success",Staging:"b-warning",Building:"b-info",Paused:"b-purple"};
  const filtered=projects.filter(p=>(filter==="All"||p.status===filter)&&p.projectName.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div>
      <div className="page-header"><h1>📁 Project Manager</h1><p>Manage, monitor and deploy all projects</p></div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input className="inp" placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:220}}/>
        <div style={{display:"flex",gap:4}}>{["All","Active","Staging","Building","Paused"].map(f=><button key={f} onClick={()=>setFilter(f)} className={`fbtn ${filter===f?"active":""}`}>{f}</button>)}</div>
        <button className="btn btn-primary" onClick={()=>notify.success("New project dialog opening!")}>＋ New Project</button>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="tbl"><thead><tr><th>Project</th><th>Stack</th><th>Status</th><th>Env</th><th>Last Deploy</th><th>Health</th><th>Actions</th></tr></thead>
          <tbody>{loading?<tr><td colSpan="7" style={{textAlign:"center",padding:"20px",color:"var(--text-muted)"}}>⏳ Loading...</td></tr>:filtered.length===0?<tr><td colSpan="7" style={{textAlign:"center",padding:"20px",color:"var(--text-muted)"}}>No projects found</td></tr>:filtered.map(p=>(
            <tr key={p.projectId}>
              <td style={{fontWeight:600,color:"var(--text-primary)"}}>{p.projectName}</td>
              <td style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-muted)"}}>{p.stack}</td>
              <td><span className={`badge ${stB[p.status]}`}>{p.status}</span></td>
              <td style={{color:"var(--accent-cyan)",fontSize:11}}>{p.environment}</td>
              <td style={{color:"var(--text-muted)",fontSize:11}}>{new Date(p.lastDeployTime).toLocaleString("en-IN").split(",")[1]}</td>
              <td>{p.healthPercentage?<span style={{color:"var(--accent-green)",fontFamily:"var(--font-mono)",fontSize:12}}>{p.healthPercentage}%</span>:<span style={{color:"var(--text-muted)"}}>—</span>}</td>
              <td><div style={{display:"flex",gap:5}}><button className="btn btn-ghost" style={{padding:"3px 8px",fontSize:11}} onClick={()=>notify.deploy(`Deploying ${p.projectName}...`)}>🚀</button><button className="btn btn-ghost" style={{padding:"3px 8px",fontSize:11}} onClick={()=>notify.info(`Opening logs for ${p.projectName}`)}>📊</button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
function CodeWorkspace() {
  const { notify } = useNotif();
  return (
    <div>
      <div className="page-header"><h1>💻 Code Workspace</h1><p>Browse, edit and review code with AI assistance</p></div>
      <div style={{display:"grid",gridTemplateColumns:"200px 1fr 200px",gap:14}}>
        <div className="card">
          <div className="card-header"><span className="card-title">📂 Files</span></div>
          {["AgentDashboard.jsx","GitControlPanel.jsx","SecurityVault.jsx","global.css","main.jsx"].map((f,i)=>(
            <div key={i} onClick={()=>notify.info(`Opened: ${f}`)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid var(--border)",cursor:"pointer"}}>
              <span>📄</span><span style={{fontSize:11,color:"var(--text-secondary)",fontFamily:"var(--font-mono)"}}>{f}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">📝 Editor</span>
            <div style={{display:"flex",gap:5}}>
              <button className="btn btn-ghost" style={{padding:"3px 9px",fontSize:11}} onClick={()=>notify.success("✅ Lint passed — 0 errors!")}>🔍 Lint</button>
              <button className="btn btn-primary" style={{padding:"3px 9px",fontSize:11}} onClick={()=>notify.success("✅ Build successful!")}>▶ Run</button>
            </div>
          </div>
          <pre style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--accent-cyan)",background:"var(--bg-secondary)",borderRadius:6,padding:14,overflow:"auto",lineHeight:1.7,maxHeight:340}}>
{`// AgentDashboard.jsx v4.0.0
export default function Dashboard() {
  const [stats, setStats] = useState([]);
  
  return (
    <div className="dashboard">
      <h1>⚡ Agent Dashboard</h1>
      {/* stats rendering */}
    </div>
  );
}`}
          </pre>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">🤖 AI Assist</span><span className="badge b-success">Ready</span></div>
          {["💡 Use useMemo to optimize","⚠️ Add error boundary","✅ ESLint passing","🔐 No secrets"].map((s,i)=>(
            <div key={i} style={{fontSize:11,color:"var(--text-secondary)",background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:6,padding:"7px 9px",marginBottom:7}}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GitControlPanel() {
  const { notify } = useNotif();
  const [ghToken, setGhToken] = useState("");
  const [ghUsername, setGhUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);

  const fetchRepos = async () => {
    if (!ghToken || !ghUsername) {
      notify.error("GitHub token aur username dono dalo!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://api.github.com/users/${ghUsername}/repos?sort=updated&per_page=10`, {
        headers: { Authorization: `Bearer ${ghToken}`, Accept: "application/vnd.github+json" }
      });
      if (!res.ok) throw new Error("GitHub API error: " + res.status);
      const data = await res.json();
      setRepos(data.map(r => ({ id: r.id, name: r.name, url: r.html_url, stars: r.stargazers_count, language: r.language })));
      notify.success("✅ Repositories loaded!");
    } catch (e) {
      notify.error("Error: " + e.message);
    }
    setLoading(false);
  };

  const fetchCommits = async (repoName) => {
    if (!ghToken || !ghUsername) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${ghUsername}/${repoName}/commits?per_page=10`, {
        headers: { Authorization: `Bearer ${ghToken}`, Accept: "application/vnd.github+json" }
      });
      if (!res.ok) throw new Error("Error");
      const data = await res.json();
      setCommits(data.map(c => ({
        hash: c.sha.slice(0, 7),
        msg: c.commit.message.split("\n")[0],
        author: c.commit.author.name,
        date: new Date(c.commit.author.date).toLocaleString("en-IN")
      })));
      setSelectedRepo(repoName);
      notify.success("✅ Commits loaded!");
    } catch (e) {
      notify.error("Error loading commits");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>🔀 Git Control Panel</h1>
        <p>Real GitHub API integration</p>
      </div>
      <div className="g2">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card">
            <div className="card-header"><span className="card-title">🐙 GitHub Credentials</span></div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div>
                <label style={{fontSize:11,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase"}}>Token</label>
                <input 
                  type="password" 
                  placeholder="Paste your GitHub token here" 
                  value={ghToken} 
                  onChange={e=>setGhToken(e.target.value)}
                  style={{width:"100%",padding:"8px",background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:6,color:"var(--text-primary)",fontFamily:"inherit",fontSize:12,outline:"none",marginTop:6}}
                />
                <div style={{fontSize:10,color:"var(--text-muted)",marginTop:4}}>🔐 Token paste karo (chat mein share mat karna!)</div>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase"}}>GitHub Username</label>
                <input 
                  placeholder="e.g., binit-singh" 
                  value={ghUsername} 
                  onChange={e=>setGhUsername(e.target.value)}
                  style={{width:"100%",padding:"8px",background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:6,color:"var(--text-primary)",fontFamily:"inherit",fontSize:12,outline:"none",marginTop:6}}
                />
              </div>
              <button className="btn btn-primary" onClick={fetchRepos} disabled={loading} style={{width:"100%",justifyContent:"center"}}>
                {loading?"⏳ Loading...":"🐙 Fetch Repositories"}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">📚 Your Repositories</span><span className="badge b-info">{repos.length} repos</span></div>
            <div style={{maxHeight:300,overflowY:"auto"}}>
              {repos.length===0?<div style={{padding:12,textAlign:"center",color:"var(--text-muted)",fontSize:12}}>No repos loaded</div>
              :repos.map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--text-primary)"}}>{r.name}</div>
                    <div style={{fontSize:10,color:"var(--text-muted)"}}>{r.language || "Unknown"} · ⭐ {r.stars}</div>
                  </div>
                  <button className="btn btn-ghost" style={{padding:"3px 9px",fontSize:11}} onClick={()=>fetchCommits(r.name)}>
                    Commits
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">📜 Commits</span>
            {selectedRepo&&<span className="badge b-success">{selectedRepo}</span>}
          </div>
          <div style={{maxHeight:400,overflowY:"auto"}}>
            {commits.length===0?<div style={{padding:12,textAlign:"center",color:"var(--text-muted)",fontSize:12}}>Select repo to view commits</div>
            :commits.map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--accent-cyan)",background:"rgba(6,182,212,.1)",padding:"2px 7px",borderRadius:4,minWidth:50}}>
                  {c.hash}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:500,color:"var(--text-primary)"}}>{c.msg}</div>
                  <div style={{fontSize:9,color:"var(--text-muted)"}}>{c.author} · {c.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function DeploymentCenter() {
  const { notify } = useNotif();
  const [renderKey,setRenderKey]=useState(""); const [services,setServices]=useState([]); const [loading,setLoading]=useState(false);
  const fetchRender=async()=>{if(!renderKey){notify.error("Render API key dalo");return;}setLoading(true);try{const res=await fetch("https://api.render.com/v1/services",{headers:{Authorization:`Bearer ${renderKey}`}});if(!res.ok)throw new Error("Error");const data=await res.json();setServices(data.map(s=>({name:s.service?.name,status:"Live"})));notify.success("✅ Render loaded!");}catch(e){notify.error(e.message);}setLoading(false);};
  return (
    <div>
      <div className="page-header"><h1>🚀 Deployment Center</h1><p>Real Render.com API</p></div>
      <div className="g2">
        <div className="card">
          <div className="card-header"><span className="card-title">🚀 Render.com</span></div>
          <input className="inp" type="password" placeholder="Render API Key" value={renderKey} onChange={e=>setRenderKey(e.target.value)} style={{marginBottom:10}}/>
          <button className="btn btn-primary" onClick={fetchRender} disabled={loading} style={{width:"100%",justifyContent:"center"}}>{loading?"⏳ Connecting...":"Connect"}</button>
        </div>
      </div>
    </div>
  );
}

function LiveMonitoring() {
  const { logs } = useWebSocket();
  const [apiLogs, setApiLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLogs(30).then(data => {
      setApiLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="page-header"><h1>📊 Live Monitoring</h1><p>Real-time system metrics and logs</p></div>
      <div className="card">
        <div className="card-header"><span className="card-title">📜 System Logs</span><span className="badge b-success">🟢 Connected</span></div>
        <div style={{maxHeight:400,overflowY:"auto"}}>
          {loading?<div style={{padding:20,textAlign:"center",color:"var(--text-muted)"}}>⏳ Loading...</div>
          :apiLogs.length===0?<div style={{padding:20,textAlign:"center",color:"var(--text-muted)"}}>No logs</div>
          :apiLogs.map((l,i)=>(
            <div className="log-row" key={i}>
              <span className="log-t">{new Date(l.createdAt).toLocaleTimeString("en-IN")}</span>
              <span className={`badge ${l.logLevel==="INFO"?"b-info":l.logLevel==="WARN"?"b-warning":"b-danger"}`} style={{minWidth:45,justifyContent:"center",fontSize:9}}>
                {l.logLevel}
              </span>
              <span style={{fontSize:10,color:"var(--accent-purple)",minWidth:90,fontFamily:"var(--font-mono)"}}>[{l.serviceName}]</span>
              <span style={{fontSize:11,color:"var(--text-secondary)",flex:1}}>{l.message}</span>
              <span className={`badge ${l.status==="UP"?"b-success":"b-danger"}`} style={{minWidth:40,justifyContent:"center",fontSize:9}}>
                {l.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VoiceCommandCenter() {
  const { notify } = useNotif();
  const { recording, transcript, start, stop, setTranscript } = useVoiceRecorder();
  const execute=(cmd)=>{notify.success(`Executing: ${cmd}`);setTranscript("");};
  return (
    <div>
      <div className="page-header"><h1>🎙️ Voice Command</h1><p>Real WebRTC voice + Web Speech API</p></div>
      <div className="card" style={{textAlign:"center",padding:28}}>
        <div style={{fontSize:48,marginBottom:16}}>🎙️</div>
        <button className={`btn ${recording?"btn-danger":"btn-primary"}`} style={{width:"100%",justifyContent:"center",padding:10}} onClick={recording?stop:start}>
          {recording?"⏹ Stop":"🎙️ Start"}
        </button>
        {transcript&&<div style={{marginTop:14,padding:12,background:"var(--bg-secondary)",borderRadius:8}}><div style={{fontSize:11,color:"var(--text-muted)",marginBottom:4}}>Transcript:</div><div>{transcript}</div><button className="btn btn-success" style={{marginTop:8,width:"100%",justifyContent:"center"}} onClick={()=>{execute(transcript);setTranscript("");}}>Execute</button></div>}
      </div>
    </div>
  );
}

function SecurityVault() {
  const { notify } = useNotif();
  const { user } = useAuth();
  const [pin,setPin]=useState(["","","","","",""]);
  const verifyPin=()=>{ const e=pin.join(""); e==="123456"?notify.success("✅ PIN OK"):notify.error("❌ Wrong PIN"); };
  return (
    <div>
      <div className="page-header"><h1>🔐 Security Vault</h1><p>JWT + PIN verification</p></div>
      <div className="g2">
        <div className="card">
          <div className="card-header"><span className="card-title">🔢 PIN</span></div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:12}}>
            {pin.map((p,i)=><input key={i} type="password" maxLength={1} value={p} onChange={e=>{const n=[...pin];n[i]=e.target.value.slice(-1);setPin(n);}} style={{width:40,height:44,textAlign:"center",fontSize:18,background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text-primary)",outline:"none"}}/>)}
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={verifyPin}>Verify PIN</button>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">👤 JWT</span></div>
          <div style={{fontSize:12}}><span style={{color:"var(--text-muted)"}}>User:</span> <span style={{color:"var(--text-primary)",fontWeight:600}}>{user?.name}</span></div>
          <div style={{fontSize:12,marginTop:8}}><span style={{color:"var(--text-muted)"}}>Role:</span> <span style={{color:"var(--text-primary)",fontWeight:600}}>{user?.role}</span></div>
        </div>
      </div>
    </div>
  );
}

function SystemPromptLibrary() {
  const { notify } = useNotif();
  return (
    <div>
      <div className="page-header"><h1>🤖 Prompt Library</h1><p>AI Agent prompts</p></div>
      <div className="card">
        <div className="card-header"><span className="card-title">📚 Prompts</span></div>
        <p style={{fontSize:12,color:"var(--text-secondary)"}}>Master AI Agent • Claude / GPT-4 • Full enterprise workflow</p>
      </div>
    </div>
  );
}

function VersionHistory() {
  return (
    <div>
      <div className="page-header"><h1>🗂️ Version History</h1><p>File snapshots</p></div>
      <div className="card">
        <div className="card-header"><span className="card-title">📋 Timeline</span></div>
        <p style={{fontSize:12,color:"var(--text-secondary)"}}>Version tracking with original + change snapshots</p>
      </div>
    </div>
  );
}

function Changelog() {
  return (
    <div>
      <div className="page-header"><h1>📋 Changelog</h1><p>Release notes</p></div>
      <div className="card">v4.0.0 • v3.0.0 • v2.0.0 • v1.0.0</div>
    </div>
  );
}

function AuditLog() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.getAuditLogs(50).then(data => {
      setAuditLogs(data);
      setLoading(false);
    });
  }, []);

  const riskColor = {Low:"#10b981",Medium:"#f59e0b",High:"#ef4444"};
  const filtered = filter==="All" ? auditLogs : auditLogs.filter(a=>a.riskLevel===filter);

  return (
    <div>
      <div className="page-header">
        <h1>📜 Audit Log</h1>
        <p>Activity tracking and compliance</p>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {["All","Low","Medium","High"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`fbtn ${filter===f?"active":""}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Action</th>
              <th>Target</th>
              <th>Result</th>
              <th>Risk</th>
              <th>IP Address</th>
              <th>Category</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {loading?<tr><td colSpan="7" style={{textAlign:"center",padding:"20px",color:"var(--text-muted)"}}>⏳ Loading...</td></tr>
            :filtered.length===0?<tr><td colSpan="7" style={{textAlign:"center",padding:"20px",color:"var(--text-muted)"}}>No audit logs</td></tr>
            :filtered.map((a,i)=>(
              <tr key={i}>
                <td style={{fontWeight:600,color:"var(--text-primary)",fontSize:12}}>{a.action}</td>
                <td style={{fontSize:11,color:"var(--text-secondary)",maxWidth:150,overflow:"hidden",textOverflow:"ellipsis"}}>{a.targetEntity}</td>
                <td><span className={`badge ${a.result==="Success"?"b-success":"b-danger"}`}>{a.result}</span></td>
                <td>
                  <span style={{color:riskColor[a.riskLevel],fontWeight:600,fontSize:11}}>
                    {a.riskLevel==="High"?"🔴":a.riskLevel==="Medium"?"🟡":"🟢"} {a.riskLevel}
                  </span>
                </td>
                <td style={{fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>{a.ipAddress}</td>
                <td style={{fontSize:11,color:"var(--accent-cyan)"}}>{a.category}</td>
                <td style={{fontSize:10,color:"var(--text-muted)"}}>{new Date(a.createdAt).toLocaleString("en-IN").split(",")[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemSettings() {
  const { notify } = useNotif();
  const { theme, toggle } = useTheme();
  return (
    <div>
      <div className="page-header"><h1>⚙️ System Settings</h1><p>Preferences & config</p></div>
      <div className="card">
        <button className="btn btn-primary" onClick={toggle}>{theme==="dark"?"☀️ Light":"🌙 Dark"}</button>
        <button className="btn btn-ghost" style={{marginLeft:8}} onClick={()=>notify.success("✅ Settings saved!")}>💾 Save</button>
      </div>
    </div>
  );
}

const PAGES={AgentDashboard,ProjectManager,CodeWorkspace,GitControlPanel,DeploymentCenter,LiveMonitoring,VoiceCommandCenter,SystemPromptLibrary,SecurityVault,VersionHistory,Changelog,AuditLog,SystemSettings};

function MainApp() {
  const { isAuth } = useAuth();
  const { theme, toggle} = useTheme();
  const [page,setPage] = useState("AgentDashboard");
  const [sidebarOpen,setSidebarOpen] = useState(true);
  const [searchOpen,setSearchOpen] = useState(false);
  const isMobile = window.innerWidth < 768;

  useEffect(()=>{ if(isMobile) setSidebarOpen(false); },[]);

  useKeyboardShortcuts(setPage,()=>setSidebarOpen(o=>!o),toggle,()=>setSearchOpen(true));

  if (!isAuth) return <LoginPage/>;

  const Page = PAGES[page];
  return (
    <>
      <style>{getCSS(theme)}</style>
      <div className="app">
        <Sidebar active={page} onNav={p=>{setPage(p);if(isMobile)setSidebarOpen(false);}} open={sidebarOpen} isMobile={isMobile}/>
        <div className={`main ${sidebarOpen&&!isMobile?"":"full"}`}>
          <Header active={page} onToggle={()=>setSidebarOpen(o=>!o)} sidebarOpen={sidebarOpen} onSearch={()=>setSearchOpen(true)}/>
          <div className="page">
            <ErrorBoundary>
              <Page/>
            </ErrorBoundary>
          </div>
        </div>
        <ToastContainer/>
        <GlobalSearch open={searchOpen} onClose={()=>setSearchOpen(false)} onNavigate={p=>{setPage(p);setSearchOpen(false);}}/>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            <MainApp/>
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
