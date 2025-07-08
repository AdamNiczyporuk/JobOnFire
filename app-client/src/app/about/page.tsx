import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <Header />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">O nas</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
              Poznaj historię i misję JobOnFire
            </p>
          </div>          <div className="space-y-12">
            <section className="rounded-lg border bg-white p-8 shadow-sm">
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

            <section className="rounded-lg border bg-white p-8 shadow-sm">
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

            <section className="rounded-lg border bg-white p-8 shadow-sm">
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 px-4 py-10 md:px-6 lg:flex-row lg:gap-12">
          <div className="flex flex-col gap-4 lg:w-1/3">
            <Link href="/" className="flex gap-2 items-center text-xl font-bold group cursor-pointer">
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
              <span className="transition-colors duration-300 group-hover:text-primary">
                JobOnFire
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Platforma łącząca frontend developerów z najlepszymi ofertami
              pracy w branży IT.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-125"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-125"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-125"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.944 2.013 9.284 2 12 2h.315zm-.315 9a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 110 2 1 1 0 010-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          <nav className="flex flex-col gap-2 lg:w-2/3 lg:flex-row lg:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold">Firma</p>
              <Link
                href="/about"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                O nas
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Kontakt
              </Link>
              <Link
                href="/blog"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Blog
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold">Zasoby</p>
              <Link
                href="/faq"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                FAQ
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Regulamin
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Polityka prywatności
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold">Przydatne linki</p>
              <Link
                href="/job-offers"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Oferty pracy
              </Link>
              <Link
                href="/employer"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Dla firm
              </Link>
              <Link
                href="/categories"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Kategorie
              </Link>
            </div>
          </nav>
        </div>
      </footer>
    </div>
  );
}
