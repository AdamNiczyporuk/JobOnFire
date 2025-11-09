import ToolSidebar from "@/components/ToolSidebar";
import { SmartHeader } from "@/components/SmartHeader";

export const metadata = { title: "Narzędzia" };

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8">Narzędzia dla kandydata</h1>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left sidebar with tiles */}
            <ToolSidebar />

            {/* Right content with tips */}
            <section className="flex-1">
              <article className="bg-white rounded-xl p-6 md:p-10 shadow-md border">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Jak przygotować się do rozmowy rekrutacyjnej</h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Przygotowanie merytoryczne</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                      <li>Zbadaj firmę: produkty, kultura i ostatnie newsy.</li>
                      <li>Przeczytaj ofertę i przygotuj przykłady realizacji odpowiadające wymaganiom.</li>
                      <li>Powtórz podstawy techniczne: struktury danych, HTTP, Git oraz testy.</li>
                      <li>Przygotuj portfolio/GitHub i krótkie omówienie 2–3 projektów.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Przygotowanie praktyczne i mentalne</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                      <li>Przećwicz autoprezentację: kim jesteś, co robiłeś, co chcesz robić.</li>
                      <li>Przygotuj pytania do rekrutera: zespół, proces, narzędzia, ścieżka rozwoju.</li>
                      <li>Sprawdź sprzęt: kamera, mikrofon, łącze; znajdź ciche miejsce.</li>
                      <li>Zadbaj o energię — woda, krótki rozgrzewający oddech przed startem.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold">Technika STAR</h3>
                  <p className="text-sm md:text-base leading-relaxed text-muted-foreground mt-2">
                    Stosuj schemat STAR (Sytuacja — Zadanie — Akcja — Rezultat) przy opisywaniu doświadczeń.
                    Dzięki temu Twoje odpowiedzi będą konkretne, mierzalne i łatwe do zapamiętania przez rekrutera.
                  </p>
                </div>

                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold">Po rozmowie</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base leading-relaxed text-muted-foreground mt-2">
                    <li>Zrób krótkie notatki: co poszło dobrze, co można poprawić.</li>
                    <li>Wyślij opcjonalny, krótki follow-up jeśli to pasuje do kultury organizacji.</li>
                  </ul>
                </div>
              </article>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
