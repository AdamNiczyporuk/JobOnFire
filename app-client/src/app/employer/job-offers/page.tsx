'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import JobOfferForm from '@/components/JobOfferForm';
import JobOfferList from '@/components/JobOfferList';
import { 
  getJobOffers, 
  createJobOffer, 
  updateJobOffer, 
  deleteJobOffer, 
  toggleJobOfferStatus 
} from '@/services/jobOfferService';
import { JobOffer, JobOfferCreateRequest, JobOfferUpdateRequest } from '@/types/jobOffer';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function JobOffersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [selectedJobOffer, setSelectedJobOffer] = useState<JobOffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Ładowanie listy ofert
  const loadJobOffers = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await getJobOffers({ page, limit: pagination.limit });
      setJobOffers(response.jobOffers);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading job offers:', error);
      // Tutaj można dodać toast notification
    } finally {
      setIsLoading(false);
    }
  };

  // Inicjalne ładowanie
  useEffect(() => {
    loadJobOffers();
  }, []);

  // Tworzenie nowej oferty
  const handleCreate = async (data: JobOfferCreateRequest) => {
    setIsSubmitting(true);
    try {
      await createJobOffer(data);
      await loadJobOffers(); // Odświeżenie listy
      setViewMode('list');
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
      await updateJobOffer(selectedJobOffer.id, data);
      await loadJobOffers(); // Odświeżenie listy
      setViewMode('list');
      setSelectedJobOffer(null);
      // Tutaj można dodać toast notification sukcesu
    } catch (error) {
      console.error('Error updating job offer:', error);
      // Tutaj można dodać toast notification błędu
    } finally {
      setIsSubmitting(false);
    }
  };

  // Usuwanie oferty
  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć tę ofertę pracy?')) {
      return;
    }

    try {
      await deleteJobOffer(id);
      await loadJobOffers(); // Odświeżenie listy
      // Tutaj można dodać toast notification sukcesu
    } catch (error) {
      console.error('Error deleting job offer:', error);
      // Tutaj można dodać toast notification błędu
    }
  };

  // Przełączanie statusu aktywności
  const handleToggleStatus = async (id: number) => {
    try {
      await toggleJobOfferStatus(id);
      await loadJobOffers(); // Odświeżenie listy
      // Tutaj można dodać toast notification sukcesu
    } catch (error) {
      console.error('Error toggling job offer status:', error);
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

  // Przejście do widoku szczegółów
  const handleViewClick = (jobOffer: JobOffer) => {
    setSelectedJobOffer(jobOffer);
    setViewMode('view');
  };

  // Sprawdzenie czy oferta wygasła
  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  // Renderowanie widoku szczegółów oferty
  const renderJobOfferDetails = () => {
    if (!selectedJobOffer) return null;

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">{selectedJobOffer.name}</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => handleEditClick(selectedJobOffer)}
              className="transition-all duration-200 hover:scale-105"
            >
              Edytuj
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant="outline"
              className="transition-all duration-200 hover:scale-105"
            >
              Powrót do listy
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status i podstawowe info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                !selectedJobOffer.isActive 
                  ? 'bg-gray-100 text-gray-700'
                  : isExpired(selectedJobOffer.expireDate)
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {!selectedJobOffer.isActive 
                  ? 'Nieaktywna'
                  : isExpired(selectedJobOffer.expireDate)
                  ? 'Wygasła'
                  : 'Aktywna'
                }
              </span>
            </div>
            <div>
              <span className="font-medium">Wygasa:</span>
              <span className={`ml-2 ${isExpired(selectedJobOffer.expireDate) ? 'text-red-600 font-medium' : ''}`}>
                {new Date(selectedJobOffer.expireDate).toLocaleDateString('pl-PL')}
              </span>
            </div>
            <div>
              <span className="font-medium">Typ umowy:</span> {selectedJobOffer.contractType || 'Nie określono'}
            </div>
            <div>
              <span className="font-medium">Wynagrodzenie:</span> {selectedJobOffer.salary || 'Nie określono'}
            </div>
          </div>

          {/* Komunikat o wygaśnięciu */}
          {isExpired(selectedJobOffer.expireDate) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Oferta wygasła
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Ta oferta pracy wygasła {new Date(selectedJobOffer.expireDate).toLocaleDateString('pl-PL')}. 
                      Kandydaci nie mogą już aplikować na tę pozycję. Możesz zaktualizować datę wygaśnięcia lub utworzyć nową ofertę.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Opis */}
          {selectedJobOffer.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Opis</h3>
              <p className="text-gray-700">{selectedJobOffer.description}</p>
            </div>
          )}

          {/* Obowiązki */}
          {selectedJobOffer.responsibilities && selectedJobOffer.responsibilities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Obowiązki</h3>
              <ul className="list-disc list-inside space-y-1">
                {selectedJobOffer.responsibilities.map((resp, index) => (
                  <li key={index} className="text-gray-700">{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Wymagania */}
          {selectedJobOffer.requirements && selectedJobOffer.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Wymagania</h3>
              <ul className="list-disc list-inside space-y-1">
                {selectedJobOffer.requirements.map((req, index) => (
                  <li key={index} className="text-gray-700">{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Co oferujemy */}
          {selectedJobOffer.whatWeOffer && selectedJobOffer.whatWeOffer.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Co oferujemy</h3>
              <ul className="list-disc list-inside space-y-1">
                {selectedJobOffer.whatWeOffer.map((offer, index) => (
                  <li key={index} className="text-gray-700">{offer}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tagi */}
          {selectedJobOffer.tags && selectedJobOffer.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Tagi</h3>
              <div className="flex flex-wrap gap-2">
                {selectedJobOffer.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
              <div className="text-gray-600">Wszystkie oferty</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
              <div className="text-2xl font-bold text-green-600">
                {jobOffers.filter(jo => jo.isActive).length}
              </div>
              <div className="text-gray-600">Aktywne oferty</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
              <div className="text-2xl font-bold text-purple-600">
                {jobOffers.reduce((sum, jo) => sum + (jo._count?.applications || 0), 0)}
              </div>
              <div className="text-gray-600">Aplikacje</div>
            </div>
          </div>

          {/* Lista ofert */}
          <JobOfferList
            jobOffers={jobOffers}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onView={handleViewClick}
            isLoading={isLoading}
          />

          {/* Paginacja */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                onClick={() => loadJobOffers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                variant="outline"
                className="transition-all duration-200 hover:scale-105"
              >
                Poprzednia
              </Button>
              <span className="flex items-center px-4">
                Strona {pagination.page} z {pagination.totalPages}
              </span>
              <Button
                onClick={() => loadJobOffers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                variant="outline"
                className="transition-all duration-200 hover:scale-105"
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
      {viewMode === 'view' && renderJobOfferDetails()}
    </div>
  );
}
