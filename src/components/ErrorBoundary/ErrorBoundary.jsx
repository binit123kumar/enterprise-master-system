import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("EnterpriseOS Error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", height:"60vh", gap:16, padding:24, textAlign:"center"
      }}>
        <div style={{ fontSize: 56 }}>💥</div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"var(--accent-red)" }}>
          Kuch Galat Ho Gaya!
        </h2>
        <p style={{ fontSize:13, color:"var(--text-muted)", maxWidth:400 }}>
          {this.state.error?.message || "Unknown error occurred"}
        </p>
        <div style={{
          background:"var(--bg-secondary)", border:"1px solid var(--border)",
          borderRadius:8, padding:"12px 16px", maxWidth:500,
          fontFamily:"var(--font-mono)", fontSize:11, color:"var(--accent-orange)",
          textAlign:"left", maxHeight:120, overflowY:"auto"
        }}>
          {this.state.errorInfo?.componentStack}
        </div>
        <button
          onClick={() => this.setState({ hasError:false, error:null, errorInfo:null })}
          style={{
            padding:"10px 24px", background:"var(--accent-blue)", color:"white",
            border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600
          }}
        >
          🔄 Dobara Try Karo
        </button>
      </div>
    );
  }
}
