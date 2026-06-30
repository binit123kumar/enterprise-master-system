using Microsoft.AspNetCore.Mvc;
using EnterpriseOS.API.Models;
using EnterpriseOS.API.Services;

namespace EnterpriseOS.API.Controllers;

// ── DeploymentController ──────────────────────────────
[ApiController]
[Route("api/[controller]")]
public class DeploymentController : ControllerBase
{
    private readonly IDeploymentService _svc;
    public DeploymentController(IDeploymentService svc) => _svc = svc;

    // GET /api/deployment/history
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var history = await _svc.GetHistoryAsync();
        return Ok(new ApiResponse<IEnumerable<Deployment>>(true, history, null));
    }

    // POST /api/deployment/deploy
    [HttpPost("deploy")]
    public async Task<IActionResult> Deploy([FromBody] DeploymentRequest request)
    {
        // Triple auth check
        if (!request.VoiceVerified || !request.PinVerified || !request.FingerprintVerified)
            return Unauthorized(new ApiResponse<string>(false, null,
                "Authorization failed. Voice + PIN + Fingerprint all required."));

        var result = await _svc.DeployAsync(request);
        return Ok(new ApiResponse<Deployment>(true, result, "Deployment started"));
    }

    // POST /api/deployment/rollback/{id}
    [HttpPost("rollback/{id}")]
    public async Task<IActionResult> Rollback(int id,
        [FromBody] DeploymentRequest request)
    {
        if (!request.VoiceVerified || !request.PinVerified || !request.FingerprintVerified)
            return Unauthorized(new ApiResponse<string>(false, null, "Authorization failed"));

        var result = await _svc.RollbackAsync(id);
        return Ok(new ApiResponse<Deployment>(true, result, "Rollback initiated"));
    }

    // GET /api/deployment/checklist
    [HttpGet("checklist")]
    public async Task<IActionResult> GetChecklist()
    {
        var checklist = await _svc.GetPreDeployChecklistAsync();
        return Ok(new ApiResponse<object>(true, checklist, null));
    }
}

// ── SecurityController ────────────────────────────────
[ApiController]
[Route("api/[controller]")]
public class SecurityController : ControllerBase
{
    private readonly ISecurityService _svc;
    public SecurityController(ISecurityService svc) => _svc = svc;

    // GET /api/security/logs
    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs()
    {
        var logs = await _svc.GetLogsAsync();
        return Ok(new ApiResponse<IEnumerable<SecurityLog>>(true, logs, null));
    }

    // GET /api/security/score
    [HttpGet("score")]
    public async Task<IActionResult> GetScore()
    {
        var score = await _svc.GetSecurityScoreAsync();
        return Ok(new ApiResponse<object>(true, score, null));
    }

    // POST /api/security/verify/voice
    [HttpPost("verify/voice")]
    public IActionResult VerifyVoice([FromBody] object voiceData)
    {
        // In production: connect to voice recognition service
        return Ok(new ApiResponse<object>(true, new { verified = true, confidence = 98.5 }, "Voice verified"));
    }

    // POST /api/security/verify/pin
    [HttpPost("verify/pin")]
    public IActionResult VerifyPin([FromBody] dynamic body)
    {
        // In production: validate against secure store (never log the PIN)
        string pin = body?.pin ?? "";
        bool valid = !string.IsNullOrEmpty(pin) && pin.Length >= 4;
        return Ok(new ApiResponse<object>(true, new { verified = valid }, valid ? "PIN verified" : "Invalid PIN"));
    }

    // POST /api/security/phoneguard
    [HttpPost("phoneguard")]
    public IActionResult PhoneGuard([FromBody] dynamic body)
    {
        bool enable = body?.enable ?? false;
        return Ok(new ApiResponse<object>(true, new { enabled = enable }, $"Phone Guard {(enable ? "ON" : "OFF")}"));
    }
}

// ── AgentController (AI Commands) ─────────────────────
[ApiController]
[Route("api/[controller]")]
public class AgentController : ControllerBase
{
    private readonly IAIAgentService _svc;
    public AgentController(IAIAgentService svc) => _svc = svc;

    // POST /api/agent/command
    [HttpPost("command")]
    public async Task<IActionResult> ExecuteCommand([FromBody] CommandRequest request)
    {
        var result = await _svc.ExecuteCommandAsync(request.Command, request.Source);
        return Ok(new ApiResponse<object>(true, result, null));
    }

    // GET /api/agent/status
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var status = await _svc.GetAgentStatusAsync();
        return Ok(new ApiResponse<object>(true, status, null));
    }

    // GET /api/agent/prompts
    [HttpGet("prompts")]
    public async Task<IActionResult> GetPrompts()
    {
        var prompts = await _svc.GetSystemPromptsAsync();
        return Ok(new ApiResponse<IEnumerable<SystemPrompt>>(true, prompts, null));
    }

    // POST /api/agent/prompts
    [HttpPost("prompts")]
    public async Task<IActionResult> SavePrompt([FromBody] SystemPrompt prompt)
    {
        var saved = await _svc.SaveSystemPromptAsync(prompt);
        return Ok(new ApiResponse<SystemPrompt>(true, saved, "Prompt saved"));
    }
}

// ── MonitoringController ──────────────────────────────
[ApiController]
[Route("api/[controller]")]
public class MonitoringController : ControllerBase
{
    // GET /api/monitoring/services
    [HttpGet("services")]
    public IActionResult GetServices()
    {
        var services = new[]
        {
            new { name="EnterpriseOS Frontend", url="https://enterprise-os.render.com", status="UP",   pingMs=(int?)42,  uptime="99.9%" },
            new { name="BharatPay API",          url="https://api.bharatpay.com",        status="UP",   pingMs=(int?)87,  uptime="100%"  },
            new { name="SQL Server Database",    url="db.internal:1433",                 status="UP",   pingMs=(int?)12,  uptime="99.8%" },
            new { name="ASP.NET Core Backend",   url="https://backend.render.com",       status="UP",   pingMs=(int?)55,  uptime="99.9%" },
            new { name="Python ML API",          url="https://ml.internal.com",          status="DOWN", pingMs=(int?)null, uptime="97.2%" },
        };
        return Ok(new ApiResponse<object>(true, services, null));
    }

    // GET /api/monitoring/logs
    [HttpGet("logs")]
    public IActionResult GetLogs()
    {
        var logs = new[]
        {
            new { time=DateTime.UtcNow.AddMinutes(-5), level="INFO",  message="Deployment completed", service="DeployAgent" },
            new { time=DateTime.UtcNow.AddMinutes(-20),level="WARN",  message="High memory: 82%",     service="Monitor"     },
            new { time=DateTime.UtcNow.AddMinutes(-45),level="ERROR", message="ML API unreachable",   service="Monitor"     },
            new { time=DateTime.UtcNow.AddMinutes(-60),level="INFO",  message="Build successful",     service="BuildAgent"  },
        };
        return Ok(new ApiResponse<object>(true, logs, null));
    }

    // GET /api/monitoring/metrics
    [HttpGet("metrics")]
    public IActionResult GetMetrics()
    {
        var metrics = new
        {
            cpuUsage    = 24,
            memoryUsage = 68,
            diskUsage   = 41,
            avgResponse = 42,
            uptime      = "99.8%",
            activeUsers = 1
        };
        return Ok(new ApiResponse<object>(true, metrics, null));
    }
}
