"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileMenu } from "../components/mobile-menu";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "CANDIDATE") {
      router.replace("/candidate/dashboard");
    } else if (user?.role === "EMPLOYER") {
      router.replace("/employer/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
          <div className="flex gap-2 items-center text-xl font-bold group cursor-pointer">
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
          </div>
          <div className="flex items-center">
            {/* Menu mobilne */}
            <MobileMenu />

            {/* Nawigacja desktopowa */}
            <nav className="hidden sm:flex items-center">
              <div className="flex items-center space-x-4 mr-4">
                <Link
                  href="#"
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
                >
                  Oferty pracy
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
                >
                  Dla firm
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
                >
                  Blog
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105"
                >
                  O nas
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Link href="/candidate/login">
                  <Button
                    variant="outline"
                    className="transition-all duration-200 hover:scale-105 hover:border-primary"
                  >
                    Zaloguj się
                  </Button>
                </Link>
                <Link href="/candidate/register">
                <Button className="transition-all duration-200 hover:scale-105 hover:bg-primary/90">
                  Zarejestruj się
                </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Znajdź swoją wymarzoną pracę jako Frontend Developer
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Przeglądaj tysiące ofert pracy z Next.js, React, Tailwind CSS
                  i innych technologii frontendowych.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-[600px]">
                  <div className="relative flex-1">
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
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    <Input
                      type="search"
                      placeholder="Szukaj technologii, stanowiska..."
                      className="w-full pl-8 transition-all duration-200 focus:scale-[1.02] focus:border-primary"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="px-8 whitespace-nowrap transition-all duration-200 hover:scale-105 hover:bg-primary/90"
                  >
                    Szukaj
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Popularne: Next.js, React, Tailwind CSS, TypeScript,
                  JavaScript
                </p>
              </div>
              <div className="flex justify-center">
                <Image
                  src="https://placehold.co/400x"
                  alt="Job Search"
                  width={400}
                  height={400}
                  className="rounded-lg object-cover transition-all duration-300 hover:shadow-xl hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">5000+</h3>
                <p className="text-muted-foreground">Ofert pracy</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">1200+</h3>
                <p className="text-muted-foreground">Firm</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">15000+</h3>
                <p className="text-muted-foreground">Użytkowników</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">98%</h3>
                <p className="text-muted-foreground">Zadowolonych klientów</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
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

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
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
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 transition-all duration-200 hover:scale-105"
                >
                  Przeglądaj oferty
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-200 hover:scale-105"
                >
                  Utwórz konto
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 px-4 py-10 md:px-6 lg:flex-row lg:gap-12">
          <div className="flex flex-col gap-4 lg:w-1/3">
            <div className="flex gap-2 items-center text-xl font-bold group cursor-pointer">
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
            </div>
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
                href="#"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                O nas
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Kontakt
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Blog
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold">Zasoby</p>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                FAQ
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Regulamin
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Polityka prywatności
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold">Przydatne linki</p>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Oferty pracy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Dla firm
              </Link>
              <Link
                href="#"
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
