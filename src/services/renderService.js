const RENDER_API = "https://api.render.com/v1";

export class RenderService {
  constructor(apiKey) {
    this.headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async getServices() {
    const res = await fetch(`${RENDER_API}/services`, { headers: this.headers });
    const data = await res.json();
    return (data || []).map(s => ({
      id:     s.service?.id,
      name:   s.service?.name,
      type:   s.service?.type,
      status: s.service?.suspended === "not_suspended" ? "Live" : "Suspended",
      url:    s.service?.serviceDetails?.url,
      env:    s.service?.serviceDetails?.env,
      branch: s.service?.branch,
      lastDeployedAt: s.service?.updatedAt,
    }));
  }

  async getDeploys(serviceId) {
    const res = await fetch(`${RENDER_API}/services/${serviceId}/deploys?limit=10`, { headers: this.headers });
    const data = await res.json();
    return (data || []).map(d => ({
      id:        d.deploy?.id,
      status:    d.deploy?.status,
      commitId:  d.deploy?.commit?.id?.slice(0, 7),
      commitMsg: d.deploy?.commit?.message,
      createdAt: new Date(d.deploy?.createdAt).toLocaleString("en-IN"),
      finishedAt:d.deploy?.finishedAt ? new Date(d.deploy.finishedAt).toLocaleString("en-IN") : null,
    }));
  }

  async triggerDeploy(serviceId) {
    const res = await fetch(`${RENDER_API}/services/${serviceId}/deploys`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ clearCache: "do_not_clear" }),
    });
    const data = await res.json();
    return {
      success:  res.ok,
      deployId: data.id,
      status:   data.status,
      message:  res.ok ? "✅ Deploy triggered on Render.com" : "❌ Deploy failed",
    };
  }

  async getDeployStatus(serviceId, deployId) {
    const res = await fetch(`${RENDER_API}/services/${serviceId}/deploys/${deployId}`, { headers: this.headers });
    const data = await res.json();
    return {
      status:    data.status,
      finishedAt:data.finishedAt,
      logs:      data.logs || [],
    };
  }

  async suspendService(serviceId) {
    const res = await fetch(`${RENDER_API}/services/${serviceId}/suspend`, {
      method: "POST", headers: this.headers
    });
    return { success: res.ok };
  }

  async resumeService(serviceId) {
    const res = await fetch(`${RENDER_API}/services/${serviceId}/resume`, {
      method: "POST", headers: this.headers
    });
    return { success: res.ok };
  }
}
