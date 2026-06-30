using EnterpriseOS.API.Data;
using EnterpriseOS.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace EnterpriseOS.API.Services;

public interface IVersionControlService
{
    // Originals
    Task<OriginalSnapshot>         SaveOriginalAsync(SaveSnapshotRequest req);
    Task<OriginalSnapshot?>        GetOriginalAsync(int id);
    Task<IEnumerable<OriginalSnapshot>> GetAllOriginalsAsync(string? project = null);

    // Changes
    Task<ChangeHistory>            SaveChangeAsync(SaveChangeRequest req);
    Task<IEnumerable<ChangeHistory>> GetChangesAsync(string? project = null, string? file = null);
    Task<IEnumerable<ChangeHistory>> GetChangesByDateAsync(DateTime date, string? project = null);

    // Compare
    Task<DiffResult>               CompareAsync(int snapshotId, string newContent);

    // Restore
    Task<OriginalSnapshot>         RestoreToOriginalAsync(int snapshotId);
    Task<ChangeHistory>            RestoreToChangeAsync(int changeId);

    // Folder paths
    string GetOriginalFolderPath(string project, DateTime date);
    string GetChangeFolderPath(string project, DateTime dateTime);
}

public class VersionControlService : IVersionControlService
{
    private readonly VersionDbContext _db;
    private readonly string _baseStoragePath;

    public VersionControlService(VersionDbContext db, IConfiguration config)
    {
        _db              = db;
        _baseStoragePath = config["Storage:BasePath"] ?? "snapshots";
    }

    // ── Save Original Snapshot ────────────────────────
    public async Task<OriginalSnapshot> SaveOriginalAsync(SaveSnapshotRequest req)
    {
        var hash    = ComputeHash(req.Content);
        var folderPath = GetOriginalFolderPath(req.ProjectName, DateTime.UtcNow);

        var snapshot = new OriginalSnapshot
        {
            ProjectName   = req.ProjectName,
            FileName      = req.FileName,
            FilePath      = req.FilePath,
            Content       = req.Content,
            ContentHash   = hash,
            FileSizeBytes = Encoding.UTF8.GetByteCount(req.Content),
            Version       = req.Version,
            Description   = req.Description,
            CreatedAt     = DateTime.UtcNow,
            CreatedBy     = "Binit",
        };

        _db.OriginalSnapshots.Add(snapshot);

        // Track folder
        _db.FileVersionFolders.Add(new FileVersionFolder
        {
            ProjectName  = req.ProjectName,
            FolderType   = "original",
            FolderPath   = folderPath,
            FileCount    = 1,
            TotalSizeBytes = snapshot.FileSizeBytes,
            CreatedAt    = DateTime.UtcNow,
            Label        = $"Original — {req.FileName} — {req.Version}"
        });

        await _db.SaveChangesAsync();
        return snapshot;
    }

    // ── Save Change ───────────────────────────────────
    public async Task<ChangeHistory> SaveChangeAsync(SaveChangeRequest req)
    {
        var original = await _db.OriginalSnapshots.FindAsync(req.SnapshotId);
        var oldContent = original?.Content ?? string.Empty;

        // Compute diff
        var diff = ComputeDiff(oldContent, req.NewContent);

        var folderPath = GetChangeFolderPath(req.ProjectName, DateTime.UtcNow);

        var change = new ChangeHistory
        {
            SnapshotId       = req.SnapshotId,
            ProjectName      = req.ProjectName,
            FileName         = req.FileName,
            FilePath         = req.FilePath,
            ChangeType       = req.ChangeType,
            OldContent       = oldContent,
            NewContent       = req.NewContent,
            DiffSummary      = diff.Summary,
            LinesAdded       = diff.Added,
            LinesDeleted     = diff.Deleted,
            LinesModified    = diff.Modified,
            CommitMessage    = req.CommitMessage,
            Branch           = req.Branch,
            ChangeReason     = req.ChangeReason,
            ChangedAt        = DateTime.UtcNow,
            ChangedBy        = "Binit",
            Version          = $"change-{DateTime.UtcNow:yyyyMMdd-HHmmss}",
            StorageFolderPath= $"{folderPath}/{req.FileName}",
            IsDeployed       = false
        };

        _db.ChangeHistories.Add(change);

        // Track folder
        _db.FileVersionFolders.Add(new FileVersionFolder
        {
            ProjectName  = req.ProjectName,
            FolderType   = "change",
            FolderPath   = folderPath,
            FileCount    = 1,
            TotalSizeBytes = Encoding.UTF8.GetByteCount(req.NewContent),
            CreatedAt    = DateTime.UtcNow,
            Label        = $"{req.ChangeType} — {req.FileName} — {req.CommitMessage ?? "No message"}"
        });

        await _db.SaveChangesAsync();
        return change;
    }

    // ── Get All Originals ─────────────────────────────
    public async Task<IEnumerable<OriginalSnapshot>> GetAllOriginalsAsync(string? project = null)
    {
        var q = _db.OriginalSnapshots.Include(s => s.Changes).AsQueryable();
        if (!string.IsNullOrEmpty(project))
            q = q.Where(s => s.ProjectName == project);
        return await q.OrderByDescending(s => s.CreatedAt).ToListAsync();
    }

