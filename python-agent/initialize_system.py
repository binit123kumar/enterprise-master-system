import os
from pathlib import Path
from dotenv import load_dotenv
from github_fetcher import GitHubFetcher
from change_tracker import ChangeTracker

# Load env variables
load_dotenv(Path(__file__).parent.parent / ".env")

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
LOCAL_REPOS_PATH = os.getenv("LOCAL_REPOS_PATH", "D:\\ITCell")

def initialize_system():
    """Initialize entire system"""
    print("\n🚀 Initializing EnterpriseOS Voice DevOps System")
    print("=" * 50)
    
    # Step 1: Clone all repos from GitHub
    print("\n📥 Step 1: Cloning repositories from GitHub...")
    fetcher = GitHubFetcher(GITHUB_TOKEN, LOCAL_REPOS_PATH)
    cloned = fetcher.clone_all_repos(GITHUB_USERNAME)
    
    # Step 2: Track all changes
    print("\n📊 Step 2: Tracking repository changes...")
    tracker = ChangeTracker()
    changes = tracker.track_all_repos(LOCAL_REPOS_PATH)
    
    # Step 3: Create directories
    print("\n📁 Step 3: Creating system directories...")
    
    backup_path = Path(LOCAL_REPOS_PATH) / "Backups"
    logs_path = Path(LOCAL_REPOS_PATH) / "Logs"
    
    backup_path.mkdir(parents=True, exist_ok=True)
    logs_path.mkdir(parents=True, exist_ok=True)
    
    print(f"✅ Backup path: {backup_path}")
    print(f"✅ Logs path: {logs_path}")
    
    # Summary
    print("\n" + "=" * 50)
    print("✅ SYSTEM INITIALIZED SUCCESSFULLY!")
    print(f"📊 Repositories: {len(cloned)}")
    print(f"📝 Changes tracked: {len(changes)}")
    print("=" * 50)

if __name__ == "__main__":
    initialize_system()