"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getJobOffers } from '@/services/jobOfferService';
import { JobOffer } from '@/types/jobOffer';
import { GenerateRecruitmentTestRequest, deleteRecruitmentTest, generateRecruitmentTest, getRecruitmentTestByJobOffer, updateRecruitmentTest } from '@/services/recruitmentTestService';
import { RecruitmentTest } from '@/types/recruitmentTest';
import { ArrowLeft, Brain, RefreshCw, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TestState {
  loading: boolean;
  error?: string;
  test: RecruitmentTest | null;
  editMode: boolean;
  draft: string; // JSON string
}

export default function EmployerRecruitmentTestPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [tests, setTests] = useState<Record<number, TestState>>({});
  const [genParams, setGenParams] = useState<{ difficulty: 'easy'|'medium'|'hard'; numQuestions: number; language: string }>({ difficulty: 'medium', numQuestions: 10, language: 'pl' });

  useEffect(() => {
    const load = async () => {
      setLoadingOffers(true);
      try {
        const resp = await getJobOffers({ page: 1, limit: 20 });
        setOffers(resp.jobOffers || []);
      } catch (err) {
        console.error('Error loading job offers for tests', err);
      } finally {
        setLoadingOffers(false);
      }
    };
    load();
  }, []);

  const ensureState = (jobOfferId: number) => {
    setTests(prev => prev[jobOfferId] ? prev : ({ ...prev, [jobOfferId]: { loading: false, test: null, editMode: false, draft: '' } }));
  };

  const loadTest = async (jobOfferId: number) => {
    ensureState(jobOfferId);
    setTests(prev => ({ ...prev, [jobOfferId]: { ...(prev[jobOfferId] || { loading: false, editMode: false, draft: '' }), loading: true, error: undefined } }));
    try {
      const test = await getRecruitmentTestByJobOffer(jobOfferId);
      setTests(prev => ({ ...prev, [jobOfferId]: { loading: false, test, editMode: false, draft: test ? JSON.stringify(test.testJson, null, 2) : '' } }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Nie udało się pobrać testu';
      setTests(prev => ({ ...prev, [jobOfferId]: { loading: false, test: null, editMode: false, draft: '', error: msg } }));
    }
  };

  const handleGenerate = async (jobOfferId: number) => {
    ensureState(jobOfferId);
    setTests(prev => ({ ...prev, [jobOfferId]: { ...(prev[jobOfferId] || { editMode: false, draft: '' }), loading: true, error: undefined } }));
    try {
      const payload: GenerateRecruitmentTestRequest = { jobOfferId, difficulty: genParams.difficulty, numQuestions: genParams.numQuestions, language: genParams.language };
      const test = await generateRecruitmentTest(payload);
      setTests(prev => ({ ...prev, [jobOfferId]: { loading: false, test, editMode: false, draft: JSON.stringify(test.testJson, null, 2) } }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Nie udało się wygenerować testu';
      setTests(prev => ({ ...prev, [jobOfferId]: { loading: false, test: null, editMode: false, draft: '', error: msg } }));
    }
  };

  const handleEdit = (jobOfferId: number) => {
    ensureState(jobOfferId);
    setTests(prev => {
      const s = prev[jobOfferId] || { loading: false, test: null, editMode: false, draft: '' };
      return { ...prev, [jobOfferId]: { ...s, editMode: true, draft: s.test ? JSON.stringify(s.test.testJson, null, 2) : s.draft } };
    });
  };

  const handleSave = async (jobOfferId: number) => {
    const s = tests[jobOfferId];
    if (!s || !s.test) return;
    try {
      const parsed = s.draft.trim() ? JSON.parse(s.draft) : null;
      const updated = await updateRecruitmentTest(s.test.id, { testJson: parsed });
      setTests(prev => ({ ...prev, [jobOfferId]: { loading: false, test: updated, editMode: false, draft: JSON.stringify(updated.testJson, null, 2) } }));
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.message || 'Nie udało się zapisać testu (sprawdź poprawność JSON)';
      setTests(prev => ({ ...prev, [jobOfferId]: { ...(prev[jobOfferId] || { loading: false, test: null, editMode: false, draft: '' }), error: msg } }));
    }
  };

  const handleDelete = async (jobOfferId: number) => {
    const s = tests[jobOfferId];
    if (!s || !s.test) return;
    if (!confirm('Usunąć test rekrutacyjny dla tej oferty?')) return;
    try {
      await deleteRecruitmentTest(s.test.id);
      setTests(prev => ({ ...prev, [jobOfferId]: { loading: false, test: null, editMode: false, draft: '' } }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Nie udało się usunąć testu';
      setTests(prev => ({ ...prev, [jobOfferId]: { ...(prev[jobOfferId] || { loading: false, test: null, editMode: false, draft: '' }), error: msg } }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Test rekrutacyjny</h1>
          <Link href="/employer/dashboard">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Powrót
            </Button>
          </Link>
        </div>

        {/* Global generator params */}
        <div className="mb-6 bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-3">Parametry generowania AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Poziom trudności</label>
              <select
                className="w-full p-2 border rounded-md"
                value={genParams.difficulty}
                onChange={(e) => setGenParams(p => ({ ...p, difficulty: e.target.value as any }))}
              >
                <option value="easy">Łatwy</option>
                <option value="medium">Średni</option>
                <option value="hard">Trudny</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Liczba pytań</label>
              <input type="number" min={1} max={50} className="w-full p-2 border rounded-md" value={genParams.numQuestions}
                onChange={(e) => setGenParams(p => ({ ...p, numQuestions: Math.max(1, Math.min(50, parseInt(e.target.value || '10'))) }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Język</label>
              <select className="w-full p-2 border rounded-md" value={genParams.language} onChange={(e) => setGenParams(p => ({ ...p, language: e.target.value }))}>
                <option value="pl">Polski</option>
                <option value="en">Angielski</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Twoje oferty pracy</h2>
            <Button variant="outline" onClick={() => router.push('/employer/job-offers')}>
              Zarządzaj ofertami
            </Button>
          </div>

          {loadingOffers ? (
            <div>Ładowanie ofert...</div>
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
                  <div key={offer.id} className="border rounded-lg p-4">
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
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => loadTest(offer.id)} disabled={state?.loading}>
                          <RefreshCw className="w-4 h-4 mr-1" /> Załaduj
                        </Button>
                        {!state?.test ? (
                          <Button size="sm" onClick={() => handleGenerate(offer.id)} disabled={state?.loading}>
                            <Brain className="w-4 h-4 mr-1" /> Wygeneruj AI
                          </Button>
                        ) : (
                          <>
                            {!state.editMode ? (
                              <Button variant="outline" size="sm" onClick={() => handleEdit(offer.id)}>
                                Edytuj
                              </Button>
                            ) : (
                              <Button size="sm" onClick={() => handleSave(offer.id)}>
                                <Save className="w-4 h-4 mr-1" /> Zapisz
                              </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(offer.id)}>
                              <Trash2 className="w-4 h-4 mr-1" /> Usuń
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Editor / Preview */}
                    {state?.loading ? (
                      <div className="mt-3 text-sm text-muted-foreground">Ładowanie testu...</div>
                    ) : state?.test ? (
                      <div className="mt-3">
                        {state.editMode ? (
                          <textarea
                            className="w-full p-2 border rounded-md font-mono text-sm"
                            rows={12}
                            value={state.draft}
                            onChange={(e) => setTests(prev => ({ ...prev, [offer.id]: { ...(prev[offer.id] as TestState), draft: e.target.value } }))}
                            spellCheck={false}
                          />
                        ) : (
                          <pre className="w-full p-3 bg-gray-50 border rounded-md overflow-auto text-sm whitespace-pre-wrap break-words">
{JSON.stringify(state.test.testJson, null, 2)}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-gray-500">Brak testu — możesz go wygenerować przyciskiem powyżej.</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
