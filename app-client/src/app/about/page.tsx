"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SmartHeader } from "@/components/SmartHeader";
import { useAuth } from "@/context/authContext";

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">O nas</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
              Poznaj historię i misję JobOnFire
            </p>
          </div>          <div className="space-y-12">
            <section className="rounded-lg border bg-white p-8 shadow-md">
              <h2 className="text-2xl font-bold mb-4">Nasza misja</h2>
              <p className="text-muted-foreground mb-4">
                JobOnFire to platforma stworzona z myślą o frontend developerach, którzy szukają 
                swojego miejsca w branży IT. Naszym celem jest łączenie najlepszych talentów 
                z innowacyjnymi firmami, które potrzebują wykwalifikowanych specjalistów.
              </p>
              <p className="text-muted-foreground">
                Wierzymy, że każdy developer zasługuje na pracę, która go inspiruje i pozwala 
                rozwijać się zawodowo. Dlatego dokładamy wszelkich starań, aby oferować 
                najlepsze oferty pracy w branży frontend development.
              </p>
            </section>

            <section className="rounded-lg border bg-white p-8 shadow-md">
              <h2 className="text-2xl font-bold mb-6">Dlaczego warto korzystać z JobOnFire?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">🚀 Najnowsze technologie</h3>
                  <p className="text-muted-foreground">
                    Skupiamy się na najnowszych technologiach frontend, takich jak React, 
                    Next.js, Vue.js i Angular.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">🏢 Sprawdzone firmy</h3>
                  <p className="text-muted-foreground">
                    Współpracujemy tylko z renomowanymi firmami, które oferują 
                    atrakcyjne warunki zatrudnienia.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">⚡ Szybki proces</h3>
                  <p className="text-muted-foreground">
                    Nasz prosty i intuicyjny system pozwala aplikować na oferty 
                    pracy w kilka sekund.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">💼 Wsparcie kariery</h3>
                  <p className="text-muted-foreground">
                    Oferujemy wsparcie w rozwoju kariery poprzez blog, webinary 
                    i porady ekspertów.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border bg-white p-8 shadow-md">
              <h2 className="text-2xl font-bold mb-6">Nasz zespół</h2>
              <p className="text-muted-foreground mb-8">
                JobOnFire to zespół pasjonatów technologii i rekrutacji, którzy rozumieją 
                potrzeby zarówno developerów, jak i firm poszukujących talentów.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
                  <h3 className="font-bold">Anna Kowalska</h3>
                  <p className="text-muted-foreground text-sm">CEO & Founder</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
                  <h3 className="font-bold">Michał Nowak</h3>
                  <p className="text-muted-foreground text-sm">CTO</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
                  <h3 className="font-bold">Katarzyna Wiśniewska</h3>
                  <p className="text-muted-foreground text-sm">Head of Recruitment</p>
                </div>
              </div>
            </section>

            {/* Sekcja CTA - ukryta dla zalogowanych użytkowników */}
            {!user && (
              <section className="bg-primary text-primary-foreground rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Dołącz do nas już dziś!</h2>
                <p className="mb-6 max-w-[600px] mx-auto">
                  Rozpocznij swoją przygodę z najlepszymi ofertami pracy w branży frontend.
                </p>
                <Link href="/candidate/register">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Stwórz konto
                  </Button>
                </Link>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
