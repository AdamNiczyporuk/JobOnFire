'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileText, Plus, ArrowLeft } from 'lucide-react';
import { JobOffer } from '@/types/jobOffer';
import { CandidateCV } from '@/types/candidate';
import { ApplicationFormData, RecruitmentQuestion, QuestionAnswer } from '@/types/application';
import { candidateService } from '@/services/candidateService';
import { createApplication, checkApplicationStatus } from '@/services/applicationService';
import { getJobOfferQuestions } from '@/services/jobOfferService';
import { useAuth } from '@/context/authContext';

interface JobApplicationFormProps {
  jobOffer: JobOffer;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function JobApplicationForm({ jobOffer, onSuccess, onCancel }: JobApplicationFormProps) {
  const { user, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    message: '',
    cvId: null,
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
          setCvs(cvsResult.value);
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
              <Button variant="outline" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do oferty
              </Button>
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
              <Button variant="outline" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do oferty
              </Button>
              <Button onClick={() => window.location.href = '/candidate/applications'}>
                Zobacz moje aplikacje
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Aplikuj na stanowisko</CardTitle>
            <CardDescription>{jobOffer.name}</CardDescription>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {jobOffer.employerProfile?.companyName}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wybór CV */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Wybierz CV</h3>
            
            {cvs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center py-4">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nie masz jeszcze żadnego CV. Utwórz nowe CV, aby móc aplikować na tę ofertę.
                    </p>
                    <Button type="button" variant="outline" disabled>
                      <Plus className="w-4 h-4 mr-2" />
                      Utwórz nowe CV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {cvs.map((cv) => (
                  <div key={cv.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <input
                      type="radio"
                      value={cv.id.toString()}
                      id={`cv-${cv.id}`}
                      name="cvSelection"
                      checked={formData.cvId === cv.id}
                      onChange={(e) => handleCVSelect(e.target.value)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`cv-${cv.id}`} className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">{cv.name || `CV #${cv.id}`}</p>
                        <p className="text-sm text-muted-foreground">
                          {cv.cvUrl ? 'CV z pliku' : 'CV wygenerowane z profilu'}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
                
                {/* Opcja utworzenia nowego CV */}
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 border-dashed">
                  <input
                    type="radio"
                    value="new"
                    id="cv-new"
                    name="cvSelection"
                    checked={formData.cvId === null}
                    onChange={(e) => handleCVSelect(e.target.value)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="cv-new" className="flex-1 cursor-pointer">
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      <div>
                        <p className="font-medium">Utwórz nowe CV dla tej oferty</p>
                        <p className="text-sm text-muted-foreground">
                          Wygeneruj CV dostosowane specjalnie do tej pozycji
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
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
              disabled={isSubmitting || !formData.cvId}
              className="flex-1"
            >
              {isSubmitting ? 'Wysyłanie...' : 'Wyślij aplikację'}
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
