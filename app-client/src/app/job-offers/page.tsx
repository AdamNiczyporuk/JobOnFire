import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export default function JobOffersPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <Header />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Oferty pracy</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
              Znajdź swoją idealną pracę w branży frontend development
            </p>
          </div>          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Przykładowe oferty pracy */}
            <div className="rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 h-14 flex items-start">Frontend Developer - React/Next.js</h3>
                <p className="text-muted-foreground mb-2 font-medium h-6">TechCorp Sp. z o.o.</p>
                <p className="text-sm text-muted-foreground mb-4 h-5">Warszawa • 12 000 - 18 000 PLN</p>
                <div className="flex flex-wrap gap-2 mb-6 h-16 items-start">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">React</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Next.js</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">TypeScript</span>
                </div>
              </div>
              <Button className="w-full transition-all duration-200 hover:scale-105 mt-auto">Aplikuj</Button>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 h-14 flex items-start">Senior Frontend Developer</h3>
                <p className="text-muted-foreground mb-2 font-medium h-6">StartupXYZ</p>
                <p className="text-sm text-muted-foreground mb-4 h-5">Kraków • 15 000 - 22 000 PLN</p>
                <div className="flex flex-wrap gap-2 mb-6 h-16 items-start">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Vue.js</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Nuxt.js</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">JavaScript</span>
                </div>
              </div>
              <Button className="w-full transition-all duration-200 hover:scale-105 mt-auto">Aplikuj</Button>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 h-14 flex items-start">Full Stack Developer</h3>
                <p className="text-muted-foreground mb-2 font-medium h-6">InnovateLab</p>
                <p className="text-sm text-muted-foreground mb-4 h-5">Gdańsk • 14 000 - 20 000 PLN</p>
                <div className="flex flex-wrap gap-2 mb-6 h-16 items-start">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">React</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Node.js</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">MongoDB</span>
                </div>
              </div>
              <Button className="w-full transition-all duration-200 hover:scale-105 mt-auto">Aplikuj</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
