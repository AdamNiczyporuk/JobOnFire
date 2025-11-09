"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { getJobOffers } from '@/services/jobOfferService';
import { JobOffer } from '@/types/jobOffer';
import { deleteRecruitmentTest, getRecruitmentTestByJobOffer } from '@/services/recruitmentTestService';
import { RecruitmentTest } from '@/types/recruitmentTest';
import { ArrowLeft, Plus, RefreshCw, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

interface TestState {
  loading: boolean;
  error?: string;
  test: RecruitmentTest | null;
}

export default function EmployerRecruitmentTestPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [tests, setTests] = useState<Record<number, TestState>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; jobOfferId?: number; testId?: number }>({ 
    open: false 
  });

  const loadTest = useCallback(async (jobOfferId: number) => {
    setTests(prev => ({ ...prev, [jobOfferId]: { loading: true, test: null, error: undefined } }));
    try {
      const test = await getRecruitmentTestByJobOffer(jobOfferId);
      setTests(prev => ({ ...prev, [jobOfferId]: { loading: false, test } }));
    } catch (err: any) {
      // Silently handle 404 - it means no test exists yet
      if (err?.response?.status === 404) {
        setTests(prev => ({ ...prev, [jobOfferId]: { loading: false, test: null } }));
      } else {
        const msg = err?.response?.data?.message || 'Nie udało się pobrać testu';
        setTests(prev => ({ ...prev, [jobOfferId]: { loading: false, test: null, error: msg } }));
      }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoadingOffers(true);
      try {
        const resp = await getJobOffers({ page: 1, limit: 20 });
        setOffers(resp.jobOffers || []);
        
        // Auto-load test status for all offers
        if (resp.jobOffers && resp.jobOffers.length > 0) {
          for (const offer of resp.jobOffers) {
            loadTest(offer.id);
          }
        }
      } catch (err) {
        console.error('Error loading job offers for tests', err);
      } finally {
        setLoadingOffers(false);
      }
    };
    load();
  }, [loadTest]);

  const handleDelete = async (jobOfferId: number) => {
    const s = tests[jobOfferId];
    if (!s || !s.test) return;
    
    // Open confirmation dialog
    setDeleteDialog({ 
      open: true, 
      jobOfferId, 
      testId: s.test.id 
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.jobOfferId || !deleteDialog.testId) return;
    
    try {
      await deleteRecruitmentTest(deleteDialog.testId);
      setTests(prev => ({ ...prev, [deleteDialog.jobOfferId!]: { loading: false, test: null } }));
      addToast({
        title: 'Sukces',
        description: 'Test został usunięty',
        type: 'success'
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Nie udało się usunąć testu';
      addToast({
        title: 'Błąd',
        description: msg,
        type: 'error'
      });
      setTests(prev => ({ 
        ...prev, 
        [deleteDialog.jobOfferId!]: { 
          ...(prev[deleteDialog.jobOfferId!] || { loading: false, test: null }), 
          error: msg 
        } 
      }));
    }
  };

  const handleCreateTest = (jobOfferId: number) => {
    router.push(`/employer/job-offers/${jobOfferId}/recruitment-test`);
  };

  const handleViewTest = async (jobOfferId: number) => {
    // Load test first if not loaded
    const state = tests[jobOfferId];
    if (!state?.test) {
      await loadTest(jobOfferId);
    }
    router.push(`/employer/job-offers/${jobOfferId}/recruitment-test?mode=view`);
  };

  const handleEditTest = (jobOfferId: number) => {
    router.push(`/employer/job-offers/${jobOfferId}/recruitment-test?mode=edit`);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/employer/dashboard">
          <Button variant="outline" className="inline-flex items-center gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Powrót
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Testy rekrutacyjne</h1>

        <div className="bg-white rounded-lg border p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Twoje oferty pracy</h2>
            <Button variant="outline" onClick={() => router.push('/employer/job-offers')}>
              Zarządzaj ofertami
            </Button>
          </div>

          {loadingOffers ? (
            <div className="text-center py-8">Ładowanie ofert...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground mb-4">Brak ofert pracy</p>
              <Link href="/employer/job-offers"><Button>Utwórz ofertę</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => {
                const state = tests[offer.id];
                return (
                  <div key={offer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold truncate">{offer.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${state?.test ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {state?.test ? 'Test istnieje' : 'Brak testu'}
                          </span>
                        </div>
                        {state?.error && (
                          <p className="text-sm text-red-600 mt-1">{state.error}</p>
                        )}
                        {state?.test && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {state.test.testJson?.title || 'Test rekrutacyjny'} • 
                            {state.test.testJson?.questions?.length || 0} pytań
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!state?.test ? (
                          <Button size="sm" onClick={() => handleCreateTest(offer.id)}>
                            <Plus className="w-4 h-4 mr-1" /> Stwórz test
                          </Button>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewTest(offer.id)}
                              disabled={state?.loading}
                            >
                              {state?.loading ? (
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <FileText className="w-4 h-4 mr-1" />
                              )}
                              Zobacz test
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditTest(offer.id)}>
                              Edytuj test
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleDelete(offer.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Usuń
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Usunąć test rekrutacyjny?"
        description="Czy na pewno chcesz usunąć ten test? Tej operacji nie można cofnąć."
        cancelText="Anuluj"
        actionText="Usuń test"
        onAction={confirmDelete}
      />
    </div>
  );
}
