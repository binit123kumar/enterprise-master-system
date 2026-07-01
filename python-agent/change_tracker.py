import json
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List

class ChangeTracker:
    def __init__(self, db_connection_string: str = None):
        self.db_connection = db_connection_string
        self.changes_log = []
    
    def track_repo_changes(self, repo_path: str, repo_name: str) -> Dict:
        """Track all changes in repo"""
        try:
            repo_path = Path(repo_path)
            
            # Get git status
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=repo_path,
                capture_output=True,
                text=True
            )
            
            changes = result.stdout.strip().split('\n') if result.stdout.strip() else []
            
            # Get last commit
            commit_result = subprocess.run(
                ["git", "log", "-1", "--format=%H|%an|%s"],
                cwd=repo_path,
                capture_output=True,
                text=True
            )
            
            last_commit = {}
            if commit_result.stdout:
                parts = commit_result.stdout.strip().split("|")
                last_commit = {
                    "hash": parts[0][:7],
                    "author": parts[1],
                    "message": parts[2]
                }
            
            # Get branch
            branch_result = subprocess.run(
                ["git", "branch", "--show-current"],
                cwd=repo_path,
                capture_output=True,
                text=True
            )
            
            current_branch = branch_result.stdout.strip()
            
            change_record = {
                "timestamp": datetime.now().isoformat(),
                "repository": repo_name,
                "path": str(repo_path),
                "branch": current_branch,
                "changes_count": len([c for c in changes if c]),
                "changed_files": changes,
                "last_commit": last_commit,
                "status": "modified" if changes else "clean"
            }
            
            self.changes_log.append(change_record)
            
            return change_record
        
        except Exception as e:
            print(f"❌ Error tracking {repo_name}: {e}")
            return {"error": str(e)}
    
    def save_changes_to_db(self, change_record: Dict):
        """Save to database"""
        try:
            print(f"💾 Saving changes for: {change_record['repository']}")
            
            # TODO: Connect to SQL Server
            # For now, save to JSON
            log_file = Path(f"D:\\ITCell\\Logs\\{change_record['repository']}_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json")
            log_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(log_file, 'w') as f:
                json.dump(change_record, f, indent=2)
            
            print(f"✅ Saved: {log_file}")
            return True
        
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def track_all_repos(self, repos_path: str = "D:\\ITCell") -> List[Dict]:
        """Track changes in all repos"""
        repos_path = Path(repos_path)
        tracked = []
        
        for folder in repos_path.iterdir():
            if folder.is_dir() and (folder / ".git").exists():
                print(f"\n📊 Tracking: {folder.name}")
                
                changes = self.track_repo_changes(str(folder), folder.name)
                
                if "error" not in changes:
                    self.save_changes_to_db(changes)
                    tracked.append(changes)
        
        return tracked

if __name__ == "__main__":
    tracker = ChangeTracker()
    
    # Track all repos
    changes = tracker.track_all_repos()
    
    print(f"\n✅ Tracked {len(changes)} repositories")