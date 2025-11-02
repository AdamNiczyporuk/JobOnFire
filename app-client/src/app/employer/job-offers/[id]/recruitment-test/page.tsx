"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2, Brain, Save, Loader2, Edit } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getJobOffer } from '@/services/jobOfferService';
import { 
  createRecruitmentTest, 
  generateRecruitmentTest, 
  getRecruitmentTestByJobOffer,
  updateRecruitmentTest 
} from '@/services/recruitmentTestService';
import { JobOffer } from '@/types/jobOffer';
import { RecruitmentTest } from '@/types/recruitmentTest';
import { useToast } from '@/components/ui/toast';

interface Question {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'multiple';
  options?: string[];
  correctAnswer?: string | string[];
}

interface TestFormData {
  title: string;
  questions: Question[];
}

export default function CreateRecruitmentTestPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const jobOfferId = parseInt(params.id as string);
  const viewMode = searchParams.get('mode') === 'view';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [existingTest, setExistingTest] = useState<RecruitmentTest | null>(null);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  
  // AI generation params
  const [aiParams, setAiParams] = useState({
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    numQuestions: 10 as number | '',
    language: 'pl'
  });

  // Form data
  const [formData, setFormData] = useState<TestFormData>({
    title: '',
    questions: []
  });

  useEffect(() => {
    loadData();
  }, [jobOfferId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load job offer
      const offer = await getJobOffer(jobOfferId);
      setJobOffer(offer);
      
      // Try to load existing test
      const test = await getRecruitmentTestByJobOffer(jobOfferId);
      if (test) {
        setExistingTest(test);
        // Load test data into form
        const testJson = test.testJson || {};
        setFormData({
          title: testJson.title || '',
          questions: (testJson.questions || []).map((q: any, idx: number) => ({
            id: `q-${idx}`,
            question: q.question || '',
            type: q.type || 'text',
            options: q.options || [],
            correctAnswer: q.correctAnswer
          }))
        });
      } else {
        // Initialize with job offer name
        setFormData(prev => ({
          ...prev,
          title: `Test rekrutacyjny - ${offer.name}`
        }));
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      addToast({
        title: 'Błąd',
        description: err?.response?.data?.message || 'Nie udało się załadować danych',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!jobOffer) return;
    
    // Validate number of questions
    const numQuestionsValue = typeof aiParams.numQuestions === 'number' ? aiParams.numQuestions : parseInt(aiParams.numQuestions) || 0;
    
    if (numQuestionsValue < 1) {
      addToast({
        title: 'Błąd walidacji',
        description: 'Liczba pytań musi być co najmniej 1',
        type: 'error'
      });
      return;
    }
    
    if (numQuestionsValue > 50) {
      addToast({
        title: 'Błąd walidacji',
        description: 'Liczba pytań nie może przekraczać 50',
        type: 'error'
      });
      return;
    }
    
    console.log('[AI Generation] Starting generation process...');
    console.log('[AI Generation] Job Offer ID:', jobOffer.id);
    console.log('[AI Generation] Parameters:', aiParams);
    
    setGenerating(true);
    try {
      console.log('[AI Generation] Calling generateRecruitmentTest API...');
      const startTime = Date.now();
      
      const result = await generateRecruitmentTest({
        jobOfferId: jobOffer.id,
        difficulty: aiParams.difficulty,
        numQuestions: numQuestionsValue,
        language: aiParams.language
      });

      const duration = Date.now() - startTime;
      console.log('[AI Generation] API call successful. Duration:', duration, 'ms');
      console.log('[AI Generation] Received result:', result);

      // Don't set existingTest - this is just generated content, not saved yet
      
      // Load generated test into form for editing
      const testJson = result.testJson || {};
      console.log('[AI Generation] Parsing test JSON:', testJson);
      
      setFormData({
        title: testJson.title || '',
        questions: (testJson.questions || []).map((q: any, idx: number) => ({
          id: `q-${idx}`,
          question: q.question || '',
          type: q.type || 'text',
          options: q.options || [],
          correctAnswer: q.correctAnswer
        }))
      });

      console.log('[AI Generation] Form data updated successfully');

      // Switch to manual mode for editing
      setMode('manual');

      addToast({
        title: 'Sukces',
        description: 'Test został wygenerowany. Możesz go teraz edytować i zapisać.',
        type: 'success'
      });

    } catch (err: any) {
      console.error('[AI Generation] Error occurred:', err);
      console.error('[AI Generation] Error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        stack: err?.stack
      });
      
      addToast({
        title: 'Błąd',
        description: err?.response?.data?.message || err?.message || 'Nie udało się wygenerować testu',
        type: 'error'
      });
    } finally {
      console.log('[AI Generation] Cleaning up, setting generating to false');
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!jobOffer) return;
    
    // Validation
    if (!formData.title.trim()) {
      addToast({
        title: 'Błąd walidacji',
        description: 'Tytuł testu jest wymagany',
        type: 'error'
      });
      return;
    }

    if (formData.questions.length === 0) {
      addToast({
        title: 'Błąd walidacji',
        description: 'Test musi zawierać co najmniej jedno pytanie',
        type: 'error'
      });
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        addToast({
          title: 'Błąd walidacji',
          description: `Pytanie ${i + 1} nie może być puste`,
          type: 'error'
        });
        return;
      }
      if ((q.type === 'choice' || q.type === 'multiple') && (!q.options || q.options.length < 2)) {
        addToast({
          title: 'Błąd walidacji',
          description: `Pytanie ${i + 1} musi mieć co najmniej 2 opcje odpowiedzi`,
          type: 'error'
        });
        return;
      }
    }

    setSaving(true);
    try {
      const testJson = {
        title: formData.title,
        questions: formData.questions.map(q => ({
          question: q.question,
          type: q.type,
          ...(q.options && { options: q.options }),
          ...(q.correctAnswer && { correctAnswer: q.correctAnswer })
        }))
      };

      if (existingTest) {
        // Update existing test
        await updateRecruitmentTest(existingTest.id, { testJson });
        addToast({
          title: 'Sukces',
          description: 'Test został zaktualizowany',
          type: 'success',
          duration: 3000
        });
      } else {
        // Create new test
        const createdTest = await createRecruitmentTest({
          jobOfferId: jobOffer.id,
          testJson
        });
        setExistingTest(createdTest);
        addToast({
          title: 'Sukces',
          description: 'Test został utworzony',
          type: 'success',
          duration: 3000
        });
      }

      // Redirect to view mode after successful save
      router.push(`/employer/job-offers/${jobOfferId}/recruitment-test?mode=view`);
    } catch (err: any) {
      console.error('Error saving test:', err);
      addToast({
        title: 'Błąd',
        description: err?.response?.data?.message || 'Nie udało się zapisać testu',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      question: '',
      type: 'text'
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      )
    }));
  };

  const addOption = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...(q.options || []), '']
          };
        }
        return q;
      })
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.options) {
          const oldOption = q.options[optionIndex];
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          
          // Update correctAnswer if this option was marked as correct
          let newCorrectAnswer = q.correctAnswer;
          
          if (q.type === 'choice' && q.correctAnswer === oldOption) {
            // For single choice, update the correct answer to new value
            newCorrectAnswer = value;
          } else if (q.type === 'multiple' && Array.isArray(q.correctAnswer)) {
            // For multiple choice, replace old value with new value in array
            newCorrectAnswer = q.correctAnswer.map(ans => ans === oldOption ? value : ans);
          }
          
          return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
        }
        return q;
      })
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.options) {
          const removedOption = q.options[optionIndex];
          const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
          
          // Update correctAnswer if removed option was marked as correct
          let newCorrectAnswer = q.correctAnswer;
          
          if (q.type === 'choice' && q.correctAnswer === removedOption) {
            // For single choice, clear correct answer if we removed it
            newCorrectAnswer = undefined;
          } else if (q.type === 'multiple' && Array.isArray(q.correctAnswer)) {
            // For multiple choice, remove from array
            newCorrectAnswer = q.correctAnswer.filter(ans => ans !== removedOption);
          }
          
          return {
            ...q,
            options: newOptions,
            correctAnswer: newCorrectAnswer
          };
        }
        return q;
      })
    }));
  };

  // Helper function to check if an option is correct answer
  const isCorrectAnswer = (question: Question, option: string): boolean => {
    if (!question.correctAnswer) return false;
    
    if (question.type === 'choice') {
      return question.correctAnswer === option;
    }
    
    if (question.type === 'multiple' && Array.isArray(question.correctAnswer)) {
      return question.correctAnswer.includes(option);
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!jobOffer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Nie znaleziono oferty pracy</p>
          <Button onClick={() => router.push('/employer/recruitment-test')}>
            Powrót
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="outline" onClick={() => router.push('/employer/recruitment-test')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót
        </Button>

        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {viewMode ? 'Podgląd testu rekrutacyjnego' : (existingTest ? 'Edytuj test rekrutacyjny' : 'Stwórz test rekrutacyjny')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Oferta: {jobOffer.name}
            </p>
          </div>
          {viewMode && existingTest && (
            <Button onClick={() => router.push(`/employer/job-offers/${jobOfferId}/recruitment-test?mode=edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edytuj test
            </Button>
          )}
        </div>

        {/* Mode selector - only show when creating new test */}
        {!existingTest && !viewMode && (
          <div className="bg-white rounded-lg border p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Sposób tworzenia</h2>
            <div className="flex gap-4">
              <Button
                variant={mode === 'manual' ? 'default' : 'outline'}
                onClick={() => setMode('manual')}
                className="flex-1"
              >
                Ręcznie
              </Button>
              <Button
                variant={mode === 'ai' ? 'default' : 'outline'}
                onClick={() => setMode('ai')}
                className="flex-1"
              >
                <Brain className="w-4 h-4 mr-2" />
                Generuj AI
              </Button>
            </div>
          </div>
        )}

        {/* AI Generation - only show when creating new test with AI mode */}
        {mode === 'ai' && (!existingTest || generating) && !viewMode && (
          <div className="bg-white rounded-lg border p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Parametry generowania AI</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Poziom trudności</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={aiParams.difficulty}
                  onChange={(e) => setAiParams(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  disabled={generating}
                >
                  <option value="easy">Łatwy</option>
                  <option value="medium">Średni</option>
                  <option value="hard">Trudny</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Liczba pytań <span className="text-gray-500 font-normal">(1-50)</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={aiParams.numQuestions}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setAiParams(prev => ({ ...prev, numQuestions: '' }));
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
                        setAiParams(prev => ({ ...prev, numQuestions: numValue }));
                      }
                    }
                  }}
                  disabled={generating}
                  placeholder="1-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Język</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={aiParams.language}
                  onChange={(e) => setAiParams(prev => ({ ...prev, language: e.target.value }))}
                  disabled={generating}
                >
                  <option value="pl">Polski</option>
                  <option value="en">Angielski</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={handleGenerateWithAI} 
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generowanie testu AI... Proszę czekać
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Wygeneruj test
                </>
              )}
            </Button>
            {generating && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                To może potrwać od 10 do 30 sekund. Nie zamykaj tej strony.
              </p>
            )}
          </div>
        )}

        {/* Test form */}
        <div className="bg-white rounded-lg border p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Informacje o teście</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tytuł testu *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="np. Test rekrutacyjny - Frontend Developer"
                disabled={viewMode}
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg border p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pytania ({formData.questions.length})</h2>
            {!viewMode && (
              <Button onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Dodaj pytanie
              </Button>
            )}
          </div>

          {formData.questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak pytań. Dodaj pierwsze pytanie lub wygeneruj test przy pomocy AI.
            </div>
          ) : (
            <div className="space-y-6">
              {formData.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Pytanie {index + 1}</h3>
                    {!viewMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Treść pytania *</label>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        rows={2}
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                        placeholder="Wpisz treść pytania..."
                        disabled={viewMode}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Typ pytania</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={question.type}
                        onChange={(e) => {
                          const newType = e.target.value as Question['type'];
                          updateQuestion(question.id, { 
                            type: newType,
                            options: (newType !== 'text' && !question.options) ? ['', '', '', ''] : question.options,
                            correctAnswer: undefined
                          });
                        }}
                        disabled={viewMode}
                      >
                        <option value="text">Pytanie otwarte</option>
                        <option value="choice">Jednokrotny wybór</option>
                        <option value="multiple">Wielokrotny wybór</option>
                      </select>
                    </div>

                    {/* Model answer for open-ended questions */}
                    {question.type === 'text' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Wzorcowa odpowiedź {!viewMode && <span className="text-gray-500 font-normal">(opcjonalna - pomoc dla rekrutera)</span>}
                        </label>
                        <textarea
                          className={`w-full p-2 border rounded-md ${viewMode ? 'bg-green-50 border-green-500' : ''}`}
                          rows={3}
                          value={typeof question.correctAnswer === 'string' ? question.correctAnswer : ''}
                          onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                          placeholder="Wpisz przykładową/wzorcową odpowiedź, która pomoże w ocenie odpowiedzi kandydata..."
                          disabled={viewMode}
                        />
                        {viewMode && question.correctAnswer && (
                          <p className="text-xs text-green-700 mt-1">✓ Wzorcowa odpowiedź (do porównania z odpowiedzią kandydata)</p>
                        )}
                      </div>
                    )}

                    {/* Options for choice/multiple questions */}
                    {(question.type === 'choice' || question.type === 'multiple') && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Opcje odpowiedzi</label>
                        <div className="space-y-2">
                          {(question.options || []).map((option, optIdx) => (
                            <div key={optIdx} className="flex gap-2 items-center">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(question.id, optIdx, e.target.value)}
                                placeholder={`Opcja ${optIdx + 1}`}
                                disabled={viewMode}
                                className={viewMode && isCorrectAnswer(question, option) ? 'bg-green-50 border-green-500' : ''}
                              />
                              {viewMode && isCorrectAnswer(question, option) && (
                                <span className="text-green-600 font-medium text-sm whitespace-nowrap">✓ Poprawna</span>
                              )}
                              {!viewMode && (question.options?.length || 0) > 2 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(question.id, optIdx)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          ))}
                          {!viewMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(question.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Dodaj opcję
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Correct answer for single choice */}
                    {question.type === 'choice' && question.options && question.options.length > 0 && !viewMode && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Poprawna odpowiedź</label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={question.correctAnswer as string || ''}
                          onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                        >
                          <option value="">Wybierz poprawną odpowiedź</option>
                          {question.options.map((opt, idx) => (
                            <option key={idx} value={opt}>{opt || `Opcja ${idx + 1}`}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Correct answers for multiple choice */}
                    {question.type === 'multiple' && question.options && question.options.length > 0 && !viewMode && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Poprawne odpowiedzi (zaznacz wszystkie)</label>
                        <div className="space-y-2">
                          {question.options.map((opt, idx) => {
                            const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                            const isChecked = correctAnswers.includes(opt);
                            
                            return (
                              <label key={idx} className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const currentAnswers = Array.isArray(question.correctAnswer) ? [...question.correctAnswer] : [];
                                    if (e.target.checked) {
                                      // Add this option to correct answers if not already there
                                      if (!currentAnswers.includes(opt)) {
                                        updateQuestion(question.id, { correctAnswer: [...currentAnswers, opt] });
                                      }
                                    } else {
                                      // Remove this option from correct answers
                                      updateQuestion(question.id, { correctAnswer: currentAnswers.filter(a => a !== opt) });
                                    }
                                  }}
                                  className="w-4 h-4 cursor-pointer accent-red-600 border-gray-300 rounded transition-all"
                                />
                                <span className="text-sm group-hover:text-red-600 transition-colors duration-200">{opt || `Opcja ${idx + 1}`}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {!viewMode && (
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/employer/recruitment-test')}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Zapisz test
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
