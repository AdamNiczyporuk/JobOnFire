"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getJobOffer } from "@/services/jobOfferService";
import { JobOffer } from "@/types/jobOffer";

export default function EmployerJobOfferDetailsPage() {
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const jobOfferId = idParam ? parseInt(idParam) : NaN;

  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isNaN(jobOfferId)) {
      fetchDetails();
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
    <div className="flex flex-col items-center">
      <main className="flex-1 w-full">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/employer/job-offers"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Powrót do listy
            </Link>
          </div>

          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold">{jobOffer.name}</h1>
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
                      ? "Nieaktywna"
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
