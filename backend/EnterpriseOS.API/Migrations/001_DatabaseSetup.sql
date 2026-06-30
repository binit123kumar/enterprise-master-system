-- ============================================================
-- EnterpriseOS — Complete SQL Server Setup Script
-- Owner: Binit
-- Run this ONCE to setup everything
-- ============================================================

USE master;
GO

-- Step 1: Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'EnterpriseOS')
BEGIN
    CREATE DATABASE EnterpriseOS
    COLLATE SQL_Latin1_General_CP1_CI_AS;
    PRINT '✅ Database EnterpriseOS created';
END
GO

USE EnterpriseOS;
GO

-- ── TABLE: Projects ───────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Projects' AND xtype='U')
BEGIN
    CREATE TABLE Projects (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        Name            NVARCHAR(200)    NOT NULL,
        TechStack       NVARCHAR(300)    NOT NULL,
        Status          NVARCHAR(50)     NOT NULL DEFAULT 'Active',
        Environment     NVARCHAR(50)     NOT NULL DEFAULT 'Dev',
        CommitCount     INT              NOT NULL DEFAULT 0,
        HealthScore     INT              NULL,
        CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        LastDeployedAt  DATETIME2        NULL
    );
    PRINT '✅ Table Projects created';
END
GO

-- ── TABLE: Deployments ────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Deployments' AND xtype='U')
BEGIN
    CREATE TABLE Deployments (
        Id                  INT IDENTITY(1,1) PRIMARY KEY,
        ProjectId           INT              NOT NULL,
        Version             NVARCHAR(20)     NOT NULL,
        Environment         NVARCHAR(50)     NOT NULL DEFAULT 'Production',
        Status              NVARCHAR(50)     NOT NULL DEFAULT 'Pending',
        DeployedBy          NVARCHAR(100)    NOT NULL DEFAULT 'Binit',
        StartedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        CompletedAt         DATETIME2        NULL,
        BuildLog            NVARCHAR(MAX)    NULL,
        VoiceVerified       BIT              NOT NULL DEFAULT 0,
        PinVerified         BIT              NOT NULL DEFAULT 0,
        FingerprintVerified BIT              NOT NULL DEFAULT 0,
        CONSTRAINT FK_Deployments_Projects
            FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE
    );
    CREATE INDEX IX_Deployments_ProjectId ON Deployments(ProjectId);
    CREATE INDEX IX_Deployments_StartedAt ON Deployments(StartedAt DESC);
    PRINT '✅ Table Deployments created';
END
GO

-- ── TABLE: OriginalSnapshots ──────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OriginalSnapshots' AND xtype='U')
BEGIN
    CREATE TABLE OriginalSnapshots (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        ProjectName     NVARCHAR(200)    NOT NULL,
        FileName        NVARCHAR(300)    NOT NULL,
        FilePath        NVARCHAR(500)    NOT NULL,
        Content         NVARCHAR(MAX)    NOT NULL,
        ContentHash     NVARCHAR(64)     NOT NULL,
        FileSizeBytes   BIGINT           NOT NULL DEFAULT 0,
        CreatedBy       NVARCHAR(100)    NOT NULL DEFAULT 'Binit',
        CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        Version         NVARCHAR(20)     NOT NULL DEFAULT 'v1.0.0',
        Description     NVARCHAR(500)    NULL
    );
    CREATE INDEX IX_Originals_Project  ON OriginalSnapshots(ProjectName);
    CREATE INDEX IX_Originals_Date     ON OriginalSnapshots(CreatedAt DESC);
    PRINT '✅ Table OriginalSnapshots created';
END
GO

