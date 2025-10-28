import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { AuthProvider } from "@/context/authContext";
import CookieConsent from "@/components/CookieConsent";
import SiteFooter from "@/components/SiteFooter";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "JobOnFire - Znajdź pracę jako Frontend Developer",
  description: "Platforma z ofertami pracy dla frontend developerów",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <AuthProvider>
          <ToastProvider>
            <CookieConsent />
            {children}
            <SiteFooter />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
