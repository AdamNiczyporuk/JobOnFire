"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/api";

type User = { username: string; role: string } | null;

const AuthContext = createContext<{
  user: User;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
}>({
  user: null,
  setUser: () => {},
  checkAuth: async () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sprawdź sesję po załadowaniu strony
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);