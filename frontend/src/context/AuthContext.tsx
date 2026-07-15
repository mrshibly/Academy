"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  signature_url?: string | null;
  is_active: boolean;
  is_verified: boolean;
  roles: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userProfile: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (newToken: string, userProfile: UserProfile) => {
    setToken(newToken);
    setUser(userProfile);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userProfile));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Optionally trigger backend logout to clear HTTPOnly cookie
    fetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
  };

  const performRefresh = async () => {
    try {
      const res = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        localStorage.setItem("token", data.access_token);
      } else {
        logout();
      }
    } catch (e) {
      console.error("Token refresh failed:", e);
    }
  };

  useEffect(() => {
    // Load stored token & user on startup
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        
        // Background sync to fetch fresh roles/profile details from backend
        fetch("/api/v1/users/me", {
          headers: { "Authorization": `Bearer ${storedToken}` }
        })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Stale session");
        })
        .then(freshProfile => {
          setUser(freshProfile);
          localStorage.setItem("user", JSON.stringify(freshProfile));
        })
        .catch(() => {
          // Keep existing cached user if background sync fails
        });
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Set up token refresh timer
  useEffect(() => {
    if (!token) return;

    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return;

    const expMs = decoded.exp * 1000;
    const delay = expMs - Date.now() - 60000; // refresh 1 minute before expiry

    if (delay <= 0) {
      performRefresh();
      return;
    }

    const timer = setTimeout(() => {
      performRefresh();
    }, delay);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
