using Microsoft.AspNetCore.Mvc;
using EnterpriseOS.API.Models;
using EnterpriseOS.API.Services;

namespace EnterpriseOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _svc;
    public AuditController(IAuditService svc) => _svc = svc;

    // GET /api/audit/logs?limit=50
    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] int limit = 50)
    {
        var logs = await _svc.GetLogsAsync(limit);
        return Ok(new ApiResponse<IEnumerable<AuditLog>>(true, logs, null));
    }
}
