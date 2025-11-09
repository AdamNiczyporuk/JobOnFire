"use client";
import { SmartHeader } from "@/components/SmartHeader";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Dla kandydatów",
    question: "Czy korzystanie z serwisu jest bezpłatne dla kandydatów?",
    answer: "Tak! JobOnFire jest całkowicie bezpłatny dla osób szukających pracy. Możesz przeglądać oferty, tworzyć profil, aplikować na stanowiska i korzystać ze wszystkich naszych narzędzi bez żadnych opłat."
  },
  {
    category: "Dla kandydatów",
    question: "Jak mogę aplikować na ofertę pracy?",
    answer: "Po zalogowaniu się do konta, znajdź interesującą ofertę i kliknij przycisk 'Aplikuj'. Możesz użyć swojego profilu z automatycznie wygenerowanym CV lub przesłać własne dokumenty. Pracodawca otrzyma Twoją aplikację i skontaktuje się z Tobą, jeśli będzie zainteresowany."
  },
  {
    category: "Dla kandydatów",
    question: "Czy mogę edytować swój profil po jego utworzeniu?",
    answer: "Oczywiście! W każdej chwili możesz zaktualizować swój profil, dodać nowe doświadczenie, umiejętności, projekty czy certyfikaty. Im bardziej kompletny profil, tym większe szanse na znalezienie wymarzonej pracy."
  },
  {
    category: "Dla pracodawców",
    question: "Jak długo będzie widoczna moja oferta?",
    answer: "Standardowo oferta jest aktywna przez 30 dni. Możesz ją przedłużyć w dowolnym momencie lub wcześniej dezaktywować, jeśli znajdziesz odpowiedniego kandydata."
  },
  {
    category: "Dla pracodawców",
    question: "Czy mogę edytować opublikowaną ofertę?",
    answer: "Tak, w każdej chwili możesz edytować szczegóły oferty - wynagrodzenie, wymagania, opis stanowiska. Zmiany są widoczne natychmiast po zapisaniu."
  },
  {
    category: "Dla pracodawców",
    question: "Jak mogę skontaktować się z kandydatami?",
    answer: "Po otrzymaniu aplikacji, zobaczysz dane kontaktowe kandydata (email, telefon) oraz możliwość wysłania wiadomości bezpośrednio przez platformę. Możesz też zaplanować rozmowę kwalifikacyjną za pomocą naszego kalendarza."
  },
  {
    category: "Bezpieczeństwo i prywatność",
    question: "Jak chronione są moje dane osobowe?",
    answer: "Traktujemy bezpieczeństwo bardzo poważnie. Wszystkie dane są szyfrowane, stosujemy protokół SSL/TLS, a dostęp do danych mają tylko autoryzowane osoby. Pełna polityka prywatności dostępna jest tutaj: /privacy"
  },
  {
    category: "Bezpieczeństwo i prywatność",
    question: "Czy mogę usunąć swoje konto?",
    answer: "Tak, w każdej chwili możesz usunąć konto z poziomu ustawień profilu. Po usunięciu, wszystkie Twoje dane zostaną trwale wykasowane z naszych systemów."
  },
  {
    category: "Bezpieczeństwo i prywatność",
    question: "Kto może zobaczyć mój profil?",
    answer: "Tylko pracodawcy zalogowani do serwisu mogą przeglądać profile kandydatów. Twoje dane kontaktowe są widoczne dopiero po złożeniu aplikacji na ofertę pracy."
  },
  {
    category: "Pomoc techniczna",
    question: "Nie mogę się zalogować do konta, co robić?",
    answer: "Spróbuj zresetować hasło używając opcji 'Zapomniałeś hasła?' na stronie logowania. Jeśli to nie pomoże, skontaktuj się z nami: kontakt@jobonfire.pl"
  },
  {
    category: "Pomoc techniczna",
    question: "Nie otrzymałem emaila aktywacyjnego",
    answer: "Sprawdź folder SPAM. Jeśli nadal nie ma wiadomości, możesz wysłać link ponownie z poziomu strony logowania. W razie problemów napisz do nas."
  },
  {
    category: "Pomoc techniczna",
    question: "Mam problem z przesłaniem CV, co mogę zrobić?",
    answer: "Upewnij się, że plik CV jest w formacie PDF lub DOCX i nie przekracza 5 MB. Jeśli problem nadal występuje, spróbuj użyć innej przeglądarki lub skontaktuj się z supportem."
  },
  {
    category: "Pomoc techniczna",
    question: "Jak mogę zgłosić błąd lub zasugerować nową funkcję?",
    answer: "Bardzo cenimy feedback! Napisz do nas na: feedback@jobonfire.pl lub skorzystaj z formularza kontaktowego. Każda sugestia jest dla nas ważna."
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const categories = Array.from(new Set(faqData.map(item => item.category)));

  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Najczęściej zadawane pytania
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Znajdź odpowiedzi na najczęstsze pytania dotyczące korzystania z JobOnFire
            </p>
          </div>

          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4">{category}</h2>
                <div className="space-y-2">
                  {faqData
                    .filter(item => item.category === category)
                    .map((item, index) => {
                      const globalIndex = faqData.indexOf(item);
                      const isOpen = openIndex === globalIndex;
                      
                      return (
                        <div key={globalIndex} className="bg-white rounded-lg border shadow-md">
                          <button
                            onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                          >
                            <span className="font-medium pr-4">{item.question}</span>
                            <ChevronDown
                              className={`w-5 h-5 flex-shrink-0 transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4 text-muted-foreground">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-primary/5 rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Nie znalazłeś odpowiedzi?</h3>
            <p className="text-muted-foreground mb-4">
              Skontaktuj się z nami, chętnie pomożemy!
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
            >
              Skontaktuj się
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
