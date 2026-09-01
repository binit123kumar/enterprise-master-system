using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EnterpriseOS.API.Controllers;

// ── AuthController ────────────────────────────────────
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly Services.IAuditService _audit;
    public AuthController(IConfiguration config, Services.IAuditService audit)
    {
        _config = config;
        _audit  = audit;
    }

    public record LoginRequest(string Username, string Password);
    public record LoginResponse(string Token, string Name, string Role, DateTime Expires);

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        // In production: validate against DB with hashed passwords
        // Demo: only Binit can login
        if (req.Username != "Binit" || req.Password != "admin123")
        {
            await _audit.LogAsync("login", "Dashboard", "Failed", "Medium", ip, "Auth");
            return Unauthorized(new { success = false, message = "Invalid credentials" });
        }

        await _audit.LogAsync("login", "Dashboard", "Success", "Low", ip, "Auth");

        var token   = GenerateJwtToken(req.Username, "owner");
        var expires = DateTime.UtcNow.AddHours(24);

        return Ok(new LoginResponse(token, req.Username, "owner", expires));
    }

    // POST /api/auth/refresh
    [HttpPost("refresh")]
    public IActionResult Refresh()
    {
        var name  = User.FindFirst(ClaimTypes.Name)?.Value ?? "Binit";
        var role  = User.FindFirst(ClaimTypes.Role)?.Value ?? "owner";
        var token = GenerateJwtToken(name, role);
        return Ok(new { token });
    }

    // GET /api/auth/me
    [HttpGet("me")]
    public IActionResult Me()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();
        return Ok(new {
            name = User.FindFirst(ClaimTypes.Name)?.Value,
            role = User.FindFirst(ClaimTypes.Role)?.Value,
        });
    }

    private string GenerateJwtToken(string username, string role)
    {
        var secret  = _config["AppSettings:JwtSecret"] ?? "EnterpriseOS_Super_Secret_Key_Min32Chars!!";
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:   "EnterpriseOS",
            audience: "EnterpriseOS-Client",
            claims:   claims,
            expires:  DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
