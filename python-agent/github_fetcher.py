import os
import json
import subprocess
from pathlib import Path
from typing import List, Dict
import requests

class GitHubFetcher:
    def __init__(self, github_token: str, local_base_path="D:\\ITCell"):
        self.github_token = github_token
        self.local_base_path = Path(local_base_path)
        self.local_base_path.mkdir(parents=True, exist_ok=True)
        
        self.headers = {
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
    
    def get_user_repos(self, username: str) -> List[Dict]:
        """Fetch all repos from GitHub"""
        print(f"\n🐙 Fetching repos from GitHub: {username}")
        
        try:
            url = f"https://api.github.com/users/{username}/repos"
            response = requests.get(url, headers=self.headers, params={"per_page": 100})
            
            if response.status_code == 200:
                repos = response.json()
                print(f"✅ Found {len(repos)} repositories")
                
                repo_list = []
                for repo in repos:
                    repo_info = {
                        "name": repo["name"],
                        "url": repo["clone_url"],
                        "ssh_url": repo["ssh_url"],
                        "description": repo.get("description", ""),
                        "language": repo.get("language", ""),
                        "stars": repo["stargazers_count"],
                        "is_private": repo["private"],
                        "created_at": repo["created_at"],
                        "updated_at": repo["updated_at"]
                    }
                    repo_list.append(repo_info)
                    print(f"  📁 {repo['name']} ({repo.get('language', 'Unknown')})")
                
                return repo_list
            else:
                print(f"❌ Error: {response.status_code}")
                return []
        
        except Exception as e:
            print(f"❌ Error: {e}")
            return []
    
    def clone_repository(self, repo_url: str, repo_name: str) -> bool:
        """Clone repo to D:\ITCell"""
        try:
            repo_path = self.local_base_path / repo_name
            
            # Skip if already exists
            if repo_path.exists():
                print(f"⏭️  Already exists: {repo_name}")
                return True
            
            print(f"📥 Cloning: {repo_name}")
            
            subprocess.run(
                ["git", "clone", repo_url, str(repo_path)],
                capture_output=True,
                check=True
            )
            
            print(f"✅ Cloned: {repo_name}")
            return True
        
        except Exception as e:
            print(f"❌ Clone error: {e}")
            return False
    
    def clone_all_repos(self, username: str) -> List[Dict]:
        """Clone all repos locally"""
        repos = self.get_user_repos(username)
        
        cloned = []
        for repo in repos:
            if self.clone_repository(repo["url"], repo["name"]):
                cloned.append(repo)
        
        print(f"\n✅ Total cloned: {len(cloned)}/{len(repos)}")
        
        # Save to JSON
        self.save_repos_metadata(repos)
        
        return cloned
    
    def save_repos_metadata(self, repos: List[Dict]):
        """Save repos list to JSON"""
        metadata_file = self.local_base_path / "repositories.json"
        
        with open(metadata_file, 'w') as f:
            json.dump(repos, f, indent=2)
        
        print(f"💾 Saved metadata: {metadata_file}")
    
    def get_local_repos(self) -> List[Dict]:
        """Get all local repos"""
        repos = []
        
        for folder in self.local_base_path.iterdir():
            if folder.is_dir() and (folder / ".git").exists():
                repos.append({
                    "name": folder.name,
                    "path": str(folder)
                })
        
        return repos

if __name__ == "__main__":
    # Get token from environment
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "your_token_here")
    USERNAME = "binit123kumar"
    
    fetcher = GitHubFetcher(GITHUB_TOKEN)
    
    # Clone all repos
    cloned = fetcher.clone_all_repos(USERNAME)
    
    # Get local repos
    local = fetcher.get_local_repos()
    print(f"\n📊 Local repositories: {len(local)}")