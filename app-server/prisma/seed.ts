import { ApplicationStatus, MeetingType, Prisma, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

type AdditionalEmployerSeed = {
  user: {
    email: string;
    username: string;
  };
  profile: {
    companyName: string;
    companyImageUrl?: string;
    industry: string[];
    description?: string;
    contractTypes: string[];
    contactPhone?: string;
    contactEmail?: string;
    benefits: string[];
  };
  locations: Array<{
    city: string;
    state?: string;
    street?: string;
    postalCode?: string;
    latitude?: number;
    longtitude?: number;
  }>;
  offers: Array<{
    name: string;
    description: string;
    jobLevel: string[];
    contractType: string;
    salary?: string;
    workingMode: string[];
    workload?: string;
    responsibilities: string[];
    requirements: string[];
    whatWeOffer: string[];
    applicationUrl?: string | null;
    tags: string[];
    expireInDays: number;
    locationIndex?: number;
  }>;
};

async function main(): Promise<void> {
  console.info("🌱 Seeding database with demo data...");

  // Clean up old seed data before re-seeding
  console.info("🧹 Cleaning previous seed data...");
  await prisma.candidateAnswer.deleteMany();
  await prisma.applicationResponse.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.applicationForJobOffer.deleteMany();
  await prisma.recruitmentQuestion.deleteMany();
  await prisma.jobOffer.deleteMany();
  await prisma.lokalizationToEmployerProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.candidateCV.deleteMany();
  await prisma.profileLink.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.lokalization.deleteMany();
  await prisma.user.deleteMany({ where: { email: { endsWith: "@jobonfire.com" } } });
  console.info("✅ Cleanup complete");

  const [employerPasswordHash, candidatePasswordHash] = await Promise.all([
    bcrypt.hash("Employer123!", 10),
    bcrypt.hash("Candidate123!", 10),
  ]);

  const employerUser = await prisma.user.upsert({
    where: { email: "employer@jobonfire.com" },
    update: {
      username: "firetech",
      isDeleted: false,
    },
    create: {
      username: "firetech",
      email: "employer@jobonfire.com",
      passwordHash: employerPasswordHash,
      role: UserRole.EMPLOYER,
      registerDate: new Date(),
      isDeleted: false,
    },
  });

  const industry: Prisma.JsonArray = ["Software", "IT Services"];
  const contractTypes: Prisma.JsonArray = ["Umowa o pracę", "B2B"];
  const benefits: Prisma.JsonArray = [
    "Prywatna opieka medyczna",
    "Budżet szkoleniowy",
    "Praca hybrydowa",
    "Karta sportowa",
  ];

  const employerProfile = await prisma.employerProfile.upsert({
    where: { userId: employerUser.id },
    update: {
      companyName: "FireTech Software",
      companyImageUrl: "https://cdn.jobonfire.dev/logos/firetech.png",
      industry,
      description:
        "Nowoczesny software house budujący aplikacje webowe i mobilne dla branży fintech, e-commerce oraz HR.",
      contractType: contractTypes,
      contactPhone: "+48 511 223 344",
      contactEmail: "hr@firetech.pl",
      benefits,
    },
    create: {
      companyName: "FireTech Software",
      companyImageUrl: "https://cdn.jobonfire.dev/logos/firetech.png",
      industry,
      description:
        "Nowoczesny software house budujący aplikacje webowe i mobilne dla branży fintech, e-commerce oraz HR.",
      contractType: contractTypes,
      contactPhone: "+48 511 223 344",
      contactEmail: "hr@firetech.pl",
      benefits,
      userId: employerUser.id,
    },
  });

  let warsawOffice = await prisma.lokalization.findFirst({
    where: {
      city: "Warszawa",
      state: "Mazowieckie",
      street: "Prosta 51",
      postalCode: "00-838",
    },
  });

  if (!warsawOffice) {
    warsawOffice = await prisma.lokalization.create({
      data: {
        city: "Warszawa",
        state: "Mazowieckie",
        street: "Prosta 51",
        postalCode: "00-838",
        latitude: 52.2318,
        longtitude: 20.9965,
      },
    });
  }

  await prisma.lokalizationToEmployerProfile.upsert({
    where: {
      employerProfileId_lokalizationId: {
        employerProfileId: employerProfile.id,
        lokalizationId: warsawOffice.id,
      },
    },
    update: {},
    create: {
      employerProfileId: employerProfile.id,
      lokalizationId: warsawOffice.id,
    },
  });

  const jobLevels: Prisma.JsonArray = ["Mid", "Senior"];
  const workingModes: Prisma.JsonArray = ["Hybrydowa", "Zdalna"];
  const responsibilities: Prisma.JsonArray = [
    "Rozwój i utrzymanie aplikacji frontendowych w oparciu o Next.js i TypeScript",
    "Ścisła współpraca z zespołem UX/UI oraz backend",
    "Dbanie o jakość kodu i pokrycie testami automatycznymi",
    "Optymalizacja wydajnościowo-SEO istniejących modułów",
  ];
  const requirements: Prisma.JsonArray = [
    "Min. 3 lata doświadczenia komercyjnego w React/Next.js",
    "Bardzo dobra znajomość TypeScript",
    "Umiejętność pracy z REST API i GraphQL",
    "Doświadczenie z testami (Jest, React Testing Library)",
    "Znajomość narzędzi CI/CD (GitHub Actions, Docker)",
  ];
  const offerWhatWeProvide: Prisma.JsonArray = [
    "Wynagrodzenie 18 000 - 24 000 PLN netto + VAT",
    "Budżet szkoleniowy 5 000 PLN rocznie",
    "Nowoczesne biuro w centrum Warszawy",
    "Elastyczne godziny pracy oraz możliwość pracy zdalnej",
  ];
  const offerTags: Prisma.JsonArray = ["React", "Next.js", "TypeScript", "CI/CD", "GraphQL"];

  let frontendOffer = await prisma.jobOffer.findFirst({
    where: {
      name: "Frontend Developer (React/Next.js)",
      employerProfileId: employerProfile.id,
    },
  });

  if (!frontendOffer) {
    frontendOffer = await prisma.jobOffer.create({
      data: {
        name: "Frontend Developer (React/Next.js)",
        description:
          "Dołącz do zespołu FireTech Software i rozwijaj rozwiązania webowe dla klientów z całego świata. Szukamy osoby, która kocha czysty kod, automatyzację i śledzenie najnowszych trendów frontendowych.",
        jobLevel: jobLevels,
        contractType: "B2B",
        salary: "18 000 - 24 000 PLN netto (B2B)",
        createDate: new Date(),
        expireDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        workingMode: workingModes,
        workload: "Pełny etat",
        responsibilities,
        requirements,
        whatWeOffer: offerWhatWeProvide,
        applicationUrl: null,
        tags: offerTags,
        isActive: true,
        lokalizationId: warsawOffice.id,
        employerProfileId: employerProfile.id,
      },
    });
  } else {
    frontendOffer = await prisma.jobOffer.update({
      where: { id: frontendOffer.id },
      data: {
        description:
          "Dołącz do zespołu FireTech Software i rozwijaj rozwiązania webowe dla klientów z całego świata. Szukamy osoby, która kocha czysty kod, automatyzację i śledzenie najnowszych trendów frontendowych.",
        jobLevel: jobLevels,
        workingMode: workingModes,
        responsibilities,
        requirements,
        whatWeOffer: offerWhatWeProvide,
        tags: offerTags,
        salary: "18 000 - 24 000 PLN netto (B2B)",
        isActive: true,
        expireDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const questionTexts = [
    "Opisz swoje największe wyzwanie projektowe związane z wydajnością frontendu.",
    "Jakie narzędzia wykorzystujesz do monitorowania jakości i stabilności aplikacji React?",
  ];

  for (const text of questionTexts) {
    const existingQuestion = await prisma.recruitmentQuestion.findFirst({
      where: {
        jobOfferId: frontendOffer.id,
        question: text,
      },
    });


  const additionalEmployers: AdditionalEmployerSeed[] = [
    {
      user: {
        email: "employer.analytics@jobonfire.com",
        username: "dataforge",
      },
      profile: {
        companyName: "DataForge Analytics",
        companyImageUrl: "https://cdn.jobonfire.dev/logos/dataforge.png",
        industry: ["Analityka danych", "Cloud"],
        description:
          "Tworzymy rozwiązania analityczne w oparciu o Azure i ekosystem danych. Wspieramy klientów w budowie hurtowni danych i platform BI.",
        contractTypes: ["Umowa o pracę", "B2B"],
        contactPhone: "+48 600 112 233",
        contactEmail: "kariera@dataforge.pl",
        benefits: [
          "Budżet konferencyjny",
          "Elastyczne godziny pracy",
          "Ubezpieczenie na życie",
          "Program mentorski",
        ],
      },
      locations: [
        {
          city: "Kraków",
          state: "Małopolskie",
          street: "Lubicz 17G",
          postalCode: "31-503",
          latitude: 50.0665,
          longtitude: 19.9601,
        },
      ],
      offers: [
        {
          name: "Data Engineer (Azure)",
          description:
            "Poszukujemy Data Engineera do zespołu projektującego i wdrażającego rozwiązania danych na platformie Azure.",
          jobLevel: ["Mid", "Senior"],
          contractType: "B2B",
          salary: "20 000 - 26 000 PLN netto (B2B)",
          workingMode: ["Hybrydowa"],
          workload: "Pełny etat",
          responsibilities: [
            "Projektowanie i implementacja pipeline'ów danych w Azure Data Factory i Databricks",
            "Modelowanie hurtowni danych i optymalizacja zapytań SQL",
            "Automatyzacja procesów CI/CD dla rozwiązań danych",
          ],
          requirements: [
            "Min. 3 lata doświadczenia w projektach danych",
            "Bardzo dobra znajomość Azure Data Platform",
            "Umiejętność programowania w Python lub Scala",
            "Praktyczna znajomość narzędzi CI/CD",
          ],
          whatWeOffer: [
            "Praca z międzynarodowymi klientami",
            "Budżet szkoleniowy 6 000 PLN rocznie",
            "Możliwość pracy z najnowszym stackiem Azure",
          ],
          applicationUrl: null,
          tags: ["Azure", "Data Lake", "PySpark", "SQL"],
          expireInDays: 60,
        },
        {
          name: "BI Developer (Power BI)",
          description:
            "Szukamy osoby, która pomoże nam budować interaktywne raporty i dashboardy Power BI dla klientów z branży retail.",
          jobLevel: ["Mid"],
          contractType: "Umowa o pracę",
          salary: "16 000 - 19 000 PLN brutto",
          workingMode: ["Hybrydowa"],
          workload: "Pełny etat",
          responsibilities: [
            "Projektowanie modeli danych w Power BI",
            "Tworzenie raportów i dashboardów",
            "Optymalizacja istniejących rozwiązań i wsparcie użytkowników biznesowych",
          ],
          requirements: [
            "Doświadczenie w pracy z Power BI i DAX",
            "Bardzo dobra znajomość SQL",
            "Znajomość procesów ETL",
          ],
          whatWeOffer: [
            "Stabilna współpraca i jasna ścieżka rozwoju",
            "Prywatna opieka medyczna i karta sportowa",
            "Zespół ekspertów gotowych dzielić się wiedzą",
          ],
          applicationUrl: null,
          tags: ["Power BI", "DAX", "SQL"],
          expireInDays: 45,
        },
      ],
    },
    {
      user: {
        email: "employer.cloud@jobonfire.com",
        username: "cloudops",
      },
      profile: {
        companyName: "CloudOps Solutions",
        companyImageUrl: "https://cdn.jobonfire.dev/logos/cloudops.png",
        industry: ["DevOps", "Infrastruktura"],
        description:
          "Specjalizujemy się w automatyzacji infrastruktury i zapewnianiu niezawodności systemów krytycznych w architekturze chmurowej.",
        contractTypes: ["B2B"],
        contactPhone: "+48 722 443 990",
        contactEmail: "jobs@cloudops.solutions",
        benefits: [
          "Sprzęt do wyboru",
          "Pakiet medyczny",
          "Hackathony wewnętrzne",
          "Budżet certyfikacyjny AWS/GCP",
        ],
      },
      locations: [
        {
          city: "Wrocław",
          state: "Dolnośląskie",
          street: "Plac Grunwaldzki 23",
          postalCode: "50-377",
          latitude: 51.1101,
          longtitude: 17.0603,
        },
        {
          city: "Gdańsk",
          state: "Pomorskie",
          street: "Marynarki Polskiej 96",
          postalCode: "80-557",
          latitude: 54.3953,
          longtitude: 18.6400,
        },
      ],
      offers: [
        {
          name: "DevOps Engineer (AWS)",
          description:
            "Dołącz do zespołu odpowiedzialnego za tworzenie i utrzymanie infrastruktury AWS dla klientów z branży e-commerce.",
          jobLevel: ["Senior"],
          contractType: "B2B",
          salary: "24 000 - 30 000 PLN netto (B2B)",
          workingMode: ["Zdalna"],
          workload: "Pełny etat",
          responsibilities: [
            "Projektowanie i wdrażanie infrastruktury jako kod (Terraform)",
            "Automatyzacja procesów CI/CD oraz monitoringu",
            "Współpraca z zespołami developerskimi w zakresie dobrych praktyk DevOps",
          ],
          requirements: [
            "Bardzo dobra znajomość AWS",
            "Doświadczenie z Kubernetes i Terraform",
            "Znajomość narzędzi observability (Prometheus, Grafana)",
          ],
          whatWeOffer: [
            "W 100% zdalna współpraca",
            "Elastyczne godziny i brak nadgodzin",
            "Budżet na certyfikacje AWS",
          ],
          applicationUrl: null,
          tags: ["AWS", "Terraform", "Kubernetes"],
          expireInDays: 50,
          locationIndex: 0,
        },
        {
          name: "Site Reliability Engineer",
          description:
            "SRE odpowiedzialny za niezawodność platform SaaS o globalnym zasięgu. Praca z kulturą bliską zespołom produktowym.",
          jobLevel: ["Mid", "Senior"],
          contractType: "B2B",
          salary: "22 000 - 28 000 PLN netto (B2B)",
          workingMode: ["Zdalna", "Hybrydowa"],
          workload: "Pełny etat",
          responsibilities: [
            "Projektowanie procesów SLO/SLA oraz automatyzacji runbooków",
            "Budowa narzędzi poprawiających obserwowalność",
            "Analiza incydentów i ciągłe doskonalenie platformy",
          ],
          requirements: [
            "Doświadczenie w rolach SRE/DevOps",
            "Znajomość języka Python lub Go",
            "Praktyka w pracy z narzędziami observability",
          ],
          whatWeOffer: [
            "Dwutygodniowe sprinty R&D",
            "Pakiet benefitów dopasowany indywidualnie",
            "Wyjazdy integracyjne w Europie",
          ],
          applicationUrl: null,
          tags: ["SRE", "Observability", "Python"],
          expireInDays: 55,
          locationIndex: 1,
        },
      ],
    },
  ];

  for (const employerData of additionalEmployers) {
    const employerUserSeed = await prisma.user.upsert({
      where: { email: employerData.user.email },
      update: {
        username: employerData.user.username,
        passwordHash: employerPasswordHash,
        isDeleted: false,
      },
      create: {
        username: employerData.user.username,
        email: employerData.user.email,
        passwordHash: employerPasswordHash,
        role: UserRole.EMPLOYER,
        registerDate: new Date(),
        isDeleted: false,
      },
    });

    const employerProfileSeed = await prisma.employerProfile.upsert({
      where: { userId: employerUserSeed.id },
      update: {
        companyName: employerData.profile.companyName,
        companyImageUrl: employerData.profile.companyImageUrl,
        industry: employerData.profile.industry as Prisma.JsonArray,
        description: employerData.profile.description,
        contractType: employerData.profile.contractTypes as Prisma.JsonArray,
        contactPhone: employerData.profile.contactPhone,
        contactEmail: employerData.profile.contactEmail,
        benefits: employerData.profile.benefits as Prisma.JsonArray,
      },
      create: {
        companyName: employerData.profile.companyName,
        companyImageUrl: employerData.profile.companyImageUrl,
        industry: employerData.profile.industry as Prisma.JsonArray,
        description: employerData.profile.description,
        contractType: employerData.profile.contractTypes as Prisma.JsonArray,
        contactPhone: employerData.profile.contactPhone,
        contactEmail: employerData.profile.contactEmail,
        benefits: employerData.profile.benefits as Prisma.JsonArray,
        userId: employerUserSeed.id,
      },
    });

    const locationIds: number[] = [];
    for (const location of employerData.locations) {
      let locationRecord = await prisma.lokalization.findFirst({
        where: {
          city: location.city,
          state: location.state,
          street: location.street,
          postalCode: location.postalCode,
        },
      });

      if (!locationRecord) {
        locationRecord = await prisma.lokalization.create({
          data: {
            city: location.city,
            state: location.state,
            street: location.street,
            postalCode: location.postalCode,
            latitude: location.latitude,
            longtitude: location.longtitude,
          },
        });
      }

      locationIds.push(locationRecord.id);

      await prisma.lokalizationToEmployerProfile.upsert({
        where: {
          employerProfileId_lokalizationId: {
            employerProfileId: employerProfileSeed.id,
            lokalizationId: locationRecord.id,
          },
        },
        update: {},
        create: {
          employerProfileId: employerProfileSeed.id,
          lokalizationId: locationRecord.id,
        },
      });
    }

    for (const offer of employerData.offers) {
      const targetLocationId = locationIds[offer.locationIndex ?? 0] ?? null;
      const existingOffer = await prisma.jobOffer.findFirst({
        where: {
          employerProfileId: employerProfileSeed.id,
          name: offer.name,
        },
      });

      const offerData = {
        description: offer.description,
        jobLevel: offer.jobLevel as Prisma.JsonArray,
        contractType: offer.contractType,
        salary: offer.salary ?? null,
        workingMode: offer.workingMode as Prisma.JsonArray,
        workload: offer.workload ?? null,
        responsibilities: offer.responsibilities as Prisma.JsonArray,
        requirements: offer.requirements as Prisma.JsonArray,
        whatWeOffer: offer.whatWeOffer as Prisma.JsonArray,
        applicationUrl: offer.applicationUrl ?? null,
        tags: offer.tags as Prisma.JsonArray,
        isActive: true,
        expireDate: new Date(Date.now() + offer.expireInDays * 24 * 60 * 60 * 1000),
        lokalizationId: targetLocationId,
      };

      if (!existingOffer) {
        await prisma.jobOffer.create({
          data: {
            name: offer.name,
            createDate: new Date(),
            employerProfileId: employerProfileSeed.id,
            ...offerData,
          },
        });
      } else {
        await prisma.jobOffer.update({
          where: { id: existingOffer.id },
          data: offerData,
        });
      }
    }
  }
    if (!existingQuestion) {
      await prisma.recruitmentQuestion.create({
        data: {
          jobOfferId: frontendOffer.id,
          question: text,
        },
      });
    }
  }

  const candidateUser = await prisma.user.upsert({
    where: { email: "candidate@jobonfire.com" },
    update: {
      username: "frontendhero",
      isDeleted: false,
    },
    create: {
      username: "frontendhero",
      email: "candidate@jobonfire.com",
      passwordHash: candidatePasswordHash,
      role: UserRole.CANDIDATE,
      registerDate: new Date(),
      isDeleted: false,
    },
  });

  const skills: Prisma.JsonArray = [
    { name: "React", level: "EXPERT" },
    { name: "Next.js", level: "EXPERT" },
    { name: "TypeScript", level: "ADVANCED" },
    { name: "GraphQL", level: "ADVANCED" },
    { name: "Jest", level: "ADVANCED" },
  ];
  const experience: Prisma.JsonArray = [
    {
      company: "CodeWave",
      position: "Frontend Developer",
      from: "2021-02-01",
      to: "2023-07-31",
      responsibilities: [
        "Implementacja modułów w React i Next.js",
        "Współpraca z zespołem backendowym przy projektowaniu API",
        "Tworzenie testów jednostkowych i integracyjnych",
      ],
    },
    {
      company: "BrightApps",
      position: "Junior Frontend Developer",
      from: "2019-05-01",
      to: "2021-01-31",
      responsibilities: [
        "Budowa komponentów UI",
        "Optymalizacja wydajności komponentów",
      ],
    },
  ];
  const education: Prisma.JsonArray = [
    {
      school: "Politechnika Warszawska",
      field: "Informatyka",
      degree: "Magister",
      graduationYear: 2019,
    },
  ];

  const candidateProfile = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {
      name: "Anna",
      lastName: "Nowak",
      description:
        "Frontend Developer z 5-letnim doświadczeniem w budowaniu aplikacji webowych. Specjalizuję się w ekosystemie React i stale poszukuję przestrzeni do automatyzacji i usprawniania procesów.",
      birthday: new Date("1994-08-14"),
      experience,
      phoneNumber: 481112233,
      skills,
      place: "Warszawa",
      education,
    },
    create: {
      name: "Anna",
      lastName: "Nowak",
      description:
        "Frontend Developer z 5-letnim doświadczeniem w budowaniu aplikacji webowych. Specjalizuję się w ekosystemie React i stale poszukuję przestrzeni do automatyzacji i usprawniania procesów.",
      birthday: new Date("1994-08-14"),
      experience,
      phoneNumber: 481112233,
      skills,
      place: "Warszawa",
      education,
      userId: candidateUser.id,
    },
  });

  const cvJson = JSON.stringify({
    summary:
      "Doświadczona frontend developerka, która łączy świetne oko do detalu z zamiłowaniem do automatyzacji i testów.",
    skills,
    experience,
    education,
  });

  let candidateCv = await prisma.candidateCV.findFirst({
    where: {
      candidateProfileId: candidateProfile.id,
      name: "Frontend CV",
    },
  });

  if (!candidateCv) {
    candidateCv = await prisma.candidateCV.create({
      data: {
        name: "Frontend CV",
        cvJson,
        candidateProfileId: candidateProfile.id,
      },
    });
  } else {
    candidateCv = await prisma.candidateCV.update({
      where: { id: candidateCv.id },
      data: {
        cvJson,
      },
    });
  }

  const existingProfileLink = await prisma.profileLink.findFirst({
    where: {
      candidateProfileId: candidateProfile.id,
      url: "https://github.com/frontendhero",
    },
  });

  if (!existingProfileLink) {
    await prisma.profileLink.create({
      data: {
        name: "GitHub",
        url: "https://github.com/frontendhero",
        candidateProfileId: candidateProfile.id,
      },
    });
  }

  const existingApplication = await prisma.applicationForJobOffer.findFirst({
    where: {
      candidateProfileId: candidateProfile.id,
      jobOfferId: frontendOffer.id,
    },
  });

  if (!existingApplication) {
    const application = await prisma.applicationForJobOffer.create({
      data: {
        message:
          "Cześć! Mam duże doświadczenie w Next.js i budowaniu skalowalnych frontendów. Chętnie opowiem więcej podczas rozmowy.",
        status: ApplicationStatus.PENDING,
        candidateProfileId: candidateProfile.id,
        jobOfferId: frontendOffer.id,
        cvId: candidateCv.id,
      },
      include: { jobOffer: true },
    });

    const firstQuestion = await prisma.recruitmentQuestion.findFirst({
      where: { jobOfferId: frontendOffer.id },
    });

    if (firstQuestion) {
      await prisma.candidateAnswer.create({
        data: {
          applicationForJobOfferId: application.id,
          recruitmentQuestionId: firstQuestion.id,
          answer:
            "Przeprowadziłam audyt bundle'a, wprowadziłam code splitting i memoizację komponentów. Efekt to -40% czasu ładowania.",
        },
      });
    }

    await prisma.meeting.create({
      data: {
        applicationForJobOfferId: application.id,
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: MeetingType.ONLINE,
        contributors: "Anna Nowak, Piotr Kowalski",
        onlineMeetingUrl: "https://meet.jobonfire.com/frontend-interview",
        message: "Wstępna rozmowa techniczna – sprawdzenie dopasowania i doświadczenia.",
      },
    });
  }

  console.info("✅ Seeding finished successfully.");
}

main()
  .catch((error: unknown) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
