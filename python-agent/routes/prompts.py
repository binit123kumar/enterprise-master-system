"""Prompt management routes"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PromptModel(BaseModel):
    name: str
    content: str
    platform: str = "claude-sonnet-4-6"
    category: str = "General"

@router.get("/")
async def list_prompts():
    return {"prompts": [
        {"id": 1, "name": "Master AI Agent",    "platform": "Claude", "status": "Active"},
        {"id": 2, "name": "Code Review Agent",  "platform": "Claude", "status": "Active"},
        {"id": 3, "name": "Deployment Guard",   "platform": "AutoGen","status": "Active"},
    ]}

@router.post("/")
async def create_prompt(prompt: PromptModel):
    return {"success": True, "message": f"Prompt '{prompt.name}' saved"}

@router.post("/{prompt_id}/deploy")
async def deploy_prompt(prompt_id: int):
    return {"success": True, "message": f"Prompt {prompt_id} deployed to agent"}
