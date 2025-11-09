"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getJobOffer } from "@/services/jobOfferService";
import { JobOffer } from "@/types/jobOffer";
import { ArrowLeft, User, Clock, CheckCircle, XCircle, AlertCircle, Calendar, MessageSquare } from "lucide-react";
import { getEmployerApplications } from "@/services/applicationService";
import { EmployerApplication } from "@/types/application";

export default function EmployerJobOfferDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string | undefined;
  const jobOfferId = idParam ? parseInt(idParam) : NaN;

  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apps, setApps] = useState<EmployerApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isNaN(jobOfferId)) {
      fetchDetails();
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobOfferId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getJobOffer(jobOfferId);
      setJobOffer(data);
    } catch (e) {
      console.error("Error loading job offer details", e);
      setError("Nie udało się pobrać szczegółów oferty pracy");
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (dateString: string) => new Date(dateString) < new Date();

  const fetchApplications = async () => {
    if (Number.isNaN(jobOfferId)) return;
    try {
      setAppsLoading(true);
      setAppsError(null);
      const res = await getEmployerApplications({ page: 1, limit: 1000, jobOfferId });
      setApps(res.applications || []);
    } catch (e) {
      console.error("Error loading applications for job offer", e);
      setAppsError("Nie udało się pobrać aplikacji dla tej oferty");
    } finally {
      setAppsLoading(false);
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
                <p className="text-muted-foreground">Ładowanie oferty pracy...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !jobOffer) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <main className="flex-1 w-full">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchDetails}>Spróbuj ponownie</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="flex-1 w-full">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8">
          {/* Back link */}
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Powrót
            </Button>
          </div>

          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold">{jobOffer.name}</h1>
              {jobOffer.isActive && (
                <div className="flex gap-2">
                  <Link href={`/employer/job-offers/${jobOffer.id}/edit`}>
                    <Button className="transition-all duration-200 hover:scale-105">Edytuj</Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Status i podstawowe info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      !jobOffer.isActive
                        ? "bg-gray-100 text-gray-700"
                        : isExpired(jobOffer.expireDate)
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {!jobOffer.isActive
                      ? "Usunięta"
                      : isExpired(jobOffer.expireDate)
                      ? "Wygasła"
                      : "Aktywna"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Wygasa:</span>
                  <span
                    className={`ml-2 ${isExpired(jobOffer.expireDate) ? "text-red-600 font-medium" : ""}`}
                  >
                    {new Date(jobOffer.expireDate).toLocaleDateString("pl-PL")}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Typ umowy:</span> {jobOffer.contractType || "Nie określono"}
                </div>
                <div>
                  <span className="font-medium">Wynagrodzenie:</span> {jobOffer.salary || "Nie określono"}
                </div>
              </div>

              {/* Komunikat o wygaśnięciu */}
              {isExpired(jobOffer.expireDate) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Oferta wygasła</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          Ta oferta pracy wygasła {new Date(jobOffer.expireDate).toLocaleDateString("pl-PL")}. Kandydaci
                          nie mogą już aplikować na tę pozycję.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Opis */}
              {jobOffer.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Opis</h3>
                  <p className="text-gray-700">{jobOffer.description}</p>
                </div>
              )}

              {/* Obowiązki */}
              {jobOffer.responsibilities && jobOffer.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Obowiązki</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {jobOffer.responsibilities.map((resp, index) => (
                      <li key={index} className="text-gray-700">
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Wymagania */}
              {jobOffer.requirements && jobOffer.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Wymagania</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {jobOffer.requirements.map((req, index) => (
                      <li key={index} className="text-gray-700">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Co oferujemy */}
              {jobOffer.whatWeOffer && jobOffer.whatWeOffer.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Co oferujemy</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {jobOffer.whatWeOffer.map((offer, index) => (
                      <li key={index} className="text-gray-700">
                        {offer}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tagi */}
              {jobOffer.tags && jobOffer.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tagi</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobOffer.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pytania rekrutacyjne */}
              {jobOffer.questions && jobOffer.questions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Pytania rekrutacyjne</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {jobOffer.questions.map((q) => (
                      <li key={q.id} className="text-gray-700 whitespace-normal break-words">{q.question}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Aplikacje do tej oferty */}
              <div className="pt-4 border-t">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-lg font-semibold">Aplikacje do tej oferty</h3>
                  {!appsLoading && !appsError && (
                    <span className="text-sm text-muted-foreground">Łącznie: {apps.length}</span>
                  )}
                </div>

                {appsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                    <span>Ładowanie aplikacji...</span>
                  </div>
                ) : appsError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
                    {appsError}
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={fetchApplications}>Spróbuj ponownie</Button>
                    </div>
                  </div>
                ) : apps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Brak aplikacji na tę ofertę.</p>
                ) : (
                  <div className="space-y-3">
                    {apps.map((application) => (
                      <div key={application.id} className="rounded-lg border bg-white p-4 shadow-md">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span className="truncate">
                                {application.candidate.fullName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(application.createdAt).toLocaleDateString("pl-PL")}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MessageSquare className="w-4 h-4" />
                                <span>
                                  {application.recruitmentQuestions.total === 0 ? 'Brak pytań' : `${application.recruitmentQuestions.answered}/${application.recruitmentQuestions.total} odpowiedzi`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${
                              application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-green-200' :
                              application.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {application.status === 'PENDING' && <Clock className="w-3 h-3" />}
                              {application.status === 'ACCEPTED' && <CheckCircle className="w-3 h-3" />}
                              {application.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                              {application.status === 'CANCELED' && <AlertCircle className="w-3 h-3" />}
                              <span>{
                                application.status === 'PENDING' ? 'Oczekuje' :
                                application.status === 'ACCEPTED' ? 'Zaakceptowana' :
                                application.status === 'REJECTED' ? 'Odrzucona' :
                                'Anulowana'
                              }</span>
                            </span>
                            <Link href={`/employer/applications/${application.id}`}>
                              <Button variant="outline" className="transition-all duration-200 hover:scale-105" size="sm">Szczegóły</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
