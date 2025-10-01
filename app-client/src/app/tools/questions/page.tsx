import ToolSidebar from "@/components/ToolSidebar";
import InterviewTestGenerator from "@/components/InterviewTestGenerator";
import { SmartHeader } from "@/components/SmartHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Pytania na rozmowę" };

export default function QuestionsPage() {
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
      <SiteFooter />
    </div>
  );
}
