"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/services/authService";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";

export default function EmployerRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Hasła muszą być takie same.");
      return;
    }
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: "EMPLOYER",
        companyName: form.companyName,
      });
      router.push("/employer/login");
    } catch (err: any) {
      setError(err?.response?.data?.errors?.[0] || err?.response?.data?.message || "Błąd rejestracji");
    }
  };

  return (
    <main className="flex-1 w-full flex items-center justify-center py-12 md:py-16">
      <div className="w-full max-w-md">
          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tighter mb-2">Zarejestruj firmę</h1>
              <p className="text-muted-foreground">Stwórz konto pracodawcy i znajdź najlepszych kandydatów</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nazwa firmy</label>
                <Input
                  name="companyName"
                  type="text"
                  placeholder="Nazwa Twojej firmy"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:scale-[1.02] focus:border-red-500 hover:border-red-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nazwa użytkownika</label>
                <Input
                  name="username"
                  type="text"
                  placeholder="Twoja nazwa użytkownika"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:scale-[1.02] focus:border-red-500 hover:border-red-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email firmowy</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="firma@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:scale-[1.02] focus:border-red-500 hover:border-red-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Hasło</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Wprowadź hasło"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:scale-[1.02] focus:border-red-500 hover:border-red-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Powtórz hasło</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Powtórz hasło"
                  value={form.confirmPassword}
                  onChange={handleChange}
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
                Zarejestruj firmę
              </Button>
            </form>
            
            <div className="mt-6">
              <GoogleAuthButton label="Zarejestruj się z Google" role="EMPLOYER" />
            </div>
            
            <div className="mt-8 text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                <span>Masz już konto? </span>
                <Link 
                  href="/employer/login" 
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Zaloguj się
                </Link>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <span>Szukasz pracy? </span>
                <Link 
                  href="/candidate/register" 
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Zarejestruj się jako kandydat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}

