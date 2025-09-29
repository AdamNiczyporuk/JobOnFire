import { ApplicationStatus, MeetingType, Prisma, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.info("🌱 Seeding database with demo data...");

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

  const skills: Prisma.JsonArray = ["React", "Next.js", "TypeScript", "GraphQL", "Jest"];
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
