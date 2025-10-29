"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { getCandidateApplications, updateApplication } from "@/services/applicationService";
import { Application } from "@/types/candidate";
import { Search, Briefcase, Building2, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Filtry
  const [statusFilter, setStatusFilter] = useState('');
  const [jobOfferFilter, setJobOfferFilter] = useState('');
  const [meetingFilter, setMeetingFilter] = useState('');

  // Applied filters
  const [appliedStatus, setAppliedStatus] = useState('');
  const [appliedJobOffer, setAppliedJobOffer] = useState('');
  const [appliedMeeting, setAppliedMeeting] = useState('');

  // Modal anulowania
  const [cancelConfirm, setCancelConfirm] = useState<{ show: boolean; id: number | null; offerName?: string }>(
    { show: false, id: null, offerName: undefined }
  );

  useEffect(() => {
    fetchApplications();
  }, [page, searchQuery, appliedStatus, appliedJobOffer, appliedMeeting]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pobierz wszystkie i filtruj po stronie klienta (jak u pracodawcy)
      const response = await getCandidateApplications({ page: 1, limit: 1000 });
      let filtered = response.applications || [];

      // Backendowy status tylko jeśli chcesz; tutaj filtrujemy na froncie dla spójności
      if (appliedStatus) {
        filtered = filtered.filter(app => app.status === appliedStatus);
      }

      // Filtrowanie po nazwie oferty pracy
      if (appliedJobOffer) {
        filtered = filtered.filter(app => app.jobOffer.name.toLowerCase().includes(appliedJobOffer.toLowerCase()));
      }

      // Spotkanie zaplanowane/nie
      if (appliedMeeting) {
        filtered = filtered.filter(app => {
          const isScheduled = (app.meetings || []).length > 0;
          if (appliedMeeting === 'scheduled') return isScheduled;
          if (appliedMeeting === 'not_scheduled') return !isScheduled;
          return true;
        });
      }

      // Wyszukiwanie: nazwa oferty lub firma
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(app => {
          const company = app.jobOffer.employerProfile?.companyName || '';
          return app.jobOffer.name.toLowerCase().includes(q) || company.toLowerCase().includes(q);
        });
      }

      setAllApplications(response.applications);

      // Paginacja po stronie frontendu
      const itemsPerPage = 12;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setApplications(filtered.slice(startIndex, endIndex));
      setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
      setTotalCount(filtered.length);
    } catch (err) {
      console.error('Błąd podczas pobierania aplikacji:', err);
      setError('Nie udało się pobrać aplikacji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'CANCELED':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Oczekuje';
      case 'ACCEPTED':
        return 'Zaakceptowana';
      case 'REJECTED':
        return 'Odrzucona';
      case 'CANCELED':
        return 'Anulowana';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRelativeDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Dzisiaj';
    if (diffDays === 1) return 'Wczoraj';
    if (diffDays < 7) return `${diffDays} dni temu`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'tydzień' : 'tygodnie'} temu`;
    }
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const openCancel = (app: Application) => {
    setCancelConfirm({ show: true, id: app.id, offerName: app.jobOffer.name });
  };
  const closeCancel = () => setCancelConfirm({ show: false, id: null, offerName: undefined });
  const confirmCancel = async () => {
    if (!cancelConfirm.id) return;
    try {
      await updateApplication(cancelConfirm.id, { status: 'CANCELED' });
      await fetchApplications();
    } catch (e) {
      console.error('Błąd podczas anulowania aplikacji', e);
    } finally {
      closeCancel();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <main className="w-full flex flex-col">
          <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Moje aplikacje</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                Przeglądaj status swoich aplikacji i sprawdzaj szczegóły ofert
              </p>
            </div>
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Ładowanie aplikacji...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <main className="w-full flex flex-col">
          <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Moje aplikacje</h1>
            </div>
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 text-lg mb-4">{error}</p>
              <Button onClick={fetchApplications}>Spróbuj ponownie</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gray-50">
      <main className="w-full flex flex-col">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Moje aplikacje</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
              Przeglądaj status swoich aplikacji i sprawdzaj szczegóły ofert
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              Znaleziono <span className="font-semibold text-primary">{totalCount}</span> aplikacji
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-6 w-full max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Szukaj po nazwie oferty lub firmie..."
                  className="w-full pl-10 pr-20 py-2 border rounded-lg"
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
                >
                  Szukaj
                </Button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar filters */}
            <aside className="rounded-lg border bg-white p-4 h-fit">
              <h3 className="text-sm font-semibold mb-3">Filtry</h3>

              {/* Status */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Status aplikacji</p>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Wszystkie statusy</option>
                  <option value="PENDING">Oczekuje</option>
                  <option value="ACCEPTED">Zaakceptowana</option>
                  <option value="REJECTED">Odrzucona</option>
                  <option value="CANCELED">Anulowana</option>
                </select>
              </div>

              {/* Job Offer Name */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Nazwa oferty pracy</p>
                <input
                  type="text"
                  value={jobOfferFilter}
                  onChange={(e) => setJobOfferFilter(e.target.value)}
                  placeholder="np. Frontend Developer"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              {/* Meeting Status */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Spotkanie</p>
                <select
                  value={meetingFilter}
                  onChange={(e) => setMeetingFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Wszystkie</option>
                  <option value="scheduled">Zaplanowane</option>
                  <option value="not_scheduled">Niezaplanowane</option>
                </select>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => {
                    setAppliedStatus(statusFilter);
                    setAppliedJobOffer(jobOfferFilter);
                    setAppliedMeeting(meetingFilter);
                    setPage(1);
                  }}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Zastosuj
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('');
                    setJobOfferFilter('');
                    setMeetingFilter('');
                    setAppliedStatus('');
                    setAppliedJobOffer('');
                    setAppliedMeeting('');
                    setPage(1);
                  }}
                  className="w-36 px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
                >
                  Wyczyść
                </Button>
              </div>
            </aside>

            {/* Applications list */}
            <div className="space-y-4 pr-2">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-4">Brak aplikacji spełniających kryteria</p>
                  <p className="text-sm text-muted-foreground">Spróbuj zmienić kryteria wyszukiwania</p>
                </div>
              ) : (
                <>
                  {applications.map((app) => {
                    const company = app.jobOffer.employerProfile?.companyName;
                    const hasMeeting = (app.meetings || []).length > 0;
                    return (
                      <div
                        key={app.id}
                        className="block rounded-lg border bg-white p-4 shadow-sm transition-colors duration-150 hover:bg-accent/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer min-w-[400px] w-full"
                      >
                        <div className="flex flex-col gap-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Briefcase className="w-5 h-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-lg font-semibold mb-1">{app.jobOffer.name}</h3>
                                  {company && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Building2 className="w-4 h-4" />
                                      <span>{company}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status badge */}
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadgeClass(app.status)}`}>
                              {getStatusIcon(app.status)}
                              {getStatusText(app.status)}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Application date */}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Data aplikacji</p>
                                <p className="font-medium">{formatRelativeDate(app.createDate)}</p>
                              </div>
                            </div>

                            {/* Meeting */}
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                                <polyline points="17 2 12 7 7 2"></polyline>
                              </svg>
                              <div>
                                <p className="text-xs text-muted-foreground">Spotkanie</p>
                                <p className="font-medium">
                                  {hasMeeting ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> Zaplanowane
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">Nie zaplanowano</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Link href={`/candidate/applications/${app.id}`}>
                              <Button
                                variant="outline"
                                className="flex-1 px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
                              >
                                Zobacz szczegóły aplikacji
                              </Button>
                            </Link>
                            <Link href={`/job-offers/${app.jobOfferId}`}>
                              <Button
                                variant="outline"
                                className="flex-1 px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
                              >
                                Szczegóły oferty
                              </Button>
                            </Link>
                            {app.status === 'PENDING' && (
                              <Button
                                onClick={() => openCancel(app)}
                                className="transition-all duration-200 hover:scale-105"
                              >
                                Anuluj aplikację
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && applications.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Poprzednia
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = page <= 3 ? i + 1 : page > totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      onClick={() => setPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Następna
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Modal potwierdzenia anulowania */}
      {cancelConfirm.show && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Anuluj aplikację</h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Czy na pewno chcesz anulować aplikację na ofertę "{cancelConfirm.offerName}"?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button onClick={closeCancel} variant="outline" className="transition-all duration-200 hover:scale-105">
                Anuluj
              </Button>
              <Button onClick={confirmCancel} variant="destructive" className="transition-all duration-200 hover:scale-105">
                Potwierdź anulowanie
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

