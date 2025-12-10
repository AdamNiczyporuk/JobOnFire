"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { getEmployerApplications, updateApplicationStatus } from "@/services/applicationService";
import { EmployerApplication, EmployerApplicationsParams } from "@/types/application";
import { Search, Briefcase, User, Calendar, MessageSquare, Video, CheckCircle, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function EmployerApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [allApplications, setAllApplications] = useState<EmployerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  
  // Filtry
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || '');
  const [jobOfferFilter, setJobOfferFilter] = useState(() => searchParams.get('jobOffer') || '');
  const [meetingFilter, setMeetingFilter] = useState(() => searchParams.get('meeting') || '');
  const [questionsFilter, setQuestionsFilter] = useState('');

  // Applied filters
  const [appliedStatus, setAppliedStatus] = useState(() => searchParams.get('status') || '');
  const [appliedJobOffer, setAppliedJobOffer] = useState(() => searchParams.get('jobOffer') || '');
  const [appliedMeeting, setAppliedMeeting] = useState(() => searchParams.get('meeting') || '');
  const [appliedQuestions, setAppliedQuestions] = useState('');

  // State initialized from URL via useState initializers above

  const updateQueryParams = (updates: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === null) current.delete(k); else current.set(k, String(v));
    });
    const qs = current.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  useEffect(() => {
    fetchApplications();
  }, [page, searchQuery, appliedStatus, appliedJobOffer, appliedMeeting]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const itemsPerPage = 12;
      const hasClientFilters = Boolean(appliedJobOffer || appliedMeeting || searchQuery);

      // Buduj parametry z uwzględnieniem paginacji backendowej gdy brak filtrów klienckich
      const params: EmployerApplicationsParams = {
        page: hasClientFilters ? 1 : page,
        limit: hasClientFilters ? 1000 : itemsPerPage,
      };

      // Status filtrowany po stronie backendu
      if (appliedStatus) {
        params.status = appliedStatus as any;
      }

      const response = await getEmployerApplications(params);

      if (!hasClientFilters) {
        // Używaj paginacji backendowej i całkowitej liczby z backendu (spójnie z dashboardem)
        setApplications(response.applications);
        setTotalPages(response.pagination.pages);
        setTotalCount(response.pagination.total);
      } else {
        // Filtrowanie po stronie frontu na pełnym zbiorze i paginacja lokalna
        let filteredApplications = response.applications;

        // Filtrowanie po nazwie oferty pracy
        if (appliedJobOffer) {
          filteredApplications = filteredApplications.filter(app => 
            app.jobOffer.name.toLowerCase().includes(appliedJobOffer.toLowerCase())
          );
        }

        // Filtrowanie po statusie spotkania
        if (appliedMeeting) {
          filteredApplications = filteredApplications.filter(app => {
            if (appliedMeeting === 'scheduled') {
              return app.meeting.isScheduled;
            } else if (appliedMeeting === 'not_scheduled') {
              return !app.meeting.isScheduled;
            }
            return true;
          });
        }

        // Filtrowanie po wyszukiwanej frazie
        if (searchQuery) {
          filteredApplications = filteredApplications.filter(app => 
            app.jobOffer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setAllApplications(response.applications);

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

        setApplications(paginatedApplications);
        setTotalPages(Math.ceil(filteredApplications.length / itemsPerPage));
        setTotalCount(filteredApplications.length);
      }
    } catch (err) {
      console.error('Błąd podczas pobierania aplikacji:', err);
      setError('Nie udało się pobrać aplikacji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const handleInlineStatusUpdate = async (id: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await updateApplicationStatus(id, { status });
      // Optimistyczna aktualizacja lokalnej listy
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      setAllApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    } catch (err) {
      console.error('Błąd aktualizacji statusu aplikacji:', err);
      // Fallback: odśwież listę z serwera
      fetchApplications();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
    updateQueryParams({ q: searchInput, page: 1 });
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

  const formatDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Dzisiaj';
    } else if (diffDays === 1) {
      return 'Wczoraj';
    } else if (diffDays < 7) {
      return `${diffDays} dni temu`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'tydzień' : 'tygodnie'} temu`;
    } else {
      return date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <main className="w-full flex flex-col">
          <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Aplikacje</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                Przeglądaj i zarządzaj aplikacjami kandydatów na Twoje oferty pracy
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
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Aplikacje</h1>
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
    <div className="flex flex-col items-center">
      <main className="w-full flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col">
          <div className="mb-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-2">Aplikacje</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
              Przeglądaj i zarządzaj aplikacjami kandydatów na Twoje oferty pracy
            </p>
            <div className="mt-2 text-sm text-muted-foreground">
              Znaleziono <span className="font-semibold text-primary">{totalCount}</span> aplikacji
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-4 w-full max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Szukaj po nazwie oferty lub kandydacie..."
                  className="pl-10 pr-20"
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

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
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
                    updateQueryParams({ status: statusFilter || undefined, jobOffer: jobOfferFilter || undefined, meeting: meetingFilter || undefined, page: 1 });
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
                    setQuestionsFilter('');
                    setAppliedStatus('');
                    setAppliedJobOffer('');
                    setAppliedMeeting('');
                    setAppliedQuestions('');
                    setPage(1);
                    updateQueryParams({ status: undefined, jobOffer: undefined, meeting: undefined, q: undefined, page: 1 });
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
                  <p className="text-sm text-muted-foreground">Spróbuj zmienić kryteria wyszukiwania lub poszerzyć zakres filtrów</p>
                </div>
              ) : (
                <>
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className="block rounded-lg border bg-white p-4 shadow-md transition-colors duration-150 hover:bg-accent/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary min-w-[400px] w-full"
                    >
                      <div className="flex gap-4">
                        {/* Left side - Content */}
                        <div className="flex-1 flex flex-col gap-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Briefcase className="w-5 h-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-lg font-semibold mb-1">
                                    {application.jobOffer.name}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="w-4 h-4" />
                                    <span>{application.candidate.fullName}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Status badge */}
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadgeClass(application.status)}`}>
                              {getStatusIcon(application.status)}
                              {getStatusText(application.status)}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Application date */}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Data aplikacji</p>
                                <p className="font-medium">{formatDate(application.createdAt)}</p>
                              </div>
                            </div>

                            {/* Recruitment questions */}
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Pytania rekrutacyjne</p>
                                <p className="font-medium">
                                  {application.recruitmentQuestions.total === 0 ? (
                                    <span className="text-muted-foreground">Brak pytań</span>
                                  ) : (
                                    <span className={application.recruitmentQuestions.allAnswered ? 'text-green-600' : 'text-orange-600'}>
                                      {application.recruitmentQuestions.answered}/{application.recruitmentQuestions.total}
                                      {application.recruitmentQuestions.allAnswered && (
                                        <CheckCircle className="w-3 h-3 inline ml-1" />
                                      )}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Meeting */}
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Spotkanie</p>
                                <p className="font-medium">
                                  {application.meeting.isScheduled ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Zaplanowane
                                      {application.meeting.type === 'ONLINE' && (
                                        <span className="text-xs text-muted-foreground">(Online)</span>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">Nie zaplanowano</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                          <Link href={`/employer/applications/${application.id}`}>
                            <Button
                              variant="outline"
                              className="w-full px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
                            >
                              Zobacz szczegóły
                            </Button>
                          </Link>
                          {application.status === 'PENDING' && (
                            <>
                              <Button
                                onClick={() => handleInlineStatusUpdate(application.id, 'ACCEPTED')}
                                className="w-full transition-all duration-200 hover:scale-105 bg-white hover:bg-red-50 text-red-600 border border-red-600 hover:border-red-700"
                              >
                                Akceptuj
                              </Button>
                              <Button
                                onClick={() => handleInlineStatusUpdate(application.id, 'REJECTED')}
                                className="w-full transition-all duration-200 hover:scale-105"
                              >
                                Odrzuć
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && applications.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => { const np = Math.max(1, page - 1); setPage(np); updateQueryParams({ page: np }); }}
                disabled={page === 1}
              >
                Poprzednia
              </Button>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = page <= 3 ? i + 1 : 
                                 page > totalPages - 2 ? totalPages - 4 + i :
                                 page - 2 + i;
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      onClick={() => { setPage(pageNum); updateQueryParams({ page: pageNum }); }}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => { const np = Math.min(totalPages, page + 1); setPage(np); updateQueryParams({ page: np }); }}
                disabled={page === totalPages}
              >
                Następna
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
