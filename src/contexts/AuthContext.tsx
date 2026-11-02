import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { adminApi, tokenStorage } from "../api";

interface AuthContextType {
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = tokenStorage.get();
    if (token) {
      adminApi.me(token)
        .then((res) => {
          setAdminEmail(res.admin.email);
          setMustChangePassword(!!res.mustChangePassword);
          setIsAuthenticated(!res.mustChangePassword);
        })
        .catch(() => {
          // Token invalid/expired
          tokenStorage.remove();
          setIsAuthenticated(false);
          setAdminEmail(null);
        });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await adminApi.login(email, password);
      tokenStorage.set(res.token);
      setAdminEmail(res.admin.email);
      setMustChangePassword(!!res.mustChangePassword);
      setIsAuthenticated(!res.mustChangePassword);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    tokenStorage.remove();
    setIsAuthenticated(false);
    setMustChangePassword(false);
    setAdminEmail(null);
  };

  const getToken = useCallback((): string | null => tokenStorage.get(), []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, mustChangePassword, adminEmail, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
