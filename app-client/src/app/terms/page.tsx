"use client";
import { SmartHeader } from "@/components/SmartHeader";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Regulamin serwisu
            </h1>
            <p className="text-muted-foreground">
              Ostatnia aktualizacja: 28 października 2025
            </p>
          </div>

          <div className="space-y-8 bg-white rounded-lg border p-8 shadow-sm">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Postanowienia ogólne</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  1.1. Niniejszy regulamin określa zasady korzystania z serwisu JobOnFire, 
                  dostępnego pod adresem jobonfire.pl (zwanego dalej "Serwisem").
                </p>
                <p>
                  1.2. Właścicielem i administratorem Serwisu jest JobOnFire Sp. z o.o. 
                  z siedzibą w Warszawie (zwana dalej "Administratorem").
                </p>
                <p>
                  1.3. Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Definicje</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  2.1. <strong>Użytkownik</strong> - osoba fizyczna, osoba prawna lub jednostka organizacyjna 
                  nieposiadająca osobowości prawnej, korzystająca z Serwisu.
                </p>
                <p>
                  2.2. <strong>Kandydat</strong> - Użytkownik poszukujący pracy za pośrednictwem Serwisu.
                </p>
                <p>
                  2.3. <strong>Pracodawca</strong> - Użytkownik publikujący oferty pracy w Serwisie.
                </p>
                <p>
                  2.4. <strong>Oferta pracy</strong> - ogłoszenie o pracę publikowane przez Pracodawcę w Serwisie.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Rejestracja i konto użytkownika</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  3.1. Rejestracja w Serwisie wymaga podania prawdziwych danych osobowych 
                  oraz akceptacji niniejszego Regulaminu i Polityki Prywatności.
                </p>
                <p>
                  3.2. Użytkownik zobowiązuje się do nieudostępniania swojego hasła osobom trzecim 
                  oraz do niezwłocznego poinformowania Administratora o nieautoryzowanym dostępie do konta.
                </p>
                <p>
                  3.3. Użytkownik może posiadać tylko jedno aktywne konto w Serwisie.
                </p>
                <p>
                  3.4. Administrator zastrzega sobie prawo do odmowy rejestracji lub usunięcia konta 
                  w przypadku naruszenia postanowień Regulaminu.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Zasady korzystania z Serwisu dla Kandydatów</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  4.1. Kandydat może przeglądać oferty pracy oraz aplikować na wybrane stanowiska 
                  po zarejestrowaniu się w Serwisie.
                </p>
                <p>
                  4.2. Kandydat zobowiązuje się do podawania prawdziwych informacji w swoim profilu 
                  oraz w aplikacjach na oferty pracy.
                </p>
                <p>
                  4.3. Kandydat może w każdej chwili wycofać swoją aplikację lub usunąć profil z Serwisu.
                </p>
                <p>
                  4.4. Korzystanie z Serwisu przez Kandydatów jest bezpłatne.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Zasady korzystania z Serwisu dla Pracodawców</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  5.1. Pracodawca może publikować oferty pracy po zarejestrowaniu się w Serwisie 
                  i wykupieniu odpowiedniego pakietu.
                </p>
                <p>
                  5.2. Pracodawca zobowiązuje się do publikowania tylko prawdziwych i zgodnych 
                  z prawem ofert pracy.
                </p>
                <p>
                  5.3. Pracodawca nie może publikować ofert zawierających treści dyskryminujące, 
                  obraźliwe lub niezgodne z dobrymi obyczajami.
                </p>
                <p>
                  5.4. Administrator zastrzega sobie prawo do moderacji i usuwania ofert 
                  naruszających Regulamin bez wcześniejszego powiadomienia.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Płatności i cennik</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  6.1. Szczegółowy cennik usług dla Pracodawców dostępny jest na stronie Serwisu.
                </p>
                <p>
                  6.2. Płatności są realizowane za pośrednictwem bezpiecznych systemów płatności online.
                </p>
                <p>
                  6.3. Administrator wystawia faktury VAT za świadczone usługi.
                </p>
                <p>
                  6.4. Opłacenie usługi następuje z góry, przed rozpoczęciem świadczenia usługi.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Odpowiedzialność</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  7.1. Administrator nie ponosi odpowiedzialności za treść ofert pracy 
                  publikowanych przez Pracodawców.
                </p>
                <p>
                  7.2. Administrator nie ponosi odpowiedzialności za działania Użytkowników 
                  oraz relacje między Kandydatami a Pracodawcami.
                </p>
                <p>
                  7.3. Administrator dokłada wszelkich starań, aby Serwis działał prawidłowo, 
                  jednak nie gwarantuje nieprzerwanego dostępu do Serwisu.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Własność intelektualna</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  8.1. Wszystkie prawa autorskie do Serwisu, w tym do jego struktury, wyglądu, 
                  funkcjonalności i treści, należą do Administratora.
                </p>
                <p>
                  8.2. Zabronione jest kopiowanie, modyfikowanie lub wykorzystywanie w celach 
                  komercyjnych jakichkolwiek elementów Serwisu bez zgody Administratora.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Ochrona danych osobowych</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  9.1. Administrator przetwarza dane osobowe Użytkowników zgodnie z przepisami RODO 
                  oraz Polityką Prywatności dostępną na stronie Serwisu.
                </p>
                <p>
                  9.2. Szczegółowe informacje dotyczące przetwarzania danych osobowych znajdują się 
                  w Polityce Prywatności.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Reklamacje</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  10.1. Reklamacje dotyczące działania Serwisu można składać na adres email: 
                  reklamacje@jobonfire.pl
                </p>
                <p>
                  10.2. Reklamacja powinna zawierać: imię i nazwisko, adres email, opis problemu 
                  oraz oczekiwania Użytkownika.
                </p>
                <p>
                  10.3. Administrator rozpatrzy reklamację w terminie 14 dni roboczych od jej otrzymania.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Postanowienia końcowe</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  11.1. Administrator zastrzega sobie prawo do wprowadzania zmian w Regulaminie. 
                  O zmianach Użytkownicy zostaną poinformowani z 7-dniowym wyprzedzeniem.
                </p>
                <p>
                  11.2. W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają 
                  przepisy prawa polskiego.
                </p>
                <p>
                  11.3. Wszelkie spory będą rozstrzygane przez sąd właściwy dla siedziby Administratora.
                </p>
              </div>
            </section>

            <section className="border-t pt-8 mt-8">
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Kontakt:</strong><br />
                  JobOnFire Sp. z o.o.<br />
                  ul. Przykładowa 123, 00-001 Warszawa<br />
                  Email: kontakt@jobonfire.pl<br />
                  Tel: +48 123 456 789
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
