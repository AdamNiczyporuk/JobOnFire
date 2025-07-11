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

// Stałe dla ofert pracy

// Poziomy stanowisk
export const JOB_LEVELS: string[] = [
  'Praktykant',
  'Junior',
  'Mid',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP',
  'Expert',
  'Principal',
  'Staff'
];

// Tryby pracy
export const WORKING_MODES: string[] = [
  'Biuro',
  'Zdalnie',
  'Hybrydowo',
  'Częściowo zdalnie',
  'Mobilnie',
  'W terenie'
];

// Wymiary pracy
export const WORKLOAD_OPTIONS: string[] = [
  'Pełny etat',
  'Część etatu (1/2)',
  'Część etatu (3/4)',
  'Elastyczny wymiar',
  'Weekend',
  'Wieczory',
  'Dodatkowa praca'
];

// Popularne tagi/umiejętności techniczne
export const POPULAR_TECH_TAGS: string[] = [
  // Frontend
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Angular',
  'HTML',
  'CSS',
  'SASS',
  'Next.js',
  'Nuxt.js',
  
  // Backend  
  'Node.js',
  'Python',
  'Java',
  'C#',
  'PHP',
  'Go',
  'Ruby',
  'Express.js',
  'Django',
  'Spring',
  
  // Bazy danych
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  
  // Cloud & DevOps
  'AWS',
  'Azure',
  'Docker',
  'Kubernetes',
  'CI/CD',
  'Jenkins',
  'Git',
  
  // Mobilne
  'React Native',
  'Flutter',
  'iOS',
  'Android',
  'Swift',
  'Kotlin',
  
  // Inne
  'GraphQL',
  'REST API',
  'Microservices',
  'Agile',
  'Scrum',
  'Testing'
];

// Popularne tagi nieTechniczne
export const POPULAR_SOFT_TAGS: string[] = [
  'Komunikatywność',
  'Praca w zespole',
  'Zarządzanie projektem',
  'Analityczne myślenie',
  'Kreatywność',
  'Odpowiedzialność',
  'Samodzielność',
  'Elastyczność',
  'Umiejętności prezentacyjne',
  'Język angielski',
  'Język niemiecki',
  'Obsługa klienta',
  'Sprzedaż',
  'Marketing',
  'Księgowość',
  'HR'
];

// Łączone tagi (wszystkie)
export const ALL_POPULAR_TAGS: string[] = [
  ...POPULAR_TECH_TAGS,
  ...POPULAR_SOFT_TAGS
];

// Szablon odpowiedzialności dla różnych stanowisk
export const RESPONSIBILITY_TEMPLATES = {
  'Developer': [
    'Tworzenie i utrzymanie aplikacji',
    'Pisanie czystego i testowalnego kodu',
    'Uczestnictwo w code review',
    'Współpraca z zespołem projektowym',
    'Optymalizacja wydajności aplikacji'
  ],
  'Manager': [
    'Zarządzanie zespołem',
    'Planowanie i koordynacja projektów',
    'Monitoring postępów prac',
    'Komunikacja z klientami',
    'Rozwój członków zespołu'
  ],
  'Designer': [
    'Projektowanie interfejsów użytkownika',
    'Tworzenie prototypów',
    'Współpraca z zespołem deweloperskim',
    'Badanie potrzeb użytkowników',
    'Utrzymanie spójności wizualnej'
  ]
};

// Szablon wymagań dla różnych stanowisk
export const REQUIREMENT_TEMPLATES = {
  'Junior Developer': [
    'Znajomość podstaw programowania',
    'Chęć do nauki nowych technologii',
    'Podstawowa znajomość narzędzi deweloperskich',
    'Umiejętność pracy w zespole',
    'Znajomość języka angielskiego na poziomie podstawowym'
  ],
  'Senior Developer': [
    'Minimum 5 lat doświadczenia w programowaniu',
    'Dogłębna znajomość wybranych technologii',
    'Doświadczenie w prowadzeniu projektów',
    'Umiejętność mentoringu junior developerów',
    'Znajomość języka angielskiego na poziomie komunikatywnym'
  ],
  'Manager': [
    'Doświadczenie w zarządzaniu zespołem',
    'Znajomość metodyk zarządzania projektami',
    'Umiejętności komunikacyjne i przywódcze',
    'Doświadczenie w budżetowaniu',
    'Wykształcenie wyższe kierunkowe'
  ]
};
