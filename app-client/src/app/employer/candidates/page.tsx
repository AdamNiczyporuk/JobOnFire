"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { candidateService } from "@/services/candidateService";
import { CandidateListItem, CandidateFilters } from "@/types/candidate";
import { Search, MapPin, User, Briefcase, GraduationCap, Award } from "lucide-react";

export default function EmployerCandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // Filtry
  const [experienceFilter, setExperienceFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [placeFilter, setPlaceFilter] = useState('');
  const [educationFilter, setEducationFilter] = useState('');
  // Applied filters: used when user clicks "Zastosuj filtry"
  const [appliedExperience, setAppliedExperience] = useState('');
  const [appliedSkills, setAppliedSkills] = useState('');
  const [appliedPlace, setAppliedPlace] = useState('');
  const [appliedEducation, setAppliedEducation] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, [page, searchQuery, appliedExperience, appliedSkills, appliedPlace, appliedEducation]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const filters: CandidateFilters = {
        page,
        limit: 12,
      };

      if (searchQuery) {
        // Używamy search filter do wyszukiwania po imieniu/nazwisku
        filters.search = searchQuery;
      }

      // Use applied filters (only applied when user confirms)
      if (appliedExperience) filters.experience = appliedExperience;
      if (appliedSkills) filters.skills = appliedSkills;
      if (appliedPlace) filters.place = appliedPlace;
      if (appliedEducation) filters.education = appliedEducation;

      const response = await candidateService.getCandidatesList(filters);
      
      setCandidates(response.candidates);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.totalCount);
    } catch (err) {
      setError('Nie udało się pobrać listy kandydatów');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const formatSkills = (skills: any): string[] => {
    if (!skills) return [];
    if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        if (Array.isArray(parsed)) {
          return parsed.map(skill => typeof skill === 'object' ? skill.name : skill).slice(0, 3);
        }
      } catch {
        return [];
      }
    }
    if (Array.isArray(skills)) {
      return skills.map(skill => typeof skill === 'object' ? skill.name : skill).slice(0, 3);
    }
    return [];
  };

  const formatExperience = (experience: any): string => {
    if (!experience) return 'Brak informacji';
    if (typeof experience === 'string') {
      try {
        const parsed = JSON.parse(experience);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const latest = parsed[0];
          return latest.position || 'Specjalista';
        }
      } catch {
        return 'Specjalista';
      }
    }
    if (Array.isArray(experience) && experience.length > 0) {
      return experience[0].position || 'Specjalista';
    }
    return 'Specjalista';
  };

  const formatEducation = (education: any): string => {
    if (!education) return '';
    if (typeof education === 'string') {
      try {
        const parsed = JSON.parse(education);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const latest = parsed[0];
          return latest.degree || '';
        }
      } catch {
        return '';
      }
    }
    if (Array.isArray(education) && education.length > 0) {
      return education[0].degree || '';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center overflow-hidden">
        <main className="flex-1 w-full flex flex-col overflow-hidden">
          <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Kandydaci</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                Znajdź idealnych kandydatów do swojego zespołu
              </p>
            </div>
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Ładowanie kandydatów...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center overflow-hidden">
        <main className="flex-1 w-full flex flex-col overflow-hidden">
          <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Kandydaci</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                Znajdź idealnych kandydatów do swojego zespołu
              </p>
            </div>
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchCandidates}>Spróbuj ponownie</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
  <div className="flex flex-col items-center">
      <main className="w-full flex flex-col">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Kandydaci</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto mb-4">
              Znajdź idealnych kandydatów do swojego zespołu
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Znaleziono {totalCount} kandydatów
            </p>
            
            {/* Wyszukiwarka */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Wyszukaj kandydatów..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                >
                  Szukaj
                </Button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar filters (always visible) */}
            <aside className="rounded-lg border bg-white p-4 h-fit"> 
                <h3 className="text-sm font-semibold mb-3">Filtry</h3>

                {/* Lokalizacja */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Lokalizacja</p>
                  <input
                    type="text"
                    value={placeFilter}
                    onChange={(e) => { setPlaceFilter(e.target.value); }}
                    placeholder="np. Warszawa, Kraków"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                {/* Umiejętności */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Umiejętności</p>
                  <input
                    type="text"
                    value={skillsFilter}
                    onChange={(e) => { setSkillsFilter(e.target.value); }}
                    placeholder="np. React, JavaScript"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                {/* Doświadczenie */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Doświadczenie</p>
                  <input
                    type="text"
                    value={experienceFilter}
                    onChange={(e) => { setExperienceFilter(e.target.value); }}
                    placeholder="np. Frontend Developer"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                {/* Wykształcenie */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Wykształcenie</p>
                  <input
                    type="text"
                    value={educationFilter}
                    onChange={(e) => { setEducationFilter(e.target.value); }}
                    placeholder="np. Informatyka, Magister"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => {
                      // Apply current input filters
                      setAppliedExperience(experienceFilter);
                      setAppliedSkills(skillsFilter);
                      setAppliedPlace(placeFilter);
                      setAppliedEducation(educationFilter);
                      setPage(1);
                    }}
                    className="flex-1"
                  >
                    Zastosuj
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      // Clear both inputs and applied filters
                      setExperienceFilter('');
                      setSkillsFilter('');
                      setPlaceFilter('');
                      setEducationFilter('');

                      setAppliedExperience('');
                      setAppliedSkills('');
                      setAppliedPlace('');
                      setAppliedEducation('');
                      setPage(1);
                    }}
                    className="w-36"
                  >
                    Wyczyść
                  </Button>
                </div>
              </aside>

              {/* List content */}
              <div className="space-y-4 pr-2">
                {candidates.length === 0 ? (
                  <div className="text-center py-12 md:col-span-2">
                    <p className="text-muted-foreground text-lg mb-4">Brak kandydatów spełniających kryteria</p>
                    <p className="text-sm text-muted-foreground">Spróbuj zmienić kryteria wyszukiwania lub poszerzyć zakres filtrów</p>
                  </div>
                ) : (
                  <>
                    {candidates.map((candidate) => (
                      <Link
                        key={candidate.id}
                        href={`/employer/candidates/${candidate.id}`}
                        className="block rounded-lg border bg-white p-4 shadow-sm transition-colors duration-150 hover:bg-accent/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer min-w-[400px] w-full"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-semibold mb-1">
                                  {candidate.name && candidate.lastName
                                    ? `${candidate.name} ${candidate.lastName}`
                                    : candidate.name || candidate.lastName || 'Kandydat'}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4" />
                                    <span>{formatExperience(candidate.experience)}</span>
                                  </div>
                                  {candidate.place && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>{candidate.place}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {candidate.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {candidate.description}
                              </p>
                            )}

                            <div className="space-y-2">
                              {/* Umiejętności */}
                              {formatSkills(candidate.skills).length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Award className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  {formatSkills(candidate.skills).map((skill, index) => (
                                    <span
                                      key={index}
                                      className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {candidate.skills && formatSkills(candidate.skills).length < 3 && (
                                    <span className="text-xs text-muted-foreground">
                                      i więcej...
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Wykształcenie */}
                              {formatEducation(candidate.education) && (
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {formatEducation(candidate.education)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>
          

          {/* Paginacja */}
          {totalPages > 1 && candidates.length > 0 && (
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
                  const pageNum = page <= 3 ? i + 1 : 
                                 page > totalPages - 2 ? totalPages - 4 + i :
                                 page - 2 + i;
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
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
    </div>
  );
}
