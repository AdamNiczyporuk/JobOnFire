// Stałe i enumy dla pracodawców

export interface CompanyLogo {
  id: number;
  name: string;
  url: string;
}

// Predefiniowane obrazki logo firmy
export const COMPANY_LOGOS: CompanyLogo[] = [
  { id: 1, name: "Logo 1", url: "/logo1.png" },
  { id: 2, name: "Logo 2", url: "/logo2.png" },
  { id: 3, name: "Logo 3", url: "/logo3.png" },
  { id: 4, name: "Logo 4", url: "/logo4.png" },
  { id: 5, name: "Logo 5", url: "/logo5.png" }
];

// Predefiniowane typy umów (zgodne z walidacją backendową)
export const CONTRACT_TYPES: string[] = [
  'Umowa o pracę',
  'Umowa B2B',
  'Umowa zlecenie',
  'Umowa o dzieło'
];

// Predefiniowane branże (opcjonalnie, można rozszerzyć w przyszłości)
export const POPULAR_INDUSTRIES: string[] = [
  'IT/Software',
  'Finanse',
  'Marketing',
  'Sprzedaż',
  'HR',
  'Produkcja',
  'Logistyka',
  'Edukacja',
  'Zdrowie',
  'E-commerce',
  'Konsulting',
  'Media',
  'Nieruchomości',
  'Automotive',
  'Energetyka'
];

// Predefiniowane benefity (opcjonalnie, można rozszerzyć w przyszłości)
export const POPULAR_BENEFITS: string[] = [
  'Praca zdalna',
  'Elastyczne godziny pracy',
  'Prywatna opieka medyczna',
  'Karta MultiSport',
  'Dodatkowy urlop',
  'Budżet szkoleniowy',
  'Dofinansowanie do nauki języków',
  'Owoce w biurze',
  'Parking dla pracowników',
  'Dopłata do transportu',
  'Telefon służbowy',
  'Laptop służbowy',
  'Zespołowe wyjazdy integracyjne',
  'Program kafeteryjny',
  'Ubezpieczenie na życie'
];
