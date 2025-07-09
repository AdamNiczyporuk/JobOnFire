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
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="w-full px-4 md:px-8 flex h-20 items-center justify-between">
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

        <div className="flex items-center">
          {/* Nawigacja desktopowa */}
          <nav className="hidden sm:flex items-center">
            {/* Główne linki nawigacyjne */}
            <div className="flex items-center space-x-8 mr-8 border-r border-gray-200 pr-8">
              <Link
                href="/job-offers"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v10l4-4 4 4V8" />
                </svg>
                Oferty pracy
              </Link>
              <Link
                href="/candidate/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/employer/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="hidden lg:inline">Portal Pracodawców</span>
                <span className="lg:hidden">Dla firm</span>
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                O nas
              </Link>
            </div>
            
            {/* Sekcja użytkownika */}
            <div className="flex items-center space-x-3">
              {user && user.role === 'CANDIDATE' ? (
                <>
                  <Link href="/candidate/profile">
                    <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profil: {user.username}
                    </span>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Wyloguj się
                  </button>
                </>
              ) : user && user.role === 'EMPLOYER' ? (
                <>
                  <Link href="/employer/dashboard">
                    <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Panel Pracodawcy: {user.username}
                    </span>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Wyloguj się
                  </button>
                </>
              ) : (
                <>
                  <Link href="/candidate/login">
                    <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 border border-gray-200 hover:border-primary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Zaloguj się
                    </span>
                  </Link>
                  <Link href="/candidate/register">
                    <span className="text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200 cursor-pointer px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
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
      </div>
    </header>
  );
}
