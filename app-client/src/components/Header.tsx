"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/mobile-menu";
import { useAuth } from "@/context/authContext";
import { logout } from "@/services/authService";

export function Header() {
  const { user, setUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  // Zamknij dropdown przy kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="w-full px-4 md:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
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
          
          <Link
            href="/job-offers"
            className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
          >
            Oferty pracy
          </Link>
        </div>
        <div className="flex items-center">
          {/* Menu mobilne */}
          <MobileMenu />

          {/* Nawigacja desktopowa */}
          <nav className="hidden sm:flex items-center space-x-8">
            {/* Sekcja użytkownika */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {user.role === 'CANDIDATE' ? (
                    <>
                      <Link href="/candidate/dashboard">
                        <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer px-4 py-2 rounded-full hover:bg-gray-50">
                          Dashboard: {user.username}
                        </span>
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 px-4 py-2 rounded-full hover:bg-gray-50"
                      >
                        Wyloguj się
                      </button>
                      {/* Dla firm - widoczne dla kandydatów */}
                      <div>
                        <Link
                          href="/employer"
                          className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full block"
                        >
                          Dla firm
                        </Link>
                        <Link
                          href="/employer/dashboard"
                          className="text-xs text-red-600 hover:text-red-700 transition-colors duration-200 block"
                        >
                          Dodaj ofertę
                        </Link>
                      </div>
                    </>
                  ) : user.role === 'EMPLOYER' ? (
                    <>
                      <Link href="/employer/dashboard">
                        <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer px-4 py-2 rounded-full hover:bg-gray-50">
                          Dashboard: {user.username}
                        </span>
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 px-4 py-2 rounded-full hover:bg-gray-50"
                      >
                        Wyloguj się
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleLogout} 
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 px-4 py-2 rounded-full hover:bg-gray-50"
                    >
                      Wyloguj się
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200 px-6 py-3 rounded-full shadow-sm"
                    >
                      Moje Konto
                    </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 py-6 z-50 transition-all duration-200 ease-out animate-in fade-in-0 zoom-in-95">
                      <div className="px-8 pb-6 border-b border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">🎉 Witaj na JobOnFire!</h3>
                        <p className="text-sm text-gray-600 text-center">Zaloguj się, aby znaleźć wymarzoną pracę</p>
                      </div>
                      
                      <div className="px-8 pt-6 space-y-4">
                        <Link href="/candidate/login">
                          <button 
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 shadow-sm"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Zaloguj się
                          </button>
                        </Link>
                        
                        <div className="text-center text-sm text-gray-500 font-semibold pt-4">
                          Nie masz konta?
                        </div>
                        
                        <Link href="/candidate/register">
                          <button 
                            className="w-full bg-white hover:bg-red-50 text-red-600 font-bold py-4 px-6 rounded-lg border-2 border-red-600 hover:border-red-700 transition-all duration-200 shadow-sm"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Zarejestruj się
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                  {/* Dla firm - widoczne dla niezalogowanych */}
                  <div>
                    <Link
                      href="/employer"
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full block"
                    >
                      Dla firm
                    </Link>
                    <Link
                      href="/employer/dashboard"
                      className="text-xs text-red-600 hover:text-red-700 transition-colors duration-200 block"
                    >
                      Dodaj ofertę
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
