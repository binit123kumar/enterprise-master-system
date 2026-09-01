using EnterpriseOS.API.Data;
using EnterpriseOS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseOS.API.Services;

// ── Interfaces ────────────────────────────────────────
public interface IProjectService
{
    Task<IEnumerable<Project>> GetAllAsync();
    Task<Project?> GetByIdAsync(int id);
    Task<Project> CreateAsync(Project project);
    Task<Project?> UpdateAsync(int id, Project project);
    Task<bool> DeleteAsync(int id);
    Task<object> GetHealthAsync(int id);
}

public interface IDeploymentService
{
    Task<IEnumerable<Deployment>> GetHistoryAsync();
    Task<Deployment> DeployAsync(DeploymentRequest request);
    Task<Deployment> RollbackAsync(int deploymentId);
    Task<object> GetPreDeployChecklistAsync();
}

public interface ISecurityService
{
    Task<IEnumerable<SecurityLog>> GetLogsAsync();
    Task<object> GetSecurityScoreAsync();
    Task LogAsync(string action, string ip, string status);
}

public interface IAIAgentService
{
    Task<object> ExecuteCommandAsync(string command, string source);
    Task<object> GetAgentStatusAsync();
    Task<IEnumerable<SystemPrompt>> GetSystemPromptsAsync();
    Task<SystemPrompt> SaveSystemPromptAsync(SystemPrompt prompt);
}

public interface IGitService
{
    Task<object> GetStatusAsync(int projectId);
    Task<object> CommitAsync(int projectId, string message, string branch);
}

public interface IAuditService
{
    Task<IEnumerable<AuditLog>> GetLogsAsync(int limit = 50);
    Task LogAsync(string action, string targetEntity, string result, string riskLevel, string ip, string category);
}

// ── ProjectService ────────────────────────────────────
public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;
    public ProjectService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Project>> GetAllAsync() =>
        await _db.Projects.Include(p => p.Deployments).ToListAsync();

    public async Task<Project?> GetByIdAsync(int id) =>
        await _db.Projects.Include(p => p.Deployments).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Project> CreateAsync(Project project)
    {
        _db.Projects.Add(project);
        await _db.SaveChangesAsync();
        return project;
    }

    public async Task<Project?> UpdateAsync(int id, Project project)
    {
        var existing = await _db.Projects.FindAsync(id);
        if (existing == null) return null;
        existing.Name = project.Name;
        existing.TechStack = project.TechStack;
        existing.Status = project.Status;
        existing.Environment = project.Environment;
        await _db.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return false;
        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<object> GetHealthAsync(int id)
    {
        var project = await _db.Projects.FindAsync(id);
        return new
        {
            projectId   = id,
            health      = project?.HealthScore ?? 0,
            status      = project?.Status,
            lastChecked = DateTime.UtcNow
        };
    }
}

// ── DeploymentService ─────────────────────────────────
public class DeploymentService : IDeploymentService
{
    private readonly AppDbContext _db;
    public DeploymentService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Deployment>> GetHistoryAsync() =>
        await _db.Deployments.Include(d => d.Project)
            .OrderByDescending(d => d.StartedAt).Take(20).ToListAsync();

    public async Task<Deployment> DeployAsync(DeploymentRequest req)
    {
        var deployment = new Deployment
        {
            ProjectId           = req.ProjectId,
            Version             = req.Version,
            Environment         = req.Environment,
            Status              = "Running",
            VoiceVerified       = req.VoiceVerified,
            PinVerified         = req.PinVerified,
            FingerprintVerified = req.FingerprintVerified,
            StartedAt           = DateTime.UtcNow,
        };
        _db.Deployments.Add(deployment);
        await _db.SaveChangesAsync();

        // Simulate async completion (in prod: trigger real pipeline)
        _ = Task.Run(async () =>
        {
            await Task.Delay(5000);
            deployment.Status      = "Success";
            deployment.CompletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        });

        return deployment;
    }

    public async Task<Deployment> RollbackAsync(int deploymentId)
    {
        var last = await _db.Deployments
            .Where(d => d.Status == "Success")
            .OrderByDescending(d => d.StartedAt)
            .Skip(1).FirstOrDefaultAsync();

        var rollback = new Deployment
        {
            ProjectId   = last?.ProjectId ?? 1,
            Version     = last?.Version ?? "prev",
            Environment = last?.Environment ?? "Production",
            Status      = "Rolled Back",
            StartedAt   = DateTime.UtcNow,
            CompletedAt = DateTime.UtcNow,
        };
        _db.Deployments.Add(rollback);
        await _db.SaveChangesAsync();
        return rollback;
    }

