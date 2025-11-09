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
import { MapPin, Building2, Calendar, DollarSign, Clock, Users, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function JobOfferDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
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
    addToast({
      title: "Sukces!",
      description: "Aplikacja została wysłana pomyślnie!",
      type: "success",
      duration: 5000
    });
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
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
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
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
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
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
          {/* Breadcrumb i powrót */}
          <div className="mb-6">
            <Button
              variant="outline"
              size="default"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
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
              <Card className="mb-8 shadow-md">
            <CardHeader className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <CardTitle className="text-3xl md:text-4xl font-bold mb-3">{jobOffer.name}</CardTitle>
                  {jobOffer.employerProfile?.companyName && (
                    <CardDescription className="text-xl">
                      <Link href={`/companies/${jobOffer.employerProfile.id}`} className="hover:text-primary underline-offset-2 hover:underline">
                        {jobOffer.employerProfile.companyName}
                      </Link>
                    </CardDescription>
                  )}
                </div>
                {jobOffer.employerProfile?.companyImageUrl ? (
                  <img
                    src={jobOffer.employerProfile.companyImageUrl}
                    alt={jobOffer.employerProfile.companyName || 'Company logo'}
                    className="w-24 h-24 md:w-28 md:h-28 rounded-lg object-cover shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Building2 className="w-12 h-12 md:w-14 md:h-14 text-primary" />
                  </div>
                )}
              </div>
              
              {/* Informacje podstawowe */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="text-base font-medium">{formatLocation()}</span>
                </div>
                {jobOffer.contractType && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Building2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-base font-medium">{jobOffer.contractType}</span>
                  </div>
                )}
                {jobOffer.salary && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <DollarSign className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-base font-medium">{jobOffer.salary}</span>
                  </div>
                )}
                {jobOffer.workload && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-base font-medium">{jobOffer.workload}</span>
                  </div>
                )}
              </div>

              {/* Tagi */}
              {jobOffer.tags && jobOffer.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {jobOffer.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
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
                <Card className="shadow-md border">
                  <CardHeader>
                    <CardTitle className="text-2xl">Opis stanowiska</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-base max-w-none">
                      <p className="whitespace-pre-wrap text-base leading-relaxed">{jobOffer.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Obowiązki */}
              {jobOffer.responsibilities && jobOffer.responsibilities.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Obowiązki</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {jobOffer.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                          <span className="text-base leading-relaxed">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Wymagania */}
              {jobOffer.requirements && jobOffer.requirements.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Wymagania</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {jobOffer.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                          <span className="text-base leading-relaxed">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Co oferujemy */}
              {jobOffer.whatWeOffer && jobOffer.whatWeOffer.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Co oferujemy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {jobOffer.whatWeOffer.map((offer, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2.5 flex-shrink-0" />
                          <span className="text-base leading-relaxed">{offer}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {/* Aplikuj */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl">Aplikuj na stanowisko</CardTitle>
                  <CardDescription className="text-base">
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
                      <Button size="lg" className="w-full h-12 text-base">
                        Aplikuj zewnętrznie
                      </Button>
                    </Link>
                  ) : hasApplied ? (
                    <div className="text-base text-green-700 bg-green-50 border border-green-200 rounded-md p-4">
                      Już zaaplikowano na tę ofertę.
                      {applicationId ? (
                        <div className="mt-2">
                          <Link href={`/candidate/applications/${applicationId}`} className="underline underline-offset-2 text-green-700 hover:text-green-800 font-medium">
                            Zobacz swoją aplikację
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <Button size="lg" className="w-full h-12 text-base" onClick={handleApplyClick}>
                      Aplikuj teraz
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Szczegóły */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Szczegóły oferty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Data publikacji:</span>
                    </div>
                    <span className="text-base font-medium">{formatDate(jobOffer.createDate)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Ważne do:</span>
                    </div>
                    <span className="text-base font-medium">
                      {formatDate(jobOffer.expireDate)}
                    </span>
                  </div>
                  {jobOffer.jobLevel && jobOffer.jobLevel.length > 0 && (
                    <div className="py-2">
                      <span className="text-sm font-medium text-muted-foreground">Poziom stanowiska:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {jobOffer.jobLevel.map((level, index) => (
                          <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {jobOffer.workingMode && jobOffer.workingMode.length > 0 && (
                    <div className="py-2">
                      <span className="text-sm font-medium text-muted-foreground">Tryb pracy:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {jobOffer.workingMode.map((mode, index) => (
                          <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                            {mode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {jobOffer._count && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Liczba aplikacji:</span>
                      </div>
                      <span className="text-base font-medium">{jobOffer._count.applications}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informacje o firmie */}
              {jobOffer.employerProfile && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">O firmie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      {jobOffer.employerProfile.companyImageUrl ? (
                        <img
                          src={jobOffer.employerProfile.companyImageUrl}
                          alt={jobOffer.employerProfile.companyName || 'Company logo'}
                          className="w-16 h-16 rounded-lg object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm">
                          <Building2 className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <h4 className="font-semibold text-lg">{jobOffer.employerProfile.companyName}</h4>
                    </div>
                    {jobOffer.employerProfile.industry && jobOffer.employerProfile.industry.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {jobOffer.employerProfile.industry.map((industry, index) => (
                          <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Link href={`/companies/${jobOffer.employerProfile.id}`}>
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full transition-all duration-200 hover:scale-105 hover:bg-accent/30"
                      >
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
