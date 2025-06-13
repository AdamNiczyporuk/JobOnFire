import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { AuthProvider } from "@/context/authContext";

export const metadata: Metadata = {
  title: "JobOnFire - Znajdź pracę jako Frontend Developer",
  description: "Platforma z ofertami pracy dla frontend developerów",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
