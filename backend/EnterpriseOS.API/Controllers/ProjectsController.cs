using Microsoft.AspNetCore.Mvc;
using EnterpriseOS.API.Models;
using EnterpriseOS.API.Services;

namespace EnterpriseOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _svc;
    public ProjectsController(IProjectService svc) => _svc = svc;

    // GET /api/projects
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await _svc.GetAllAsync();
        return Ok(new ApiResponse<IEnumerable<Project>>(true, projects, null));
    }

    // GET /api/projects/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _svc.GetByIdAsync(id);
        if (project == null) return NotFound(new ApiResponse<Project>(false, null, "Project not found"));
        return Ok(new ApiResponse<Project>(true, project, null));
    }

    // POST /api/projects
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Project project)
    {
        var created = await _svc.CreateAsync(project);
        return CreatedAtAction(nameof(GetById), new { id = created.Id },
            new ApiResponse<Project>(true, created, "Project created"));
    }

    // PUT /api/projects/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Project project)
    {
        var updated = await _svc.UpdateAsync(id, project);
        if (updated == null) return NotFound();
        return Ok(new ApiResponse<Project>(true, updated, "Project updated"));
    }

    // DELETE /api/projects/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _svc.DeleteAsync(id);
        if (!success) return NotFound();
        return Ok(new ApiResponse<bool>(true, true, "Project deleted"));
    }

    // GET /api/projects/5/health
    [HttpGet("{id}/health")]
    public async Task<IActionResult> GetHealth(int id)
    {
        var health = await _svc.GetHealthAsync(id);
        return Ok(new ApiResponse<object>(true, health, null));
    }
}
