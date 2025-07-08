"use client";
import { useAuth } from "@/context/authContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CandidateDashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="flex-1 w-full flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Wymagane logowanie</h2>
          <p className="text-muted-foreground mb-6">Musisz być zalogowany, aby zobaczyć panel kandydata.</p>
          <Link href="/candidate/login">
            <Button>Zaloguj się</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (user.role !== "CANDIDATE") {
    return (
      <main className="flex-1 w-full flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Brak dostępu</h2>
          <p className="text-muted-foreground mb-6">Nie masz dostępu do panelu kandydata.</p>
          <Link href="/">
            <Button variant="outline">Wróć do strony głównej</Button>
          </Link>
        </div>
      </main>
    );
  }

  // Przykładowe dane - w prawdziwej aplikacji byłyby pobierane z API
  const stats = {
    applications: 12,
    interviews: 3,
    offers: 1,
    views: 45
  };

  const recentApplications = [
    {
      id: 1,
      company: "TechCorp",
      position: "Frontend Developer",
      status: "W trakcie",
      appliedDate: "2025-01-05",
      statusColor: "bg-yellow-100 text-yellow-800"
    },
    {
      id: 2,
      company: "StartupXYZ",
      position: "React Developer",
      status: "Rozmowa",
      appliedDate: "2025-01-03",
      statusColor: "bg-blue-100 text-blue-800"
    },
    {
      id: 3,
      company: "WebStudio",
      position: "UI/UX Designer",
      status: "Odrzucone",
      appliedDate: "2024-12-28",
      statusColor: "bg-red-100 text-red-800"
    }
  ];

  const recommendedJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "InnovateTech",
      location: "Warszawa",
      salary: "15 000 - 20 000 PLN",
      type: "Pełny etat",
      posted: "2 dni temu"
    },
    {
      id: 2,
      title: "React Native Developer",
      company: "MobileFirst",
      location: "Kraków",
      salary: "12 000 - 18 000 PLN",
      type: "Pełny etat",
      posted: "1 tydzień temu"
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "DevHouse",
      location: "Gdańsk",
      salary: "14 000 - 22 000 PLN",
      type: "Pełny etat",
      posted: "3 dni temu"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Nagłówek powitania */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Witaj, {user.username}! 👋
        </h1>
        <p className="text-muted-foreground">
          Zarządzaj swoimi aplikacjami i znajdź wymarzoną pracę
        </p>
      </div>

      {/* Szybkie akcje - na górze */}
      <div className="mb-8 bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Szybkie akcje</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="w-full" variant="default">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Zaktualizuj CV
          </Button>
          <Button className="w-full" variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Wygeneruj CV
          </Button>
          <Link href="/job-offers" className="w-full">
            <Button className="w-full" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Szukaj ofert
            </Button>
          </Link>
          <Button className="w-full" variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Edytuj profil
          </Button>
        </div>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-primary">{stats.applications}</div>
          <div className="text-sm text-muted-foreground">Aplikacje</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.interviews}</div>
          <div className="text-sm text-muted-foreground">Rozmowy</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
          <div className="text-sm text-muted-foreground">Oferty</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-purple-600">{stats.views}</div>
          <div className="text-sm text-muted-foreground">Wyświetlenia profilu</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ostatnie aplikacje */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Ostatnie aplikacje</h2>
            <Button variant="outline" size="sm">
              Zobacz wszystkie
            </Button>
          </div>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium">{app.position}</h3>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                  <p className="text-xs text-muted-foreground">Aplikowano: {app.appliedDate}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                  {app.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rekomendowane oferty */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Rekomendowane dla Ciebie</h2>
            <Link href="/job-offers">
              <Button variant="outline" size="sm">
                Zobacz więcej
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recommendedJobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-1">{job.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{job.company} • {job.location}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">{job.salary}</p>
                    <p className="text-xs text-muted-foreground">{job.type} • {job.posted}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Aplikuj
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}