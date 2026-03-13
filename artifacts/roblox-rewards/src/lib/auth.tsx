import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetCurrentUser } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(localStorage.getItem("roblox_token"));

  const { data: user, isLoading, refetch, isError } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      // If fetching user fails (e.g. 401), clear token
      localStorage.removeItem("roblox_token");
      setToken(null);
      setLocation("/");
    }
  }, [isError, setLocation]);

  const login = (newToken: string) => {
    localStorage.setItem("roblox_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("roblox_token");
    setToken(null);
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, logout, refetchUser: refetch }}>
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
