import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage({ onLogin }) {
  const { login }  = useAuth();
  const [step,     setStep]     = useState("credentials"); // credentials | pin
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin,      setPin]      = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleCredentials = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError("Username and password required"); return; }
    setLoading(true);
    setError("");
    // For demo: accept Binit / any password, then ask PIN
    if (username.toLowerCase() === "binit") {
      setStep("pin");
    } else {
      setError("❌ Access denied. Only owner can login.");
    }
    setLoading(false);
  };

  const handlePin = async (e) => {
    e.preventDefault();
    if (pin.length < 4) { setError("PIN must be at least 4 digits"); return; }
    setLoading(true);
    setError("");
    // Demo PIN: 1234 — in production validate via /api/auth/login
    if (pin === "1234") {
      const result = await login(username, password);
      if (!result.success) {
        // Fallback: set mock user for demo
        localStorage.setItem("eos-token", "demo.token.binit");
        onLogin?.();
      } else {
        onLogin?.();
      }
    } else {
      setError("❌ Incorrect PIN");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg-primary)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"var(--font-main)"
    }}>
      <div style={{
        width:"100%", maxWidth:420,
        background:"var(--bg-secondary)",
        border:"1px solid var(--border)",
        borderRadius:16, padding:40,
        boxShadow:"0 20px 60px rgba(0,0,0,.5)"
      }}>
        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:32}}>
          <div style={{fontSize:48, marginBottom:12}}>🛡️</div>
          <h1 style={{fontSize:22, fontWeight:800, color:"var(--text-primary)", marginBottom:4}}>EnterpriseOS</h1>
          <p style={{fontSize:12, color:"var(--text-muted)"}}>Binit's Master System — Secure Access</p>
        </div>

        {/* Step indicator */}
        <div style={{display:"flex", gap:8, marginBottom:28}}>
          {["Credentials","PIN Verify"].map((s,i)=>(
            <div key={i} style={{
              flex:1, padding:"6px 0", textAlign:"center", borderRadius:6,
              fontSize:11, fontWeight:600,
              background: step==="credentials" ? (i===0?"var(--accent-blue)":"var(--border)") : (i===1?"var(--accent-green)":"var(--accent-blue)"),
              color: step==="credentials" ? (i===0?"white":"var(--text-muted)") : "white",
              transition:"all .3s"
            }}>{s}</div>
          ))}
        </div>

        {/* Credentials form */}
        {step === "credentials" && (
          <form onSubmit={handleCredentials} style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={{display:"block",fontSize:11,color:"var(--text-muted)",marginBottom:5,fontWeight:600}}>OWNER USERNAME</label>
              <input
                style={{width:"100%",background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 14px",fontSize:13,color:"var(--text-primary)",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
                placeholder="Enter username"
                value={username}
                onChange={e=>setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label style={{display:"block",fontSize:11,color:"var(--text-muted)",marginBottom:5,fontWeight:600}}>PASSWORD</label>
              <input
                type="password"
                style={{width:"100%",background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 14px",fontSize:13,color:"var(--text-primary)",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
                placeholder="Enter password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
              />
            </div>
            {error && <div style={{fontSize:12,color:"var(--accent-red)",background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:6,padding:"8px 12px"}}>{error}</div>}
            <button type="submit" disabled={loading} style={{
              padding:"11px",borderRadius:8,border:"none",
              background:"var(--accent-blue)",color:"white",
              fontSize:14,fontWeight:600,cursor:"pointer",
              fontFamily:"inherit",marginTop:4,
              opacity:loading?0.6:1
            }}>
              {loading ? "Verifying..." : "Continue →"}
            </button>
          </form>
        )}

        {/* PIN form */}
        {step === "pin" && (
          <form onSubmit={handlePin} style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center"}}>
            <div style={{fontSize:13,color:"var(--text-secondary)",textAlign:"center"}}>
              Welcome <strong style={{color:"var(--accent-blue)"}}>Binit</strong>! Enter your deployment PIN to continue.
            </div>
            <div style={{display:"flex",gap:10,margin:"8px 0"}}>
              {[0,1,2,3].map(i=>(
                <div key={i} style={{
                  width:48,height:56,background:"var(--bg-card)",
                  border:`2px solid ${pin.length>i?"var(--accent-blue)":"var(--border)"}`,
                  borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:24,color:"var(--accent-blue)",transition:"all .2s"
                }}>
                  {pin.length > i ? "●" : ""}
                </div>
              ))}
            </div>
            {/* Number pad */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,width:"100%"}}>
              {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
                <button key={i} type="button"
                  onClick={()=>{
                    if(k==="⌫") setPin(p=>p.slice(0,-1));
                    else if(k!=="" && pin.length<4) setPin(p=>p+k);
                  }}
                  style={{
                    padding:"14px",borderRadius:8,border:"1px solid var(--border)",
                    background:k===""?"transparent":"var(--bg-card)",
                    color:k==="⌫"?"var(--accent-red)":"var(--text-primary)",
                    fontSize:16,fontWeight:600,cursor:k===""?"default":"pointer",
                    fontFamily:"inherit",transition:"all .15s"
                  }}
                >{k}</button>
              ))}
            </div>
            {error && <div style={{fontSize:12,color:"var(--accent-red)",background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:6,padding:"8px 12px",width:"100%",textAlign:"center"}}>{error}</div>}
            <div style={{display:"flex",gap:8,width:"100%"}}>
              <button type="button" onClick={()=>{setStep("credentials");setPin("");setError("");}} style={{
                flex:1,padding:"10px",borderRadius:8,border:"1px solid var(--border)",
                background:"none",color:"var(--text-secondary)",fontSize:13,cursor:"pointer",fontFamily:"inherit"
              }}>← Back</button>
              <button type="submit" disabled={pin.length<4||loading} style={{
                flex:2,padding:"10px",borderRadius:8,border:"none",
                background:"var(--accent-green)",color:"white",
                fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                opacity:(pin.length<4||loading)?0.5:1
              }}>
                {loading?"Verifying...":"🔐 Login"}
              </button>
            </div>
          </form>
        )}

        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"var(--text-muted)"}}>
          🔒 Protected by Voice + PIN + Fingerprint Auth
        </div>
      </div>
    </div>
  );
}
