"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getEmployerStats } from "@/services/employerService";
import { getEmployerApplications } from "@/services/applicationService";
import { getJobOffers } from "@/services/jobOfferService";
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Building2,
  MapPin,
  Eye,
  Edit,
  Calendar
} from "lucide-react";

interface EmployerStats {
  totalJobOffers: number;
  activeJobOffers: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingData, setLoadingData] = useState(false);
  const [stats, setStats] = useState<EmployerStats>({
    totalJobOffers: 0,
    activeJobOffers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [activeJobOffers, setActiveJobOffers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        router.push('/employer/login');
      }, 1500);
      return () => clearTimeout(timer);
    } else if (user.role !== "EMPLOYER") {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user || user.role !== "EMPLOYER") return;
      setLoadingData(true);
      try {
        // Pobierz statystyki
        const statsData = await getEmployerStats();
        if (active && statsData) setStats(statsData);

        // Pobierz ostatnie aplikacje
        const appsResponse = await getEmployerApplications({ page: 1, limit: 5 });
        if (active && appsResponse) {
          setRecentApplications(appsResponse.applications || []);
        }

        // Pobierz aktywne oferty pracy
        const jobsResponse = await getJobOffers({ page: 1, limit: 5 });
        if (active && jobsResponse) {
          setActiveJobOffers(jobsResponse.jobOffers || []);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        if (active) setLoadingData(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Sprawdzanie uprawnień...</p>
        <p className="text-sm text-gray-500 mt-2">Przekierowanie na stronę logowania</p>
      </main>
    );
  }

  if (user.role !== "EMPLOYER") {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p className="text-red-600">Brak dostępu do panelu pracodawcy</p>
        <p className="text-sm text-gray-500 mt-2">Przekierowanie na stronę główną</p>
      </main>
    );
  }

  const statCards = [
    { 
      label: "Oferty pracy", 
      value: stats.totalJobOffers, 
      color: "text-primary",
      bgColor: "bg-red-50",
      icon: <Briefcase className="w-6 h-6" />
    },
    { 
      label: "Aktywne oferty", 
      value: stats.activeJobOffers, 
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: <TrendingUp className="w-6 h-6" />
    },
    { 
      label: "Aplikacje", 
      value: stats.totalApplications, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: <Users className="w-6 h-6" />
    },
    { 
      label: "Aplikacje Oczekujące", 
      value: stats.pendingApplications, 
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      icon: <Clock className="w-6 h-6" />
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Oczekuje', color: 'bg-yellow-100 text-yellow-800' };
      case 'ACCEPTED':
        return { label: 'Zaakceptowana', color: 'bg-green-100 text-green-800' };
      case 'REJECTED':
        return { label: 'Odrzucona', color: 'bg-red-100 text-red-800' };
      case 'CANCELED':
        return { label: 'Anulowana', color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Dzisiaj';
    if (diffDays === 1) return 'Wczoraj';
    if (diffDays < 7) return `${diffDays} dni temu`;
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Nagłówek powitania */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Witaj, {user.username}! 👋
          </h1>
          <p className="text-muted-foreground">
            Zarządzaj ofertami pracy i rekrutacją w jednym miejscu
          </p>
        </div>

        {/* Szybkie akcje */}
        <div className="mb-8 bg-gradient-to-r from-primary/10 to-red-50 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Szybkie akcje
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <Link href="/employer/job-offers" className="w-full group">
              <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary/90 group-hover:-translate-y-1" variant="default">
                <Briefcase className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                Oferty pracy
              </Button>
            </Link>

            <Link href="/employer/applications" className="w-full group">
              <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
                <FileText className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Aplikacje
              </Button>
            </Link>

            <Link href="/employer/candidates" className="w-full group">
              <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
                <Users className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Kandydaci
              </Button>
            </Link>

            <Link href="/employer/profile" className="w-full group">
              <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
                <Building2 className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-6" />
                Profil firmy
              </Button>
            </Link>

            <Link href="/employer/calendar" className="w-full group">
              <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
                <Calendar className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                Kalendarz
              </Button>
            </Link>

            <Link href="/employer/recruitment-test" className="w-full group">
              <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
                <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="flex items-center gap-1.5">
                  Test rekrutacyjny
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

            <Link href="/employer/profile?edit=1#locations" className="w-full group">
              <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary group-hover:-translate-y-1" variant="outline">
                <MapPin className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Lokalizacje
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
          {statCards.map((card, idx) => (
            <div 
              key={card.label} 
              className={`${card.bgColor} rounded-lg border border-transparent p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-white/50 ${card.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  {card.icon}
                </div>
              </div>
              <div className={`text-3xl font-bold ${card.color} transition-transform duration-300 group-hover:scale-110`}>
                {loadingData ? (
                  <div className="h-9 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  card.value
                )}
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ostatnie aplikacje */}
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Ostatnie aplikacje
              </h2>
              <Link href="/employer/applications">
                <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary">
                  Zobacz wszystkie
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {loadingData ? (
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
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">Brak aplikacji</p>
                  <Link href="/employer/job-offers">
                    <Button variant="default" className="transition-all duration-300 hover:scale-105">
                      Utwórz ofertę pracy
                    </Button>
                  </Link>
                </div>
              ) : recentApplications.map((app, idx) => {
                const badge = getStatusBadge(app.status);
                return (
                  <Link 
                    key={app.id} 
                    href={`/employer/applications/${app.id}`}
                    className="block"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
                      <div className="flex-1">
                        <h3 className="font-medium group-hover:text-primary transition-colors duration-300">
                          {app.candidate?.fullName || 'Kandydat'}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Briefcase className="w-4 h-4" />
                          {app.jobOffer?.name || 'Stanowisko'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Aktywne oferty */}
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Aktywne oferty pracy
              </h2>
              <Link href="/employer/job-offers">
                <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary">
                  Zobacz wszystkie
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {loadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeJobOffers.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">Brak aktywnych ofert</p>
                  <Link href="/employer/job-offers">
                    <Button variant="default" className="transition-all duration-300 hover:scale-105">
                      Dodaj ofertę
                    </Button>
                  </Link>
                </div>
              ) : activeJobOffers.map((job, idx) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/employer/job-offers/${job.id}`)}
                  className="block"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="p-4 border rounded-lg hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium group-hover:text-primary transition-colors duration-300">
                          {job.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job._count?.applications || 0} aplikacji
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(job.createDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/employer/job-offers/${job.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 transition-transform duration-300 hover:scale-110">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/employer/job-offers/${job.id}/edit`} onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 transition-transform duration-300 hover:scale-110">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}