using Microsoft.AspNetCore.SignalR;

namespace EnterpriseOS.API.Hubs;

// ── LogHub — Real-time log streaming via WebSocket ────
public class LogHub : Hub
{
    // Client connects
    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("Connected", new
        {
            message   = "✅ Connected to EnterpriseOS Live Log Stream",
            timestamp = DateTime.UtcNow.ToString("HH:mm:ss"),
            clientId  = Context.ConnectionId
        });
        await base.OnConnectedAsync();
    }

    // Client disconnects
    public override async Task OnDisconnectedAsync(Exception? ex)
    {
        await base.OnDisconnectedAsync(ex);
    }

    // Client joins a project room
    public async Task JoinProject(string projectName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, projectName);
        await Clients.Caller.SendAsync("JoinedProject", new
        {
            project   = projectName,
            message   = $"Joined log stream for {projectName}",
            timestamp = DateTime.UtcNow.ToString("HH:mm:ss")
        });
    }

    // Client leaves a project room
    public async Task LeaveProject(string projectName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, projectName);
    }

    // Broadcast log to all clients
    public async Task BroadcastLog(string level, string message, string service)
    {
        await Clients.All.SendAsync("ReceiveLog", new
        {
            level,
            message,
            service,
            time = DateTime.UtcNow.ToString("HH:mm:ss")
        });
    }
}

// ── LogBroadcastService — Push logs from anywhere ─────
public class LogBroadcastService
{
    private readonly IHubContext<LogHub> _hub;
    public LogBroadcastService(IHubContext<LogHub> hub) => _hub = hub;

    public async Task BroadcastAsync(string level, string message, string service, string? project = null)
    {
        var log = new
        {
            level,
            message,
            service,
            time    = DateTime.UtcNow.ToString("HH:mm:ss"),
            project = project ?? "System"
        };

        if (project != null)
            await _hub.Clients.Group(project).SendAsync("ReceiveLog", log);
        else
            await _hub.Clients.All.SendAsync("ReceiveLog", log);
    }

    public async Task BroadcastDeploymentAsync(string projectName, string status, string version)
    {
        await _hub.Clients.All.SendAsync("DeploymentUpdate", new
        {
            projectName,
            status,
            version,
            time = DateTime.UtcNow.ToString("HH:mm:ss")
        });
    }

    public async Task BroadcastMetricsAsync(object metrics)
    {
        await _hub.Clients.All.SendAsync("MetricsUpdate", metrics);
    }
}
