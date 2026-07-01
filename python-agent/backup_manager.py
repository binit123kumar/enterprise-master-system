import shutil
import json
from pathlib import Path
from datetime import datetime
from typing import Dict

class BackupManager:
    def __init__(self, backup_base_path="D:\\ITCell\\Backups"):
        self.backup_base_path = Path(backup_base_path)
        self.backup_base_path.mkdir(parents=True, exist_ok=True)
    
    def create_backup(self, repo_path: str, repo_name: str) -> Dict:
        """Create backup before modification"""
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            backup_folder = self.backup_base_path / f"{repo_name}_{timestamp}"
            
            print(f"💾 Creating backup: {backup_folder}")
            
            shutil.copytree(repo_path, backup_folder)
            
            backup_info = {
                "repo_name": repo_name,
                "repo_path": repo_path,
                "backup_path": str(backup_folder),
                "timestamp": timestamp,
                "created_at": datetime.now().isoformat()
            }
            
            # Save metadata
            metadata_file = backup_folder / "backup_metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(backup_info, f, indent=2)
            
            print(f"✅ Backup created: {backup_folder}")
            return backup_info
        
        except Exception as e:
            print(f"❌ Backup error: {e}")
            return {"error": str(e)}
    
    def list_backups(self, repo_name: str = None):
        """List all backups"""
        print(f"\n📚 Available Backups:")
        
        for backup_folder in self.backup_base_path.iterdir():
            if backup_folder.is_dir():
                if repo_name is None or repo_name in backup_folder.name:
                    print(f"  📁 {backup_folder.name}")
    
    def restore_backup(self, backup_path: str, restore_to: str) -> bool:
        """Restore from backup"""
        try:
            print(f"♻️ Restoring from: {backup_path}")
            
            # Remove current
            if Path(restore_to).exists():
                shutil.rmtree(restore_to)
            
            # Restore backup
            shutil.copytree(backup_path, restore_to)
            
            print(f"✅ Restored to: {restore_to}")
            return True
        
        except Exception as e:
            print(f"❌ Restore error: {e}")
            return False

if __name__ == "__main__":
    backup = BackupManager()
    
    # Test
    info = backup.create_backup("D:\\ITCell\\CGS", "CGS")
    print(info)
    
    backup.list_backups()