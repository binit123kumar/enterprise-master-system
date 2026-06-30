const GITHUB_API = "https://api.github.com";

export class GitHubService {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo  = repo;
    this.headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  async getRepos() {
    const res = await fetch(`${GITHUB_API}/user/repos?sort=updated&per_page=20`, { headers: this.headers });
    return res.json();
  }

  async getBranches() {
    const res = await fetch(`${GITHUB_API}/repos/${this.owner}/${this.repo}/branches`, { headers: this.headers });
    return res.json();
  }

  async getCommits(branch = "main", per_page = 20) {
    const res = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/commits?sha=${branch}&per_page=${per_page}`,
      { headers: this.headers }
    );
    const data = await res.json();
    return data.map(c => ({
      hash:    c.sha.slice(0, 7),
      fullHash:c.sha,
      message: c.commit.message,
      author:  c.commit.author.name,
      date:    new Date(c.commit.author.date).toLocaleString("en-IN"),
      url:     c.html_url,
    }));
  }

  async getPullRequests() {
    const res = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/pulls?state=open`,
      { headers: this.headers }
    );
    return res.json();
  }

  async createCommit(message, files, branch = "main") {
    // Get latest commit SHA
    const refRes = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/git/ref/heads/${branch}`,
      { headers: this.headers }
    );
    const ref = await refRes.json();
    const latestSHA = ref.object.sha;

    // Get tree SHA
    const commitRes = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/git/commits/${latestSHA}`,
      { headers: this.headers }
    );
    const commit = await commitRes.json();

    // Create blobs for each file
    const treeItems = await Promise.all(files.map(async file => {
      const blobRes = await fetch(
        `${GITHUB_API}/repos/${this.owner}/${this.repo}/git/blobs`,
        {
          method: "POST",
          headers: { ...this.headers, "Content-Type": "application/json" },
          body: JSON.stringify({ content: file.content, encoding: "utf-8" }),
        }
      );
      const blob = await blobRes.json();
      return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
    }));

    // Create tree
    const treeRes = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/git/trees`,
      {
        method: "POST",
        headers: { ...this.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ base_tree: commit.tree.sha, tree: treeItems }),
      }
    );
    const tree = await treeRes.json();

    // Create commit
    const newCommitRes = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/git/commits`,
      {
        method: "POST",
        headers: { ...this.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ message, tree: tree.sha, parents: [latestSHA] }),
      }
    );
    const newCommit = await newCommitRes.json();

    // Update ref
    await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/git/refs/heads/${branch}`,
      {
        method: "PATCH",
        headers: { ...this.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ sha: newCommit.sha }),
      }
    );

    return { success: true, sha: newCommit.sha.slice(0, 7), message };
  }

  async getWorkflowRuns() {
    const res = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/actions/runs?per_page=10`,
      { headers: this.headers }
    );
    const data = await res.json();
    return data.workflow_runs || [];
  }
}
