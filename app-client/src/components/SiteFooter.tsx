import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="w-full border-t bg-white mt-12">
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
              <path d="M20 14v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"></path>
              <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path>
              <path d="M2 14h20"></path>
            </svg>
            <span className="transition-colors duration-300 group-hover:text-primary">JobOnFire</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Platforma łącząca frontend developerów z najlepszymi ofertami pracy w branży IT.
          </p>
        </div>
        <nav className="flex flex-col gap-2 lg:w-2/3 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">Firma</p>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">O nas</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Kontakt</Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">Zasoby</p>
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Regulamin</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Polityka prywatności</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">Przydatne linki</p>
            <Link href="/job-offers" className="text-sm text-muted-foreground hover:text-primary">Oferty pracy</Link>
            <Link href="/employer" className="text-sm text-muted-foreground hover:text-primary">Dla firm</Link>
            <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary">Kategorie</Link>
          </div>
        </nav>
      </div>
    </footer>
  );
}
