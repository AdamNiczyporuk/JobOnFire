"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/api";

type User = { username: string; role: string } | null;

const AuthContext = createContext<{
  user: User;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}>({
  user: null,
  setUser: () => {},
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  // Sprawdź sesję po załadowaniu strony
  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);