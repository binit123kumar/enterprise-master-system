import json
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import SQL Server connector
try:
    import pyodbc
    HAS_PYODBC = True
except ImportError:
    HAS_PYODBC = False
    print("⚠️  pyodbc not installed. Install with: pip install pyodbc")

class ChangeTracker:
    def __init__(self, db_connection_string: str = None):
        """Initialize ChangeTracker with optional SQL Server connection"""
        self.db_connection_string = db_connection_string or self._build_connection_string()
        self.changes_log = []
        self.conn = None
        self.use_db = HAS_PYODBC and self.db_connection_string is not None
        
        if self.use_db:
            self._connect_to_database()
    
    def _build_connection_string(self) -> Optional[str]:
        """Build connection string from environment variables"""
        try:
            server = os.getenv("SQL_SERVER", "localhost")
            database = os.getenv("SQL_DATABASE", "EnterpriseOS")
            user = os.getenv("SQL_USER", "sa")
            password = os.getenv("SQL_PASSWORD", "")
            
            if not password:
                print("⚠️  SQL_PASSWORD not set in .env")
                return None
            
            # SQL Server connection string
            conn_str = f"Driver={{ODBC Driver 17 for SQL Server}};Server={server};Database={database};UID={user};PWD={password};"
            return conn_str
        except Exception as e:
            print(f"❌ Error building connection string: {e}")
            return None
    
    def _connect_to_database(self):
        """Connect to SQL Server"""
        try:
            if not self.db_connection_string:
                print("⚠️  No connection string available")
                return False
            
            self.conn = pyodbc.connect(self.db_connection_string)
            print("✅ Connected to SQL Server")
            return True
        except pyodbc.Error as e:
            print(f"❌ Database connection failed: {e}")
            self.use_db = False
            return False
    
    def _ensure_tables_exist(self):
        """Create necessary tables if they don't exist"""
        if not self.use_db or not self.conn:
            return False
        
        try:
            cursor = self.conn.cursor()
            
            # Create ChangeHistory table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ChangeHistory')
                BEGIN
                    CREATE TABLE ChangeHistory (
                        Id INT PRIMARY KEY IDENTITY(1,1),
                        Timestamp DATETIME NOT NULL DEFAULT GETUTCDATE(),
                        Repository NVARCHAR(255) NOT NULL,
                        RepositoryPath NVARCHAR(MAX) NOT NULL,
                        Branch NVARCHAR(255),
                        ChangesCount INT,
                        Status NVARCHAR(50),
                        LastCommitHash NVARCHAR(40),
                        LastCommitAuthor NVARCHAR(255),
                        LastCommitMessage NVARCHAR(MAX),
                        ChangedFiles NVARCHAR(MAX), -- JSON array
                        CreatedAt DATETIME DEFAULT GETUTCDATE()
                    )
                    CREATE INDEX idx_repository ON ChangeHistory(Repository)
                    CREATE INDEX idx_timestamp ON ChangeHistory(Timestamp)
                    PRINT '✅ ChangeHistory table created'
                END
            """)
            
            self.conn.commit()
            return True
        except pyodbc.Error as e:
            print(f"❌ Error creating tables: {e}")
            return False
    
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
        """Save to SQL Server database or fallback to JSON"""
        try:
            print(f"💾 Saving changes for: {change_record['repository']}")
            
            # Try SQL Server first
            if self.use_db and self.conn:
                return self._save_to_sql_server(change_record)
            
            # Fallback to JSON
            return self._save_to_json(change_record)
        
        except Exception as e:
            print(f"❌ Error saving: {e}")
            # Final fallback to JSON
            return self._save_to_json(change_record)
    
    def _save_to_sql_server(self, change_record: Dict) -> bool:
        """Save change record to SQL Server"""
        try:
            if not self.conn:
                return False
            
            self._ensure_tables_exist()
            
            cursor = self.conn.cursor()
            
            cursor.execute("""
                INSERT INTO ChangeHistory 
                (Repository, RepositoryPath, Branch, ChangesCount, Status, 
                 LastCommitHash, LastCommitAuthor, LastCommitMessage, ChangedFiles)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                change_record.get('repository'),
                change_record.get('path'),
                change_record.get('branch'),
                change_record.get('changes_count'),
                change_record.get('status'),
                change_record.get('last_commit', {}).get('hash'),
                change_record.get('last_commit', {}).get('author'),
                change_record.get('last_commit', {}).get('message'),
                json.dumps(change_record.get('changed_files', []))
            ))
            
            self.conn.commit()
            print(f"✅ Saved to SQL Server: {change_record['repository']}")
            return True
        
        except pyodbc.Error as e:
            print(f"❌ SQL Server error: {e}")
            return False
    
    def _save_to_json(self, change_record: Dict) -> bool:
        """Fallback: Save to JSON file"""
        try:
            log_file = Path(f"D:\\ITCell\\Logs\\{change_record['repository']}_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json")
            log_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(log_file, 'w') as f:
                json.dump(change_record, f, indent=2)
            
            print(f"✅ Saved to JSON: {log_file}")
            return True
        
        except Exception as e:
            print(f"❌ JSON save error: {e}")
            return False
    
    def get_changes_from_db(self, repo_name: str = None, limit: int = 50) -> List[Dict]:
        """Retrieve changes from SQL Server"""
        if not self.use_db or not self.conn:
            print("⚠️  Database not available")
            return []
        
        try:
            cursor = self.conn.cursor()
            
            if repo_name:
                cursor.execute("""
                    SELECT TOP (?) Id, Timestamp, Repository, RepositoryPath, Branch, 
                           ChangesCount, Status, LastCommitHash, LastCommitAuthor, 
                           LastCommitMessage, ChangedFiles
                    FROM ChangeHistory
                    WHERE Repository = ?
                    ORDER BY Timestamp DESC
                """, limit, repo_name)
            else:
                cursor.execute("""
                    SELECT TOP (?) Id, Timestamp, Repository, RepositoryPath, Branch, 
                           ChangesCount, Status, LastCommitHash, LastCommitAuthor, 
                           LastCommitMessage, ChangedFiles
                    FROM ChangeHistory
                    ORDER BY Timestamp DESC
                """, limit)
            
            rows = cursor.fetchall()
            results = []
            
            for row in rows:
                results.append({
                    'id': row[0],
                    'timestamp': row[1].isoformat(),
                    'repository': row[2],
                    'path': row[3],
                    'branch': row[4],
                    'changes_count': row[5],
                    'status': row[6],
                    'last_commit': {
                        'hash': row[7],
                        'author': row[8],
                        'message': row[9]
                    },
                    'changed_files': json.loads(row[10]) if row[10] else []
                })
            
            return results
        
        except pyodbc.Error as e:
            print(f"❌ Error retrieving changes: {e}")
            return []
    
    def close_connection(self):
        """Close database connection"""
        if self.conn:
            try:
                self.conn.close()
                print("✅ Database connection closed")
            except Exception as e:
                print(f"❌ Error closing connection: {e}")
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
    
    # Ensure tables exist
    if tracker.use_db:
        tracker._ensure_tables_exist()
    
    # Track all repos
    print("\n📊 Starting repository tracking...")
    changes = tracker.track_all_repos()
    
    print(f"\n✅ Tracked {len(changes)} repositories")
    
    # Show recent changes from database
    if tracker.use_db:
        print("\n📋 Recent changes in database:")
        recent = tracker.get_changes_from_db(limit=5)
        for change in recent:
            print(f"  - {change['repository']} ({change['timestamp']}): {change['changes_count']} changes")
    
    # Cleanup
    if tracker.use_db:
        tracker.close_connection()