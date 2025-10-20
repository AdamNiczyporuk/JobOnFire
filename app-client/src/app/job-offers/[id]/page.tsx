"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SmartHeader } from "@/components/SmartHeader";
import JobApplicationForm from "@/components/JobApplicationForm";
import { getPublicJobOffer } from "@/services/jobOfferService";
import { checkApplicationStatus } from "@/services/applicationService";
import { JobOffer } from "@/types/jobOffer";
import { MapPin, Building, Calendar, DollarSign, Clock, Users, ArrowLeft } from "lucide-react";

export default function JobOfferDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);

  const jobOfferId = parseInt(params.id as string);

  useEffect(() => {
    if (!jobOfferId || isNaN(jobOfferId)) {
      setError('Nieprawidłowe ID oferty pracy');
      setLoading(false);
      return;
    }

    fetchJobOffer();
    // Po załadowaniu oferty sprawdzimy, czy kandydat już aplikował (jeśli jest zalogowany)
    checkApplied();
  }, [jobOfferId]);

  const fetchJobOffer = async () => {
    try {
      setLoading(true);
      const response = await getPublicJobOffer(jobOfferId);
      setJobOffer(response);
    } catch (err: any) {
      // Jeśli oferta wygasła lub została wyłączona, backend zwraca 404
      if (err?.response?.status === 404) {
        setError('Ta oferta pracy wygasła lub została wyłączona przez pracodawcę.');
      } else {
        setError('Nie udało się pobrać szczegółów oferty pracy. Spróbuj ponownie później.');
      }
      // Ograniczamy hałas w konsoli dla oczekiwanego przypadku 404
    } finally {
      setLoading(false);
    }
  };

  const checkApplied = async () => {
    try {
      const res = await checkApplicationStatus(jobOfferId);
      setHasApplied(!!res.hasApplied);
      setApplicationId(res.applicationId);
    } catch (err: any) {
      // Brak autoryzacji lub brak profilu kandydata -> traktuj jako niezaaplikowano
      setHasApplied(false);
      setApplicationId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApplyClick = () => {
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    // Można dodać toast notification sukcesu
    alert('Aplikacja została wysłana pomyślnie!');
    // Oznacz jako zaaplikowano i spróbuj pobrać ID aplikacji
    setHasApplied(true);
    checkApplied();
  };

  const handleApplicationCancel = () => {
    setShowApplicationForm(false);
  };

  const formatLocation = () => {
    if (!jobOffer?.lokalization) return 'Remote';
    const { city, state, street } = jobOffer.lokalization;
    if (street && city && state) return `${street}, ${city}, ${state}`;
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return 'Remote';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SmartHeader />
        <main className="flex-1 w-full">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Ładowanie szczegółów oferty...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !jobOffer) {
    return (
      <div className="flex min-h-screen flex-col">
        <SmartHeader />
        <main className="flex-1 w-full">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error || 'Oferta pracy nie została znaleziona'}</p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.back()}>
                  Powrót
                </Button>
                <Link href="/job-offers">
                  <Button>Zobacz inne oferty</Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SmartHeader />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
          {/* Breadcrumb i powrót */}
          <div className="mb-6">
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

          {/* Formularz aplikacji lub szczegóły oferty */}
          {showApplicationForm ? (
            <JobApplicationForm
              jobOffer={jobOffer}
              onSuccess={handleApplicationSuccess}
              onCancel={handleApplicationCancel}
            />
          ) : (
            <>
              {/* Header oferty */}
              <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl font-bold mb-2">{jobOffer.name}</CardTitle>
                  {jobOffer.employerProfile?.companyName && (
                    <CardDescription className="text-lg">
                      <Link href={`/companies/${jobOffer.employerProfile.id}`} className="hover:text-primary underline-offset-2 hover:underline">
                        {jobOffer.employerProfile.companyName}
                      </Link>
                    </CardDescription>
                  )}
                </div>
                {jobOffer.employerProfile?.companyImageUrl ? (
                  <img
                    src={jobOffer.employerProfile.companyImageUrl}
                    alt={jobOffer.employerProfile.companyName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <Building className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Informacje podstawowe */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatLocation()}</span>
                </div>
                {jobOffer.contractType && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{jobOffer.contractType}</span>
                  </div>
                )}
                {jobOffer.salary && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{jobOffer.salary}</span>
                  </div>
                )}
                {jobOffer.workload && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{jobOffer.workload}</span>
                  </div>
                )}
              </div>

              {/* Tagi */}
              {jobOffer.tags && jobOffer.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {jobOffer.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Główna treść */}
            <div className="lg:col-span-2 space-y-6">
              {/* Opis */}
              {jobOffer.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Opis stanowiska</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{jobOffer.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Obowiązki */}
              {jobOffer.responsibilities && jobOffer.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Obowiązki</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {jobOffer.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Wymagania */}
              {jobOffer.requirements && jobOffer.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Wymagania</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {jobOffer.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Co oferujemy */}
              {jobOffer.whatWeOffer && jobOffer.whatWeOffer.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Co oferujemy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {jobOffer.whatWeOffer.map((offer, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{offer}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Aplikuj */}
              <Card>
                <CardHeader>
                  <CardTitle>Aplikuj na stanowisko</CardTitle>
                  <CardDescription>
                    {jobOffer.applicationUrl 
                      ? "Aplikacja zostanie przekierowana na stronę zewnętrzną" 
                      : "Aplikacja wymaga zalogowania jako kandydat"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jobOffer.applicationUrl ? (
                    <Link 
                      href={jobOffer.applicationUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" className="w-full">
                        Aplikuj zewnętrznie
                      </Button>
                    </Link>
                  ) : hasApplied ? (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                      Już zaaplikowano na tę ofertę.
                      {applicationId ? (
                        <div className="mt-2">
                          <Link href={`/candidate/applications/${applicationId}`} className="underline underline-offset-2 text-green-700 hover:text-green-800">
                            Zobacz swoją aplikację
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <Button size="lg" className="w-full" onClick={handleApplyClick}>
                      Aplikuj teraz
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Szczegóły */}
              <Card>
                <CardHeader>
                  <CardTitle>Szczegóły oferty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data publikacji:</span>
                    <span className="text-sm">{formatDate(jobOffer.createDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ważne do:</span>
                    <span className="text-sm">
                      {formatDate(jobOffer.expireDate)}
                    </span>
                  </div>
                  {jobOffer.jobLevel && jobOffer.jobLevel.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Poziom stanowiska:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {jobOffer.jobLevel.map((level, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {jobOffer.workingMode && jobOffer.workingMode.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Tryb pracy:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {jobOffer.workingMode.map((mode, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {mode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {jobOffer._count && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Liczba aplikacji:</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{jobOffer._count.applications}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informacje o firmie */}
              {jobOffer.employerProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle>O firmie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-2">{jobOffer.employerProfile.companyName}</h4>
                    {jobOffer.employerProfile.industry && jobOffer.employerProfile.industry.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {jobOffer.employerProfile.industry.map((industry, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Link href={`/companies/${jobOffer.employerProfile.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Zobacz profil firmy
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
