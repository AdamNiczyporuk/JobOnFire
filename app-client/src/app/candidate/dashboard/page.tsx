"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { candidateService } from "@/services/candidateService";
import type { CandidateProfile, CandidateStats } from "@/types/candidate";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingData, setLoadingData] = useState(false);
  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (!user) {
      // Przekieruj na stronę logowania kandydata po krótkim opóźnieniu
      const timer = setTimeout(() => {
        router.push('/candidate/login');
      }, 1500);
      return () => clearTimeout(timer);
    } else if (user.role !== "CANDIDATE") {
      // Przekieruj na stronę główną jeśli nie jest kandydatem
      const timer = setTimeout(() => {
        router.push('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user || user.role !== "CANDIDATE") return;
      setLoadingData(true);
      try {
        const [s, p] = await Promise.all([
          candidateService.getStats().catch(() => null),
          candidateService.getProfile().catch(() => null),
        ]);
        if (!active) return;
        if (s) setStats(s);
        if (p) setProfile(p);
      } finally {
        if (active) setLoadingData(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user]);

  const recentApplications = useMemo(() => {
    const apps = profile?.applications ?? [];
    // We don't have appliedDate; show latest by array order and limit to 5
    return apps.slice(0, 5).map((app: any, idx: number) => {
      const status: string = app.status || "PENDING";
      const mapStatusToUi = (s: string) => {
        switch (s) {
          case "ACCEPTED":
            return { label: "Zaakceptowane", color: "bg-green-100 text-green-800" };
          case "REJECTED":
            return { label: "Odrzucone", color: "bg-red-100 text-red-800" };
          case "CANCELED":
            return { label: "Anulowane", color: "bg-gray-100 text-gray-800" };
          case "PENDING":
          default:
            return { label: "W trakcie", color: "bg-yellow-100 text-yellow-800" };
        }
      };
      const ui = mapStatusToUi(status);
      const company = app.jobOffer?.employerProfile?.companyName || "Firma";
      const position = app.jobOffer?.name || app.jobOffer?.title || "Stanowisko";
      return {
        id: app.id ?? idx,
        company,
        position,
        status: ui.label,
        statusColor: ui.color,
      };
    });
  }, [profile]);

  if (!user) {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Sprawdzanie uprawnień...</p>
        <p className="text-sm text-gray-500 mt-2">Przekierowanie na stronę logowania</p>
      </main>
    );
  }

  if (user.role !== "CANDIDATE") {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p className="text-red-600">Brak dostępu do panelu kandydata</p>
        <p className="text-sm text-gray-500 mt-2">Przekierowanie na stronę główną</p>
      </main>
    );
  }

  const cards = [
    { label: "Aplikacje", value: stats?.totalApplications ?? 0, color: "text-primary" },
    { label: "Oczekujące", value: stats?.pendingApplications ?? 0, color: "text-blue-600" },
    { label: "Zaakceptowane", value: stats?.acceptedApplications ?? 0, color: "text-green-600" },
    { label: "CV", value: stats?.totalCVs ?? 0, color: "text-purple-600" },
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
      <div className="mb-8 bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Szybkie akcje
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <Link href="/candidate/profile" className="w-full group">
            <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary/90 group-hover:-translate-y-1" variant="default">
              <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mój Profil
            </Button>
          </Link>

          <Link href="/candidate/applications" className="w-full group">
            <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
              <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Aplikacje
            </Button>
          </Link>

          <Link href="/candidate/calendar" className="w-full group">
            <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
              <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Kalendarz
            </Button>
          </Link>

          <Link href="/tools/cv-generator" className="w-full group">
            <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
              <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              <span className="flex items-center gap-1.5">
                Wygeneruj CV
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary group-hover:bg-primary/20 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4" />
                    <path d="M12 18v4" />
                    <path d="M4.93 4.93l2.83 2.83" />
                    <path d="M16.24 16.24l2.83 2.83" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  AI
                </span>
              </span>
            </Button>
          </Link>

          <Link href="/candidate/saved-jobs" className="w-full group">
            <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
              <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Zapisane
            </Button>
          </Link>

          <Link href="/candidate/cvs" className="w-full group">
            <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
              <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Moje CV
            </Button>
          </Link>

          <Link href="/job-offers" className="w-full group">
            <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
              <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Oferty pracy
            </Button>
          </Link>

          <Link href="/tools" className="w-full group">
            <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
              <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Narzędzia
            </Button>
          </Link>
        </div>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((c, idx) => (
          <div 
            key={c.label} 
            className="bg-white rounded-lg border p-6 text-center hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`text-3xl font-bold ${c.color} transition-transform duration-300 group-hover:scale-110`}>
              {loadingData ? (
                <div className="h-9 w-16 bg-gray-200 animate-pulse rounded mx-auto"></div>
              ) : (
                c.value
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-2">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Ostatnie aplikacje */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ostatnie aplikacje
            </h2>
            <Link href="/candidate/applications">
              <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary">
                Zobacz wszystkie
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {loadingData && (!recentApplications || recentApplications.length === 0) ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-muted-foreground mb-4">Nie masz jeszcze żadnych aplikacji</p>
                <Link href="/job-offers">
                  <Button variant="default" className="transition-all duration-300 hover:scale-105">
                    Przeglądaj oferty pracy
                  </Button>
                </Link>
              </div>
            ) : recentApplications.map((app, idx) => (
              <Link 
                key={app.id} 
                href={`/candidate/applications/${app.id}`}
                className="block"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors duration-300">{app.position}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {app.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${app.statusColor}`}>
                      {app.status}
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}