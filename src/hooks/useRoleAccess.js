import { useApp } from "../context/AppContext";

const PERMISSIONS = {
  owner: ["all"],
  viewer: [
    "AgentDashboard", "ProjectManager", "LiveMonitoring",
    "SystemPromptLibrary", "VersionHistory", "Changelog", "AuditLog"
  ],
};

export function useRoleAccess() {
  const { role } = useApp();

  const canAccess = (page) => {
    if (role === "owner") return true;
    return PERMISSIONS[role]?.includes(page) ?? false;
  };

  const canDeploy    = role === "owner";
  const canPush      = role === "owner";
  const canDelete    = role === "owner";
  const canViewLogs  = true;
  const canEdit      = role === "owner";

  return { canAccess, canDeploy, canPush, canDelete, canViewLogs, canEdit, role };
}
