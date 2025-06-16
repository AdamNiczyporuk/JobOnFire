"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/services/authService";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { useAuth } from "@/context/authContext";

export default function EmployerLogin() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password, "EMPLOYER");
      await checkAuth(); // pobierz aktualnego użytkownika
      router.push("/employer/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Błąd logowania");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold mb-4">Logowanie pracodawcy</h2>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full">Zaloguj się</Button>
        <GoogleAuthButton label="Zaloguj się z Google" role="EMPLOYER" />
        <div className="text-center text-sm mt-2">
          <span>Jesteś kandydatem? </span>
          <a href="/candidate/login" className="text-primary hover:underline">Zaloguj się jako kandydat</a>
        </div>
      </form>
    </div>
  );
}
