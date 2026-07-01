import os
import json
from pathlib import Path
from typing import List, Dict

class RepositoryDetector:
    def __init__(self, base_path="D:\\ITCell"):
        self.base_path = Path(base_path)
        self.repositories = []
    
    def scan_repositories(self) -> List[Dict]:
        """Auto-detect all repositories"""
        print(f"\n🔍 Scanning: {self.base_path}")
        
        if not self.base_path.exists():
            print(f"❌ Path not found: {self.base_path}")
            return []
        
        try:
            for folder in self.base_path.iterdir():
                if folder.is_dir():
                    git_path = folder / ".git"
                    
                    # Check if it's a git repo
                    if git_path.exists():
                        repo_info = {
                            "name": folder.name,
                            "path": str(folder),
                            "git_path": str(git_path),
                            "files_count": len(list(folder.rglob("*"))),
                            "is_git": True
                        }
                        self.repositories.append(repo_info)
                        print(f"✅ Found: {folder.name}")
            
            print(f"\n📊 Total repositories found: {len(self.repositories)}")
            return self.repositories
        
        except Exception as e:
            print(f"❌ Error scanning: {e}")
            return []
    
    def get_repository(self, name: str) -> Dict:
        """Get specific repository by name"""
        for repo in self.repositories:
            if repo["name"].lower() == name.lower():
                return repo
        return None
    
    def list_repositories(self):
        """Print all repositories"""
        print("\n📚 Available Repositories:")
        for i, repo in enumerate(self.repositories, 1):
            print(f"{i}. {repo['name']}")
            print(f"   Path: {repo['path']}")
            print(f"   Files: {repo['files_count']}")
    
    def export_to_json(self, filepath="repositories.json"):
        """Export repo list to JSON"""
        with open(filepath, 'w') as f:
            json.dump(self.repositories, f, indent=2)
        print(f"✅ Saved to {filepath}")

if __name__ == "__main__":
    detector = RepositoryDetector()
    repos = detector.scan_repositories()
    detector.list_repositories()
    detector.export_to_json()