-- ── TABLE: ChangeHistory ─────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChangeHistory' AND xtype='U')
BEGIN
    CREATE TABLE ChangeHistory (
        Id                  INT IDENTITY(1,1) PRIMARY KEY,
        SnapshotId          INT              NOT NULL,
        ProjectName         NVARCHAR(200)    NOT NULL,
        FileName            NVARCHAR(300)    NOT NULL,
        FilePath            NVARCHAR(500)    NOT NULL,
        ChangeType          NVARCHAR(50)     NOT NULL DEFAULT 'Modified',
        OldContent          NVARCHAR(MAX)    NULL,
        NewContent          NVARCHAR(MAX)    NOT NULL,
        DiffSummary         NVARCHAR(500)    NULL,
        LinesAdded          INT              NOT NULL DEFAULT 0,
        LinesDeleted        INT              NOT NULL DEFAULT 0,
        LinesModified       INT              NOT NULL DEFAULT 0,
        CommitHash          NVARCHAR(40)     NULL,
        CommitMessage       NVARCHAR(500)    NULL,
        Branch              NVARCHAR(100)    NOT NULL DEFAULT 'main',
        ChangedBy           NVARCHAR(100)    NOT NULL DEFAULT 'Binit',
        ChangedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        Version             NVARCHAR(50)     NULL,
        StorageFolderPath   NVARCHAR(500)    NULL,
        ChangeReason        NVARCHAR(500)    NULL,
        IsDeployed          BIT              NOT NULL DEFAULT 0,
        DeployedAt          DATETIME2        NULL,
        CONSTRAINT FK_Changes_Snapshot
            FOREIGN KEY (SnapshotId) REFERENCES OriginalSnapshots(Id) ON DELETE CASCADE
    );
    CREATE INDEX IX_Changes_Date    ON ChangeHistory(ChangedAt DESC);
    CREATE INDEX IX_Changes_Project ON ChangeHistory(ProjectName);
    CREATE INDEX IX_Changes_File    ON ChangeHistory(ProjectName, FileName);
    PRINT '✅ Table ChangeHistory created';
END
GO

-- ── TABLE: SecurityLogs ───────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SecurityLogs' AND xtype='U')
BEGIN
    CREATE TABLE SecurityLogs (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        Action      NVARCHAR(200)    NOT NULL,
        IpAddress   NVARCHAR(50)     NOT NULL,
        Status      NVARCHAR(50)     NOT NULL DEFAULT 'Allowed',
        Timestamp   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        Details     NVARCHAR(500)    NULL,
        UserId      NVARCHAR(100)    NULL DEFAULT 'Binit'
    );
    CREATE INDEX IX_SecurityLogs_Time ON SecurityLogs(Timestamp DESC);
    PRINT '✅ Table SecurityLogs created';
END
GO

-- ── TABLE: AuditLogs ─────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' AND xtype='U')
BEGIN
    CREATE TABLE AuditLogs (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        UserName    NVARCHAR(100)    NOT NULL DEFAULT 'Binit',
        Action      NVARCHAR(100)    NOT NULL,
        Target      NVARCHAR(500)    NOT NULL,
        Result      NVARCHAR(50)     NOT NULL,
        IpAddress   NVARCHAR(50)     NOT NULL,
        Category    NVARCHAR(100)    NOT NULL,
        RiskLevel   NVARCHAR(20)     NOT NULL DEFAULT 'Low',
        CreatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        Details     NVARCHAR(MAX)    NULL
    );
    CREATE INDEX IX_AuditLogs_Date     ON AuditLogs(CreatedAt DESC);
    CREATE INDEX IX_AuditLogs_Category ON AuditLogs(Category);
    PRINT '✅ Table AuditLogs created';
END
GO

-- ── TABLE: SystemPrompts ──────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SystemPrompts' AND xtype='U')
BEGIN
    CREATE TABLE SystemPrompts (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        Name            NVARCHAR(200)    NOT NULL,
        AgentPlatform   NVARCHAR(200)    NOT NULL,
        Category        NVARCHAR(100)    NOT NULL,
        Content         NVARCHAR(MAX)    NOT NULL,
        Tags            NVARCHAR(500)    NULL,
        Status          NVARCHAR(50)     NOT NULL DEFAULT 'Active',
        CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        LastUsedAt      DATETIME2        NULL
    );
    PRINT '✅ Table SystemPrompts created';
END
GO

