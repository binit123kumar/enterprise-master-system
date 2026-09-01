// API Service - Connected to Live Backend
const API_BASE = "https://enterprise-master-system-api.onrender.com";

// Mock data (fallback if API fails / CORS blocked / backend offline)
const MOCK_PROJECTS = [
  { projectId: 1, projectName: "EnterpriseOS", description: "AI-Powered DevOps Command Center", stack: "React + ASP.NET Core", status: "Active", environment: "Production", healthPercentage: 99, lastDeployTime: new Date(Date.now() - 2*60*60*1000).toISOString() },
  { projectId: 2, projectName: "BharatPay API", description: "Payment Processing System", stack: "Node.js + SQL Server", status: "Active", environment: "Production", healthPercentage: 100, lastDeployTime: new Date(Date.now() - 24*60*60*1000).toISOString() },
  { projectId: 3, projectName: "AdminPanel v3", description: "Admin Dashboard", stack: "React.js", status: "Active", environment: "Staging", healthPercentage: 97, lastDeployTime: new Date(Date.now() - 3*60*60*1000).toISOString() },
  { projectId: 4, projectName: "DataSync Worker", description: "Real-time Data Synchronization", stack: "Python + Docker", status: "Building", environment: "Dev", healthPercentage: null, lastDeployTime: new Date(Date.now() - 10*60*1000).toISOString() }
];

const MOCK_LOGS = [
  { logId: 1, serviceName: "Monitor", logLevel: "INFO", message: "Health check passed — all services UP", status: "UP", createdAt: new Date(Date.now() - 2*60*1000).toISOString() },
  { logId: 2, serviceName: "GitAgent", logLevel: "INFO", message: "Git pull completed — branch: main", status: "UP", createdAt: new Date(Date.now() - 5*60*1000).toISOString() },
  { logId: 3, serviceName: "Monitor", logLevel: "WARN", message: "Memory usage at 78%", status: "UP", createdAt: new Date(Date.now() - 8*60*1000).toISOString() },
  { logId: 4, serviceName: "Backend", logLevel: "INFO", message: "API request processed in 42ms", status: "UP", createdAt: new Date(Date.now() - 12*60*1000).toISOString() }
];

const MOCK_AUDIT_LOGS = [
  { auditId: 1, action: "login", targetEntity: "Dashboard", result: "Success", riskLevel: "Low", ipAddress: "192.168.1.100", category: "Auth", createdAt: new Date(Date.now() - 1*60*1000).toISOString() },
  { auditId: 2, action: "deploy", targetEntity: "EnterpriseOS → Production", result: "Success", riskLevel: "High", ipAddress: "192.168.1.100", category: "Deployment", createdAt: new Date(Date.now() - 5*60*1000).toISOString() }
];

// Backend returns: { success, data, message } — this unwraps it safely
async function callApi(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  // ApiResponse<T> wrapper shape
  if (body && typeof body === "object" && "success" in body) {
    if (!body.success) throw new Error(body.message || "API returned success:false");
    return body.data;
  }
  return body; // already a plain array/object (e.g. /health)
}

// Real backend Project shape -> what the UI components expect
function mapProject(p) {
  return {
    projectId: p.id ?? p.Id,
    projectName: p.name ?? p.Name,
    description: p.description ?? "",
    stack: p.techStack ?? p.TechStack ?? "Unknown",
    status: p.status ?? p.Status ?? "Active",
    environment: p.environment ?? p.Environment ?? "Dev",
    healthPercentage: p.healthScore ?? p.HealthScore ?? null,
    lastDeployTime: p.lastDeployedAt ?? p.LastDeployedAt ?? p.createdAt ?? new Date().toISOString()
  };
}

function mapAuditLog(a) {
  return {
    auditId: a.auditId ?? a.AuditId,
    action: a.action ?? a.Action,
    targetEntity: a.targetEntity ?? a.TargetEntity,
    result: a.result ?? a.Result,
    riskLevel: a.riskLevel ?? a.RiskLevel,
    ipAddress: a.ipAddress ?? a.IpAddress,
    category: a.category ?? a.Category,
    createdAt: a.createdAt ?? a.CreatedAt
  };
}

export const api = {
  getProjects: async () => {
    try {
      const data = await callApi("/api/projects");
      if (!Array.isArray(data)) throw new Error("Unexpected shape");
      return data.map(mapProject);
    } catch (e) {
      console.log("Using mock projects", e.message);
      return MOCK_PROJECTS;
    }
  },

  getLogs: async (limit = 50) => {
    try {
      const data = await callApi("/api/monitoring/logs");
      if (!Array.isArray(data)) throw new Error("Unexpected shape");
      return data.slice(0, limit).map(l => ({
        logId: Math.random(),
        serviceName: l.service ?? l.serviceName,
        logLevel: l.level ?? l.logLevel,
        message: l.message,
        status: l.status ?? "UP",
        createdAt: l.time ?? l.createdAt
      }));
    } catch (e) {
      console.log("Using mock logs", e.message);
      return MOCK_LOGS;
    }
  },

  getAuditLogs: async (limit = 50) => {
    try {
      const data = await callApi(`/api/audit/logs?limit=${limit}`);
      if (!Array.isArray(data)) throw new Error("Unexpected shape");
      return data.map(mapAuditLog);
    } catch (e) {
      console.log("Using mock audit logs", e.message);
      return MOCK_AUDIT_LOGS;
    }
  },

  getDeployments: async () => {
    try {
      const data = await callApi("/api/deployment/history");
      if (!Array.isArray(data)) throw new Error("Unexpected shape");
      return data;
    } catch (e) {
      console.log("Using mock deployments", e.message);
      return [];
    }
  }
};

export default api;
