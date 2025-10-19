"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { candidateService } from "@/services/candidateService";
import type { CandidateCV } from "@/types/candidate";

export default function CandidateCVsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cvs, setCvs] = useState<CandidateCV[]>([]);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        router.push('/candidate/login');
      }, 1500);
      return () => clearTimeout(timer);
    } else if (user.role !== "CANDIDATE") {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  useEffect(() => {
    let active = true;
    const loadCVs = async () => {
      if (!user || user.role !== "CANDIDATE") return;
      setLoading(true);
      try {
        const data = await candidateService.getCVs();
        if (!active) return;
        setCvs(data);
      } catch (error) {
        console.error("Error loading CVs:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCVs();
    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Sprawdzanie uprawnień...</p>
        <p className="text-sm text-gray-500 mt-2">Przekierowanie na stronę logowania</p>
      </main>
    );
  }

  if (user.role !== "CANDIDATE") {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p className="text-red-600">Brak dostępu do panelu kandydata</p>
        <p className="text-sm text-gray-500 mt-2">Przekierowanie na stronę główną</p>
      </main>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Nagłówek */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Moje CV 📄
          </h1>
          <p className="text-muted-foreground">
            Zarządzaj swoimi CV i dokumentami aplikacyjnymi
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/candidate/cv/upload">
            <Button className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Dodaj CV
            </Button>
          </Link>
          <Link href="/tools/cv-generator">
            <Button variant="outline" className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Wygeneruj CV
            </Button>
          </Link>
        </div>
      </div>

      {/* Lista CV */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie CV...</p>
          </div>
        ) : cvs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-4">
              <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Nie masz jeszcze żadnego CV</h3>
            <p className="text-muted-foreground mb-6">
              Dodaj swoje pierwsze CV lub wygeneruj je automatycznie
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/candidate/cv/upload">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Dodaj CV
                </Button>
              </Link>
              <Link href="/tools/cv-generator">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Wygeneruj CV
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {cvs.map((cv) => (
              <div key={cv.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {cv.name || `CV #${cv.id}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {cv.cvUrl ? 'Plik PDF' : 'CV wygenerowane'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {cv.cvUrl && (
                      <a href={cv.cvUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-colors">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Pobierz
                        </Button>
                      </a>
                    )}
                    <Link href={`/candidate/cv/${cv.id}`}>
                      <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Podgląd
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informacja */}
      {cvs.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Wskazówka</h4>
              <p className="text-sm text-blue-800">
                Przechowuj różne wersje CV dopasowane do konkretnych stanowisk. 
                To zwiększy Twoje szanse na zatrudnienie!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
