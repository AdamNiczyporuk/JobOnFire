"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { logout } from "@/services/authService";
import { CandidateMobileMenu } from "./candidate-mobile-menu";

export function CandidateHeader() {
  const { user, setUser } = useAuth();
  const pathname = usePathname();

  // Sprawdź czy jesteśmy na stronie logowania/rejestracji
  const isAuthPage = !pathname || pathname.includes('/login') || pathname.includes('/register');

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="w-full px-4 md:px-8 flex h-20 items-center justify-between">
        {/* Na stronach auth - tylko wyśrodkowane logo */}
        {isAuthPage ? (
          <div className="w-full flex justify-center">
            <Link href="/" className="flex gap-3 items-center text-xl font-bold group cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-all duration-300">
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
              </div>
              <span className="transition-colors duration-300 group-hover:text-primary">
                JobOnFire
              </span>
            </Link>
          </div>
        ) : (
          <>
            {/* Logo - zawsze prowadzi do strony głównej */}
            <Link href="/" className="flex gap-3 items-center text-xl font-bold group cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-all duration-300">
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
              </div>
              <span className="transition-colors duration-300 group-hover:text-primary">
                JobOnFire
              </span>
            </Link>

              {/* Nawigacja desktopowa */}
            <div className="flex items-center">
              <nav className="hidden sm:flex items-center">
                {/* Główne linki nawigacyjne */}
                <div className="flex items-center space-x-8 mr-8 border-r border-gray-200 pr-8">
                  <Link
                    href="/job-offers"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                  >
                    Oferty pracy
                  </Link>
                  <Link
                    href="/candidate/dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/about"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                  >
                    O nas
                  </Link>
                </div>
                
                {/* Sekcja użytkownika */}
                <div className="flex items-center space-x-3">
                  {user && user.role === 'CANDIDATE' ? (
                    <>
                      <Link href="/candidate/profile">
                        <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary">
                          Profil: {user.username}
                        </span>
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200 px-3 py-2 rounded-lg shadow-sm"
                      >
                        Wyloguj się
                      </button>
                    </>
                  ) : user && user.role === 'EMPLOYER' ? (
                    <>
                      <Link href="/employer/dashboard">
                        <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary">
                          Panel Pracodawcy: {user.username}
                        </span>
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200 px-3 py-2 rounded-lg shadow-sm"
                      >
                        Wyloguj się
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/candidate/login">
                        <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary">
                          Zaloguj się
                        </span>
                      </Link>
                      <Link href="/candidate/register">
                        <span className="text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200 cursor-pointer px-4 py-2 rounded-lg shadow-sm">
                          Zarejestruj się
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              </nav>

              {/* Menu mobilne */}
              <CandidateMobileMenu />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
