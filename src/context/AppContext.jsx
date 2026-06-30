import { createContext, useContext, useState } from "react";

const AppCtx = createContext();

export function AppProvider({ children }) {
  const [activeProject, setActiveProject] = useState("EnterpriseOS");
  const [globalSearch,  setGlobalSearch]  = useState("");
  const [shortcuts,     setShortcuts]     = useState(true);
  const [role,          setRole]          = useState("owner"); // owner | viewer

  const projects = ["EnterpriseOS", "BharatPay API", "AdminPanel v3", "DataSync Worker", "ML Prediction API"];

  return (
    <AppCtx.Provider value={{
      activeProject, setActiveProject, projects,
      globalSearch, setGlobalSearch,
      shortcuts, setShortcuts,
      role, setRole,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
