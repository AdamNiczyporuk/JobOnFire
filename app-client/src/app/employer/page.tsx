"use client";
// Strona /employer: jeśli zalogowany pracodawca -> redirect do dashboard,
// w przyszłości można dodać publiczny landing (marketing) zanim nastąpi redirect.
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

  // Placeholder content (mini landing/spinner). Docelowo można rozszerzyć.
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-3xl font-bold mb-3">Strefa pracodawcy</h1>
      <p className="text-muted-foreground mb-8 max-w-xl">
        Trwa sprawdzanie Twojego konta. Jeśli jesteś zalogowany jako pracodawca, przekierujemy Cię do panelu.
      </p>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4" />
      <p className="text-sm text-gray-500">Przekierowanie...</p>
    </main>
  );
}
