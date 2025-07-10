"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmployerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Przekieruj na stronę logowania pracodawcy po krótkim opóźnieniu
      const timer = setTimeout(() => {
        router.push('/employer/login');
      }, 1500);
      return () => clearTimeout(timer);
    } else if (user.role !== "EMPLOYER") {
      // Przekieruj na stronę główną jeśli nie jest pracodawcą
      const timer = setTimeout(() => {
        router.push('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Sprawdzanie uprawnień...</p>
        <p className="text-sm text-gray-500 mt-2">Przekierowanie na stronę logowania</p>
      </div>
    );
  }

  if (user.role !== "EMPLOYER") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p className="text-red-600">Brak dostępu do panelu pracodawcy</p>
        <p className="text-sm text-gray-500 mt-2">Przekierowanie na stronę główną</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Panel Pracodawcy</h1>
      <p className="mb-4">Witaj, <span className="font-semibold">{user.username}</span>!</p>
      {/* Tu możesz dodać np. listę aplikacji, CV, powiadomienia itp. */}
      <div className="bg-white rounded shadow p-4">
        <p>To jest Twój dashboard. Wkrótce pojawią się tu Twoje aplikacje i powiadomienia.</p>
      </div>
    </div>
  );
}