-- ── TABLE: FileVersionFolders ─────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FileVersionFolders' AND xtype='U')
BEGIN
    CREATE TABLE FileVersionFolders (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        ProjectName     NVARCHAR(200)    NOT NULL,
        FolderType      NVARCHAR(50)     NOT NULL,
        FolderPath      NVARCHAR(500)    NOT NULL,
        FileCount       INT              NOT NULL DEFAULT 0,
        TotalSizeBytes  BIGINT           NOT NULL DEFAULT 0,
        CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        Label           NVARCHAR(200)    NULL
    );
    PRINT '✅ Table FileVersionFolders created';
END
GO

-- ── VIEWS ─────────────────────────────────────────────
CREATE OR ALTER VIEW vw_FileTimeline AS
SELECT 'original' AS RecordType, os.Id AS RecordId, os.ProjectName, os.FileName, os.FilePath,
       os.Version, NULL AS ChangeType, os.CreatedAt AS EventDate,
       FORMAT(os.CreatedAt,'dd MMM yyyy HH:mm:ss') AS EventDateFormatted,
       os.CreatedBy AS EventBy, os.Description AS Summary, 0 AS LinesAdded, 0 AS LinesDeleted, NULL AS StorageFolderPath
FROM OriginalSnapshots os
UNION ALL
SELECT 'change', ch.Id, ch.ProjectName, ch.FileName, ch.FilePath,
       ch.Version, ch.ChangeType, ch.ChangedAt,
       FORMAT(ch.ChangedAt,'dd MMM yyyy HH:mm:ss'),
       ch.ChangedBy, ISNULL(ch.CommitMessage, ch.DiffSummary),
       ch.LinesAdded, ch.LinesDeleted, ch.StorageFolderPath
FROM ChangeHistory ch;
GO

CREATE OR ALTER VIEW vw_ProjectDashboard AS
SELECT p.Id, p.Name, p.TechStack, p.Status, p.Environment,
       p.CommitCount, p.HealthScore, p.CreatedAt,
       COUNT(d.Id) AS TotalDeployments,
       MAX(d.StartedAt) AS LastDeployedAt,
       SUM(CASE WHEN d.Status='Success' THEN 1 ELSE 0 END) AS SuccessfulDeploys
FROM Projects p
LEFT JOIN Deployments d ON p.Id = d.ProjectId
GROUP BY p.Id, p.Name, p.TechStack, p.Status, p.Environment,
         p.CommitCount, p.HealthScore, p.CreatedAt;
GO

PRINT '✅ Views created';

-- ── STORED PROCEDURES ─────────────────────────────────
CREATE OR ALTER PROCEDURE sp_SaveChange
    @SnapshotId     INT,
    @ProjectName    NVARCHAR(200),
    @FileName       NVARCHAR(300),
    @FilePath       NVARCHAR(500),
    @NewContent     NVARCHAR(MAX),
    @ChangeType     NVARCHAR(50) = 'Modified',
    @CommitMessage  NVARCHAR(500) = NULL,
    @Branch         NVARCHAR(100) = 'main',
    @ChangeReason   NVARCHAR(500) = NULL
AS
BEGIN
    DECLARE @OldContent NVARCHAR(MAX);
    SELECT @OldContent = Content FROM OriginalSnapshots WHERE Id = @SnapshotId;

    DECLARE @FolderPath NVARCHAR(500) =
        'snapshots/' + @ProjectName + '/changes/' +
        FORMAT(GETUTCDATE(),'yyyy-MM-dd') + '/' +
        FORMAT(GETUTCDATE(),'HH-mm-ss') + '/' + @FileName;

    INSERT INTO ChangeHistory (SnapshotId, ProjectName, FileName, FilePath, ChangeType,
        OldContent, NewContent, CommitMessage, Branch, ChangeReason,
        StorageFolderPath, ChangedAt, ChangedBy)
    VALUES (@SnapshotId, @ProjectName, @FileName, @FilePath, @ChangeType,
        @OldContent, @NewContent, @CommitMessage, @Branch, @ChangeReason,
        @FolderPath, GETUTCDATE(), 'Binit');

    SELECT SCOPE_IDENTITY() AS NewChangeId, @FolderPath AS StoredAt;
