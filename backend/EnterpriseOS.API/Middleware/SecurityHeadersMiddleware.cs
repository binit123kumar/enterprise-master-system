namespace EnterpriseOS.API.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        // Security headers
        context.Response.Headers["X-Content-Type-Options"]    = "nosniff";
        context.Response.Headers["X-Frame-Options"]           = "DENY";
        context.Response.Headers["X-XSS-Protection"]          = "1; mode=block";
        context.Response.Headers["Referrer-Policy"]           = "strict-origin-when-cross-origin";
        context.Response.Headers["Permissions-Policy"]        = "camera=(), microphone=(), geolocation=()";
        context.Response.Headers["X-EnterpriseOS-Version"]   = "2.0.0";

        // Never expose secrets in responses
        context.Response.Headers.Remove("Server");
        context.Response.Headers.Remove("X-Powered-By");

        await _next(context);
    }
}
