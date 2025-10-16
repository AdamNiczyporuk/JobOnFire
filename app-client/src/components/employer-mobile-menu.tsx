"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/authContext"
import { logout } from "@/services/authService"

export function EmployerMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, setUser } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
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
            href="/employer/dashboard"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-2"
            onClick={() => setIsOpen(false)}
          >
            Mój Dashboard
          </Link>
          <Link
            href="/employer/job-offers"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-2"
            onClick={() => setIsOpen(false)}
          >
            Moje Oferty
          </Link>
          <Link
            href="/employer/candidates"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-2"
            onClick={() => setIsOpen(false)}
          >
            Kandydaci
          </Link>
          <Link
            href="/employer/calendar"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-2"
            onClick={() => setIsOpen(false)}
          >
            Kalendarz
          </Link>
          <Link
            href="/candidate/login"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-2"
            onClick={() => setIsOpen(false)}
          >
            Portal Kandydatów
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1 py-2"
            onClick={() => setIsOpen(false)}
          >
            O nas
          </Link>
          <div className="pt-2 flex flex-col space-y-2">
            {user && user.role === 'EMPLOYER' ? (
              <>
                <Link href="/employer/profile" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center transition-all duration-200 hover:scale-105 hover:border-primary"
                  >
                    Firma: {user.username}
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout} 
                  className="w-full justify-center transition-all duration-200 hover:scale-105 hover:bg-primary/90"
                >
                  Wyloguj się
                </Button>
              </>
            ) : user && user.role === 'CANDIDATE' ? (
              <>
                <Link href="/candidate/dashboard" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center transition-all duration-200 hover:scale-105 hover:border-primary"
                  >
                    Panel Kandydata: {user.username}
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout} 
                  className="w-full justify-center transition-all duration-200 hover:scale-105 hover:bg-primary/90"
                >
                  Wyloguj się
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
