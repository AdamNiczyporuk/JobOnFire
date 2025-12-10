"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SmartHeader } from "@/components/SmartHeader";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getPublicJobOffers } from "@/services/jobOfferService";
import { JobOffer } from "@/types/jobOffer";
import { Search } from "lucide-react";

export default function JobOffersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Initialize search from URL parameter immediately
  const searchFromUrl = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  
  const [selectedWorkingModes, setSelectedWorkingModes] = useState<string[]>(() => (searchParams.get('workingModes') || '').split(',').map(s => s.trim()).filter(Boolean));
  const [selectedContractTypes, setSelectedContractTypes] = useState<string[]>(() => (searchParams.get('contractTypes') || '').split(',').map(s => s.trim()).filter(Boolean));
  // Job level is now free-text input instead of checkboxes
  const [jobLevelInput, setJobLevelInput] = useState(() => searchParams.get('jobLevel') || "");
  const [selectedWorkloads, setSelectedWorkloads] = useState<string[]>(() => (searchParams.get('workloads') || '').split(',').map(s => s.trim()).filter(Boolean));
  const [techInput, setTechInput] = useState(() => searchParams.get('tech') || ''); // comma-separated technologies

  // Applied filters: used only after clicking "Zastosuj"
  const [appliedWorkingModes, setAppliedWorkingModes] = useState<string[]>(() => (searchParams.get('workingModes') || '').split(',').map(s => s.trim()).filter(Boolean));
  const [appliedContractTypes, setAppliedContractTypes] = useState<string[]>(() => (searchParams.get('contractTypes') || '').split(',').map(s => s.trim()).filter(Boolean));
  const [appliedJobLevel, setAppliedJobLevel] = useState(() => searchParams.get('jobLevel') || "");
  const [appliedWorkloads, setAppliedWorkloads] = useState<string[]>(() => (searchParams.get('workloads') || '').split(',').map(s => s.trim()).filter(Boolean));
  const [appliedTechInput, setAppliedTechInput] = useState(() => searchParams.get('tech') || '');

  // Salary minimum filter (PLN)
  const [minSalaryInput, setMinSalaryInput] = useState<string>(() => searchParams.get('minSalary') || '');
  const [appliedMinSalary, setAppliedMinSalary] = useState<number | undefined>(() => {
    const v = searchParams.get('minSalary');
    const n = v ? parseInt(v, 10) : NaN;
    return !Number.isNaN(n) && n > 0 ? n : undefined;
  });

  // Compute backend filter params (first selected for workingMode/contractType; tags as CSV)
  const backendWorkingMode = useMemo(() => appliedWorkingModes[0], [appliedWorkingModes]);
  const backendContractType = useMemo(() => appliedContractTypes[0], [appliedContractTypes]);
  const backendTags = useMemo(() => {
    return appliedTechInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .join(',') || undefined;
  }, [appliedTechInput]);

  const fetchJobOffers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPublicJobOffers({
        page,
        limit: 12,
        search: searchQuery || undefined,
        sortBy: 'createDate',
        sortOrder: 'desc',
        workingMode: backendWorkingMode,
        contractType: backendContractType,
        tags: backendTags,
      });
      
      setJobOffers(response.jobOffers);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError('Nie udało się pobrać ofert pracy');
      console.error('Error fetching job offers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, backendWorkingMode, backendContractType, backendTags]);

  useEffect(() => {
    fetchJobOffers();
  }, [fetchJobOffers]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1); // Reset to first page when searching
    updateQueryParams({ search: searchInput || undefined, page: 1 });
  }, [searchInput]);

  const toggleSelection = useCallback((arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  }, []);

  const formatSalary = (salary?: string) => {
    if (!salary) return 'Salary not specified';
    return salary;
  };

  const formatLocation = (jobOffer: JobOffer) => {
    const city = jobOffer.lokalization?.city;
    const state = jobOffer.lokalization?.state;
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return 'Remote';
  };

  const formatTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return [];
    return tags.slice(0, 2); // Show max 2 tags for thin rows
  };

  // Helper to sync URL query params
  const updateQueryParams = (updates: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) current.delete(key); else current.set(key, String(value));
    });
    const qs = current.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  // Parse salary string like "10 000 - 15 000 PLN" to min/max numbers
  const parseSalaryNumbers = (salary?: string): { min?: number; max?: number } => {
    if (!salary) return {};
    // capture numeric chunks with spaces, dots or commas
    const matches = salary.match(/\d[\d\s.,]*/g);
    if (!matches || matches.length === 0) return {};
    const nums = matches
      .map((m) => parseInt(m.replace(/[^\d]/g, ''), 10))
      .filter((n) => !Number.isNaN(n));
    if (nums.length === 0) return {};
    if (nums.length === 1) return { min: nums[0] };
    // ensure ascending order just in case
    const [a, b] = nums;
    return { min: Math.min(a, b), max: Math.max(a, b) };
  };

  // Client-side filters (for multiple working modes/contract types, job levels, workloads)
  const filteredJobOffers = useMemo(() => {
    return jobOffers.filter((offer) => {
      // working mode (support multiple)
      if (appliedWorkingModes.length > 0) {
        const modes = (offer.workingMode || []).map(m => m.toLowerCase());
        const matchMode = appliedWorkingModes.some(sel => modes.some(m => m.includes(sel.toLowerCase())));
        if (!matchMode) return false;
      }

      // contract type (support multiple)
      if (appliedContractTypes.length > 0) {
        const ct = (offer.contractType || '').toLowerCase();
        const matchCt = appliedContractTypes.some(sel => ct.includes(sel.toLowerCase()));
        if (!matchCt) return false;
      }

      // job level (free-text contains)
      if (appliedJobLevel.trim().length > 0) {
        const needle = appliedJobLevel.toLowerCase();
        const levels = (offer.jobLevel || []).map(l => l.toLowerCase());
        const matchLevel = levels.some(l => l.includes(needle));
        if (!matchLevel) return false;
      }

      // minimum salary threshold
      if (appliedMinSalary && appliedMinSalary > 0) {
        const { min, max } = parseSalaryNumbers(offer.salary);
        if (min == null && max == null) return false; // no salary provided -> filter out when min required
        const comparable = (max ?? min ?? 0);
        if (comparable < appliedMinSalary) return false;
      }

      // workload
      if (appliedWorkloads.length > 0) {
        const wl = (offer.workload || '').toLowerCase();
        const matchWl = appliedWorkloads.some(sel => wl.includes(sel.toLowerCase()));
        if (!matchWl) return false;
      }

      // technologies (tags) client-side as well for robustness
      const techs = appliedTechInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      if (techs.length > 0) {
        const tags = (offer.tags || []).map(t => t.toLowerCase());
        const matchTechs = techs.every(t => tags.some(tag => tag.includes(t)));
        if (!matchTechs) return false;
      }

      return true;
    });
  }, [jobOffers, appliedWorkingModes, appliedContractTypes, appliedJobLevel, appliedWorkloads, appliedTechInput, appliedMinSalary]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <SmartHeader />
        <main className="flex-1 w-full">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Oferty pracy</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                Znajdź swoją idealną pracę w branży IT
              </p>
            </div>
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Ładowanie ofert pracy...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <SmartHeader />
        <main className="flex-1 w-full">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Oferty pracy</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                Znajdź swoją idealną pracę w branży IT
              </p>
            </div>
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchJobOffers}>Spróbuj ponownie</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Oferty pracy</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto mb-8">
              Znajdź swoją idealną pracę w branży IT
            </p>
            
            {/* Wyszukiwarka */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Wyszukaj oferty pracy..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-11 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                />
                <Button 
                  type="submit" 
                  size="default" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                >
                  Szukaj
                </Button>
              </div>
            </form>

            {/* Licznik wyników pod wyszukiwaniem */}
            <div className="mt-3 text-sm text-muted-foreground">
              <span>
                Znaleziono <span className="text-red-600 font-semibold">{filteredJobOffers.length}</span> ofert pracy
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
            {/* Sidebar filters - always visible */}
            <aside className="rounded-lg border bg-white p-6 h-fit shadow-md"> 
              <h3 className="text-base font-semibold mb-4">Filtry</h3>

              {/* Tryb pracy */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2.5">Tryb pracy</p>
                {['Biuro', 'Hybrydowo', 'Częściowo zdalnie', 'Mobilnie', 'Zdalnie', 'W terenie'].map((mode) => (
                  <label key={mode} className="flex items-center gap-2.5 text-sm mb-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedWorkingModes.includes(mode)}
                      onChange={() => toggleSelection(selectedWorkingModes, mode, setSelectedWorkingModes)}
                      className="w-4 h-4 cursor-pointer accent-red-600 border-gray-300 rounded transition-all"
                    />
                    <span className="group-hover:text-red-600 transition-colors duration-200">{mode}</span>
                  </label>
                ))}
              </div>

              {/* Rodzaj umowy */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2.5">Rodzaj umowy</p>
                {['Umowa o pracę', 'Umowa B2B', 'Umowa zlecenie', 'Umowa o dzieło'].map((ct) => (
                  <label key={ct} className="flex items-center gap-2.5 text-sm mb-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedContractTypes.includes(ct)}
                      onChange={() => toggleSelection(selectedContractTypes, ct, setSelectedContractTypes)}
                      className="w-4 h-4 cursor-pointer accent-red-600 border-gray-300 rounded transition-all"
                    />
                    <span className="group-hover:text-red-600 transition-colors duration-200">{ct}</span>
                  </label>
                ))}
              </div>

              {/* Poziom stanowiska (wpisz dowolny, np. Junior/Mid/Senior/Lead) */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2.5">Poziom stanowiska</p>
                <input
                  type="text"
                  value={jobLevelInput}
                  onChange={(e) => setJobLevelInput(e.target.value)}
                  placeholder="np. Junior, Senior, Lead"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Wymiar pracy */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2.5">Wymiar pracy</p>
                {['Pełny etat', 'Część etatu', 'Elastyczny wymiar', 'Weekend', 'Wieczory', 'Dodatkowa praca'].map((wl) => (
                  <label key={wl} className="flex items-center gap-2.5 text-sm mb-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedWorkloads.includes(wl)}
                      onChange={() => toggleSelection(selectedWorkloads, wl, setSelectedWorkloads)}
                      className="w-4 h-4 cursor-pointer accent-red-600 border-gray-300 rounded transition-all"
                    />
                    <span className="group-hover:text-red-600 transition-colors duration-200">{wl}</span>
                  </label>
                ))}
              </div>

              {/* Minimalne wynagrodzenie (PLN) */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2.5">Minimalne wynagrodzenie (PLN)</p>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={minSalaryInput}
                  onChange={(e) => setMinSalaryInput(e.target.value)}
                  placeholder="np. 8000"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none transition-all duration-200"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Filtruje oferty z wynagrodzeniem co najmniej tej wysokości</p>
              </div>

              {/* Technologie / Specjalizacje */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2.5">Technologie / Specjalizacje</p>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => { setTechInput(e.target.value); }}
                  placeholder="np. React, Node, AWS"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none transition-all duration-200"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Oddziel przecinkami</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-5">
                <Button
                  onClick={() => {
                    setAppliedWorkingModes(selectedWorkingModes);
                    setAppliedContractTypes(selectedContractTypes);
                    setAppliedJobLevel(jobLevelInput);
                    setAppliedWorkloads(selectedWorkloads);
                    setAppliedTechInput(techInput);
                    const parsed = parseInt(minSalaryInput, 10);
                    setAppliedMinSalary(!Number.isNaN(parsed) && parsed > 0 ? parsed : undefined);
                    setPage(1);
                    updateQueryParams({
                      workingModes: selectedWorkingModes.join(',') || undefined,
                      contractTypes: selectedContractTypes.join(',') || undefined,
                      jobLevel: jobLevelInput || undefined,
                      workloads: selectedWorkloads.join(',') || undefined,
                      tech: techInput || undefined,
                      minSalary: (!Number.isNaN(parsed) && parsed > 0 ? parsed : undefined) as any,
                      search: searchQuery || undefined,
                      page: 1,
                    });
                  }}
                  className="flex-1 transition-all duration-200 hover:scale-105"
                  size="default"
                >
                  Zastosuj
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedWorkingModes([]);
                    setSelectedContractTypes([]);
                    setJobLevelInput("");
                    setSelectedWorkloads([]);
                    setTechInput('');
                    setMinSalaryInput('');

                    setAppliedWorkingModes([]);
                    setAppliedContractTypes([]);
                    setAppliedJobLevel("");
                    setAppliedWorkloads([]);
                    setAppliedTechInput('');
                    setAppliedMinSalary(undefined);
                    setPage(1);
                    updateQueryParams({ workingModes: undefined, contractTypes: undefined, jobLevel: undefined, workloads: undefined, tech: undefined, minSalary: undefined, page: 1 });
                  }}
                  className="flex-1 transition-all duration-200 hover:scale-105"
                  size="default"
                >
                  Wyczyść
                </Button>
              </div>
            </aside>

            {/* List content */}
            <div className="space-y-5">
              {filteredJobOffers.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">Brak dostępnych ofert pracy</p>
                  <p className="text-sm text-muted-foreground">Sprawdź ponownie później lub zmień kryteria wyszukiwania</p>
                </div>
              ) : (
                filteredJobOffers.map((jobOffer) => (
                  <div
                    key={jobOffer.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/job-offers/${jobOffer.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/job-offers/${jobOffer.id}`);
                      }
                    }}
                    className="block rounded-lg border bg-white p-6 shadow-md transition-all duration-200 hover:bg-accent/30 hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                            {jobOffer.name}
                          </h3>
                          {jobOffer.employerProfile?.companyName && jobOffer.employerProfile?.id && (
                            <p className="text-muted-foreground mb-1 font-medium text-base">
                              <Link href={`/companies/${jobOffer.employerProfile.id}`} className="hover:text-primary underline-offset-2 hover:underline" onClick={(e) => e.stopPropagation()}>
                                {jobOffer.employerProfile.companyName}
                              </Link>
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                              {formatLocation(jobOffer)}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatSalary(jobOffer.salary)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {jobOffer.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {jobOffer.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 items-start">
                        {formatTags(jobOffer.tags).map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {jobOffer.tags && jobOffer.tags.length > 2 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                            +{jobOffer.tags.length - 2} więcej
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Paginacja */}
          {totalPages > 1 && filteredJobOffers.length > 0 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <Button
                variant="outline"
                onClick={() => { const np = Math.max(1, page - 1); setPage(np); updateQueryParams({ page: np }); }}
                disabled={page === 1}
                size="default"
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
                      className="w-11 h-11"
                      size="default"
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
                size="default"
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
