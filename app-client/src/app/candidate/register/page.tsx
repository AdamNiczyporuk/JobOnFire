"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/services/authService";

export default function CandidateRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
        role: "CANDIDATE",
      });
      router.push("/candidate/login");
    } catch (err: any) {
      setError(err?.response?.data?.errors?.[0] || err?.response?.data?.message || "Błąd rejestracji");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold mb-4">Rejestracja kandydata</h2>
        <Input
          name="username"
          type="text"
          placeholder="Nazwa użytkownika"
          value={form.username}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          name="password"
          type="password"
          placeholder="Hasło"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Input
          name="confirmPassword"
          type="password"
          placeholder="Powtórz hasło"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full">Zarejestruj się</Button>
        <div className="text-center text-sm mt-2">
          <span>Jesteś pracodawcą? </span>
          <a href="/employer/register" className="text-primary hover:underline">Zarejestruj się jako pracodawca</a>
        </div>
      </form>
    </div>
  );
}