"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { logout } from "@/services/authService";
import { CandidateMobileMenu } from "./candidate-mobile-menu";

export function CandidateHeader() {
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
        {/* Logo - zawsze prowadzi do strony głównej */}
        <Link href="/" className="flex gap-2 items-center text-xl font-bold group cursor-pointer">
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
        </Link>

        <div className="flex items-center">
          {/* Nawigacja desktopowa */}
          <nav className="hidden sm:flex items-center">
            <div className="flex items-center space-x-4 mr-4">
              <Link
                href="/job-offers"
                className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
              >
                Oferty pracy
              </Link>
              <Link
                href="/candidate/dashboard"
                className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
              >
                Dashboard
              </Link>
              <Link
                href="/employer/login"
                className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
              >
                <span className="hidden lg:inline">Portal Pracodawców</span>
                <span className="lg:hidden">Dla firm</span>
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
              >
                O nas
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              {user && user.role === 'CANDIDATE' ? (
                <>
                  <Link href="/candidate/profile">
                    <Button variant="outline" className="transition-all duration-200 hover:scale-105 hover:border-primary">
                      Profil: {user.username}
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} className="transition-all duration-200 hover:scale-105 hover:bg-primary/90">
                    Wyloguj się
                  </Button>
                </>
              ) : user && user.role === 'EMPLOYER' ? (
                <>
                  <Link href="/employer/dashboard">
                    <Button variant="outline" className="transition-all duration-200 hover:scale-105 hover:border-primary">
                      Panel Pracodawcy: {user.username}
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} className="transition-all duration-200 hover:scale-105 hover:bg-primary/90">
                    Wyloguj się
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/candidate/login">
                    <Button variant="outline" className="transition-all duration-200 hover:scale-105 hover:border-primary">
                      Zaloguj się
                    </Button>
                  </Link>
                  <Link href="/candidate/register">
                    <Button className="transition-all duration-200 hover:scale-105 hover:bg-primary/90">
                      Zarejestruj się
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Menu mobilne */}
          <CandidateMobileMenu />
        </div>
      </div>
    </header>
  );
}
