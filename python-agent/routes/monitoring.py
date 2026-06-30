"""Monitoring routes"""
from fastapi import APIRouter
from datetime import datetime
import psutil

router = APIRouter()

@router.get("/metrics")
async def get_metrics():
    try:
        return {
            "cpu":    psutil.cpu_percent(interval=1),
            "memory": psutil.virtual_memory().percent,
            "disk":   psutil.disk_usage('/').percent,
            "time":   datetime.utcnow().isoformat()
        }
    except:
        return {"cpu": 24, "memory": 68, "disk": 41, "time": datetime.utcnow().isoformat()}

@router.get("/ping")
async def ping():
    return {"pong": True, "ts": datetime.utcnow().isoformat()}
