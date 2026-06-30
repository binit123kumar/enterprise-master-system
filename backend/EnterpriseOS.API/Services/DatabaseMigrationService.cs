using EnterpriseOS.API.Data;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseOS.API.Services;

// ── Auto-runs migrations on startup ──────────────────
public class DatabaseMigrationService : IHostedService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<DatabaseMigrationService> _logger;

    public DatabaseMigrationService(
        IServiceProvider services,
        ILogger<DatabaseMigrationService> logger)
    {
        _services = services;
        _logger   = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _services.CreateScope();
        try
        {
            _logger.LogInformation("🗄️ Running database migrations...");

            var appDb = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await appDb.Database.MigrateAsync(cancellationToken);

            var verDb = scope.ServiceProvider.GetRequiredService<VersionDbContext>();
            await verDb.Database.MigrateAsync(cancellationToken);

            _logger.LogInformation("✅ Database migrations completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Database migration failed: {Message}", ex.Message);
            // Don't throw — allow app to start even if DB is temporarily unavailable
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
