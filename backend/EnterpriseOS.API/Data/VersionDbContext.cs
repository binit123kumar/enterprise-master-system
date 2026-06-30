using Microsoft.EntityFrameworkCore;
using EnterpriseOS.API.Models;

namespace EnterpriseOS.API.Data;

public class VersionDbContext : DbContext
{
    public VersionDbContext(DbContextOptions<VersionDbContext> options) : base(options) { }

    // Tables
    public DbSet<OriginalSnapshot>  OriginalSnapshots  { get; set; }
    public DbSet<ChangeHistory>     ChangeHistories    { get; set; }
    public DbSet<FileVersionFolder> FileVersionFolders { get; set; }

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ── OriginalSnapshot ──────────────────────────
        b.Entity<OriginalSnapshot>(e =>
        {
            e.ToTable("OriginalSnapshots");
            e.HasKey(x => x.Id);
            e.Property(x => x.ProjectName).HasMaxLength(200).IsRequired();
            e.Property(x => x.FileName).HasMaxLength(300).IsRequired();
            e.Property(x => x.FilePath).HasMaxLength(500);
            e.Property(x => x.Content).HasColumnType("nvarchar(max)");
            e.Property(x => x.ContentHash).HasMaxLength(64);
            e.Property(x => x.CreatedBy).HasMaxLength(100);
            e.Property(x => x.Version).HasMaxLength(20);
            e.HasIndex(x => new { x.ProjectName, x.FileName });
            e.HasIndex(x => x.CreatedAt);
        });

        // ── ChangeHistory ─────────────────────────────
        b.Entity<ChangeHistory>(e =>
        {
            e.ToTable("ChangeHistory");
            e.HasKey(x => x.Id);
            e.Property(x => x.ProjectName).HasMaxLength(200).IsRequired();
            e.Property(x => x.FileName).HasMaxLength(300).IsRequired();
            e.Property(x => x.FilePath).HasMaxLength(500);
            e.Property(x => x.ChangeType).HasMaxLength(50);
            e.Property(x => x.OldContent).HasColumnType("nvarchar(max)");
            e.Property(x => x.NewContent).HasColumnType("nvarchar(max)");
            e.Property(x => x.DiffSummary).HasMaxLength(500);
            e.Property(x => x.CommitHash).HasMaxLength(40);
            e.Property(x => x.CommitMessage).HasMaxLength(500);
            e.Property(x => x.Branch).HasMaxLength(100);
            e.Property(x => x.ChangedBy).HasMaxLength(100);
            e.Property(x => x.Version).HasMaxLength(20);
            e.Property(x => x.StorageFolderPath).HasMaxLength(500);

            // FK → OriginalSnapshot
            e.HasOne(x => x.Snapshot)
             .WithMany(x => x.Changes)
             .HasForeignKey(x => x.SnapshotId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(x => x.ChangedAt);
            e.HasIndex(x => new { x.ProjectName, x.FileName });
            e.HasIndex(x => x.ChangeType);
        });

        // ── FileVersionFolder ─────────────────────────
        b.Entity<FileVersionFolder>(e =>
        {
            e.ToTable("FileVersionFolders");
            e.HasKey(x => x.Id);
            e.Property(x => x.ProjectName).HasMaxLength(200);
            e.Property(x => x.FolderType).HasMaxLength(50);
            e.Property(x => x.FolderPath).HasMaxLength(500);
            e.Property(x => x.Label).HasMaxLength(200);
        });

        // ── Seed Data ─────────────────────────────────
        b.Entity<OriginalSnapshot>().HasData(
            new OriginalSnapshot
            {
                Id          = 1,
                ProjectName = "EnterpriseOS",
                FileName    = "AgentDashboard.jsx",
                FilePath    = "src/pages/Dashboard/",
                Content     = "// AgentDashboard.jsx - Initial version\nexport default function AgentDashboard() { return <div>Dashboard</div>; }",
                ContentHash = "abc123def456",
                FileSizeBytes = 1024,
                CreatedBy   = "Binit",
                CreatedAt   = new DateTime(2024, 1, 15, 10, 0, 0, DateTimeKind.Utc),
                Version     = "v1.0.0",
                Description = "Initial release of Agent Dashboard"
            },
            new OriginalSnapshot
            {
                Id          = 2,
                ProjectName = "EnterpriseOS",
                FileName    = "GitControlPanel.jsx",
                FilePath    = "src/pages/GitControl/",
                Content     = "// GitControlPanel.jsx - Initial version\nexport default function GitControlPanel() { return <div>Git</div>; }",
                ContentHash = "xyz789uvw012",
                FileSizeBytes = 892,
                CreatedBy   = "Binit",
                CreatedAt   = new DateTime(2024, 1, 15, 10, 5, 0, DateTimeKind.Utc),
                Version     = "v1.0.0",
                Description = "Initial Git Control Panel"
            }
        );
    }
}
