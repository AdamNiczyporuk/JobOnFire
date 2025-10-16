"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/authContext"
import { logout } from "@/services/authService"

export function CandidateMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, setUser } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setUser(null);
    setIsOpen(false);
    router.push('/'); // Przekieruj na stronę główną
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="sm:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="relative transition-all duration-200 hover:bg-primary/10 hover:scale-110"
        aria-label="Menu"
        onClick={toggleMenu}
      >
        {isOpen ? (
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
            className="h-6 w-6 transition-transform duration-300 rotate-90"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
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
            className="h-6 w-6 transition-transform duration-300"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </Button>

      <div
        className={`absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex flex-col p-4 space-y-4">
          <Link
            href="/job-offers"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-2"
            onClick={() => setIsOpen(false)}
          >
            Oferty pracy
          </Link>
          <Link
            href="/candidate/dashboard"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-2"
            onClick={() => setIsOpen(false)}
          >
            Mój Dashboard
          </Link>
          <Link
            href="/employer/login"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-2"
            onClick={() => setIsOpen(false)}
          >
            Portal Pracodawców
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-2"
            onClick={() => setIsOpen(false)}
          >
            O nas
          </Link>
          <div className="pt-2 flex flex-col space-y-2">
            {user && user.role === 'CANDIDATE' ? (
              <>
                <Link
                  href="/candidate/callendar"
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-center transition-all duration-200 hover:scale-105 hover:border-primary flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Kalendarz
                  </Button>
                </Link>
                <Link href="/candidate/profile" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center transition-all duration-200 hover:scale-105 hover:border-primary flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Moje Konto
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout} 
                  className="w-full justify-center transition-all duration-200 hover:scale-105 hover:bg-primary/90"
                >
                  Wyloguj się
                </Button>
              </>
            ) : user && user.role === 'EMPLOYER' ? (
              <>
                <Link href="/employer/dashboard" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center transition-all duration-200 hover:scale-105 hover:border-primary"
                  >
                    Panel Pracodawcy: {user.username}
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout} 
                  className="w-full justify-center transition-all duration-200 hover:scale-105 hover:bg-primary/90"
                >
                  Wyloguj się
                </Button>
              </>
            ) : !isLoggingOut ? (
              <>
                <Link href="/candidate/login" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center transition-all duration-200 hover:scale-105 hover:border-primary"
                  >
                    Zaloguj się
                  </Button>
                </Link>
                <Link href="/candidate/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full justify-center transition-all duration-200 hover:scale-105 hover:bg-primary/90">
                    Zarejestruj się
                  </Button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
