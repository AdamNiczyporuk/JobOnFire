"use client";
import { useAuth } from "@/context/authContext";
import ToolSidebar from "@/components/ToolSidebar";
import InterviewTestGenerator from "@/components/InterviewTestGenerator";
import { SmartHeader } from "@/components/SmartHeader";
import Link from "next/link";

export default function QuestionsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <SmartHeader />
        <main className="flex-1 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Ładowanie...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <SmartHeader />
        <main className="flex-1 w-full">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6">
              <ToolSidebar />
              <section className="flex-1">
                <div className="rounded-xl border bg-white p-8 shadow-sm text-center">
                  <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h2 className="text-xl font-bold mb-2">Wymagane logowanie</h2>
                  <p className="text-muted-foreground mb-6">
                    Aby korzystać z generatora pytań na rozmowę, musisz być zalogowany.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Link href="/candidate/login" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                      Zaloguj się
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <ToolSidebar />
            <section className="flex-1">
              <div className="mb-4">
                <h1 className="text-2xl font-bold">Przykładowe pytania na rozmowę</h1>
                <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-sm bg-primary/10 px-2 py-0.5 text-primary text-[11px]">AI</span>
                  Wspomagane przez AI — losuj pytania dostosowane do kategorii
                </p>
              </div>
              <InterviewTestGenerator />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
