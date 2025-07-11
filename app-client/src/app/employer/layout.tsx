"use client";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { EmployerHeader } from "@/components/EmployerHeader";
import { SharedHeader } from "@/components/SharedHeader";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Nie wykonuj przekierowań podczas ładowania
    if (isLoading) return;

    // Sprawdź czy użytkownik jest na stronach autoryzacji (login/register)
    const isOnAuthRoute = pathname.includes('/login') || pathname.includes('/register');
    
    // Jeśli nie jest zalogowany i nie jest na stronie autoryzacji
    if (!user && !isOnAuthRoute) {
      router.replace("/employer/login");
      return;
    }

    // Jeśli jest zalogowany, ale nie ma roli EMPLOYER
    if (user && user.role !== "EMPLOYER" && !isOnAuthRoute) {
      router.replace("/employer/login");
      return;
    }
  }, [user, isLoading, router, pathname]);

  // Sprawdź czy użytkownik jest na stronach autoryzacji
  const isOnAuthRoute = pathname.includes('/login') || pathname.includes('/register');
  
  // Pokaż loading podczas ładowania danych użytkownika
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Ładowanie...</p>
      </div>
    );
  }
  
  // Jeśli nie jest zalogowany i nie jest na stronie autoryzacji, pokaż loading
  if (!user && !isOnAuthRoute) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Przekierowanie...</p>
      </div>
    );
  }

  // Jeśli użytkownik jest zalogowany ale nie ma roli EMPLOYER, pokaż loading
  if (user && user.role !== "EMPLOYER" && !isOnAuthRoute) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Przekierowanie...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Pokazuj EmployerHeader jeśli użytkownik jest zalogowany i nie jest na stronach autoryzacji */}
      {user && !isOnAuthRoute && <EmployerHeader />}
      {/* Pokazuj SharedHeader na stronach autoryzacji */}
      {isOnAuthRoute && <SharedHeader />}
      {children}
    </div>
  );
}
