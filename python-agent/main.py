"""
EnterpriseOS Python AI Agent
============================
FastAPI-based AI agent that processes voice/text commands
and integrates with Claude API for intelligent responses.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import anthropic
import os
from datetime import datetime
from routes import commands, prompts, monitoring

app = FastAPI(
    title="EnterpriseOS AI Agent",
    description="Binit's Enterprise AI Agent - Voice & Text Command Processor",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://enterprise-os.render.com",
        "http://localhost:5000",  # ASP.NET backend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(commands.router, prefix="/commands",   tags=["Commands"])
app.include_router(prompts.router,  prefix="/prompts",    tags=["Prompts"])
app.include_router(monitoring.router,prefix="/monitoring",tags=["Monitoring"])

# ── Models ────────────────────────────────────────────
class CommandRequest(BaseModel):
    command: str
    source: str = "text"   # voice | text
    owner: str = "Binit"
    context: Optional[dict] = None

class CommandResponse(BaseModel):
    command: str
    result: str
    action_taken: str
    requires_auth: bool
    timestamp: str

# ── Protected commands that need auth ────────────────
PROTECTED_COMMANDS = [
    "deploy", "push", "rollback", "restart",
    "delete", "drop", "migrate", "secret"
]

# ── Main execute endpoint ─────────────────────────────
@app.post("/execute", response_model=CommandResponse)
async def execute_command(req: CommandRequest):
    """Main command execution endpoint called by ASP.NET backend"""
    command_lower = req.command.lower()

    # Check if protected
    requires_auth = any(word in command_lower for word in PROTECTED_COMMANDS)

    # Call Claude API for intelligent processing
    result = await process_with_claude(req.command, req.context)

    return CommandResponse(
        command      = req.command,
        result       = result["response"],
        action_taken = result["action"],
        requires_auth= requires_auth,
        timestamp    = datetime.utcnow().isoformat()
    )

async def process_with_claude(command: str, context: Optional[dict]) -> dict:
    """Send command to Claude API for intelligent processing"""
    try:
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

        system_prompt = """You are Binit's Enterprise AI Agent.
You process voice and text commands for software development, deployment and operations.

Rules:
1. Be concise and actionable
2. For protected operations (deploy, push, delete): say auth is required
3. Always respond in Hindi or English based on the command language
4. Format: briefly explain what action you will take

Owner: Binit
System: EnterpriseOS v2.0.0"""

        message = client.messages.create(
            model      = "claude-sonnet-4-6",
            max_tokens = 500,
            system     = system_prompt,
            messages   = [{"role": "user", "content": command}]
        )

        response_text = message.content[0].text

        # Determine action taken
        action = determine_action(command)

        return {"response": response_text, "action": action}

    except Exception as e:
        # Fallback if API unavailable
        return {
            "response": f"Command '{command}' received. Processing...",
            "action":   "queued"
        }

def determine_action(command: str) -> str:
    """Map command to action type"""
    cmd = command.lower()
    if "deploy"   in cmd: return "deployment_requested"
    if "build"    in cmd: return "build_triggered"
    if "test"     in cmd: return "tests_initiated"
    if "push"     in cmd: return "git_push_requested"
    if "commit"   in cmd: return "git_commit_requested"
    if "log"      in cmd: return "logs_fetched"
    if "rollback" in cmd: return "rollback_requested"
    if "status"   in cmd: return "status_checked"
    if "scan"     in cmd: return "security_scan_initiated"
    return "command_processed"

# ── Health check ──────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status":    "healthy",
        "agent":     "EnterpriseOS AI Agent",
        "version":   "2.0.0",
        "owner":     "Binit",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
async def root():
    return {"message": "EnterpriseOS AI Agent v2.0.0 — Binit's Master System"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
