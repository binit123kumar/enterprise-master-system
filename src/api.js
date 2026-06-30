// Mock API Service for EnterpriseOS
const MOCK_PROJECTS = [
  {
    projectId: 1,
    projectName: "EnterpriseOS",
    description: "AI-Powered DevOps Command Center",
    stack: "React + ASP.NET Core",
    status: "Active",
    environment: "Production",
    healthPercentage: 99,
    lastDeployTime: new Date(Date.now() - 2*60*60*1000).toISOString()
  },
  {
    projectId: 2,
    projectName: "BharatPay API",
    description: "Payment Processing System",
    stack: "Node.js + SQL Server",
    status: "Active",
    environment: "Production",
    healthPercentage: 100,
    lastDeployTime: new Date(Date.now() - 24*60*60*1000).toISOString()
  },
  {
    projectId: 3,
    projectName: "AdminPanel v3",
    description: "Admin Dashboard",
    stack: "React.js",
    status: "Active",
    environment: "Staging",
    healthPercentage: 97,
    lastDeployTime: new Date(Date.now() - 3*60*60*1000).toISOString()
  },
  {
    projectId: 4,
    projectName: "DataSync Worker",
    description: "Real-time Data Synchronization",
    stack: "Python + Docker",
    status: "Building",
    environment: "Dev",
    healthPercentage: null,
    lastDeployTime: new Date(Date.now() - 10*60*1000).toISOString()
  }
];

const MOCK_LOGS = [
  { logId: 1, serviceName: "Monitor", logLevel: "INFO", message: "Health check passed — all services UP", status: "UP", createdAt: new Date(Date.now() - 2*60*1000).toISOString() },
  { logId: 2, serviceName: "GitAgent", logLevel: "INFO", message: "Git pull completed — branch: main", status: "UP", createdAt: new Date(Date.now() - 5*60*1000).toISOString() },
  { logId: 3, serviceName: "Monitor", logLevel: "WARN", message: "Memory usage at 78%", status: "UP", createdAt: new Date(Date.now() - 8*60*1000).toISOString() },
  { logId: 4, serviceName: "Backend", logLevel: "INFO", message: "API request processed in 42ms", status: "UP", createdAt: new Date(Date.now() - 12*60*1000).toISOString() }
];

const MOCK_AUDIT_LOGS = [
  { auditId: 1, action: "login", targetEntity: "Dashboard", result: "Success", riskLevel: "Low", ipAddress: "192.168.1.100", category: "Auth", createdAt: new Date(Date.now() - 1*60*1000).toISOString() },
  { auditId: 2, action: "deploy", targetEntity: "EnterpriseOS → Production", result: "Success", riskLevel: "High", ipAddress: "192.168.1.100", category: "Deployment", createdAt: new Date(Date.now() - 5*60*1000).toISOString() },
  { auditId: 3, action: "git_push", targetEntity: "main — 4 files changed", result: "Success", riskLevel: "Medium", ipAddress: "192.168.1.100", category: "Git", createdAt: new Date(Date.now() - 15*60*1000).toISOString() },
  { auditId: 4, action: "config_change", targetEntity: "Database Connection", result: "Success", riskLevel: "High", ipAddress: "192.168.1.100", category: "Security", createdAt: new Date(Date.now() - 60*60*1000).toISOString() }
];

export const api = {
  getProjects: async () => {
    return new Promise(resolve => {
      setTimeout(() => resolve(MOCK_PROJECTS), 300);
    });
  },

  getLogs: async (limit = 50) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(MOCK_LOGS.slice(0, limit)), 300);
    });
  },

  getAuditLogs: async (limit = 50) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(MOCK_AUDIT_LOGS.slice(0, limit)), 300);
    });
  }
};

export default api;