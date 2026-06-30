import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(localStorage.getItem("eos-token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Validate token
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ name: payload.name, role: payload.role });
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    // Call backend JWT endpoint
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        localStorage.setItem("eos-token", data.token);
        setUser({ name: data.name, role: data.role });
        return { success: true };
      }
      return { success: false, message: "Invalid credentials" };
    } catch {
      // Demo mode - offline login
      if (username === "Binit" && password === "admin123") {
        const fakeToken = btoa(JSON.stringify({ alg: "HS256" })) + "." +
          btoa(JSON.stringify({ name: "Binit", role: "owner", exp: Math.floor(Date.now()/1000) + 86400 })) +
          ".signature";
        setToken(fakeToken);
        localStorage.setItem("eos-token", fakeToken);
        setUser({ name: "Binit", role: "owner" });
        return { success: true };
      }
      return { success: false, message: "Login failed" };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("eos-token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
