import { useEffect } from "react";

export function useKeyboardShortcuts(navigate, toggleSidebar, toggleTheme, openSearch) {
  useEffect(() => {
    const handler = (e) => {
      // Ignore if typing in input
      if (["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "k") { e.preventDefault(); openSearch(); }
      if (ctrl && e.key === "b") { e.preventDefault(); toggleSidebar(); }
      if (ctrl && e.key === "t") { e.preventDefault(); toggleTheme(); }

      // Page shortcuts (Alt + key)
      if (e.altKey) {
        const map = {
          "1": "AgentDashboard",
          "2": "ProjectManager",
          "3": "CodeWorkspace",
          "4": "GitControlPanel",
          "5": "DeploymentCenter",
          "6": "LiveMonitoring",
          "7": "VoiceCommandCenter",
          "8": "SecurityVault",
          "9": "SystemSettings",
        };
        if (map[e.key]) { e.preventDefault(); navigate(map[e.key]); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, toggleSidebar, toggleTheme, openSearch]);
}
