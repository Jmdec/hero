"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppRole, normalizeRole } from '@/lib/rbac';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  role: AppRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canAccessAdmin: boolean;
  isAuthReady: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>('guest');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Bearer token is the source of truth; stale user data is ignored.
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const normalizedRole = normalizeRole(parsedUser?.role);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setRole(normalizedRole);
        setIsAdmin(normalizedRole === 'admin');
        setIsManager(normalizedRole === 'manager');
        setCanAccessAdmin(normalizedRole === 'admin' || normalizedRole === 'manager');
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setIsAuthReady(true);
  }, []);

  const login = (userData: User, token?: string) => {
    const normalizedRole = normalizeRole(userData.role);
    setUser(userData);
    setIsAuthenticated(true);
    setRole(normalizedRole);
    setIsAdmin(normalizedRole === 'admin');
    setIsManager(normalizedRole === 'manager');
    setCanAccessAdmin(normalizedRole === 'admin' || normalizedRole === 'manager');
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setUser(null);
    setRole('guest');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsManager(false);
    setCanAccessAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isAuthenticated, isAdmin, isManager, canAccessAdmin, isAuthReady, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
