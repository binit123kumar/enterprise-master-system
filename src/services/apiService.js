const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  getHeaders() {
    const token = localStorage.getItem("eos-token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
  }

  async get(path) {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }

  async post(path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }

  async put(path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async delete(path) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // ── Project APIs ──
  getProjects()                   { return this.get("/projects"); }
  createProject(data)             { return this.post("/projects", data); }
  updateProject(id, data)         { return this.put(`/projects/${id}`, data); }
  deleteProject(id)               { return this.delete(`/projects/${id}`); }

  // ── Deployment APIs ──
  deploy(data)                    { return this.post("/deployment/deploy", data); }
  rollback(id)                    { return this.post(`/deployment/rollback/${id}`, {}); }
  getDeployHistory()              { return this.get("/deployment/history"); }
  getChecklist()                  { return this.get("/deployment/checklist"); }

  // ── Version APIs ──
  getOriginals(project)           { return this.get(`/version/originals?project=${project||""}`); }
  saveOriginal(data)              { return this.post("/version/originals", data); }
  getChanges(project, file)       { return this.get(`/version/changes?project=${project||""}&file=${file||""}`); }
  saveChange(data)                { return this.post("/version/changes", data); }
  getTimeline(project, file)      { return this.get(`/version/timeline?project=${project}&file=${file}`); }
  restoreOriginal(id)             { return this.post(`/version/originals/${id}/restore`, {}); }
  restoreChange(id)               { return this.post(`/version/changes/${id}/restore`, {}); }

  // ── Monitoring APIs ──
  getServices()                   { return this.get("/monitoring/services"); }
  getLogs()                       { return this.get("/monitoring/logs"); }
  getMetrics()                    { return this.get("/monitoring/metrics"); }

  // ── Security APIs ──
  getSecurityScore()              { return this.get("/security/score"); }
  getSecurityLogs()               { return this.get("/security/logs"); }
  verifyVoice(data)               { return this.post("/security/verify/voice", data); }
  verifyPin(pin)                  { return this.post("/security/verify/pin", { pin }); }

  // ── Agent APIs ──
  executeCommand(cmd, src)        { return this.post("/agent/command", { command: cmd, source: src }); }
  getAgentStatus()                { return this.get("/agent/status"); }
}

export const api = new ApiService();
