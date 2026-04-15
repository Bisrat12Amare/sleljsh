import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { User } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("selelgesh_token"));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("selelgesh_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [, setLocation] = useLocation();

  const setAuth = (newToken: string, newUser: User) => {
    localStorage.setItem("selelgesh_token", newToken);
    localStorage.setItem("selelgesh_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("selelgesh_token");
    localStorage.removeItem("selelgesh_user");
    setToken(null);
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
