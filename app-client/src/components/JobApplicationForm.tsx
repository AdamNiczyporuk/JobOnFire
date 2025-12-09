'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileText, Plus, ArrowLeft, Sparkles } from 'lucide-react';
import { JobOffer } from '@/types/jobOffer';
import { CandidateCV } from '@/types/candidate';
import { ApplicationFormData, RecruitmentQuestion, QuestionAnswer } from '@/types/application';
import { candidateService } from '@/services/candidateService';
import { createApplication, checkApplicationStatus, deleteApplication } from '@/services/applicationService';
import { getJobOfferQuestions } from '@/services/jobOfferService';
import { useAuth } from '@/context/authContext';
import { useToast } from '@/components/ui/toast';

interface JobApplicationFormProps {
  jobOffer: JobOffer;
  onSuccess: () => void;
  onCancel: () => void;
  prefilledCvId?: number | null;
}

export default function JobApplicationForm({ jobOffer, onSuccess, onCancel, prefilledCvId = null }: JobApplicationFormProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const prefillAppliedRef = useRef(false);
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    message: '',
    cvId: prefilledCvId,
    answers: []
  });
  
  const [cvs, setCvs] = useState<CandidateCV[]>([]);
  const [questions, setQuestions] = useState<RecruitmentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);

  // Ładowanie CV i pytań rekrutacyjnych
  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [jobOffer.id, authLoading]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ładujemy pytania zawsze
      const promises: Promise<any>[] = [getJobOfferQuestions(jobOffer.id)];
      
      // Dla zalogowanych kandydatów ładujemy CV i sprawdzamy status aplikacji
      if (user && user.role === 'CANDIDATE') {
        promises.push(candidateService.getCVs());
        promises.push(checkApplicationStatus(jobOffer.id));
      }
      
      const results = await Promise.allSettled(promises);
      
      // Obsługa rezultatu pytań rekrutacyjnych
      const questionsResult = results[0];
      if (questionsResult.status === 'fulfilled') {
        const questionsData = questionsResult.value || [];
        setQuestions(questionsData);
        
        // Inicjalizacja odpowiedzi na pytania
        if (questionsData.length > 0) {
          setFormData(prev => ({
            ...prev,
            answers: questionsData.map((q: RecruitmentQuestion) => ({
              recruitmentQuestionId: q.id,
              answer: ''
            }))
          }));
        }
      } else {
        console.error('Błąd podczas ładowania pytań rekrutacyjnych:', questionsResult.reason);
        setQuestions([]);
      }
      
      // Obsługa rezultatu CV i statusu aplikacji (jeśli użytkownik jest kandydatem)
      if (user && user.role === 'CANDIDATE' && results.length > 1) {
        // CV
        const cvsResult = results[1];
        if (cvsResult.status === 'fulfilled') {
          const cvList = cvsResult.value;
          setCvs(cvList);

          if (!prefillAppliedRef.current && prefilledCvId && cvList.some((cv) => cv.id === prefilledCvId)) {
            setFormData((prev) => ({ ...prev, cvId: prefilledCvId }));
            prefillAppliedRef.current = true;
          }
        } else {
          console.error('Błąd podczas ładowania CV:', cvsResult.reason);
          setCvs([]);
          setError('Nie udało się załadować listy CV. Sprawdź czy masz utworzony profil kandydata.');
        }
        
        // Status aplikacji
        if (results.length > 2) {
          const statusResult = results[2];
          if (statusResult.status === 'fulfilled') {
            setHasApplied(statusResult.value.hasApplied);
            setApplicationId(statusResult.value.applicationId);
          } else {
            console.error('Błąd podczas sprawdzania statusu aplikacji:', statusResult.reason);
          }
        }
      } else {
        setCvs([]);
        setHasApplied(false);
        setApplicationId(null);
      }
      
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVSelect = (cvId: string) => {
    setFormData(prev => ({
      ...prev,
      cvId: cvId === 'new' ? null : parseInt(cvId)
    }));
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map(a => 
        a.recruitmentQuestionId === questionId 
          ? { ...a, answer }
          : a
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Jeśli wybrana jest opcja "utwórz nowe CV", redirect do generatora CV
    if (formData.cvId === null && cvs.length > 0) {
      router.push(`/tools/cv-generator?jobOfferId=${jobOffer.id}`);
      return;
    }
    
    if (!formData.cvId) {
      setError('Proszę wybrać CV lub utworzyć nowe');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createApplication({
        jobOfferId: jobOffer.id,
        cvId: formData.cvId,
        message: formData.message || undefined,
        answers: formData.answers.filter(a => a.answer && a.answer.trim() !== '')
      });

      onSuccess();
    } catch (err) {
      console.error('Błąd podczas wysyłania aplikacji:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas wysyłania aplikacji');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stan ładowania uwierzytelnienia
  if (authLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Sprawdzanie uprawnień...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sprawdzenie czy użytkownik jest zalogowany jako kandydat
  if (!user || user.role !== 'CANDIDATE') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Aplikacja na stanowisko</CardTitle>
          <CardDescription>Aby aplikować na tę pozycję, musisz być zalogowany jako kandydat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="mb-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Wymagane logowanie</h3>
              <p className="text-muted-foreground mb-4">
                {!user 
                  ? "Aby aplikować na oferty pracy, musisz założyć konto kandydata i być zalogowany."
                  : "Aby aplikować na oferty pracy, musisz mieć konto kandydata. Twoje konto jest skonfigurowane jako pracodawca."
                }
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              {!user ? (
                <Button onClick={() => window.location.href = '/candidate/login'}>
                  Zaloguj się jako kandydat
                </Button>
              ) : (
                <Button onClick={() => window.location.href = '/candidate/register'}>
                  Załóż konto kandydata
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Ładowanie formularza aplikacji...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sprawdzenie czy użytkownik już aplikował na tę ofertę
  if (hasApplied) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Aplikacja wysłana</CardTitle>
          <CardDescription>{jobOffer.name}</CardDescription>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {jobOffer.employerProfile?.companyName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Już aplikowałeś na tę pozycję</h3>
              <p className="text-muted-foreground mb-4">
                Twoja aplikacja została już wysłana na tę ofertę pracy. Nie możesz aplikować ponownie.
              </p>
              {applicationId && (
                <p className="text-sm text-muted-foreground">
                  Numer aplikacji: #{applicationId}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.href = '/candidate/applications'}>
                Zobacz moje aplikacje
              </Button>
              {applicationId && (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    const confirmed = window.confirm('Czy na pewno chcesz usunąć tę aplikację?');
                    if (!confirmed) return;
                    try {
                      await deleteApplication(applicationId);
                      addToast({
                        title: "Sukces",
                        description: "Aplikacja została usunięta.",
                        type: "success",
                        duration: 5000
                      });
                      setHasApplied(false);
                      setApplicationId(null);
                      await loadData();
                    } catch (e: any) {
                      const msg = e?.response?.data?.message || 'Nie udało się usunąć aplikacji';
                      addToast({
                        title: "Błąd",
                        description: msg,
                        type: "error",
                        duration: 5000
                      });
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Usuń aplikację
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Aplikuj na stanowisko</CardTitle>
        <CardDescription>{jobOffer.name}</CardDescription>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          {jobOffer.employerProfile?.companyName}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wybór CV */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Wybierz CV</h3>
            
            {/* Sekcja: Zapisane CV */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Zapisane CV</h4>
              
              {cvs.length === 0 ? (
                <Card className="border-dashed bg-muted/30">
                  <CardContent className="pt-4 pb-4">
                    <div className="text-center py-2">
                      <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nie masz żadnego zapisanego CV. Dodaj lub wygeneruj CV.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  <select
                    value={formData.cvId?.toString() || ''}
                    onChange={(e) => handleCVSelect(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">-- Wybierz CV z listy --</option>
                    {cvs.map((cv) => (
                      <option key={cv.id} value={cv.id.toString()}>
                        {cv.name || `CV #${cv.id}`} - {cv.cvUrl ? 'CV z pliku' : 'CV wygenerowane z profilu'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Wybierz jedno z wcześniej zapisanych CV
                  </p>
                </div>
              )}
            </div>

            {/* Sekcja: Wygeneruj CV */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Wygeneruj CV</h4>
              
              <div 
                className={`flex items-center space-x-3 p-4 border-2 border-dashed rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group ${
                  formData.cvId === null ? 'bg-primary/5 border-primary' : ''
                }`}
                onClick={() => handleCVSelect('new')}
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Utwórz nowe CV dla tej oferty</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Wygeneruj CV z AI dostosowane specjalnie do tej pozycji
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Wiadomość do pracodawcy */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-base font-semibold block">
              Wiadomość do pracodawcy (opcjonalne)
            </label>
            <textarea
              id="message"
              placeholder="Napisz kilka słów o sobie i dlaczego jesteś idealnym kandydatem na tę pozycję..."
              value={formData.message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Możesz dodać personalizowaną wiadomość, aby wyróżnić swoją aplikację.
            </p>
          </div>

          {/* Pytania rekrutacyjne */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Pytania rekrutacyjne</h3>
              <p className="text-sm text-muted-foreground">
                Pracodawca przygotował dodatkowe pytania dotyczące tej pozycji.
              </p>
              
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <label htmlFor={`question-${question.id}`} className="font-medium block">
                    {index + 1}. {question.question}
                  </label>
                  <textarea
                    id={`question-${question.id}`}
                    placeholder="Twoja odpowiedź..."
                    value={formData.answers.find(a => a.recruitmentQuestionId === question.id)?.answer || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswerChange(question.id, e.target.value)}
                    className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Komunikaty błędów */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Przyciski */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Ładowanie...' : formData.cvId === null && cvs.length > 0 ? 'Stwórz CV' : 'Wyślij aplikację'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
