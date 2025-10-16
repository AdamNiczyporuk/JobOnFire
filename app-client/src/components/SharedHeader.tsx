"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MobileMenu } from "@/components/mobile-menu";
import { CandidateMobileMenu } from "@/components/candidate-mobile-menu";
import { useAuth } from "@/context/authContext";
import { logout } from "@/services/authService";

export function SharedHeader() {
  const { user, setUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sprawdź czy jesteśmy na stronie logowania/rejestracji
  const isAuthPage = !pathname || pathname.includes('/login') || pathname.includes('/register');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setUser(null);
    router.push('/'); // Przekieruj na stronę główną
  };

  // Zamknij dropdown przy kliknięciu poza nim (sprawdzaj czy kliknięcie było poza kontenerem menu)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!isDropdownOpen) return;
      if (containerRef.current && containerRef.current.contains(target)) {
        // kliknięcie wewnątrz kontenera - nie zamykaj
        return;
      }
      setIsDropdownOpen(false);
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
              
              <Link
                href="/employer-profiles"
                className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
              >
                Profile pracodawców
              </Link>
              
              <Link
                href="/tools"
                className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
              >
                Narzędzia
              </Link>

              {user && user.role === 'CANDIDATE' && (
                <Link
                  href="/candidate/callendar"
                  className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                >
                  Kalendarz
                </Link>
              )}
            </div>
            
            <div className="flex items-center" ref={containerRef}>
              {/* Menu mobilne - używaj odpowiedniego w zależności od użytkownika */}
              {user && user.role === 'CANDIDATE' ? <CandidateMobileMenu /> : <MobileMenu />}

              {/* Nawigacja desktopowa */}
              <nav className="hidden sm:flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {user && user.role === 'CANDIDATE' && !isLoggingOut ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200 px-6 py-3 rounded-full shadow-sm flex items-center gap-2"
                      >
                        Moje Konto
                        <svg 
                          className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    
                      {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-3 z-50 transition-all duration-200 ease-out animate-in fade-in-0 zoom-in-95">
                          <div className="px-6 pb-3 border-b border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900 mb-1 text-center">Panel Kandydata</h3>
                            <p className="text-xs text-gray-600 text-center">Witaj, {user.username}!</p>
                          </div>
                          
                          <div className="px-4 pt-3 space-y-1">
                            <Link href="/candidate/dashboard">
                              <div 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center gap-3 rounded-lg cursor-pointer"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Dashboard
                              </div>
                            </Link>
                            
                            <Link href="/candidate/profile">
                              <div 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center gap-3 rounded-lg cursor-pointer"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Mój Profil
                              </div>
                            </Link>
                          
                            <Link href="/candidate/applications">
                              <div 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center gap-3 rounded-lg cursor-pointer"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Moje Aplikacje
                              </div>
                            </Link>

                            <Link href="/candidate/callendar">
                              <div 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center gap-3 rounded-lg cursor-pointer"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Kalendarz
                              </div>
                            </Link>
                            
                            <Link href="/candidate/cv-generator">
                              <div 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center gap-3 rounded-lg cursor-pointer"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Wygeneruj CV
                              </div>
                            </Link>
                            
                            <Link href="/candidate/saved-jobs">
                              <div 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center gap-3 rounded-lg cursor-pointer"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Zapisane Oferty
                              </div>
                            </Link>
                            
                            <Link href="/candidate/settings">
                              <div 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center gap-3 rounded-lg cursor-pointer"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Ustawienia
                              </div>
                            </Link>
                          </div>
                          
                          <div className="px-4 pt-3 border-t border-gray-100">
                            <div 
                              onClick={() => {
                                handleLogout();
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200 flex items-center gap-3 rounded-lg cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Wyloguj się
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : user && user.role === 'EMPLOYER' && !isLoggingOut ? (
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
                  ) : !isLoggingOut ? (
                    <>
                      <div className="relative">
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200 px-6 py-3 rounded-full shadow-sm flex items-center gap-2"
                        >
                          Moje Konto
                          <svg 
                            className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      
                      {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 py-4 z-50 transition-all duration-200 ease-out animate-in fade-in-0 zoom-in-95">
                          <div className="px-6 pb-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">Witaj na JobOnFire!</h3>
                            <p className="text-sm text-gray-600 text-center">Zaloguj się, aby znaleźć wymarzoną pracę</p>
                          </div>
                          
                          <div className="px-6 pt-4 space-y-3">
                            <Link href="/candidate/login">
                              <button 
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-full transition-colors duration-200 shadow-sm"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                Zaloguj się
                              </button>
                            </Link>
                            
                            <div className="text-center text-xs text-gray-500 font-medium pt-2">
                              Nie masz konta?
                            </div>
                            
                            <Link href="/candidate/register">
                              <button 
                                className="w-full bg-white hover:bg-red-50 text-red-600 font-bold py-3 px-4 rounded-full border-2 border-red-600 hover:border-red-700 transition-all duration-200 shadow-sm"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                Zarejestruj się
                              </button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                    </>
                  ) : null}
                </div>
                
                {/* Sekcja "Dla firm" - widoczna zarówno dla niezalogowanych jak i pracodawców */}
                {!isLoggingOut && (
                  <div className="hidden sm:block ml-4">
                    <div>
                      <Link
                        href="/employer"
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full block"
                      >
                        Dla firm
                      </Link>
                      {user && user.role === 'EMPLOYER' ? (
                        <Link
                          href="/employer/dashboard"
                          className="text-xs text-red-600 hover:text-red-700 transition-colors duration-200 block"
                        >
                          Dodaj ofertę
                        </Link>
                      ) : (
                        <Link
                          href="/employer/dashboard"
                          className="text-xs text-red-600 hover:text-red-700 transition-colors duration-200 block"
                        >
                          Dodaj ofertę
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
