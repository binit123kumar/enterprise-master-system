import json
from pathlib import Path
from datetime import datetime

class LoggerSystem:
    def __init__(self, log_base_path="D:\\ITCell\\Logs"):
        self.log_base_path = Path(log_base_path)
        self.log_base_path.mkdir(parents=True, exist_ok=True)
    
    def create_log(self, repo_name: str, action: str, details: dict) -> str:
        """Create detailed log"""
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            log_file = self.log_base_path / f"{repo_name}_{timestamp}.json"
            
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "repository": repo_name,
                "action": action,
                "details": details,
                "status": "success" if details.get("success") else "failed"
            }
            
            with open(log_file, 'w') as f:
                json.dump(log_entry, f, indent=2)
            
            print(f"📝 Log created: {log_file}")
            return str(log_file)
        
        except Exception as e:
            print(f"❌ Log error: {e}")
            return None
    
    def get_logs(self, repo_name: str = None):
        """Get all logs"""
        logs = []
        
        for log_file in self.log_base_path.glob("*.json"):
            if repo_name is None or repo_name in log_file.name:
                with open(log_file, 'r') as f:
                    logs.append(json.load(f))
        
        return logs

if __name__ == "__main__":
    logger = LoggerSystem()
    
    logger.create_log("CGS", "update_media", {
        "files_modified": ["image.jpg", "banner.png"],
        "success": True
    })
    
    logs = logger.get_logs("CGS")
    print(json.dumps(logs, indent=2))