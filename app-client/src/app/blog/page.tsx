"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SmartHeader } from "@/components/SmartHeader";
import { useState } from "react";
import { ChevronDown, Calendar, User, ArrowRight } from "lucide-react";

interface Article {
  id: number;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  fullContent: string;
  author: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: "10 najlepszych praktyk w Next.js 14",
    category: "Frontend",
    date: "15 marca 2024",
    author: "Anna Kowalska",
    excerpt: "Poznaj najnowsze funkcjonalności Next.js 14 i dowiedz się, jak wykorzystać je w swoich projektach. App Router, Server Components i wiele więcej...",
    fullContent: `Next.js 14 wprowadza wiele znaczących ulepszeń, które zmieniają sposób, w jaki budujemy nowoczesne aplikacje webowe. W tym artykule omówimy najważniejsze praktyki, które pomogą Ci w pełni wykorzystać potencjał tej wersji.

**1. App Router - nowy standard routingu**

App Router to rewolucyjna zmiana w sposobie organizacji aplikacji Next.js. W przeciwieństwie do Pages Router, App Router wykorzystuje strukturę folderów do definiowania tras i oferuje lepsze wsparcie dla React Server Components.

**2. Server Components - domyślna opcja**

Next.js 14 domyślnie renderuje komponenty po stronie serwera, co znacząco poprawia wydajność. Używaj dyrektywy "use client" tylko wtedy, gdy potrzebujesz interaktywności lub hooków React.

**3. Optymalizacja obrazów z komponentem Image**

Komponent <Image> automatycznie optymalizuje obrazy, generuje webp, i zapewnia lazy loading. To niezbędne narzędzie dla wydajności.

**4. Metadata API dla SEO**

Nowe Metadata API pozwala łatwo zarządzać meta tagami dla każdej strony, co jest kluczowe dla SEO.

**5. Server Actions - bezpośrednie wywołania serwerowe**

Server Actions umożliwiają wykonywanie operacji serwerowych bez konieczności tworzenia oddzielnych API endpoints.

**6. Streaming i Suspense**

Wykorzystuj React Suspense do streamingu treści i pokazywania stanów ładowania, co poprawia perceived performance.

**7. Partial Prerendering**

Eksperymentalna funkcja pozwalająca na częściowe pre-renderowanie stron dla optymalnej wydajności.

**8. Zoptymalizowane fonty z next/font**

Automatyczna optymalizacja fontów eliminuje layout shift i poprawia Core Web Vitals.

**9. Paralelne ładowanie danych**

Wykorzystuj Promise.all() do równoległego ładowania danych w Server Components.

**10. TypeScript first**

Next.js 14 oferuje doskonałe wsparcie TypeScript out-of-the-box - wykorzystaj to dla lepszej developer experience.

Stosując te praktyki, stworzysz szybkie, skalowalne i łatwe w utrzymaniu aplikacje Next.js!`
  },
  {
    id: 2,
    title: "Jak przygotować się do rozmowy kwalifikacyjnej na stanowisko Frontend Developer",
    category: "Kariera",
    date: "10 marca 2024",
    author: "Piotr Nowak",
    excerpt: "Praktyczne wskazówki i najczęściej zadawane pytania na rozmowach kwalifikacyjnych. Przygotuj się na sukces w swojej karierze!",
    fullContent: `Rozmowa kwalifikacyjna na stanowisko Frontend Developer może być stresująca, ale odpowiednie przygotowanie znacząco zwiększa Twoje szanse na sukces. Oto kompleksowy przewodnik, który pomoże Ci się przygotować.

**Przygotowanie techniczne**

Zacznij od solidnego przeglądu fundamentów: JavaScript (ES6+), HTML5, CSS3, oraz frameworków, które znasz (React, Vue, Angular). Pamiętaj o:
- Zrozumieniu koncepcji asynchroniczności (Promises, async/await)
- Znajomości zarządzania stanem aplikacji
- Umiejętności debugowania i optymalizacji wydajności
- Praktyce z narzędziami deweloperskimi przeglądarki

**Najczęściej zadawane pytania techniczne**

1. Co to jest closure w JavaScript?
2. Różnica między let, const i var
3. Jak działa event loop?
4. Co to są React Hooks i kiedy ich używać?
5. Czym różni się null od undefined?
6. Jak optymalizujesz wydajność aplikacji React?
7. Co to jest Virtual DOM?
8. Wyjaśnij różnicę między flex i grid w CSS

**Live coding - czego się spodziewać**

Często rekruterzy proszą o rozwiązanie praktycznego zadania na żywo. Przygotuj się na:
- Implementację prostych algorytmów (np. FizzBuzz, odwracanie tablicy)
- Tworzenie responsywnych layoutów
- Fetch danych z API i ich wyświetlanie
- Implementację prostych komponentów React

**Przygotowanie portfolio**

Upewnij się, że Twoje portfolio:
- Jest hostowane online i działa poprawnie
- Zawiera różnorodne projekty pokazujące Twoje umiejętności
- Ma czysty, czytelny kod dostępny na GitHub
- Zawiera opis użytych technologii i rozwiązanych problemów

**Pytania behawioralne**

Przygotuj odpowiedzi na pytania typu:
- Opowiedz o swoim najciekawszym projekcie
- Jak radzisz sobie z trudnymi zadaniami?
- Opisz sytuację, gdy musiałeś nauczyć się czegoś nowego pod presją czasu
- Jak pracujesz w zespole?

**Dzień przed rozmową**

- Wyśpij się - wypoczęty umysł pracuje lepiej
- Przygotuj pytania do rekrutera (np. o stack technologiczny, proces onboardingu)
- Sprawdź połączenie internetowe i sprzęt (jeśli rozmowa online)
- Przejrzyj informacje o firmie i jej produktach

**Podczas rozmowy**

- Myśl głośno - pokażesz swój proces myślowy
- Nie bój się przyznać, jeśli czegoś nie wiesz
- Zadawaj pytania doprecyzowujące do zadań
- Zachowaj spokój i bądź sobą

**Po rozmowie**

Wyślij email z podziękowaniem za rozmowę i potwierdzeniem zainteresowania pozycją. To pokazuje profesjonalizm i zaangażowanie.

Pamiętaj: każda rozmowa to doświadczenie. Nawet jeśli nie dostaniesz pracy, wyniesiesz cenne lekcje na przyszłość. Powodzenia!`
  },
  {
    id: 3,
    title: "Tailwind CSS - od podstaw do zaawansowanych technik",
    category: "Tutorial",
    date: "5 marca 2024",
    author: "Karolina Wiśniewska",
    excerpt: "Kompletny przewodnik po Tailwind CSS. Naucz się tworzyć piękne interfejsy użytkownika z wykorzystaniem utility-first CSS framework.",
    fullContent: `Tailwind CSS zrewolucjonizował sposób, w jaki piszemy style w aplikacjach webowych. W tym artykule przejdziemy od podstaw do zaawansowanych technik, które pozwolą Ci tworzyć profesjonalne interfejsy.

**Co to jest Tailwind CSS?**

Tailwind to utility-first CSS framework, który dostarcza niskopoziomowe klasy użytkowe do budowania customowych designów. Zamiast pisać własny CSS, komponujesz style bezpośrednio w HTML/JSX.

**Instalacja i konfiguracja**

\`\`\`bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

Skonfiguruj \`tailwind.config.js\`:

\`\`\`javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
\`\`\`

**Podstawowe koncepcje**

1. **Utility classes** - każda klasa robi jedną rzecz:
   - \`text-center\` - centruje tekst
   - \`bg-blue-500\` - tło w kolorze niebieskim
   - \`p-4\` - padding 1rem

2. **Responsive design** - prefiksy dla breakpointów:
   - \`md:text-lg\` - większy tekst na średnich ekranach
   - \`lg:grid-cols-3\` - 3 kolumny na dużych ekranach

3. **Hover, focus i inne stany**:
   - \`hover:bg-blue-600\` - zmiana koloru po najechaniu
   - \`focus:ring-2\` - ring przy focusie

**Praktyczne przykłady**

**Przycisk z hover effect:**

\`\`\`jsx
<button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200">
  Kliknij mnie
</button>
\`\`\`

**Responsywny card:**

\`\`\`jsx
<div className="max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
  <img className="w-full" src="/img/card.jpg" alt="Card" />
  <div className="px-6 py-4">
    <div className="font-bold text-xl mb-2">Tytuł</div>
    <p className="text-gray-700 text-base">Opis...</p>
  </div>
</div>
\`\`\`

**Zaawansowane techniki**

**1. Własne kolory i wartości**

Rozszerz domyślną konfigurację:

\`\`\`javascript
theme: {
  extend: {
    colors: {
      primary: '#3490dc',
      secondary: '#ffed4e',
    },
    spacing: {
      '128': '32rem',
    }
  }
}
\`\`\`

**2. Używanie @apply dla reużywalnych stylów**

\`\`\`css
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded;
  }
}
\`\`\`

**3. Dark mode**

Tailwind wspiera dark mode out of the box:

\`\`\`jsx
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  Automatyczny dark mode!
</div>
\`\`\`

**4. Pluginy**

Rozszerz funkcjonalność Tailwind:

\`\`\`javascript
plugins: [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),
  require('@tailwindcss/aspect-ratio'),
]
\`\`\`

**Optymalizacja produkcyjna**

Tailwind automatycznie usuwa nieużywane style w build production, dzięki czemu finalna paczka CSS jest bardzo mała (często <10KB).

**Najlepsze praktyki**

1. Używaj sensownych nazw dla komponentów
2. Ekstrahuj powtarzające się kombinacje klas do komponentów
3. Wykorzystuj konfigurację do definiowania design tokens
4. Używaj pluginu Prettier dla formatowania klas Tailwind

**Kiedy NIE używać Tailwind?**

- Małe projekty, gdzie tradycyjny CSS jest prostszy
- Projekty z bardzo customowymi, unikalnymi designami
- Zespoły, które nie chcą uczyć się nowej metodologii

**Podsumowanie**

Tailwind CSS to potężne narzędzie, które po opanowaniu znacząco przyspiesza development. Początkowo może wydawać się skomplikowany, ale dzięki doskonałej dokumentacji i IntelliSense w VS Code, szybko stanie się Twoim ulubionym narzędziem do stylowania!`
  }
];

