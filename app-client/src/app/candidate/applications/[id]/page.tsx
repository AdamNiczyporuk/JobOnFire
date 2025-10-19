"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getApplication, getApplicationQuestions, updateApplication, updateApplicationAnswers } from "@/services/applicationService";
import { candidateService } from "@/services/candidateService";
import { Application, CandidateCV } from "@/types/candidate";
import { ArrowLeft, Briefcase, Building2, Calendar, CheckCircle, XCircle, Clock, AlertCircle, MessageSquare, FileText, ExternalLink, Ban } from "lucide-react";

type QuestionItem = {
  id: number;
  question?: string;
  currentAnswer?: string | null;
};

export default function CandidateApplicationDetailPage() {
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const applicationId = idParam ? parseInt(idParam) : NaN;

  const [application, setApplication] = useState<Application | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveInfo, setSaveInfo] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageSaving, setMessageSaving] = useState(false);
  const [messageInfo, setMessageInfo] = useState<string | null>(null);
  const [cv, setCv] = useState<CandidateCV | null>(null);
  const [cvs, setCvs] = useState<CandidateCV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [cvSaving, setCvSaving] = useState(false);
  const [cvInfo, setCvInfo] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [globalInfo, setGlobalInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isNaN(applicationId)) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [app, qres] = await Promise.all([
        getApplication(applicationId),
        getApplicationQuestions(applicationId),
      ]);
      setApplication(app);
      setMessage(app?.message || "");
      // fetch CV details for link (if available)
      if (app?.cvId) {
        try {
          const cvRes = await candidateService.getCV(app.cvId);
          setCv(cvRes);
        } catch (e) {
          // ignore CV fetch error, still show name from application if available via application.candidateCV
          setCv(null);
        }
      }
      // fetch candidate CVs for switching
      try {
        const list = await candidateService.getCVs();
        setCvs(list);
        setSelectedCvId(app?.cvId ?? null);
      } catch (e) {
        setCvs([]);
      }
      setQuestions(qres.questions || []);
      setCanEdit(!!qres.canEdit);
      // initialize answers map
      const init: Record<number, string> = {};
      (qres.questions || []).forEach((q) => {
        init[q.id] = q.currentAnswer || "";
      });
      setAnswers(init);
    } catch (e) {
      console.error("Error loading application detail", e);
      setError("Nie udało się pobrać danych aplikacji");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'CANCELED':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Oczekuje';
      case 'ACCEPTED':
        return 'Zaakceptowana';
      case 'REJECTED':
        return 'Odrzucona';
      case 'CANCELED':
        return 'Anulowana';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const modifiedAnswers = useMemo(() => {
    // Build payload of answers (including empty strings)
    return questions.map((q) => ({
      recruitmentQuestionId: q.id,
      answer: (answers[q.id] ?? '').trim() || undefined,
    }));
  }, [questions, answers]);

  const hasAnswerChanges = useMemo(() => {
    return questions.some((q) => {
      const current = (answers[q.id] ?? '').trim();
      const original = (q.currentAnswer ?? '').trim();
      return current !== original;
    });
  }, [questions, answers]);

  const handleSaveAnswers = async () => {
    setSaving(true);
    setSaveInfo(null);
    try {
      await updateApplicationAnswers(applicationId, modifiedAnswers);
      setSaveInfo("Odpowiedzi zostały zapisane");
      await load();
    } catch (e) {
      console.error("Error updating answers", e);
      setSaveInfo("Nie udało się zapisać odpowiedzi");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveInfo(null), 3000);
    }
  };

  const handleSaveMessage = async () => {
    setMessageSaving(true);
    setMessageInfo(null);
    try {
      await updateApplication(applicationId, { message });
      setMessageInfo("Wiadomość została zaktualizowana");
      await load();
    } catch (e) {
      console.error("Error updating message", e);
      setMessageInfo("Nie udało się zaktualizować wiadomości");
    } finally {
      setMessageSaving(false);
      setTimeout(() => setMessageInfo(null), 3000);
    }
  };

  const handleCancelApplication = async () => {
    if (!application || application.status !== 'PENDING') return;
    const confirmCancel = window.confirm('Czy na pewno chcesz anulować tę aplikację?');
    if (!confirmCancel) return;
    setCanceling(true);
    try {
      await updateApplication(applicationId, { status: 'CANCELED' });
      await load();
    } catch (e) {
      console.error('Error canceling application', e);
      alert('Nie udało się anulować aplikacji');
    } finally {
      setCanceling(false);
    }
  };

  const handleSaveCv = async () => {
    if (!application || application.status !== 'PENDING' || selectedCvId == null) return;
    setCvSaving(true);
    setCvInfo(null);
    try {
      await updateApplication(applicationId, { cvId: selectedCvId });
      setCvInfo('CV zostało zaktualizowane');
      await load();
    } catch (e) {
      console.error('Error updating CV', e);
      setCvInfo('Nie udało się zaktualizować CV');
    } finally {
      setCvSaving(false);
      setTimeout(() => setCvInfo(null), 3000);
    }
  };

  const handleEnterEdit = () => {
    if (!canEdit) return;
    setEditMode(true);
    // ensure local buffers are in sync
    setMessage(application?.message || '');
    const init: Record<number, string> = {};
    (questions || []).forEach((q) => {
      init[q.id] = q.currentAnswer || '';
    });
    setAnswers(init);
    setSelectedCvId(application?.cvId ?? null);
  };

  const handleCancelEdit = () => {
    // restore from loaded data
    setEditMode(false);
    setMessage(application?.message || '');
    const init: Record<number, string> = {};
    (questions || []).forEach((q) => {
      init[q.id] = q.currentAnswer || '';
    });
    setAnswers(init);
    setSelectedCvId(application?.cvId ?? null);
    setGlobalInfo(null);
  };

  const handleSaveAll = async () => {
    if (!application || !canEdit || !editMode) return;
    setSavingAll(true);
    setGlobalInfo(null);
    try {
      const promises: Promise<any>[] = [];

      const body: any = {};
      if ((message ?? '') !== (application.message ?? '')) body.message = message;
      if (selectedCvId != null && selectedCvId !== application.cvId) body.cvId = selectedCvId;

      if (Object.keys(body).length > 0) {
        promises.push(updateApplication(applicationId, body));
      }

      if (hasAnswerChanges && questions.length > 0) {
        promises.push(updateApplicationAnswers(applicationId, modifiedAnswers));
      }

      if (promises.length === 0) {
        setGlobalInfo('Brak zmian do zapisania');
      } else {
        await Promise.all(promises);
        setGlobalInfo('Zmiany zostały zapisane');
        await load();
        setEditMode(false);
      }
    } catch (e) {
      console.error('Error saving changes', e);
      setGlobalInfo('Nie udało się zapisać zmian');
    } finally {
      setSavingAll(false);
      setTimeout(() => setGlobalInfo(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <main className="flex-1 w-full">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Ładowanie aplikacji...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <main className="flex-1 w-full">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={load}>Spróbuj ponownie</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const company = application.jobOffer.employerProfile?.companyName;
  const hasMeeting = (application.meetings || []).length > 0;

  return (
    <div className="flex flex-col items-center">
      <main className="flex-1 w-full">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
          {/* Back */}
          <div className="mb-6">
            <Link href="/candidate/applications" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Powrót do listy
            </Link>
          </div>

          {/* Header */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{application.jobOffer.name}</h1>
                  {company && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building2 className="w-4 h-4" />
                      <span>{company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Calendar className="w-4 h-4" />
                    <span>Złożono: {formatDate(application.createDate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadgeClass(application.status)}`}>
                  {getStatusIcon(application.status)}
                  {getStatusText(application.status)}
                </div>
                {canEdit && !editMode && (
                  <Button onClick={handleEnterEdit} className="transition-all duration-200 hover:scale-105">Edytuj</Button>
                )}
                {canEdit && editMode && (
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSaveAll} disabled={savingAll} className="transition-all duration-200 hover:scale-105">Zapisz zmiany</Button>
                    <Button variant="outline" onClick={handleCancelEdit} className="transition-all duration-200 hover:scale-105">Anuluj</Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm">
              <Link href={`/job-offers/${application.jobOfferId}`} className="text-red-600 hover:text-red-700 underline-offset-2 hover:underline">
                Zobacz szczegóły oferty
              </Link>
            </div>
            {globalInfo && (
              <p className={`mt-3 text-sm ${globalInfo.includes('Nie udało') ? 'text-red-600' : globalInfo.includes('Brak') ? 'text-muted-foreground' : 'text-green-600'}`}>{globalInfo}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Message to employer */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Twoja wiadomość do pracodawcy
                </h2>
                {canEdit && editMode ? (
                  <>
                    <textarea
                      className="w-full min-h-[120px] px-3 py-2 border rounded-md text-sm"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={2000}
                      placeholder="Napisz krótką wiadomość do pracodawcy..."
                    />
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {application.message ? application.message : <span className="italic">Brak wiadomości</span>}
                  </div>
                )}
              </div>

              {/* Questions */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Pytania rekrutacyjne
                </h2>
                {questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Brak pytań rekrutacyjnych dla tej oferty.</p>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div key={q.id} className="border rounded p-4">
                        <p className="font-medium mb-2">{q.question || 'Pytanie'}</p>
                        {canEdit && editMode ? (
                          <textarea
                            value={answers[q.id] ?? ''}
                            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            className="w-full min-h-[90px] px-3 py-2 border rounded-md text-sm"
                            placeholder="Wpisz odpowiedź..."
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {q.currentAnswer ? q.currentAnswer : <span className="italic">Brak odpowiedzi</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CV used */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> CV użyte w aplikacji
                </h2>
                <div className="text-sm">
                  <div className="font-medium">{cv?.name || application.candidateCV?.name || 'CV'}</div>
                  {cv?.cvUrl ? (
                    <a
                      href={cv.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 underline-offset-2 hover:underline mt-1"
                    >
                      Otwórz CV <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground mt-1">Brak linku do pliku CV</p>
                  )}
                </div>

                {application.status === 'PENDING' && editMode && cvs.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Zmień CV dla tej aplikacji</label>
                    <select
                      value={selectedCvId ?? ''}
                      onChange={(e) => setSelectedCvId(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Wybierz CV</option>
                      {cvs.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name || `CV ${item.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Meetings info */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Spotkania</h2>
                {hasMeeting ? (
                  <div className="space-y-2 text-sm">
                    {application.meetings.map((m) => (
                      <div key={m.id} className="p-3 rounded border">
                        <div className="font-medium">{new Date(m.dateTime).toLocaleString('pl-PL')}</div>
                        <div className="text-muted-foreground">
                          Typ: {m.type === 'ONLINE' ? 'Online' : 'Stacjonarne'}
                          {m.onlineMeetingUrl && (
                            <>
                              {' '}
                              • <a href={m.onlineMeetingUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline-offset-2 hover:underline">Link</a>
                            </>
                          )}
                        </div>
                        {m.message && <div className="text-sm mt-1">{m.message}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Brak zaplanowanych spotkań.</p>
                )}
              </div>

              {/* Cancel application */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Zarządzaj aplikacją</h2>
                <div className="text-sm text-muted-foreground mb-3">
                  Status: <span className="font-medium text-foreground">{getStatusText(application.status)}</span>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleCancelApplication}
                  disabled={application.status !== 'PENDING' || canceling || editMode}
                  className="transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                  title={application.status !== 'PENDING' ? 'Można anulować tylko aplikacje w statusie Oczekuje' : undefined}
                >
                  <Ban className="w-4 h-4" /> Anuluj aplikację
                </Button>
                {application.status !== 'PENDING' && (
                  <p className="text-xs text-muted-foreground mt-2">Można anulować tylko aplikacje o statusie Oczekuje.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
