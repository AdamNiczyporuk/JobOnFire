"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { logout } from "@/services/authService";
import { EmployerMobileMenu } from "./employer-mobile-menu";

export function EmployerHeader() {
  const { user, setUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Sprawdź czy jesteśmy na stronie logowania/rejestracji
  const isAuthPage = !pathname || pathname.includes('/login') || pathname.includes('/register');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setUser(null);
    router.push('/'); // Przekieruj na stronę główną
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
                <span className="hidden sm:inline">JobOnFire - Portal Pracodawców</span>
                <span className="sm:hidden">JobOnFire</span>
              </span>
            </Link>

            <div className="flex items-center">
              {/* Nawigacja desktopowa */}
              <nav className="hidden sm:flex items-center">
                {/* Podstawowa nawigacja */}
                <div className="flex items-center space-x-4 mr-4">
                  {[
                    { href: '/employer/dashboard', label: 'Dashboard' },
                    { href: '/employer/job-offers', label: 'Oferty' },
                    { href: '/employer/candidates', label: 'Kandydaci' },
                    { href: '/employer/applications', label: 'Aplikacje' },
                    { href: '/about', label: 'O nas' }
                  ].map(link => {
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`text-sm font-medium transition-all duration-200 hover:text-primary hover:scale-105 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
                
                {/* Sekcja użytkownika */}
                <div className="flex items-center space-x-2">
                  {user && user.role === 'EMPLOYER' && !isLoggingOut ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2"
                      >
                        {user.username}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    
                      {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-4 z-50 transition-all duration-200 ease-out animate-in fade-in-0 zoom-in-95">
                          <div className="px-4 pb-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">Panel Pracodawcy</p>
                            <p className="text-xs text-gray-600">{user.username}</p>
                          </div>
                          
                          <div className="py-2">
                            <Link href="/employer/dashboard">
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Dashboard
                              </button>
                            </Link>
                            
                            <Link href="/employer/job-offers">
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v10l4-4 4 4V8" />
                                </svg>
                                Moje Oferty
                              </button>
                            </Link>
                            
                            <Link href="/employer/create-job">
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Dodaj Ofertę
                              </button>
                            </Link>
                            
                            <Link href="/employer/candidates">
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Kandydaci
                              </button>
                            </Link>
                            
                            <Link href="/employer/applications">
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Aplikacje
                              </button>
                            </Link>
                            
                            <Link href="/employer/profile">
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Profil Firmy
                              </button>
                            </Link>
                            
                            <Link href="/employer/settings">
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Ustawienia
                              </button>
                            </Link>
                          </div>
                          
                          <div className="border-t border-gray-100 pt-2">
                            <button 
                              onClick={() => {
                                handleLogout();
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Wyloguj się
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </nav>

              {/* Menu mobilne */}
              <EmployerMobileMenu />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