export default function BlogPage() {
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const toggleArticle = (id: number) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Blog</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
              Najnowsze trendy i porady dla frontend developerów
            </p>
          </div>

          <div className="space-y-8">
            {articles.map((article) => {
              const isExpanded = expandedArticle === article.id;
              
              return (
                <article key={article.id} className="rounded-lg border bg-white shadow-sm transition-all duration-300">
                  <div className="p-8">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {article.category}
                      </span>
                      <div className="flex items-center text-muted-foreground text-sm gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {article.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {article.author}
                        </span>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4">
                      {article.title}
                    </h2>
                    
                    {!isExpanded ? (
                      <>
                        <p className="text-muted-foreground mb-6">
                          {article.excerpt}
                        </p>
                        <Button 
                          onClick={() => toggleArticle(article.id)}
                          variant="outline" 
                          className="transition-all duration-200 hover:scale-105 group"
                        >
                          Czytaj więcej
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="prose prose-lg max-w-none text-muted-foreground mb-6 whitespace-pre-line">
                          {article.fullContent}
                        </div>
                        <Button 
                          onClick={() => toggleArticle(article.id)}
                          variant="outline"
                          className="transition-all duration-200"
                        >
                          <ChevronDown className="mr-2 w-4 h-4" />
                          Zwiń artykuł
                        </Button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
