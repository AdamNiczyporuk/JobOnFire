"use client";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmartHeader } from "@/components/SmartHeader";
// Statyczny import pozwala Next.js zoptymalizować obraz (plik w public/homepage_Image.png).
import homepage_Image from "../../public/homepage_Image.png";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />

      <main className="flex-1 w-full">
        {/* Sekcja powitalna dla zalogowanych użytkowników */}
        {user && (
          <section className="w-full py-12 md:py-16 bg-muted relative">
            <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Witaj z powrotem, {user.username}! 👋
                  </h1>
                  <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                    {user.role === "CANDIDATE" 
                      ? "Znajdź najnowsze oferty pracy dopasowane do Twoich umiejętności i rozpocznij kolejny etap swojej kariery"
                      : "Zarządzaj swoimi ofertami pracy i znajdź najlepszych kandydatów dla swojej firmy"}
                  </p>
                </div>
                
                {/* Wyszukiwarka ofert pracy dla zalogowanych */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 max-w-[600px] mx-auto">
                  <div className="relative flex-1 group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:text-red-500 group-focus-within:text-red-500 group-focus-within:scale-110"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    <Input
                      type="search"
                      placeholder="Szukaj ofert pracy..."
                      className="w-full pl-8 transition-all duration-300 focus:scale-[1.02] focus:border-red-500 hover:border-red-400 bg-background focus:shadow-lg hover:shadow-md placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-70"
                    />
                  </div>
                  <Link href="/job-offers">
                    <Button 
                      size="lg" 
                      className="px-8 whitespace-nowrap transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-lg transform active:scale-95"
                    >
                      Szukaj ofert
                    </Button>
                  </Link>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {user.role === "CANDIDATE" 
                    ? "Sprawdź najnowsze oferty w swoich ulubionych technologiach"
                    : "Dodaj nową ofertę lub sprawdź aplikacje kandydatów"}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Hero Section - tylko dla niezalogowanych */}
        {!user && (
          <section className="w-full py-12 md:py-20 lg:py-24 bg-muted">
            <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Znajdź swoją wymarzoną pracę w IT
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Przeglądaj tysiące ofert pracy z różnych dziedzin IT - od developera po analityka, od juniora po seniora.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-[600px]">
                  <div className="relative flex-1 group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:text-red-500 group-focus-within:text-red-500 group-focus-within:scale-110"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    <Input
                      type="search"
                      placeholder="Szukaj technologii, stanowiska..."
                      className="w-full pl-8 transition-all duration-300 focus:scale-[1.02] focus:border-red-500 hover:border-red-400 focus:shadow-lg hover:shadow-md placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-70"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="px-8 whitespace-nowrap transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-lg transform active:scale-95"
                  >
                    Szukaj
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Popularne: React, Java, Python, JavaScript, .NET, Angular
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative w-[400px] h-[400px] rounded-xl overflow-hidden shadow-lg ring-1 ring-black/10 hover:shadow-2xl transition-all duration-500 group">
                  <Image
                    src={homepage_Image}
                    alt="Energia kariery IT w płomieniach sukcesu"
                    fill
                    priority
                    sizes="(max-width: 768px) 300px, 400px"
                    placeholder="blur"
                    // Minimalny blurDataURL – można podmienić na lepszy wygenerowany np. lqip
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFgwJ/lmLZJwAAAABJRU5ErkJggg=="
                    className="object-cover object-center group-hover:scale-105 group-hover:brightness-110 ease-out duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/20 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-white drop-shadow-md">
                    <p className="text-sm font-medium tracking-wide">
                      Rozpal swoją karierę z JobOnFire
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Stats Section */}
        <section className="w-full py-8 md:py-10 bg-background relative">
          {/* Subtelny separator u góry dla zalogowanych */}
          {user && (
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          )}
          <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
            <div className="bg-white rounded-xl shadow-lg border p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
              <div className="grid grid-cols-4 gap-6 md:gap-8 text-center">
                <div className="space-y-1 p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:scale-105 cursor-pointer group">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110">💼 5000+</h3>
                  <p className="text-sm text-muted-foreground font-medium transition-colors duration-300 group-hover:text-blue-700">Ofert pracy</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 hover:scale-105 cursor-pointer group">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 transition-all duration-300 group-hover:text-green-600 group-hover:scale-110">🏢 1200+</h3>
                  <p className="text-sm text-muted-foreground font-medium transition-colors duration-300 group-hover:text-green-700">Firm</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 hover:scale-105 cursor-pointer group">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 transition-all duration-300 group-hover:text-purple-600 group-hover:scale-110">👥 15000+</h3>
                  <p className="text-sm text-muted-foreground font-medium transition-colors duration-300 group-hover:text-purple-700">Użytkowników</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-br hover:from-amber-50 hover:to-yellow-50 hover:scale-105 cursor-pointer group">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 transition-all duration-300 group-hover:text-amber-600 group-hover:scale-110">⭐ 98%</h3>
                  <p className="text-sm text-muted-foreground font-medium transition-colors duration-300 group-hover:text-amber-700">Zadowolonych klientów</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-18 lg:py-20 bg-muted">
          <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Dlaczego warto korzystać z JobOnFire?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nasza platforma oferuje najlepsze narzędzia do znalezienia
                  pracy w branży frontend.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:bg-primary/20">
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
                    className="h-6 w-6 text-primary transition-transform duration-300 hover:rotate-12 hover:scale-110"
                  >
                    <path d="m18 16 4-4-4-4"></path>
                    <path d="m6 8-4 4 4 4"></path>
                    <path d="m14.5 4-5 16"></path>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Najnowsze technologie</h3>
                  <p className="text-muted-foreground">
                    Oferty pracy z najnowszymi technologiami frontendowymi, w
                    tym Next.js i Tailwind CSS.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
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
                    className="h-6 w-6 text-primary transition-transform duration-300 hover:rotate-12 hover:scale-110"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Sprawdzone firmy</h3>
                  <p className="text-muted-foreground">
                    Współpracujemy tylko ze sprawdzonymi firmami, które oferują
                    atrakcyjne warunki zatrudnienia.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
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
                    className="h-6 w-6 text-primary transition-transform duration-300 hover:rotate-12 hover:scale-110"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Szybkie aplikowanie</h3>
                  <p className="text-muted-foreground">
                    Aplikuj na oferty pracy w kilka sekund dzięki naszemu
                    intuicyjnemu systemowi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Jobs Section */}
        <section className="w-full py-12 md:py-16 bg-background">
          <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  🔥 Najnowsze oferty pracy
                </h2>
                <p className="text-muted-foreground md:text-lg">
                  Sprawdź najświeższe oferty od najlepszych firm IT
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
                {/* Oferta 1 */}
                <div className="group rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          Senior React Developer
                        </h3>
                        <p className="text-sm text-muted-foreground">TechCorp Sp. z o.o.</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        Zdalna
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Szukamy doświadczonego React developera do pracy nad nowatorskimi projektami e-commerce.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">15 000 - 20 000 zł</span>
                      <Link href="/job-offers" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        Zobacz więcej →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Oferta 2 */}
                <div className="group rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          Java Backend Developer
                        </h3>
                        <p className="text-sm text-muted-foreground">FinTech Solutions</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Hybryda
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Dołącz do zespołu tworzącego innowacyjne rozwiązania finansowe dla banków.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">12 000 - 18 000 zł</span>
                      <Link href="/job-offers" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        Zobacz więcej →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Oferta 3 */}
                <div className="group rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          DevOps Engineer
                        </h3>
                        <p className="text-sm text-muted-foreground">CloudTech Innovations</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Warszawa
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Administruj infrastrukturą chmurową i automatyzuj procesy CI/CD.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">16 000 - 22 000 zł</span>
                      <Link href="/job-offers" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        Zobacz więcej →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link href="/job-offers">
                <Button size="lg" className="mt-4 transition-all duration-200 hover:scale-105">
                  Zobacz wszystkie oferty
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section - tylko dla niezalogowanych */}
        {!user && (
          <section className="w-full py-12 md:py-16 lg:py-20 bg-primary text-primary-foreground">
          <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Gotowy na nowe wyzwania zawodowe?
                </h2>
                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Dołącz do tysięcy frontend developerów, którzy znaleźli
                  wymarzoną pracę dzięki naszej platformie.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/job-offers">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 transition-all duration-200 hover:scale-105"
                  >
                    Przeglądaj oferty
                  </Button>
                </Link>
                <Link href="/candidate/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-200 hover:scale-105"
                  >
                    Utwórz konto
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          </section>
        )}
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
