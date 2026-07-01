import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

print("📋 Environment Configuration:")
print("=" * 50)

GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
LOCAL_REPOS_PATH = os.getenv("LOCAL_REPOS_PATH")
BACKUP_PATH = os.getenv("BACKUP_PATH")
LOGS_PATH = os.getenv("LOGS_PATH")
DATABASE_CONNECTION = os.getenv("DATABASE_CONNECTION")

print(f"✅ GITHUB_USERNAME: {GITHUB_USERNAME}")
print(f"✅ GITHUB_TOKEN: {GITHUB_TOKEN[:20]}..." if GITHUB_TOKEN else "❌ GITHUB_TOKEN: Not set")
print(f"✅ LOCAL_REPOS_PATH: {LOCAL_REPOS_PATH}")
print(f"✅ BACKUP_PATH: {BACKUP_PATH}")
print(f"✅ LOGS_PATH: {LOGS_PATH}")
print(f"✅ DATABASE_CONNECTION: {DATABASE_CONNECTION[:50]}..." if DATABASE_CONNECTION else "❌ DATABASE_CONNECTION: Not set")

print("\n" + "=" * 50)

# Verify paths exist
from pathlib import Path

for path_name, path_value in [("LOCAL_REPOS_PATH", LOCAL_REPOS_PATH), ("BACKUP_PATH", BACKUP_PATH), ("LOGS_PATH", LOGS_PATH)]:
    if path_value:
        path = Path(path_value)
        if path.exists():
            print(f"✅ {path_name} exists")
        else:
            print(f"⚠️ {path_name} doesn't exist - creating...")
            path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created {path_name}")

print("\n✅ Environment loaded successfully!")