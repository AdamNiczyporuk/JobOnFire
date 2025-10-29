'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import JobOfferForm from '@/components/JobOfferForm';
import JobOfferList from '@/components/JobOfferList';
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
      setDeleteConfirm({ show: false, jobId: null });
      // Tutaj można dodać toast notification sukcesu
    } catch (error) {
      console.error('Error deleting job offer:', error);
      // Tutaj można dodać toast notification błędu
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, jobId: null });
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
    <div className="min-h-screen bg-gray-50">
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
              <div className="text-2xl font-bold text-red-600">{statsLoading ? '-' : (stats?.totalApplications ?? jobOffers.reduce((sum, jo) => sum + (jo._count?.applications || 0), 0))}</div>
              <div className="text-gray-600">Aplikacje</div>
            </div>
          </div>

          {/* Lista ofert */}
          <JobOfferList
            jobOffers={jobOffers}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onView={(jo) => { /* backward compat - link below */ }}
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
  {/* Widok szczegółów przeniesiony do /employer/job-offers/[id] */}

      {/* Modal potwierdzenia usunięcia */}
      {deleteConfirm.show && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-600">
                  Usuń ofertę pracy
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Czy na pewno chcesz usunąć tę ofertę pracy? Ta akcja jest nieodwracalna i wszystkie dane związane z ofertą zostaną trwale utracone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={cancelDelete}
                variant="outline"
                className="transition-all duration-200 hover:scale-105"
              >
                Anuluj
              </Button>
              <Button
                onClick={confirmDelete}
                variant="destructive"
                className="transition-all duration-200 hover:scale-105"
              >
                Usuń ofertę
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
