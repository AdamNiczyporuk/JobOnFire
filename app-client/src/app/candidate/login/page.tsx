"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/services/authService";
import { useAuth } from "@/context/authContext";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";

export default function CandidateLogin() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password, "CANDIDATE");
      await checkAuth(); // pobierz aktualnego użytkownika
      router.push("/candidate/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Błąd logowania");
    }
  };

  return (
    <main className="flex-1 w-full flex items-center justify-center py-12 md:py-16">
      <div className="w-full max-w-md">
          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tighter mb-2">Witaj ponownie!</h1>
              <p className="text-muted-foreground">Zaloguj się do swojego konta kandydata</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="transition-all duration-200 focus:scale-[1.02] focus:border-red-500 hover:border-red-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Hasło</label>
                <Input
                  type="password"
                  placeholder="Wprowadź hasło"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="transition-all duration-200 focus:scale-[1.02] focus:border-red-500 hover:border-red-400"
                />
              </div>
              
              {error && (
                <div className="rounded-md bg-red-50 p-3 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full transition-all duration-200 hover:scale-105"
              >
                Zaloguj się
              </Button>
            </form>
            
            <div className="mt-6">
              <GoogleAuthButton label="Zaloguj się z Google" role="CANDIDATE" />
            </div>
            
            <div className="mt-8 text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                <span>Nie masz konta? </span>
                <Link 
                  href="/candidate/register" 
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Zarejestruj się
                </Link>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <span>Jesteś pracodawcą? </span>
                <Link 
                  href="/employer/login" 
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Zaloguj się jako pracodawca
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}