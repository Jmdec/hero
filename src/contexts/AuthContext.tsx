"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthReady: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Bearer token is the source of truth; stale user data is ignored.
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Normalize role casing to lowercase to match backend expectations
        if (parsedUser && typeof parsedUser.role === 'string') {
          parsedUser.role = parsedUser.role.toLowerCase();
        }
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser?.role === 'admin');
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
    // Normalize role to lowercase for consistency
    const normalized = { ...userData, role: typeof userData.role === 'string' ? userData.role.toLowerCase() : userData.role };
    setUser(normalized);
    setIsAuthenticated(true);
    setIsAdmin(normalized.role === 'admin');
    localStorage.setItem('user', JSON.stringify(normalized));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isAdmin, isAuthReady, login, logout }}
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
