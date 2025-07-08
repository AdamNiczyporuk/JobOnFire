import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <Header />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Blog</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
              Najnowsze trendy i porady dla frontend developerów
            </p>
          </div>          <div className="space-y-8">
            {/* Przykładowe artykuły */}
            <article className="rounded-lg border bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Frontend</span>
                <span className="ml-4 text-muted-foreground text-sm">15 marca 2024</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 hover:text-primary cursor-pointer transition-colors">
                10 najlepszych praktyk w Next.js 14
              </h2>
              <p className="text-muted-foreground mb-6">
                Poznaj najnowsze funkcjonalności Next.js 14 i dowiedz się, jak wykorzystać je w swoich projektach. 
                App Router, Server Components i wiele więcej...
              </p>
              <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                Czytaj więcej
              </Button>
            </article>

            <article className="rounded-lg border bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Kariera</span>
                <span className="ml-4 text-muted-foreground text-sm">10 marca 2024</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 hover:text-primary cursor-pointer transition-colors">
                Jak przygotować się do rozmowy kwalifikacyjnej na stanowisko Frontend Developer
              </h2>
              <p className="text-muted-foreground mb-6">
                Praktyczne wskazówki i najczęściej zadawane pytania na rozmowach kwalifikacyjnych. 
                Przygotuj się na sukces w swojej karierze!
              </p>
              <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                Czytaj więcej
              </Button>
            </article>

            <article className="rounded-lg border bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Tutorial</span>
                <span className="ml-4 text-muted-foreground text-sm">5 marca 2024</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 hover:text-primary cursor-pointer transition-colors">
                Tailwind CSS - od podstaw do zaawansowanych technik
              </h2>
              <p className="text-muted-foreground mb-6">
                Kompletny przewodnik po Tailwind CSS. Naucz się tworzyć piękne interfejsy użytkownika 
                z wykorzystaniem utility-first CSS framework.
              </p>
              <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                Czytaj więcej
              </Button>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
