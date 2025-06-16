"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { logout } from "@/services/authService";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
          <div className="flex gap-2 items-center text-xl font-bold group cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
            >
              <path d="M20 7h-4a2 2 0 0 0-2 2v.5"></path>
              <path d="M14 2h.01"></path>
              <path d="M14 2h.01"></path>
              <path d="M20 2h.01"></path>
              <path d="M20 2h.01"></path>
              <path d="M20 14v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"></path>
              <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path>
              <path d="M2 14h20"></path>
            </svg>
            <span className="transition-colors duration-300 group-hover:text-primary">
              JobOnFire - Portal Pracodawców
            </span>
          </div>
          <div className="flex items-center">
            {/* Nawigacja desktopowa */}
            <nav className="hidden sm:flex items-center">
              <div className="flex items-center space-x-4 mr-4">
                <Link
                  href="#"
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
                >
                  Twoje Oferty pracy
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
                >
                  Spotkania
                </Link>
                <Link
                  href="/candidate/dashboard"
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
                >
                  Profil dla Kandydatów
                </Link>
                </div>
              <div className="flex items-center space-x-2">
                {user ? (
                  <>
                    <Link href="/employer/profile">
                      <Button variant="outline" className="transition-all duration-200 hover:scale-105 hover:border-primary">
                        Profil: {user.username}
                      </Button>
                    </Link>
                    <Button onClick={handleLogout} className="transition-all duration-200 hover:scale-105 hover:bg-primary/90" >
                      Wyloguj się
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/employer/login">
                      <Button
                        variant="outline"
                        className="transition-all duration-200 hover:scale-105 hover:border-primary"
                      >
                        Zaloguj się
                      </Button>
                    </Link>
                    <Link href="/employer/register">
                      <Button className="transition-all duration-200 hover:scale-105 hover:bg-primary/90">
                        Zarejestruj się
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 px-4 py-10 md:px-6 lg:flex-row lg:gap-12">
          <div className="flex flex-col gap-4 lg:w-1/3">
            <div className="flex gap-2 items-center text-xl font-bold group cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
              >
                <path d="M20 7h-4a2 2 0 0 0-2 2v.5"></path>
                <path d="M14 2h.01"></path>
                <path d="M14 2h.01"></path>
                <path d="M20 2h.01"></path>
                <path d="M20 2h.01"></path>
                <path d="M20 14v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"></path>
                <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path>
                <path d="M2 14h20"></path>
              </svg>
              <span className="transition-colors duration-300 group-hover:text-primary">
                JobOnFire
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Platforma z ofertami pracy dla frontend developerów.
            </p>
          </div>
          <div className="flex flex-col gap-2 lg:w-1/3">
            <span className="font-semibold">Nawigacja</span>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Oferty pracy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Dla firm</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Kandydaci</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">O nas</Link>
          </div>
          <div className="flex flex-col gap-2 lg:w-1/3">
            <span className="font-semibold">Kontakt</span>
            <span className="text-sm text-muted-foreground">kontakt@jobonfire.pl</span>
            <span className="text-sm text-muted-foreground">ul. Przykładowa 1, 00-000 Warszawa</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