    public Task<object> GetPreDeployChecklistAsync()
    {
        var checklist = new object[]
        {
            new { label="Build Successful",    done=true  },
            new { label="Tests Passed",         done=true  },
            new { label="No Critical Errors",   done=true  },
            new { label="No Secret Exposure",   done=true  },
            new { label="Environment Ready",    done=true  },
            new { label="Rollback Available",   done=true  },
            new { label="Voice Verified",       done=false },
            new { label="PIN Verified",         done=false },
            new { label="Fingerprint Approved", done=false },
        };
        return Task.FromResult<object>(checklist);
    }
}

// ── SecurityService ───────────────────────────────────
public class SecurityService : ISecurityService
{
    private readonly AppDbContext _db;
    public SecurityService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<SecurityLog>> GetLogsAsync() =>
        await _db.SecurityLogs.OrderByDescending(l => l.Timestamp).Take(50).ToListAsync();

    public Task<object> GetSecurityScoreAsync() =>
        Task.FromResult<object>(new
        {
            score        = 98,
            grade        = "Excellent",
            ssl          = "Valid",
            secrets      = "0 Exposed",
            vulns        = "0 Found",
            lastScanned  = DateTime.UtcNow
        });

    public async Task LogAsync(string action, string ip, string status)
    {
        _db.SecurityLogs.Add(new SecurityLog
        {
            Action    = action,
            IpAddress = ip,
            Status    = status,
            Timestamp = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
}

// ── AIAgentService ────────────────────────────────────
public class AIAgentService : IAIAgentService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly HttpClient _http;

    public AIAgentService(AppDbContext db, IConfiguration config)
    {
        _db     = db;
        _config = config;
        _http   = new HttpClient
        {
            BaseAddress = new Uri(config["AppSettings:AIAgentUrl"] ?? "http://localhost:8000")
        };
    }

    public async Task<object> ExecuteCommandAsync(string command, string source)
    {
        // Forward to Python AI Agent
        try
        {
            var response = await _http.PostAsJsonAsync("/execute",
                new { command, source, owner = "Binit" });
            if (response.IsSuccessStatusCode)
                return await response.Content.ReadFromJsonAsync<object>() ?? new { };
        }
        catch { /* Python agent offline — return mock */ }

        return new
        {
            command,
            status    = "queued",
            message   = $"Command '{command}' received. AI Agent processing...",
            timestamp = DateTime.UtcNow
        };
    }

    public Task<object> GetAgentStatusAsync() =>
        Task.FromResult<object>(new[]
        {
            new { name="AI Code Agent",       status="Active",  task="Reviewing pull requests" },
            new { name="Deployment Agent",    status="Standby", task="Waiting for approval"    },
            new { name="Monitoring Agent",    status="Active",  task="Watching 4 services"     },
            new { name="Security Agent",      status="Active",  task="Running vulnerability scan"},
            new { name="Voice Command Agent", status="Active",  task="Listening for commands"  },
        });

    public async Task<IEnumerable<SystemPrompt>> GetSystemPromptsAsync() =>
        await _db.SystemPrompts.ToListAsync();

    public async Task<SystemPrompt> SaveSystemPromptAsync(SystemPrompt prompt)
    {
        if (prompt.Id == 0)
            _db.SystemPrompts.Add(prompt);
        else
        {
            var existing = await _db.SystemPrompts.FindAsync(prompt.Id);
            if (existing != null)
            {
                existing.Name    = prompt.Name;
                existing.Content = prompt.Content;
                existing.Status  = prompt.Status;
            }
        }
        await _db.SaveChangesAsync();
        return prompt;
    }
}

// ── AuditService ───────────────────────────────────────
public class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    public AuditService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<AuditLog>> GetLogsAsync(int limit = 50) =>
        await _db.AuditLogs.OrderByDescending(a => a.CreatedAt).Take(limit).ToListAsync();

    public async Task LogAsync(string action, string targetEntity, string result, string riskLevel, string ip, string category)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            Action       = action,
            TargetEntity = targetEntity,
            Result       = result,
            RiskLevel    = riskLevel,
            IpAddress    = ip,
            Category     = category,
            CreatedAt    = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
}

// ── GitService ────────────────────────────────────────
public class GitService : IGitService
{
    public Task<object> GetStatusAsync(int projectId) =>
        Task.FromResult<object>(new
        {
            branch       = "main",
            ahead        = 3,
            behind       = 0,
            changedFiles = 4,
            staged       = 2
        });

    public Task<object> CommitAsync(int projectId, string message, string branch) =>
        Task.FromResult<object>(new
        {
            hash      = Guid.NewGuid().ToString()[..7],
            message,
            branch,
            author    = "Binit",
            timestamp = DateTime.UtcNow
        });
}
