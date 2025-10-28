"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmartHeader } from "@/components/SmartHeader";
import { getPublicJobOffers } from "@/services/jobOfferService";
import type { JobOffer } from "@/types/jobOffer";
// Statyczny import pozwala Next.js zoptymalizować obraz (plik w public/homepage_Image.png).
import homepage_Image from "../../public/homepage_Image.png";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [latestOffers, setLatestOffers] = useState<JobOffer[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestError, setLatestError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLatestLoading(true);
        setLatestError(null);
  const res = await getPublicJobOffers({ page: 1, limit: 3, sortBy: "createDate", sortOrder: "desc" });
        if (!mounted) return;
        setLatestOffers(res.jobOffers);
      } catch {
        if (!mounted) return;
        setLatestError("Nie udało się pobrać najnowszych ofert.");
        setLatestOffers([]);
      } finally {
        if (mounted) setLatestLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const truncate = (text?: string, max = 120) => {
    if (!text) return "";
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}...` : text;
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/job-offers?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/job-offers');
    }
  };

  const formatWorkingMode = (offer: JobOffer): string => {
    if (offer.workingMode && offer.workingMode.length > 0) {
      // Pokaż pierwszy tryb pracy (krótko w odznace)
      return offer.workingMode[0];
    }
    return "";
  };

  const workingModeBadgeClasses = (mode: string): string => {
    const m = mode.toLowerCase();
    if (m.includes("zdal")) return "bg-primary/10 text-primary"; // Zdalna -> czerwony (brand)
    if (m.includes("hybryd")) return "bg-green-100 text-green-800"; // Hybrydowa -> zielony
    if (m.includes("stacj") || m.includes("biur") || m.includes("on-site")) return "bg-blue-100 text-blue-800"; // Stacjonarna -> niebieski
    return "bg-primary/10 text-primary"; // domyślne
  };

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
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mt-8 max-w-[600px] mx-auto">
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 transition-all duration-300 focus:scale-[1.02] focus:border-red-500 hover:border-red-400 bg-background focus:shadow-lg hover:shadow-md placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-70"
                    />
                  </div>
                  <Button 
                    type="submit"
                    size="lg" 
                    className="px-8 whitespace-nowrap transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-lg transform active:scale-95"
                  >
                    Szukaj ofert
                  </Button>
                </form>
                
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
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-[600px]">
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 transition-all duration-300 focus:scale-[1.02] focus:border-red-500 hover:border-red-400 focus:shadow-lg hover:shadow-md placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-70"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="px-8 whitespace-nowrap transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-lg transform active:scale-95"
                  >
                    Szukaj
                  </Button>
                </form>
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
                {latestLoading ? (
                  <div className="col-span-full text-center text-muted-foreground">Ładowanie ofert…</div>
                ) : latestError ? (
                  <div className="col-span-full text-center text-red-500">{latestError}</div>
                ) : latestOffers.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground">Brak ofert do wyświetlenia.</div>
                ) : (
                  latestOffers.map((offer) => (
                    <Link 
                      key={offer.id} 
                      href={`/job-offers/${offer.id}`}
                      className="group rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary/50 cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {offer.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{offer.employerProfile?.companyName ?? ""}</p>
                          </div>
                          {(() => {
                            const mode = formatWorkingMode(offer);
                            return (
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${workingModeBadgeClasses(mode)}`}
                              >
                                {mode}
                              </span>
                            );
                          })()}
                        </div>
                        {offer.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {truncate(offer.description)}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-primary">{offer.salary ?? ""}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
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
    </div>
  );
}
