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
      <div className="mb-8 bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Szybkie akcje</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="w-full transition-all duration-200 hover:scale-105 hover:shadow-lg" variant="default">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Zaktualizuj CV
          </Button>
          <Link href="/tools/cv-generator" className="w-full">
            <Button className="w-full transition-all duration-200 hover:scale-105 hover:shadow-lg" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Wygeneruj CV
            </Button>
          </Link>
          <Link href="/job-offers" className="w-full">
            <Button className="w-full transition-all duration-200 hover:scale-105 hover:shadow-lg" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Szukaj ofert
            </Button>
          </Link>
          <Link href="/candidate/profile?edit=1" className="w-full">
            <Button className="w-full transition-all duration-200 hover:scale-105 hover:shadow-lg" variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Edytuj profil
            </Button>
          </Link>
        </div>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg border p-6 text-center hover:shadow-md transition-shadow">
            <div className={`text-2xl font-bold ${c.color}`}>{loadingData ? "…" : c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
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
            {loadingData && (!recentApplications || recentApplications.length === 0) ? (
              <div className="text-sm text-muted-foreground">Ładowanie…</div>
            ) : recentApplications.length === 0 ? (
              <div className="text-sm text-muted-foreground">Brak aplikacji.</div>
            ) : recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium">{app.position}</h3>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                  {app.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rekomendowane oferty (placeholder – brak danych z backendu) */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Rekomendowane dla Ciebie</h2>
            <Link href="/job-offers">
              <Button variant="outline" size="sm">
                Zobacz więcej
              </Button>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">Brak rekomendacji. Wróć później.</div>
        </div>
      </div>
    </div>
  );
}