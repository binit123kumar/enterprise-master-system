namespace EnterpriseOS.API.Models;

// ── Original Snapshot ─────────────────────────────────
// Jab pehli baar koi file/project save hoti hai
public class OriginalSnapshot
{
    public int    Id            { get; set; }
    public string ProjectName   { get; set; } = string.Empty;
    public string FileName      { get; set; } = string.Empty;  // e.g. AgentDashboard.jsx
    public string FilePath      { get; set; } = string.Empty;  // e.g. src/pages/Dashboard/
    public string Content       { get; set; } = string.Empty;  // Full file content
    public string ContentHash   { get; set; } = string.Empty;  // SHA256 hash
    public long   FileSizeBytes { get; set; }
    public string CreatedBy     { get; set; } = "Binit";
    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;
    public string Version       { get; set; } = "v1.0.0";
    public string? Description  { get; set; }

    // Navigation
    public ICollection<ChangeHistory> Changes { get; set; } = new List<ChangeHistory>();
}

// ── Change History ────────────────────────────────────
// Har nayi change date+time ke saath alag folder mein
public class ChangeHistory
{
    public int    Id               { get; set; }
    public int    SnapshotId       { get; set; }
    public OriginalSnapshot? Snapshot { get; set; }

    public string ProjectName      { get; set; } = string.Empty;
    public string FileName         { get; set; } = string.Empty;
    public string FilePath         { get; set; } = string.Empty;

    // Change details
    public string ChangeType       { get; set; } = "Modified"; // Modified | Added | Deleted | Renamed
    public string OldContent       { get; set; } = string.Empty;
    public string NewContent       { get; set; } = string.Empty;
    public string DiffSummary      { get; set; } = string.Empty; // "+12 -3 lines changed"
    public int    LinesAdded       { get; set; }
    public int    LinesDeleted     { get; set; }
    public int    LinesModified    { get; set; }

    // Git info
    public string? CommitHash      { get; set; }
    public string? CommitMessage   { get; set; }
    public string  Branch          { get; set; } = "main";

    // Who & when
    public string  ChangedBy       { get; set; } = "Binit";
    public DateTime ChangedAt      { get; set; } = DateTime.UtcNow;
    public string  Version         { get; set; } = string.Empty;

    // Storage folder path (alag folder mein stored)
    public string  StorageFolderPath { get; set; } = string.Empty;
    // e.g. "snapshots/2024-01-15/14-30-22/AgentDashboard.jsx"

    public string? ChangeReason    { get; set; }
    public bool    IsDeployed      { get; set; }
    public DateTime? DeployedAt    { get; set; }
}

// ── File Version Folder ───────────────────────────────
// Folder structure tracker
public class FileVersionFolder
{
    public int    Id              { get; set; }
    public string ProjectName     { get; set; } = string.Empty;
    public string FolderType      { get; set; } = string.Empty; // "original" | "changes"
    public string FolderPath      { get; set; } = string.Empty;
    // e.g. "snapshots/originals/2024-01-15/"
    // e.g. "snapshots/changes/2024-01-15/14-30-22/"
    public int    FileCount       { get; set; }
    public long   TotalSizeBytes  { get; set; }
    public DateTime CreatedAt     { get; set; } = DateTime.UtcNow;
    public string? Label          { get; set; } // "Initial Release" | "Bug Fix" | "Feature Update"
}

// ── DTOs ──────────────────────────────────────────────
public record SaveSnapshotRequest(
    string ProjectName,
    string FileName,
    string FilePath,
    string Content,
    string Version,
    string? Description
);

public record SaveChangeRequest(
    int    SnapshotId,
    string ProjectName,
    string FileName,
    string FilePath,
    string NewContent,
    string ChangeType,
    string? CommitMessage,
    string  Branch,
    string? ChangeReason
);

public record DiffResult(
    string FileName,
    string OldContent,
    string NewContent,
    string DiffSummary,
    int LinesAdded,
    int LinesDeleted,
    int LinesModified
);
