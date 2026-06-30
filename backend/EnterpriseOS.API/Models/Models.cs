namespace EnterpriseOS.API.Models;

// ── User ───────────────────────────────────────────────
public class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string Role { get; set; } = "user";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

// ── MonitoringLog ──────────────────────────────────────
public class MonitoringLog
{
    public int LogId { get; set; }
    public string? ServiceName { get; set; }
    public string? LogLevel { get; set; }
    public string? Message { get; set; }
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ── AuditLog ───────────────────────────────────────────
public class AuditLog
{
    public int AuditId { get; set; }
    public string? Action { get; set; }
    public string? TargetEntity { get; set; }
    public string? Result { get; set; }
    public string? RiskLevel { get; set; }
    public string? IpAddress { get; set; }
    public string? Category { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ── Project ───────────────────────────────────────────
public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string TechStack { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public string Environment { get; set; } = "Dev";
    public int CommitCount { get; set; }
    public int? HealthScore { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastDeployedAt { get; set; }
    public ICollection<Deployment> Deployments { get; set; } = new List<Deployment>();
}

// ── Deployment ────────────────────────────────────────
public class Deployment
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public string Version { get; set; } = string.Empty;
    public string Environment { get; set; } = "Production";
    public string Status { get; set; } = "Pending";
    public string DeployedBy { get; set; } = "Binit";
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string? BuildLog { get; set; }
    public bool VoiceVerified { get; set; }
    public bool PinVerified { get; set; }
    public bool FingerprintVerified { get; set; }
}

// ── GitCommit ─────────────────────────────────────────
public class GitCommit
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public string Hash { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Branch { get; set; } = "main";
    public string Author { get; set; } = "Binit";
    public DateTime CommittedAt { get; set; } = DateTime.UtcNow;
    public int Additions { get; set; }
    public int Deletions { get; set; }
}

// ── SecurityLog ───────────────────────────────────────
public class SecurityLog
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string Status { get; set; } = "Allowed";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Details { get; set; }
}

// ── ServiceHealth ─────────────────────────────────────
public class ServiceHealth
{
    public int Id { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Status { get; set; } = "UP";
    public int? PingMs { get; set; }
    public string Uptime { get; set; } = "100%";
    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
}

// ── SystemPrompt ──────────────────────────────────────
public class SystemPrompt
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AgentPlatform { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastUsedAt { get; set; }
}

// ── DTOs ──────────────────────────────────────────────
public record DeploymentRequest(
    int ProjectId,
    string Version,
    string Environment,
    bool VoiceVerified,
    bool PinVerified,
    bool FingerprintVerified
);

public record CommandRequest(string Command, string Source);

public record ApiResponse<T>(bool Success, T? Data, string? Message);