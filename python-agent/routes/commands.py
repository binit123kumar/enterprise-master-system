"""Command processing routes"""
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter()

class VoiceCommand(BaseModel):
    audio_base64: Optional[str] = None
    transcript: Optional[str] = None

class TextCommand(BaseModel):
    text: str
    language: str = "auto"  # hindi | english | auto

@router.post("/voice")
async def process_voice(cmd: VoiceCommand):
    """Process voice command transcript"""
    text = cmd.transcript or ""
    return {
        "received":  text,
        "processed": True,
        "timestamp": datetime.utcnow().isoformat(),
        "next":      "Forwarding to AI engine..."
    }

@router.post("/text")
async def process_text(cmd: TextCommand):
    """Process text command"""
    return {
        "received":  cmd.text,
        "language":  cmd.language,
        "processed": True,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/history")
async def get_history():
    """Get recent command history"""
    return {
        "commands": [
            {"time": "10:42", "cmd": "Deploy production", "status": "Executed"},
            {"time": "10:31", "cmd": "Push to GitHub",    "status": "Executed"},
            {"time": "09:20", "cmd": "Rollback",          "status": "Blocked — Auth required"},
        ]
    }
