'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog } from '@/components/ui/alert-dialog';
import JobOfferForm from '@/components/JobOfferForm';
import JobOfferList from '@/components/JobOfferList';
import { Search, Briefcase } from 'lucide-react';
import { 
  getJobOffers, 
  createJobOffer, 
  updateJobOffer, 
  deleteJobOffer
} from '@/services/jobOfferService';
import { JobOffer, JobOfferCreateRequest, JobOfferUpdateRequest } from '@/types/jobOffer';
import { getEmployerStats } from '@/services/employerService';
import type { EmployerStats } from '@/types/employer';

type ViewMode = 'list' | 'create' | 'edit';

export default function JobOffersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [selectedJobOffer, setSelectedJobOffer] = useState<JobOffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; jobId: number | null }>({ show: false, jobId: null });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Ładowanie listy ofert
  const loadJobOffers = async (page = 1, search?: string) => {
    setIsLoading(true);
    try {
      const searchTerm = search !== undefined ? search : searchQuery;
      const response = await getJobOffers({ 
        page, 
        limit: pagination.limit,
        search: searchTerm || undefined
      });
      setJobOffers(response.jobOffers);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Error loading job offers:', error);
      // Tutaj można dodać toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
    // Załaduj od razu z pierwszej strony z nowym wyszukiwaniem
    loadJobOffers(1, searchInput);
  };

  // Inicjalne ładowanie
  useEffect(() => {
    loadJobOffers();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const s = await getEmployerStats();
      setStats(s);
    } catch (e) {
      console.error('Error loading employer stats:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  // Tworzenie nowej oferty
  const handleCreate = async (data: JobOfferCreateRequest) => {
    setIsSubmitting(true);
    try {
      const created = await createJobOffer(data);
      await loadJobOffers(); // Odświeżenie listy
      setViewMode('list');
      return created;
      // Tutaj można dodać toast notification sukcesu
    } catch (error) {
      console.error('Error creating job offer:', error);
      // Tutaj można dodać toast notification błędu
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edycja oferty
  const handleEdit = async (data: JobOfferUpdateRequest) => {
    if (!selectedJobOffer) return;
    
    setIsSubmitting(true);
    try {
      const updated = await updateJobOffer(selectedJobOffer.id, data);
      await loadJobOffers(); // Odświeżenie listy
      setViewMode('list');
      setSelectedJobOffer(null);
      return updated;
      // Tutaj można dodać toast notification sukcesu
    } catch (error) {
      console.error('Error updating job offer:', error);
      // Tutaj można dodać toast notification błędu
    } finally {
      setIsSubmitting(false);
    }
  };

  // Usuwanie oferty
  const handleDelete = (id: number) => {
    setDeleteConfirm({ show: true, jobId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.jobId) return;

    try {
      await deleteJobOffer(deleteConfirm.jobId);
      await loadJobOffers(); // Odświeżenie listy
      await loadStats(); // Odśwież statystyki
      // Tutaj można dodać toast notification sukcesu
    } catch (error) {
      console.error('Error deleting job offer:', error);
      // Tutaj można dodać toast notification błędu
    }
  };



  // Anulowanie formularza
  const handleCancel = () => {
    setViewMode('list');
    setSelectedJobOffer(null);
  };

  // Przejście do edycji
  const handleEditClick = (jobOffer: JobOffer) => {
    setSelectedJobOffer(jobOffer);
    setViewMode('edit');
  };

  // Przejście do widoku szczegółów przeniesione do osobnej strony /employer/job-offers/[id]

  // Sprawdzenie czy oferta wygasła
  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  // Widok szczegółów jest teraz na trasie /employer/job-offers/[id]

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Nagłówek */}
      {viewMode === 'list' && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Zarządzanie ofertami pracy</h1>
            <p className="text-gray-600 mt-2">
              Zarządzaj swoimi ofertami pracy - twórz, edytuj i monitoruj aplikacje
            </p>
          </div>
          <Button
            onClick={() => setViewMode('create')}
            className="transition-all duration-200 hover:scale-105"
          >
            Utwórz nową ofertę
          </Button>
        </div>
      )}

      {/* Zawartość */}
      {viewMode === 'list' && (
        <div>
          {/* Statystyki */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
              <div className="text-2xl font-bold text-red-600">{statsLoading ? '-' : (stats?.totalJobOffers ?? pagination.total)}</div>
              <div className="text-gray-600">Wszystkie oferty</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
              <div className="text-2xl font-bold text-red-600">{statsLoading ? '-' : (stats?.activeJobOffers ?? jobOffers.filter(jo => jo.isActive).length)}</div>
              <div className="text-gray-600">Aktywne oferty</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
              <div className="text-2xl font-bold text-red-600">{statsLoading ? '-' : (stats?.totalApplications ?? 0)}</div>
              <div className="text-gray-600">Aplikacje</div>
            </div>
          </div>

          {/* Pasek wyszukiwania - pokaż zawsze gdy są oferty lub jest aktywne wyszukiwanie */}
          {(jobOffers.length > 0 || searchQuery || (stats?.totalJobOffers ?? 0) > 0) && (
            <div className="mb-6 bg-white rounded-lg shadow p-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Wyszukaj ofertę po nazwie..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" className="transition-all duration-200 hover:scale-105">
                  Szukaj
                </Button>
                {searchQuery && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setSearchInput('');
                      setSearchQuery('');
                      setPagination(prev => ({ ...prev, page: 1 }));
                      loadJobOffers(1, '');
                    }}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Wyczyść
                  </Button>
                )}
              </form>
            </div>
          )}

          {/* Lista ofert lub pusty widok */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Ładowanie ofert...</div>
            </div>
          ) : jobOffers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-red-50 rounded-full p-6">
                  <Briefcase className="w-16 h-16 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Brak ofert pracy
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Nie znaleziono ofert pasujących do wyszukiwania. Spróbuj innego zapytania.'
                  : 'Kliknij "Utwórz nową ofertę", aby dodać pierwszą ofertę pracy.'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setViewMode('create')}
                  size="lg"
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Utwórz nową ofertę
                </Button>
              )}
            </div>
          ) : (
            <JobOfferList
              jobOffers={jobOffers}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onView={(jo) => { /* backward compat - link below */ }}
              isLoading={false}
            />
          )}

          {/* Paginacja */}
          {pagination.totalPages > 1 && jobOffers.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  const newPage = Math.max(1, pagination.page - 1);
                  setPagination(prev => ({ ...prev, page: newPage }));
                  loadJobOffers(newPage);
                }}
                disabled={pagination.page === 1}
              >
                Poprzednia
              </Button>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = pagination.page <= 3 ? i + 1 : 
                                 pagination.page > pagination.totalPages - 2 ? pagination.totalPages - 4 + i :
                                 pagination.page - 2 + i;
                  
                  if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      onClick={() => {
                        setPagination(prev => ({ ...prev, page: pageNum }));
                        loadJobOffers(pageNum);
                      }}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  const newPage = Math.min(pagination.totalPages, pagination.page + 1);
                  setPagination(prev => ({ ...prev, page: newPage }));
                  loadJobOffers(newPage);
                }}
                disabled={pagination.page === pagination.totalPages}
              >
                Następna
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Formularz tworzenia */}
      {viewMode === 'create' && (
        <JobOfferForm
          onSubmit={handleCreate}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      )}

      {/* Formularz edycji */}
      {viewMode === 'edit' && selectedJobOffer && (
        <JobOfferForm
          initialData={selectedJobOffer}
          onSubmit={handleEdit}
          onCancel={handleCancel}
          isEditing={true}
          isLoading={isSubmitting}
        />
      )}

      {/* Widok szczegółów */}
  {/* Widok szczegółów przeniesiony do /employer/job-offers/[id] */}

      {/* Modal potwierdzenia usunięcia */}
      <AlertDialog
        open={deleteConfirm.show}
        onOpenChange={(open) => setDeleteConfirm({ show: open, jobId: null })}
        title="Usuń ofertę pracy"
        description="Czy na pewno chcesz usunąć tę ofertę pracy? Ta akcja jest nieodwracalna i wszystkie dane związane z ofertą zostaną trwale utracone."
        cancelText="Anuluj"
        actionText="Usuń ofertę"
        onAction={confirmDelete}
        variant="destructive"
      />
      </div>
    </div>
  );
}
