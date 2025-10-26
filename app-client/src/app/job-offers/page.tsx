"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SmartHeader } from "@/components/SmartHeader";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getPublicJobOffers } from "@/services/jobOfferService";
import { JobOffer } from "@/types/jobOffer";
import { Search } from "lucide-react";

export default function JobOffersPage() {
  const searchParams = useSearchParams();
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Initialize search from URL parameter immediately
  const searchFromUrl = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  
  const [selectedWorkingModes, setSelectedWorkingModes] = useState<string[]>([]);
  const [selectedContractTypes, setSelectedContractTypes] = useState<string[]>([]);
  const [selectedJobLevels, setSelectedJobLevels] = useState<string[]>([]);
  const [selectedWorkloads, setSelectedWorkloads] = useState<string[]>([]);
  const [techInput, setTechInput] = useState(''); // comma-separated technologies

  // Applied filters: used only after clicking "Zastosuj"
  const [appliedWorkingModes, setAppliedWorkingModes] = useState<string[]>([]);
  const [appliedContractTypes, setAppliedContractTypes] = useState<string[]>([]);
  const [appliedJobLevels, setAppliedJobLevels] = useState<string[]>([]);
  const [appliedWorkloads, setAppliedWorkloads] = useState<string[]>([]);
  const [appliedTechInput, setAppliedTechInput] = useState('');

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

      // job level
      if (appliedJobLevels.length > 0) {
        const levels = (offer.jobLevel || []).map(l => l.toLowerCase());
        const matchLevel = appliedJobLevels.some(sel => levels.some(l => l.includes(sel.toLowerCase())));
        if (!matchLevel) return false;
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
  }, [jobOffers, appliedWorkingModes, appliedContractTypes, appliedJobLevels, appliedWorkloads, appliedTechInput]);

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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
            {/* Sidebar filters - always visible */}
            <aside className="rounded-lg border bg-white p-6 h-fit shadow-sm"> 
              <h3 className="text-base font-semibold mb-4">Filtry</h3>

              {/* Tryb pracy */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2.5">Tryb pracy</p>
                {['Zdalna', 'Hybrydowa', 'Stacjonarna'].map((mode) => (
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
                {['Umowa o pracę', 'B2B', 'Umowa zlecenie', 'Umowa o dzieło'].map((ct) => (
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

              {/* Poziom stanowiska */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2.5">Poziom stanowiska</p>
                {['Junior', 'Mid', 'Senior'].map((lvl) => (
                  <label key={lvl} className="flex items-center gap-2.5 text-sm mb-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedJobLevels.includes(lvl)}
                      onChange={() => toggleSelection(selectedJobLevels, lvl, setSelectedJobLevels)}
                      className="w-4 h-4 cursor-pointer accent-red-600 border-gray-300 rounded transition-all"
                    />
                    <span className="group-hover:text-red-600 transition-colors duration-200">{lvl}</span>
                  </label>
                ))}
              </div>

              {/* Wymiar pracy */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2.5">Wymiar pracy</p>
                {['Pełny etat', 'Część etatu'].map((wl) => (
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
                    setAppliedJobLevels(selectedJobLevels);
                    setAppliedWorkloads(selectedWorkloads);
                    setAppliedTechInput(techInput);
                    setPage(1);
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
                    setSelectedJobLevels([]);
                    setSelectedWorkloads([]);
                    setTechInput('');

                    setAppliedWorkingModes([]);
                    setAppliedContractTypes([]);
                    setAppliedJobLevels([]);
                    setAppliedWorkloads([]);
                    setAppliedTechInput('');
                    setPage(1);
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
                  <Link
                    key={jobOffer.id}
                    href={`/job-offers/${jobOffer.id}`}
                    className="block rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:bg-accent/30 hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                            {jobOffer.name}
                          </h3>
                          {jobOffer.employerProfile?.companyName && jobOffer.employerProfile?.id && (
                            <p className="text-muted-foreground mb-1 font-medium text-base">
                              <Link href={`/companies/${jobOffer.employerProfile.id}`} className="hover:text-primary underline-offset-2 hover:underline">
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
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Paginacja */}
          {totalPages > 1 && filteredJobOffers.length > 0 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
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
                      onClick={() => setPage(pageNum)}
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
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                size="default"
              >
                Następna
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 px-4 md:px-8 lg:px-12 py-10 lg:flex-row lg:gap-12">
          <div className="flex flex-col gap-4 lg:w-1/3">
            <Link href="/" className="flex gap-2 items-center text-xl font-bold group cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
              >
                <path d="M20 7h-4a2 2 0 0 0-2 2v.5"></path>
                <path d="M14 2h.01"></path>
                <path d="M14 2h.01"></path>
                <path d="M20 2h.01"></path>
                <path d="M20 2h.01"></path>
                <path d="M20 14v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"></path>
                <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path>
                <path d="M2 14h20"></path>
              </svg>
              <span className="transition-colors duration-300 group-hover:text-primary">
                JobOnFire
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Platforma łącząca frontend developerów z najlepszymi ofertami
              pracy w branży IT.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-125"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-125"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-125"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.60-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.944 2.013 9.284 2 12 2h.315zm-.315 9a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 110 2 1 1 0 010-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          <nav className="flex flex-col gap-2 lg:w-2/3 lg:flex-row lg:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold">Firma</p>
              <Link
                href="/about"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                O nas
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Kontakt
              </Link>
              <Link
                href="/blog"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Blog
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold">Zasoby</p>
              <Link
                href="/faq"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                FAQ
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Regulamin
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Polityka prywatności
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold">Przydatne linki</p>
              <Link
                href="/job-offers"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Oferty pracy
              </Link>
              <Link
                href="/employer"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Dla firm
              </Link>
              <Link
                href="/categories"
                className="text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
              >
                Kategorie
              </Link>
            </div>
          </nav>
        </div>
      </footer>
    </div>
  );
}