    public async Task<OriginalSnapshot?> GetOriginalAsync(int id) =>
        await _db.OriginalSnapshots.Include(s => s.Changes)
            .FirstOrDefaultAsync(s => s.Id == id);

    // ── Get Changes ───────────────────────────────────
    public async Task<IEnumerable<ChangeHistory>> GetChangesAsync(
        string? project = null, string? file = null)
    {
        var q = _db.ChangeHistories.Include(c => c.Snapshot).AsQueryable();
        if (!string.IsNullOrEmpty(project)) q = q.Where(c => c.ProjectName == project);
        if (!string.IsNullOrEmpty(file))    q = q.Where(c => c.FileName == file);
        return await q.OrderByDescending(c => c.ChangedAt).ToListAsync();
    }

    public async Task<IEnumerable<ChangeHistory>> GetChangesByDateAsync(
        DateTime date, string? project = null)
    {
        var start = date.Date;
        var end   = start.AddDays(1);
        var q     = _db.ChangeHistories
            .Where(c => c.ChangedAt >= start && c.ChangedAt < end);
        if (!string.IsNullOrEmpty(project))
            q = q.Where(c => c.ProjectName == project);
        return await q.OrderByDescending(c => c.ChangedAt).ToListAsync();
    }

    // ── Compare ───────────────────────────────────────
    public async Task<DiffResult> CompareAsync(int snapshotId, string newContent)
    {
        var snap    = await _db.OriginalSnapshots.FindAsync(snapshotId);
        var oldContent = snap?.Content ?? string.Empty;
        var diff    = ComputeDiff(oldContent, newContent);

        return new DiffResult(
            snap?.FileName ?? "unknown",
            oldContent,
            newContent,
            diff.Summary,
            diff.Added,
            diff.Deleted,
            diff.Modified
        );
    }

    // ── Restore ───────────────────────────────────────
    public async Task<OriginalSnapshot> RestoreToOriginalAsync(int snapshotId)
    {
        var snap = await _db.OriginalSnapshots.FindAsync(snapshotId)
            ?? throw new Exception("Snapshot not found");

        // Log restore as a new change
        _db.ChangeHistories.Add(new ChangeHistory
        {
            SnapshotId    = snapshotId,
            ProjectName   = snap.ProjectName,
            FileName      = snap.FileName,
            FilePath      = snap.FilePath,
            ChangeType    = "Restored",
            OldContent    = "current",
            NewContent    = snap.Content,
            DiffSummary   = "Restored to original version",
            ChangedAt     = DateTime.UtcNow,
            ChangedBy     = "Binit",
            ChangeReason  = "Restore to original",
            StorageFolderPath = GetChangeFolderPath(snap.ProjectName, DateTime.UtcNow),
        });
        await _db.SaveChangesAsync();
        return snap;
    }

    public async Task<ChangeHistory> RestoreToChangeAsync(int changeId)
    {
        var change = await _db.ChangeHistories.FindAsync(changeId)
            ?? throw new Exception("Change not found");

        _db.ChangeHistories.Add(new ChangeHistory
        {
            SnapshotId    = change.SnapshotId,
            ProjectName   = change.ProjectName,
            FileName      = change.FileName,
            FilePath      = change.FilePath,
            ChangeType    = "Restored",
            NewContent    = change.NewContent,
            DiffSummary   = $"Restored to change #{changeId}",
            ChangedAt     = DateTime.UtcNow,
            ChangedBy     = "Binit",
            ChangeReason  = $"Restore to change #{changeId}",
            StorageFolderPath = GetChangeFolderPath(change.ProjectName, DateTime.UtcNow),
        });
        await _db.SaveChangesAsync();
        return change;
    }

    // ── Folder Path Generators ────────────────────────
    public string GetOriginalFolderPath(string project, DateTime date) =>
        $"snapshots/{project}/originals/{date:yyyy-MM-dd}";

    public string GetChangeFolderPath(string project, DateTime dt) =>
        $"snapshots/{project}/changes/{dt:yyyy-MM-dd}/{dt:HH-mm-ss}";

    // ── Helpers ───────────────────────────────────────
    private static string ComputeHash(string content)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(content));
        return Convert.ToHexString(bytes).ToLower();
    }

    private static (string Summary, int Added, int Deleted, int Modified) ComputeDiff(
        string oldContent, string newContent)
    {
        var oldLines = oldContent.Split('\n');
        var newLines = newContent.Split('\n');

        int added    = newLines.Length - oldLines.Length;
        int deleted  = Math.Max(0, oldLines.Length - newLines.Length);
        int modified = oldLines.Zip(newLines, (o, n) => o != n ? 1 : 0).Sum();

        var summary  = $"+{Math.Max(0, added)} lines added, -{deleted} lines deleted, ~{modified} lines modified";
        return (summary, Math.Max(0, added), deleted, modified);
    }
}
