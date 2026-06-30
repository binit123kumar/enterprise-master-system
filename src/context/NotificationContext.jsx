import { createContext, useContext, useState, useCallback } from "react";

const NotifCtx = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => remove(id), duration);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const notify = {
    success: (msg) => add(msg, "success"),
    error:   (msg) => add(msg, "error"),
    warning: (msg) => add(msg, "warning"),
    info:    (msg) => add(msg, "info"),
    deploy:  (msg) => add(msg, "deploy"),
  };

  return (
    <NotifCtx.Provider value={{ notify, toasts, remove }}>
      {children}
    </NotifCtx.Provider>
  );
}

export const useNotification = () => useContext(NotifCtx);
