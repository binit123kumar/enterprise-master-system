using Microsoft.EntityFrameworkCore;
using EnterpriseOS.API.Models;

namespace EnterpriseOS.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Deployment> Deployments { get; set; }
    public DbSet<GitCommit> GitCommits { get; set; }
    public DbSet<MonitoringLog> MonitoringLogs { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<SecurityLog> SecurityLogs { get; set; }
    public DbSet<SystemPrompt> SystemPrompts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Deployment>()
            .HasOne(d => d.Project)
            .WithMany(p => p.Deployments)
            .HasForeignKey(d => d.ProjectId);

        base.OnModelCreating(modelBuilder);
    }
}