import subprocess
from pathlib import Path
from typing import List, Dict

class GitManager:
    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)
        self.git_folder = self.repo_path / ".git"
    
    def check_if_git(self) -> bool:
        """Check if folder is git repo"""
        return self.git_folder.exists()
    
    def get_current_branch(self) -> str:
        """Get current git branch"""
        try:
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            return result.stdout.strip()
        except Exception as e:
            return f"Error: {e}"
    
    def get_git_status(self) -> Dict:
        """Get git status"""
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            
            changes = result.stdout.strip().split('\n') if result.stdout.strip() else []
            
            return {
                "has_changes": len(changes) > 0,
                "changes_count": len(changes),
                "files": changes
            }
        except Exception as e:
            return {"error": str(e)}
    
    def pull_latest(self) -> bool:
        """Git pull latest changes"""
        try:
            print(f"🔄 Pulling latest in {self.repo_path.name}...")
            result = subprocess.run(
                ["git", "pull"],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            print(f"✅ Pull complete")
            return True
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def check_conflicts(self) -> bool:
        """Check for merge conflicts"""
        try:
            status = self.get_git_status()
            
            for file in status.get("files", []):
                if "UU" in file or "AA" in file or "DD" in file:
                    return True
            
            return False
        except:
            return False
    
    def get_last_commit(self) -> Dict:
        """Get last commit info"""
        try:
            result = subprocess.run(
                ["git", "log", "-1", "--format=%H|%an|%ae|%ai|%s"],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            
            if result.stdout:
                parts = result.stdout.strip().split("|")
                return {
                    "hash": parts[0][:7],
                    "author": parts[1],
                    "email": parts[2],
                    "date": parts[3],
                    "message": parts[4]
                }
            return None
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    git = GitManager("D:\\ITCell\\CGS")
    
    print(f"✅ Is Git Repo: {git.check_if_git()}")
    print(f"📍 Current Branch: {git.get_current_branch()}")
    print(f"📊 Status: {git.get_git_status()}")
    print(f"⚠️ Has Conflicts: {git.check_conflicts()}")
    print(f"📝 Last Commit: {git.get_last_commit()}")