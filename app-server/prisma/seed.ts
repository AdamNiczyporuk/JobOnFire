import { ApplicationStatus, MeetingType, Prisma, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.info("🌱 Seeding database with extensive demo data...");
  console.info("👥 Creating: 2 Employers + 2 Candidates with full interactions");

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
  await prisma.externalJobOffer.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.additionalCredentials.deleteMany();
  await prisma.lokalization.deleteMany();
  await prisma.user.deleteMany({ where: { email: { endsWith: "@jobonfire.com" } } });
  console.info("✅ Cleanup complete\n");

  const passwordHash = await bcrypt.hash("Demo123!", 10);

  // ============================================
  // EMPLOYER 1: FireTech Software
  // ============================================
  console.info("👔 Creating Employer 1: FireTech Software...");
  
  const employer1User = await prisma.user.create({
    data: {
      username: "firetech",
      email: "employer1@jobonfire.com",
      passwordHash,
      role: UserRole.EMPLOYER,
      registerDate: new Date(),
      isDeleted: false,
    },
  });

  const employer1Profile = await prisma.employerProfile.create({
    data: {
      companyName: "FireTech Software",
      companyImageUrl: "https://cdn.jobonfire.dev/logos/firetech.png",
      industry: ["Software", "IT Services"] as Prisma.JsonArray,
      description: "Nowoczesny software house budujący aplikacje webowe i mobilne dla branży fintech, e-commerce oraz HR.",
      contractType: ["Umowa o pracę", "B2B"] as Prisma.JsonArray,
      contactPhone: "+48 511 223 344",
      contactEmail: "hr@firetech.pl",
      benefits: ["Prywatna opieka medyczna", "Budżet szkoleniowy", "Praca hybrydowa", "Karta sportowa"] as Prisma.JsonArray,
      userId: employer1User.id,
    },
  });

  // Locations for Employer 1
  const warsawOffice = await prisma.lokalization.create({
    data: {
      city: "Warszawa",
      state: "Mazowieckie",
      street: "Prosta 51",
      postalCode: "00-838",
      latitude: 52.2318,
      longtitude: 20.9965,
    },
  });

  await prisma.lokalizationToEmployerProfile.create({
    data: {
      employerProfileId: employer1Profile.id,
      lokalizationId: warsawOffice.id,
    },
  });

  // Job Offers for Employer 1
  const frontendOffer = await prisma.jobOffer.create({
    data: {
      name: "Frontend Developer (React/Next.js)",
      description: "Dołącz do zespołu FireTech Software i rozwijaj rozwiązania webowe dla klientów z całego świata.",
      jobLevel: ["Mid", "Senior"] as Prisma.JsonArray,
      contractType: "B2B",
      salary: "18 000 - 24 000 PLN netto (B2B)",
      createDate: new Date(),
      expireDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      workingMode: ["Hybrydowa", "Zdalna"] as Prisma.JsonArray,
      workload: "Pełny etat",
      responsibilities: [
        "Rozwój i utrzymanie aplikacji frontendowych w oparciu o Next.js i TypeScript",
        "Ścisła współpraca z zespołem UX/UI oraz backend",
        "Dbanie o jakość kodu i pokrycie testami automatycznymi",
        "Optymalizacja wydajnościowo-SEO istniejących modułów",
      ] as Prisma.JsonArray,
      requirements: [
        "Min. 3 lata doświadczenia komercyjnego w React/Next.js",
        "Bardzo dobra znajomość TypeScript",
        "Umiejętność pracy z REST API i GraphQL",
        "Doświadczenie z testami (Jest, React Testing Library)",
      ] as Prisma.JsonArray,
      whatWeOffer: [
        "Wynagrodzenie 18 000 - 24 000 PLN netto + VAT",
        "Budżet szkoleniowy 5 000 PLN rocznie",
        "Nowoczesne biuro w centrum Warszawy",
        "Elastyczne godziny pracy oraz możliwość pracy zdalnej",
      ] as Prisma.JsonArray,
      applicationUrl: null,
      tags: ["React", "Next.js", "TypeScript", "CI/CD", "GraphQL"] as Prisma.JsonArray,
      isActive: true,
      lokalizationId: warsawOffice.id,
      employerProfileId: employer1Profile.id,
    },
  });

  const backendOffer = await prisma.jobOffer.create({
    data: {
      name: "Backend Developer (Node.js)",
      description: "Szukamy backend developera do pracy nad systemami dla branży fintech.",
      jobLevel: ["Senior"] as Prisma.JsonArray,
      contractType: "B2B",
      salary: "20 000 - 26 000 PLN netto (B2B)",
      createDate: new Date(),
      expireDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      workingMode: ["Zdalna"] as Prisma.JsonArray,
      workload: "Pełny etat",
      responsibilities: [
        "Projektowanie i implementacja REST API",
        "Integracja z systemami płatności",
        "Optymalizacja wydajności bazy danych",
      ] as Prisma.JsonArray,
      requirements: [
        "Min. 5 lat doświadczenia w Node.js",
        "Znajomość PostgreSQL i Redis",
        "Doświadczenie z mikrousługami",
      ] as Prisma.JsonArray,
      whatWeOffer: [
        "100% praca zdalna",
        "Nowoczesny stack technologiczny",
        "Budżet na konferencje",
      ] as Prisma.JsonArray,
      applicationUrl: null,
      tags: ["Node.js", "PostgreSQL", "Microservices", "REST API"] as Prisma.JsonArray,
      isActive: true,
      lokalizationId: warsawOffice.id,
      employerProfileId: employer1Profile.id,
    },
  });

  // Recruitment questions for Frontend offer
  await prisma.recruitmentQuestion.createMany({
    data: [
      {
        jobOfferId: frontendOffer.id,
        question: "Opisz swoje największe wyzwanie projektowe związane z wydajnością frontendu.",
      },
      {
        jobOfferId: frontendOffer.id,
        question: "Jakie narzędzia wykorzystujesz do monitorowania jakości aplikacji React?",
      },
    ],
  });

  // Recruitment questions for Backend offer
  await prisma.recruitmentQuestion.createMany({
    data: [
      {
        jobOfferId: backendOffer.id,
        question: "Jakie wzorce projektowe stosujesz przy tworzeniu mikrousług?",
      },
      {
        jobOfferId: backendOffer.id,
        question: "Opisz swoje doświadczenie z optymalizacją zapytań SQL.",
      },
    ],
  });

  console.info("✅ Employer 1 created with 2 job offers\n");

  // ============================================
  // EMPLOYER 2: DataForge Analytics
  // ============================================
  console.info("👔 Creating Employer 2: DataForge Analytics...");

  const employer2User = await prisma.user.create({
    data: {
      username: "dataforge",
      email: "employer2@jobonfire.com",
      passwordHash,
      role: UserRole.EMPLOYER,
      registerDate: new Date(),
      isDeleted: false,
    },
  });

  const employer2Profile = await prisma.employerProfile.create({
    data: {
      companyName: "DataForge Analytics",
      companyImageUrl: "https://cdn.jobonfire.dev/logos/dataforge.png",
      industry: ["Analityka danych", "Cloud"] as Prisma.JsonArray,
      description: "Tworzymy rozwiązania analityczne w oparciu o Azure i ekosystem danych.",
      contractType: ["Umowa o pracę", "B2B"] as Prisma.JsonArray,
      contactPhone: "+48 600 112 233",
      contactEmail: "kariera@dataforge.pl",
      benefits: ["Budżet konferencyjny", "Elastyczne godziny pracy", "Ubezpieczenie na życie", "Program mentorski"] as Prisma.JsonArray,
      userId: employer2User.id,
    },
  });

  const krakowOffice = await prisma.lokalization.create({
    data: {
      city: "Kraków",
      state: "Małopolskie",
      street: "Lubicz 17G",
      postalCode: "31-503",
      latitude: 50.0665,
      longtitude: 19.9601,
    },
  });

  await prisma.lokalizationToEmployerProfile.create({
    data: {
      employerProfileId: employer2Profile.id,
      lokalizationId: krakowOffice.id,
    },
  });

  const dataEngineerOffer = await prisma.jobOffer.create({
    data: {
      name: "Data Engineer (Azure)",
      description: "Poszukujemy Data Engineera do zespołu projektującego rozwiązania danych na platformie Azure.",
      jobLevel: ["Mid", "Senior"] as Prisma.JsonArray,
      contractType: "B2B",
      salary: "20 000 - 26 000 PLN netto (B2B)",
      createDate: new Date(),
      expireDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      workingMode: ["Hybrydowa"] as Prisma.JsonArray,
      workload: "Pełny etat",
      responsibilities: [
        "Projektowanie i implementacja pipeline'ów danych w Azure Data Factory",
        "Modelowanie hurtowni danych",
        "Automatyzacja procesów CI/CD",
      ] as Prisma.JsonArray,
      requirements: [
        "Min. 3 lata doświadczenia w projektach danych",
        "Bardzo dobra znajomość Azure Data Platform",
        "Umiejętność programowania w Python lub Scala",
      ] as Prisma.JsonArray,
      whatWeOffer: [
        "Praca z międzynarodowymi klientami",
        "Budżet szkoleniowy 6 000 PLN rocznie",
        "Możliwość pracy z najnowszym stackiem Azure",
      ] as Prisma.JsonArray,
      applicationUrl: null,
      tags: ["Azure", "Data Lake", "PySpark", "SQL"] as Prisma.JsonArray,
      isActive: true,
      lokalizationId: krakowOffice.id,
      employerProfileId: employer2Profile.id,
    },
  });

  const biDeveloperOffer = await prisma.jobOffer.create({
    data: {
      name: "BI Developer (Power BI)",
      description: "Szukamy osoby do budowy interaktywnych raportów Power BI dla klientów z branży retail.",
      jobLevel: ["Mid"] as Prisma.JsonArray,
      contractType: "Umowa o pracę",
      salary: "16 000 - 19 000 PLN brutto",
      createDate: new Date(),
      expireDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      workingMode: ["Hybrydowa"] as Prisma.JsonArray,
      workload: "Pełny etat",
      responsibilities: [
        "Projektowanie modeli danych w Power BI",
        "Tworzenie raportów i dashboardów",
        "Optymalizacja rozwiązań i wsparcie użytkowników",
      ] as Prisma.JsonArray,
      requirements: [
        "Doświadczenie w pracy z Power BI i DAX",
        "Bardzo dobra znajomość SQL",
        "Znajomość procesów ETL",
      ] as Prisma.JsonArray,
      whatWeOffer: [
        "Stabilna współpraca",
        "Prywatna opieka medyczna",
        "Zespół ekspertów",
      ] as Prisma.JsonArray,
      applicationUrl: null,
      tags: ["Power BI", "DAX", "SQL"] as Prisma.JsonArray,
      isActive: true,
      lokalizationId: krakowOffice.id,
      employerProfileId: employer2Profile.id,
    },
  });

  // Recruitment questions for Data Engineer
  await prisma.recruitmentQuestion.createMany({
    data: [
      {
        jobOfferId: dataEngineerOffer.id,
        question: "Opisz swoje doświadczenie z Azure Data Factory.",
      },
      {
        jobOfferId: dataEngineerOffer.id,
        question: "Jak podchodzisz do optymalizacji pipeline'ów danych?",
      },
    ],
  });

  console.info("✅ Employer 2 created with 2 job offers\n");

  // ============================================
  // CANDIDATE 1: Anna Nowak
  // ============================================
  console.info("👤 Creating Candidate 1: Anna Nowak...");

  const candidate1User = await prisma.user.create({
    data: {
      username: "frontendhero",
      email: "candidate1@jobonfire.com",
      passwordHash,
      role: UserRole.CANDIDATE,
      registerDate: new Date(),
      isDeleted: false,
    },
  });

  // Google OAuth credentials for candidate 1
  await prisma.additionalCredentials.create({
    data: {
      userId: candidate1User.id,
      provider: "google",
      value: "google-oauth-id-anna-123",
    },
  });

  const candidate1Profile = await prisma.candidateProfile.create({
    data: {
      name: "Anna",
      lastName: "Nowak",
      description: "Frontend Developer z 5-letnim doświadczeniem w budowaniu aplikacji webowych. Specjalizuję się w ekosystemie React.",
      birthday: new Date("1994-08-14"),
      experience: [
        {
          company: "CodeWave",
          position: "Frontend Developer",
          startDate: "2021-02-01",
          endDate: "2023-07-31",
          isCurrent: false,
          description: "Implementacja modułów w React i Next.js, współpraca z zespołem backendowym.",
          location: "Warszawa",
        },
        {
          company: "BrightApps",
          position: "Junior Frontend Developer",
          startDate: "2019-05-01",
          endDate: "2021-01-31",
          isCurrent: false,
          description: "Budowa komponentów UI, optymalizacja wydajności.",
          location: "Kraków",
        },
      ] as Prisma.JsonArray,
      phoneNumber: 481112233,
      skills: [
        { name: "React", level: "EXPERT" },
        { name: "Next.js", level: "EXPERT" },
        { name: "TypeScript", level: "ADVANCED" },
        { name: "GraphQL", level: "ADVANCED" },
        { name: "Jest", level: "ADVANCED" },
      ] as Prisma.JsonArray,
      place: "Warszawa",
      education: [
        {
          institution: "Politechnika Warszawska",
          degree: "Magister",
          fieldOfStudy: "Informatyka",
          startDate: "2014-10-01",
          endDate: "2019-06-30",
          isCurrent: false,
          description: "Specjalizacja: Inżynieria Oprogramowania",
          location: "Warszawa",
        },
      ] as Prisma.JsonArray,
      userId: candidate1User.id,
    },
  });

  // Profile links for candidate 1
  await prisma.profileLink.createMany({
    data: [
      {
        name: "GitHub",
        url: "https://github.com/frontendhero",
        candidateProfileId: candidate1Profile.id,
      },
      {
        name: "LinkedIn",
        url: "https://linkedin.com/in/anna-nowak-frontend",
        candidateProfileId: candidate1Profile.id,
      },
      {
        name: "Portfolio",
        url: "https://anna-nowak.dev",
        candidateProfileId: candidate1Profile.id,
      },
    ],
  });

  // External job offers tracked by candidate 1
  await prisma.externalJobOffer.createMany({
    data: [
      {
        url: "https://justjoin.it/offers/react-developer-123",
        site: "JustJoinIT",
        name: "React Developer",
        company: "TechCorp",
        candidateProfileId: candidate1Profile.id,
      },
      {
        url: "https://nofluffjobs.com/pl/job/senior-frontend",
        site: "NoFluffJobs",
        name: "Senior Frontend Engineer",
        company: "StartupXYZ",
        candidateProfileId: candidate1Profile.id,
      },
    ],
  });

  // CVs for candidate 1
  const candidate1CV1 = await prisma.candidateCV.create({
    data: {
      name: "Frontend CV - FireTech",
      cvJson: JSON.stringify({
        fullName: "Anna Nowak",
        position: "Frontend Developer",
        summary: "Doświadczona frontend developerka specjalizująca się w React i Next.js.",
        skills: ["React", "Next.js", "TypeScript", "GraphQL", "Jest"],
        experience: ["CodeWave - Frontend Developer", "BrightApps - Junior Frontend Developer"],
        education: ["Politechnika Warszawska - Informatyka, Magister"],
      }),
      candidateProfileId: candidate1Profile.id,
      isDeleted: false,
    },
  });

  const candidate1CV2 = await prisma.candidateCV.create({
    data: {
      name: "Uniwersalne CV",
      cvJson: JSON.stringify({
        fullName: "Anna Nowak",
        position: "Full Stack Developer",
        summary: "Wszechstronna developerka z doświadczeniem frontend i podstawami backend.",
        skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"],
        experience: ["CodeWave", "BrightApps"],
        education: ["Politechnika Warszawska - Informatyka"],
      }),
      candidateProfileId: candidate1Profile.id,
      isDeleted: false,
    },
  });

  console.info("✅ Candidate 1 created with 2 CVs and profile links\n");

  // ============================================
  // CANDIDATE 2: Piotr Kowalski
  // ============================================
  console.info("👤 Creating Candidate 2: Piotr Kowalski...");

  const candidate2User = await prisma.user.create({
    data: {
      username: "dataengineer",
      email: "candidate2@jobonfire.com",
      passwordHash,
      role: UserRole.CANDIDATE,
      registerDate: new Date(),
      isDeleted: false,
    },
  });

  const candidate2Profile = await prisma.candidateProfile.create({
    data: {
      name: "Piotr",
      lastName: "Kowalski",
      description: "Data Engineer z 4-letnim doświadczeniem w projektach Azure i AWS. Pasjonat automatyzacji i big data.",
      birthday: new Date("1992-03-22"),
      experience: [
        {
          company: "CloudData Solutions",
          position: "Data Engineer",
          startDate: "2021-01-01",
          endDate: null,
          isCurrent: true,
          description: "Projektowanie pipeline'ów ETL na Azure, integracja z Power BI.",
          location: "Kraków",
        },
        {
          company: "Analytics Pro",
          position: "Junior Data Analyst",
          startDate: "2019-06-01",
          endDate: "2020-12-31",
          isCurrent: false,
          description: "Analiza danych biznesowych, tworzenie raportów SQL.",
          location: "Warszawa",
        },
      ] as Prisma.JsonArray,
      phoneNumber: 485556677,
      skills: [
        { name: "Azure", level: "EXPERT" },
        { name: "Python", level: "EXPERT" },
        { name: "SQL", level: "ADVANCED" },
        { name: "PySpark", level: "ADVANCED" },
        { name: "Power BI", level: "INTERMEDIATE" },
        { name: "Databricks", level: "ADVANCED" },
      ] as Prisma.JsonArray,
      place: "Kraków",
      education: [
        {
          institution: "AGH Kraków",
          degree: "Inżynier",
          fieldOfStudy: "Informatyka i Ekonometria",
          startDate: "2015-10-01",
          endDate: "2019-06-30",
          isCurrent: false,
          description: null,
          location: "Kraków",
        },
      ] as Prisma.JsonArray,
      userId: candidate2User.id,
    },
  });

  // Profile links for candidate 2
  await prisma.profileLink.createMany({
    data: [
      {
        name: "GitHub",
        url: "https://github.com/piotrkowalski",
        candidateProfileId: candidate2Profile.id,
      },
      {
        name: "LinkedIn",
        url: "https://linkedin.com/in/piotr-kowalski-data",
        candidateProfileId: candidate2Profile.id,
      },
    ],
  });

  // CVs for candidate 2
  const candidate2CV1 = await prisma.candidateCV.create({
    data: {
      name: "Data Engineer CV",
      cvJson: JSON.stringify({
        fullName: "Piotr Kowalski",
        position: "Data Engineer",
        summary: "Doświadczony data engineer z focus na Azure i automatyzację.",
        skills: ["Azure", "Python", "SQL", "PySpark", "Databricks"],
        experience: ["CloudData Solutions - Data Engineer", "Analytics Pro - Junior Data Analyst"],
        education: ["AGH Kraków - Informatyka i Ekonometria"],
      }),
      candidateProfileId: candidate2Profile.id,
      isDeleted: false,
    },
  });

  const candidate2CV2 = await prisma.candidateCV.create({
    data: {
      name: "BI Developer CV",
      cvJson: JSON.stringify({
        fullName: "Piotr Kowalski",
        position: "BI Developer",
        summary: "Specjalista od danych z doświadczeniem w Power BI i SQL.",
        skills: ["Power BI", "SQL", "DAX", "Python"],
        experience: ["CloudData Solutions", "Analytics Pro"],
        education: ["AGH Kraków"],
      }),
      candidateProfileId: candidate2Profile.id,
      isDeleted: false,
    },
  });

  console.info("✅ Candidate 2 created with 2 CVs\n");

  // ============================================
  // APPLICATIONS - Candidate 1 (Anna)
  // ============================================
  console.info("📝 Creating applications for Candidate 1...");

  // Application 1: Anna -> FireTech Frontend (PENDING)
  const app1 = await prisma.applicationForJobOffer.create({
    data: {
      message: "Cześć! Mam duże doświadczenie w Next.js i budowaniu skalowalnych frontendów. Chętnie opowiem więcej podczas rozmowy.",
      status: ApplicationStatus.PENDING,
      candidateProfileId: candidate1Profile.id,
      jobOfferId: frontendOffer.id,
      cvId: candidate1CV1.id,
      createDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  });

  // Get recruitment questions for frontend offer
  const frontendQuestions = await prisma.recruitmentQuestion.findMany({
    where: { jobOfferId: frontendOffer.id },
  });

  // Answer to recruitment questions
  if (frontendQuestions.length > 0) {
    await prisma.candidateAnswer.create({
      data: {
        applicationForJobOfferId: app1.id,
        recruitmentQuestionId: frontendQuestions[0].id,
        answer: "Największym wyzwaniem było zoptymalizowanie renderowania listy 10000+ elementów. Użyłam React Window i memoizacji.",
      },
    });

    if (frontendQuestions.length > 1) {
      await prisma.candidateAnswer.create({
        data: {
          applicationForJobOfferId: app1.id,
          recruitmentQuestionId: frontendQuestions[1].id,
          answer: "Używam kombinacji ESLint, Prettier, Lighthouse CI i Sentry do monitorowania jakości.",
        },
      });
    }
  }

  // Meeting for this application
  await prisma.meeting.create({
    data: {
      applicationForJobOfferId: app1.id,
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      type: MeetingType.ONLINE,
      contributors: "Anna Nowak, Piotr Kowalski (Recruiter), Jan Nowak (Tech Lead)",
      onlineMeetingUrl: "https://meet.jobonfire.com/frontend-interview-anna",
      message: "Wstępna rozmowa techniczna – sprawdzenie dopasowania i doświadczenia. Przygotuj się na live coding.",
    },
  });

  // Application 2: Anna -> DataForge BI Developer (REJECTED)
  const app2 = await prisma.applicationForJobOffer.create({
    data: {
      message: "Zainteresowana pozycją BI Developer. Chociaż specjalizuję się w frontendzie, chciałabym rozwijać się w kierunku data viz.",
      status: ApplicationStatus.REJECTED,
      candidateProfileId: candidate1Profile.id,
      jobOfferId: biDeveloperOffer.id,
      cvId: candidate1CV2.id,
      createDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  });

  await prisma.applicationResponse.create({
    data: {
      applicationForJobOfferId: app2.id,
      response: "Dziękujemy za aplikację. Niestety poszukujemy osoby z większym doświadczeniem w Power BI i analizie danych.",
    },
  });

  console.info("✅ 2 applications created for Candidate 1\n");

  // ============================================
  // APPLICATIONS - Candidate 2 (Piotr)
  // ============================================
  console.info("📝 Creating applications for Candidate 2...");

  // Application 3: Piotr -> DataForge Data Engineer (ACCEPTED)
  const app3 = await prisma.applicationForJobOffer.create({
    data: {
      message: "Witam! Pracuję obecnie jako Data Engineer z Azure. Mam doświadczenie z Data Factory, Databricks i PySpark. Chętnie dołączę do Waszego zespołu.",
      status: ApplicationStatus.ACCEPTED,
      candidateProfileId: candidate2Profile.id,
      jobOfferId: dataEngineerOffer.id,
      cvId: candidate2CV1.id,
      createDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    },
  });

  const dataEngineerQuestions = await prisma.recruitmentQuestion.findMany({
    where: { jobOfferId: dataEngineerOffer.id },
  });

  if (dataEngineerQuestions.length > 0) {
    await prisma.candidateAnswer.create({
      data: {
        applicationForJobOfferId: app3.id,
        recruitmentQuestionId: dataEngineerQuestions[0].id,
        answer: "Pracuję z ADF od 2 lat. Stworzyłem ponad 30 pipeline'ów dla różnych źródeł danych - od SQL Server po REST API.",
      },
    });

    if (dataEngineerQuestions.length > 1) {
      await prisma.candidateAnswer.create({
        data: {
          applicationForJobOfferId: app3.id,
          recruitmentQuestionId: dataEngineerQuestions[1].id,
          answer: "Skupiam się na partycjonowaniu danych, incremental load, oraz monitoringu kosztów i czasu wykonania.",
        },
      });
    }
  }

  await prisma.applicationResponse.create({
    data: {
      applicationForJobOfferId: app3.id,
      response: "Gratulacje! Twoja aplikacja została zaakceptowana. Skontaktujemy się w sprawie dalszych kroków.",
    },
  });

  // Meetings for accepted application
  await prisma.meeting.createMany({
    data: [
      {
        applicationForJobOfferId: app3.id,
        dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        type: MeetingType.ONLINE,
        contributors: "Piotr Kowalski, Marek Nowak (HR)",
        onlineMeetingUrl: "https://meet.dataforge.pl/interview-piotr-1",
        message: "Pierwsza rozmowa - omówienie doświadczenia i oczekiwań.",
      },
      {
        applicationForJobOfferId: app3.id,
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        type: MeetingType.OFFLINE,
        contributors: "Piotr Kowalski, Team Lead, Senior Data Engineer",
        onlineMeetingUrl: null,
        message: "Spotkanie w biurze - omówienie warunków współpracy i poznanie zespołu.",
      },
    ],
  });

  // Application 4: Piotr -> FireTech Backend (PENDING)
  const app4 = await prisma.applicationForJobOffer.create({
    data: {
      message: "Interesuję się również rozwojem w kierunku backend. Mam doświadczenie z Node.js i PostgreSQL z projektów osobistych.",
      status: ApplicationStatus.PENDING,
      candidateProfileId: candidate2Profile.id,
      jobOfferId: backendOffer.id,
      cvId: candidate2CV1.id,
      createDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  const backendQuestions = await prisma.recruitmentQuestion.findMany({
    where: { jobOfferId: backendOffer.id },
  });

  if (backendQuestions.length > 0) {
    await prisma.candidateAnswer.create({
      data: {
        applicationForJobOfferId: app4.id,
        recruitmentQuestionId: backendQuestions[0].id,
        answer: "Stosuję CQRS, Event Sourcing oraz Repository Pattern. W projektach osobistych używam również Clean Architecture.",
      },
    });
  }

  // Application 5: Piotr -> FireTech Frontend (CANCELED by candidate)
  await prisma.applicationForJobOffer.create({
    data: {
      message: "Chciałbym spróbować swoich sił również w frontendzie, mam podstawy React.",
      status: ApplicationStatus.CANCELED,
      candidateProfileId: candidate2Profile.id,
      jobOfferId: frontendOffer.id,
      cvId: candidate2CV1.id,
      createDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    },
  });

  console.info("✅ 3 applications created for Candidate 2\n");

  // ============================================
  // SUMMARY
  // ============================================
  console.info("=" .repeat(60));
  console.info("✅ SEEDING COMPLETED SUCCESSFULLY!");
  console.info("=" .repeat(60));
  console.info("\n📊 Summary:");
  console.info("  👔 Employers: 2");
  console.info("     - FireTech Software (2 job offers)");
  console.info("     - DataForge Analytics (2 job offers)");
  console.info("  👤 Candidates: 2");
  console.info("     - Anna Nowak (2 CVs, 2 applications)");
  console.info("     - Piotr Kowalski (2 CVs, 3 applications)");
  console.info("  📍 Locations: 2 (Warszawa, Kraków)");
  console.info("  💼 Job Offers: 4");
  console.info("  📝 Applications: 5");
  console.info("     - PENDING: 2");
  console.info("     - ACCEPTED: 1");
  console.info("     - REJECTED: 1");
  console.info("     - CANCELED: 1");
  console.info("  📅 Meetings: 3");
  console.info("  🔗 Profile Links: 5");
  console.info("  📄 External Job Offers: 2");
  console.info("  ❓ Recruitment Questions: 6");
  console.info("  💬 Candidate Answers: 6");
  console.info("  📧 Application Responses: 2");
  console.info("\n🔐 Login credentials (all users):");
  console.info("  Password: Demo123!");
  console.info("  Emails:");
  console.info("    - employer1@jobonfire.com (FireTech)");
  console.info("    - employer2@jobonfire.com (DataForge)");
  console.info("    - candidate1@jobonfire.com (Anna Nowak)");
  console.info("    - candidate2@jobonfire.com (Piotr Kowalski)");
  console.info("=" .repeat(60));
}

main()
  .catch((error: unknown) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
