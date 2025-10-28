"use client";
import { SmartHeader } from "@/components/SmartHeader";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Polityka Prywatności
            </h1>
            <p className="text-muted-foreground">
              Ostatnia aktualizacja: 28 października 2025
            </p>
          </div>

          <div className="space-y-8 bg-white rounded-lg border p-8 shadow-sm">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Informacje ogólne</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  1.1. Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych 
                  przekazanych przez Użytkowników w związku z korzystaniem z serwisu JobOnFire.
                </p>
                <p>
                  1.2. Administratorem danych osobowych jest JobOnFire Sp. z o.o. z siedzibą w Warszawie, 
                  ul. Przykładowa 123, 00-001 Warszawa.
                </p>
                <p>
                  1.3. Kontakt z Administratorem możliwy jest pod adresem email: privacy@jobonfire.pl 
                  lub telefonicznie: +48 123 456 789.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Podstawa prawna przetwarzania danych</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  2.1. Administrator przetwarza dane osobowe zgodnie z Rozporządzeniem Parlamentu Europejskiego 
                  i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) oraz ustawą o ochronie danych osobowych.
                </p>
                <p>
                  2.2. Podstawą prawną przetwarzania danych jest:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2">
                  <li>Zgoda użytkownika (art. 6 ust. 1 lit. a RODO)</li>
                  <li>Niezbędność do wykonania umowy (art. 6 ust. 1 lit. b RODO)</li>
                  <li>Prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO)</li>
                  <li>Wypełnienie obowiązku prawnego (art. 6 ust. 1 lit. c RODO)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Zakres zbieranych danych</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  3.1. <strong>Dane rejestracyjne:</strong>
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>Imię i nazwisko</li>
                  <li>Adres email</li>
                  <li>Numer telefonu (opcjonalnie)</li>
                  <li>Hasło (przechowywane w postaci zahashowanej)</li>
                </ul>
                <p className="mt-3">
                  3.2. <strong>Dane profilu Kandydata:</strong>
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>CV i dokumenty aplikacyjne</li>
                  <li>Doświadczenie zawodowe</li>
                  <li>Wykształcenie</li>
                  <li>Umiejętności i certyfikaty</li>
                  <li>Portfolio (opcjonalnie)</li>
                </ul>
                <p className="mt-3">
                  3.3. <strong>Dane Pracodawcy:</strong>
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>Nazwa firmy</li>
                  <li>NIP</li>
                  <li>Adres siedziby</li>
                  <li>Dane kontaktowe</li>
                  <li>Dane do faktury</li>
                </ul>
                <p className="mt-3">
                  3.4. <strong>Dane techniczne:</strong>
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>Adres IP</li>
                  <li>Typ przeglądarki</li>
                  <li>System operacyjny</li>
                  <li>Dane z plików cookies</li>
                  <li>Historia aktywności w serwisie</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Cel przetwarzania danych</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Dane osobowe przetwarzane są w następujących celach:</p>
                <ul className="list-disc list-inside pl-4 space-y-2">
                  <li>Świadczenie usług dostępnych w Serwisie</li>
                  <li>Prowadzenie procesu rekrutacji</li>
                  <li>Kontakt z Użytkownikami</li>
                  <li>Marketing i promocja usług (po wyrażeniu zgody)</li>
                  <li>Analiza statystyczna i usprawnianie Serwisu</li>
                  <li>Zapewnienie bezpieczeństwa i wykrywanie nadużyć</li>
                  <li>Realizacja obowiązków prawnych (np. rachunkowych, podatkowych)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Udostępnianie danych osobowych</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  5.1. Dane osobowe Kandydatów mogą być udostępniane Pracodawcom w związku 
                  z procesem rekrutacji (tylko za zgodą Kandydata).
                </p>
                <p>
                  5.2. Administrator może przekazywać dane osobowe następującym kategoriom odbiorców:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2">
                  <li>Dostawcy usług IT i hostingu</li>
                  <li>Dostawcy systemów płatności</li>
                  <li>Dostawcy narzędzi analitycznych (Google Analytics)</li>
                  <li>Dostawcy usług marketingowych</li>
                  <li>Organy państwowe (na żądanie wynikające z przepisów prawa)</li>
                </ul>
                <p className="mt-3">
                  5.3. Administrator nie sprzedaje danych osobowych Użytkowników osobom trzecim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Okres przechowywania danych</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  6.1. Dane osobowe przechowywane są przez okres niezbędny do realizacji celów, 
                  dla których zostały zebrane, lub przez okres wymagany przepisami prawa.
                </p>
                <p>
                  6.2. Szczegółowe okresy przechowywania:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2">
                  <li>Dane konta: do momentu usunięcia konta lub wycofania zgody</li>
                  <li>Dane do faktur: 5 lat (wymóg prawny)</li>
                  <li>Dane aplikacji na oferty pracy: 3 miesiące od zakończenia rekrutacji</li>
                  <li>Logi systemowe: 12 miesięcy</li>
                  <li>Dane marketingowe: do wycofania zgody</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Prawa Użytkowników</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Użytkownik ma prawo do:</p>
                <ul className="list-disc list-inside pl-4 space-y-2">
                  <li><strong>Dostępu</strong> do swoich danych osobowych</li>
                  <li><strong>Sprostowania</strong> (poprawiania) danych</li>
                  <li><strong>Usunięcia</strong> danych ("prawo do bycia zapomnianym")</li>
                  <li><strong>Ograniczenia przetwarzania</strong> danych</li>
                  <li><strong>Przenoszenia</strong> danych</li>
                  <li><strong>Sprzeciwu</strong> wobec przetwarzania danych</li>
                  <li><strong>Cofnięcia zgody</strong> w dowolnym momencie</li>
                  <li><strong>Wniesienia skargi</strong> do organu nadzorczego (UODO)</li>
                </ul>
                <p className="mt-3">
                  Aby skorzystać z powyższych praw, należy skontaktować się z Administratorem 
                  pod adresem: privacy@jobonfire.pl
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Pliki cookies</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  8.1. Serwis wykorzystuje pliki cookies (ciasteczka) w celu zapewnienia prawidłowego 
                  działania strony, personalizacji treści oraz analizy ruchu.
                </p>
                <p>
                  8.2. Rodzaje używanych cookies:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2">
                  <li><strong>Niezbędne:</strong> zapewniają podstawowe funkcje Serwisu (np. logowanie)</li>
                  <li><strong>Funkcjonalne:</strong> zapamiętują preferencje użytkownika</li>
                  <li><strong>Analityczne:</strong> służą do analizy ruchu (Google Analytics)</li>
                  <li><strong>Marketingowe:</strong> wykorzystywane do personalizacji reklam</li>
                </ul>
                <p className="mt-3">
                  8.3. Użytkownik może zarządzać plikami cookies w ustawieniach swojej przeglądarki 
                  lub za pomocą panelu zgody na cookies dostępnego na stronie.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Bezpieczeństwo danych</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  9.1. Administrator stosuje odpowiednie środki techniczne i organizacyjne 
                  w celu ochrony danych osobowych przed nieuprawnionym dostępem, utratą lub zniszczeniem.
                </p>
                <p>
                  9.2. Zastosowane zabezpieczenia:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2">
                  <li>Szyfrowanie połączeń (SSL/TLS)</li>
                  <li>Hashowanie haseł</li>
                  <li>Regularne kopie zapasowe</li>
                  <li>Firewalle i systemy wykrywania intruzów</li>
                  <li>Audyty bezpieczeństwa</li>
                  <li>Szkolenia pracowników w zakresie ochrony danych</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Zmiany w Polityce Prywatności</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  10.1. Administrator zastrzega sobie prawo do wprowadzania zmian w Polityce Prywatności.
                </p>
                <p>
                  10.2. O wszelkich zmianach Użytkownicy zostaną poinformowani z 7-dniowym wyprzedzeniem 
                  poprzez komunikat na stronie głównej Serwisu lub email.
                </p>
                <p>
                  10.3. Aktualna wersja Polityki Prywatności zawsze dostępna jest na stronie 
                  jobonfire.pl/privacy
                </p>
              </div>
            </section>

            <section className="border-t pt-8 mt-8">
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="text-sm font-semibold mb-2">Kontakt w sprawach ochrony danych osobowych:</p>
                <p className="text-sm text-muted-foreground">
                  Email: privacy@jobonfire.pl<br />
                  Telefon: +48 123 456 789<br />
                  Adres: ul. Przykładowa 123, 00-001 Warszawa
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Organ nadzorczy:</strong><br />
                  Urząd Ochrony Danych Osobowych (UODO)<br />
                  ul. Stawki 2, 00-193 Warszawa<br />
                  www.uodo.gov.pl
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
