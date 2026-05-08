"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type UserRole = "CUSTOMER" | "OWNER" | "BROKER" | "ADMIN";
export type BrokerStatusType = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  avatarUrl: string | null;
  brokerStatus?: BrokerStatusType;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, otp: string) => Promise<{ success: boolean; isNew: boolean; error?: string }>;
  register: (data: { name: string; email?: string; wantToListAsOwner: boolean }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (phone: string, otp: string) => {
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, otp }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, isNew: false, error: data.error };
    if (data.user) {
      setUser(data.user);
      return { success: true, isNew: false };
    }
    return { success: true, isNew: true };
  };

  const register = async (data: { name: string; email?: string; wantToListAsOwner: boolean }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      setUser(result.user);
    }
  };

  const logout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      setUser(null);
      window.location.href = "/";
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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
