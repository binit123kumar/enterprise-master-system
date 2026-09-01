using EnterpriseOS.API.Data;
using EnterpriseOS.API.Services;
using EnterpriseOS.API.Middleware;
using EnterpriseOS.API.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Services ──────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR(); // WebSocket

// SQL Server - Main DB
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// SQL Server - Version DB
builder.Services.AddDbContext<VersionDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Custom Services
builder.Services.AddScoped<IProjectService,         ProjectService>();
builder.Services.AddScoped<IDeploymentService,      DeploymentService>();
builder.Services.AddScoped<IGitService,             GitService>();
builder.Services.AddScoped<ISecurityService,        SecurityService>();
builder.Services.AddScoped<IAIAgentService,         AIAgentService>();
builder.Services.AddScoped<IAuditService,           AuditService>();
builder.Services.AddScoped<IVersionControlService,  VersionControlService>();
builder.Services.AddSingleton<LogBroadcastService>();

// JWT Authentication
var jwtSecret = builder.Configuration["AppSettings:JwtSecret"]
    ?? "EnterpriseOS_Super_Secret_Key_Min32Chars!!";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = "EnterpriseOS",
            ValidAudience            = "EnterpriseOS-Client",
            IssuerSigningKey         = new SymmetricSecurityKey(
                                           Encoding.UTF8.GetBytes(jwtSecret)),
        };
        // Allow JWT in WebSocket query string
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var token = ctx.Request.Query["access_token"];
                var path  = ctx.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(token) && path.StartsWithSegments("/hubs"))
                    ctx.Token = token;
                return Task.CompletedTask;
            }
        };
    });

// CORS
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
            "http://localhost:3000",
            "https://enterprise-master-system.vercel.app",
            "https://enterprise-os.render.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));  // Required for SignalR

// ── App ───────────────────────────────────────────────
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// WebSocket / SignalR Hub
app.MapHub<LogHub>("/hubs/logs");

// Health check
app.MapGet("/health", () => new {
    status    = "healthy",
    version   = "2.0.0",
    timestamp = DateTime.UtcNow,
    features  = new[] { "JWT", "SignalR", "SQL Server", "GitHub API", "Render API" }
});

app.Run();
// Auto DB migration on startup
// builder.Services.AddHostedService<DatabaseMigrationService>();
