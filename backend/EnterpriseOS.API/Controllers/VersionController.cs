using Microsoft.AspNetCore.Mvc;
using EnterpriseOS.API.Models;
using EnterpriseOS.API.Services;

namespace EnterpriseOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VersionController : ControllerBase
{
    private readonly IVersionControlService _svc;
    public VersionController(IVersionControlService svc) => _svc = svc;

    // ══════════════════════════════════════════════════
    //  ORIGINAL SNAPSHOTS
    // ══════════════════════════════════════════════════

    /// GET /api/version/originals
    /// Saare original snapshots
    [HttpGet("originals")]
    public async Task<IActionResult> GetOriginals([FromQuery] string? project)
    {
        var data = await _svc.GetAllOriginalsAsync(project);
        return Ok(new { success = true, data, count = data.Count() });
    }

    /// GET /api/version/originals/5
    /// Ek specific original snapshot
    [HttpGet("originals/{id}")]
    public async Task<IActionResult> GetOriginal(int id)
    {
        var snap = await _svc.GetOriginalAsync(id);
        if (snap == null)
            return NotFound(new { success = false, message = "Snapshot not found" });
        return Ok(new { success = true, data = snap });
    }

    /// POST /api/version/originals
    /// Naya original snapshot save karo
    [HttpPost("originals")]
    public async Task<IActionResult> SaveOriginal([FromBody] SaveSnapshotRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Content))
            return BadRequest(new { success = false, message = "Content required" });

        var snap = await _svc.SaveOriginalAsync(req);
        return CreatedAtAction(nameof(GetOriginal), new { id = snap.Id }, new
        {
            success     = true,
            data        = snap,
            folderPath  = _svc.GetOriginalFolderPath(req.ProjectName, snap.CreatedAt),
            message     = $"✅ Original snapshot saved — {req.FileName} — {snap.CreatedAt:dd MMM yyyy HH:mm:ss}"
        });
    }

    /// POST /api/version/originals/5/restore
    /// Original version pe wapas jao
    [HttpPost("originals/{id}/restore")]
    public async Task<IActionResult> RestoreOriginal(int id)
    {
        var snap = await _svc.RestoreToOriginalAsync(id);
        return Ok(new
        {
            success    = true,
            data       = snap,
            message    = $"↩️ Restored to original — {snap.FileName} — {snap.Version}"
        });
    }

    // ══════════════════════════════════════════════════
    //  CHANGE HISTORY
    // ══════════════════════════════════════════════════

    /// GET /api/version/changes
    /// Saari changes (filter by project/file)
    [HttpGet("changes")]
    public async Task<IActionResult> GetChanges(
        [FromQuery] string? project,
        [FromQuery] string? file)
    {
        var data = await _svc.GetChangesAsync(project, file);
        return Ok(new { success = true, data, count = data.Count() });
    }

    /// GET /api/version/changes/by-date?date=2024-01-15&project=EnterpriseOS
    /// Specific date ki saari changes
    [HttpGet("changes/by-date")]
    public async Task<IActionResult> GetChangesByDate(
        [FromQuery] string date,
        [FromQuery] string? project)
    {
        if (!DateTime.TryParse(date, out var parsedDate))
            return BadRequest(new { success = false, message = "Invalid date format. Use yyyy-MM-dd" });

        var data = await _svc.GetChangesByDateAsync(parsedDate, project);
        return Ok(new
        {
            success = true,
            date    = parsedDate.ToString("dd MMM yyyy"),
            data,
            count   = data.Count()
        });
    }

    /// POST /api/version/changes
    /// Nayi change save karo (auto diff calculate hoga)
    [HttpPost("changes")]
    public async Task<IActionResult> SaveChange([FromBody] SaveChangeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.NewContent))
            return BadRequest(new { success = false, message = "NewContent required" });

        var change = await _svc.SaveChangeAsync(req);
        return CreatedAtAction(nameof(GetChanges), null, new
        {
            success      = true,
            data         = change,
            folderPath   = change.StorageFolderPath,
            diffSummary  = change.DiffSummary,
            message      = $"✅ Change saved — {req.FileName} — {change.ChangedAt:dd MMM yyyy HH:mm:ss}"
        });
    }

    /// POST /api/version/changes/5/restore
    /// Kisi bhi purani change pe wapas jao
    [HttpPost("changes/{id}/restore")]
    public async Task<IActionResult> RestoreChange(int id)
    {
        var change = await _svc.RestoreToChangeAsync(id);
        return Ok(new
        {
            success = true,
            data    = change,
            message = $"↩️ Restored to change #{id} — {change.FileName}"
        });
    }

    // ══════════════════════════════════════════════════
    //  COMPARE / DIFF
    // ══════════════════════════════════════════════════

    /// POST /api/version/compare/5
    /// Original vs new content ka diff dekho
    [HttpPost("compare/{snapshotId}")]
    public async Task<IActionResult> Compare(
        int snapshotId,
        [FromBody] CompareRequest req)
    {
        var diff = await _svc.CompareAsync(snapshotId, req.NewContent);
        return Ok(new
        {
            success = true,
            data    = diff,
            message = $"Diff: {diff.DiffSummary}"
        });
    }

    // ══════════════════════════════════════════════════
    //  TIMELINE — Full history of a file
    // ══════════════════════════════════════════════════

    /// GET /api/version/timeline?project=EnterpriseOS&file=AgentDashboard.jsx
    /// Ek file ki poori history (original + all changes) sorted by date
    [HttpGet("timeline")]
    public async Task<IActionResult> GetTimeline(
        [FromQuery] string project,
        [FromQuery] string file)
    {
        var originals = await _svc.GetAllOriginalsAsync(project);
        var original  = originals.FirstOrDefault(o => o.FileName == file);

        var changes   = await _svc.GetChangesAsync(project, file);

        var timeline  = new List<object>();

        // Add original as first entry
        if (original != null)
            timeline.Add(new
            {
                type        = "original",
                date        = original.CreatedAt.ToString("dd MMM yyyy HH:mm:ss"),
                dateRaw     = original.CreatedAt,
                version     = original.Version,
                fileName    = original.FileName,
                description = original.Description,
                sizeBytes   = original.FileSizeBytes,
                by          = original.CreatedBy,
                id          = original.Id
            });

        // Add all changes
        foreach (var c in changes)
            timeline.Add(new
            {
                type         = "change",
                date         = c.ChangedAt.ToString("dd MMM yyyy HH:mm:ss"),
                dateRaw      = c.ChangedAt,
                changeType   = c.ChangeType,
                fileName     = c.FileName,
                diffSummary  = c.DiffSummary,
                linesAdded   = c.LinesAdded,
                linesDeleted = c.LinesDeleted,
                commitMsg    = c.CommitMessage,
                branch       = c.Branch,
                by           = c.ChangedBy,
                folderPath   = c.StorageFolderPath,
                id           = c.Id,
                isDeployed   = c.IsDeployed
            });

        // Sort by date ascending
        var sorted = timeline
            .OrderBy(t => ((dynamic)t).dateRaw)
            .ToList();

        return Ok(new
        {
            success  = true,
            project,
            file,
            total    = sorted.Count,
            timeline = sorted
        });
    }

    // ══════════════════════════════════════════════════
    //  FOLDER STRUCTURE
    // ══════════════════════════════════════════════════

    /// GET /api/version/folders?project=EnterpriseOS
    /// All storage folders for a project
    [HttpGet("folders")]
    public IActionResult GetFolders([FromQuery] string? project)
    {
        var structure = new
        {
            project     = project ?? "EnterpriseOS",
            basePath    = "snapshots/",
            folders     = new[]
            {
                new
                {
                    name        = "originals",
                    path        = $"snapshots/{project}/originals/",
                    description = "Pehli baar save ki gayi files — date-wise folders",
                    example     = $"snapshots/{project}/originals/2024-01-15/AgentDashboard.jsx"
                },
                new
                {
                    name        = "changes",
                    path        = $"snapshots/{project}/changes/",
                    description = "Har nayi change — date + time ke alag folders mein",
                    example     = $"snapshots/{project}/changes/2024-01-15/14-30-22/AgentDashboard.jsx"
                }
            }
        };
        return Ok(new { success = true, data = structure });
    }

    // ══════════════════════════════════════════════════
    //  STATS
    // ══════════════════════════════════════════════════

    /// GET /api/version/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var originals = await _svc.GetAllOriginalsAsync();
        var changes   = await _svc.GetChangesAsync();

        return Ok(new
        {
            success   = true,
            data      = new
            {
                totalOriginals = originals.Count(),
                totalChanges   = changes.Count(),
                todayChanges   = changes.Count(c => c.ChangedAt.Date == DateTime.UtcNow.Date),
                modifiedFiles  = changes.Count(c => c.ChangeType == "Modified"),
                addedFiles     = changes.Count(c => c.ChangeType == "Added"),
                deletedFiles   = changes.Count(c => c.ChangeType == "Deleted"),
                restoredFiles  = changes.Count(c => c.ChangeType == "Restored"),
            }
        });
    }
}

public record CompareRequest(string NewContent);
