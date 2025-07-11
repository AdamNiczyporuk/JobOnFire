"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

export default function EmployerPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jeśli użytkownik jest zalogowany jako pracodawca, przekieruj do dashboard
    if (user && user.role === "EMPLOYER") {
      router.replace("/employer/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600">Przekierowanie...</p>
    </div>
  );
}
