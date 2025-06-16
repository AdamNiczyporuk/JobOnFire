"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold mb-4">Logowanie kandydata</h2>
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
        <GoogleAuthButton label="Zaloguj się z Google" role="CANDIDATE" />
        <div className="text-center text-sm mt-2">
          <span>Jesteś pracodawcą? </span>
          <a href="/employer/login" className="text-primary hover:underline">Zaloguj się jako pracodawca</a>
        </div>
      </form>
    </div>
  );
}