END
GO

CREATE OR ALTER PROCEDURE sp_GetProjectStats
AS
BEGIN
    SELECT
        (SELECT COUNT(*) FROM Projects)                                AS TotalProjects,
        (SELECT COUNT(*) FROM Projects WHERE Status = 'Live')         AS LiveProjects,
        (SELECT COUNT(*) FROM Deployments)                            AS TotalDeployments,
        (SELECT COUNT(*) FROM Deployments WHERE Status = 'Success')   AS SuccessfulDeploys,
        (SELECT COUNT(*) FROM ChangeHistory)                          AS TotalChanges,
        (SELECT COUNT(*) FROM OriginalSnapshots)                      AS TotalSnapshots,
        (SELECT COUNT(*) FROM SecurityLogs WHERE Status = 'Blocked')  AS BlockedAttempts,
        (SELECT COUNT(*) FROM AuditLogs WHERE CAST(CreatedAt AS DATE) = CAST(GETUTCDATE() AS DATE)) AS TodayEvents;
END
GO

PRINT '✅ Stored Procedures created';

-- ── SEED DATA ─────────────────────────────────────────
IF NOT EXISTS (SELECT TOP 1 Id FROM Projects)
BEGIN
    INSERT INTO Projects (Name, TechStack, Status, Environment, CommitCount, HealthScore)
    VALUES
    ('EnterpriseOS',     'React + ASP.NET Core', 'Live',     'Production', 128, 99),
    ('BharatPay API',    'Node.js + SQL Server',  'Live',     'Production', 74,  100),
    ('AdminPanel v3',    'React.js',              'Staging',  'Staging',    42,  97),
    ('DataSync Worker',  'Python + Docker',        'Building', 'Dev',        19,  NULL),
    ('ML Prediction API','Python + FastAPI',       'Paused',   'Dev',        31,  NULL);
    PRINT '✅ Projects seed data inserted';
END
GO

IF NOT EXISTS (SELECT TOP 1 Id FROM SystemPrompts)
BEGIN
    INSERT INTO SystemPrompts (Name, AgentPlatform, Category, Content, Tags, Status)
    VALUES
    ('Master AI Agent', 'Claude / GPT-4 / Gemini', 'Core',
     'You are Binit''s Enterprise AI Agent. Follow all security protocols. Require authorization for protected operations. Never expose secrets.',
     'deployment,coding,security', 'Active'),
    ('Code Review Agent', 'Claude Sonnet', 'Development',
     'Review code for quality, bugs, security issues and best practices.',
     'code,review,lint', 'Active');
    PRINT '✅ SystemPrompts seed data inserted';
END
GO

-- ── USEFUL QUERIES ────────────────────────────────────
/*
-- Aaj ki saari changes:
SELECT * FROM ChangeHistory WHERE CAST(ChangedAt AS DATE) = CAST(GETUTCDATE() AS DATE) ORDER BY ChangedAt DESC;

-- Kisi file ki poori history:
SELECT * FROM vw_FileTimeline WHERE ProjectName = 'EnterpriseOS' AND FileName = 'AgentDashboard.jsx' ORDER BY EventDate;

-- Project stats:
EXEC sp_GetProjectStats;

-- Change save karna:
EXEC sp_SaveChange @SnapshotId=1, @ProjectName='EnterpriseOS', @FileName='AgentDashboard.jsx',
     @FilePath='src/pages/Dashboard/', @NewContent='// new content here', @CommitMessage='feat: new update';
*/

PRINT '';
PRINT '═══════════════════════════════════════════════';
PRINT '✅ EnterpriseOS Database Setup Complete!';
PRINT '   Tables:     7 created';
PRINT '   Views:      2 created';
PRINT '   Procedures: 2 created';
PRINT '   Seed Data:  Inserted';
PRINT '═══════════════════════════════════════════════';
GO
