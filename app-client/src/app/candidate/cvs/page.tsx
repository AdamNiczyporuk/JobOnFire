"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { candidateService } from "@/services/candidateService";
import type { CandidateCV } from "@/types/candidate";
import api from "@/api";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

type PreviewData = {
  type: "generated" | "uploaded";
  cvData?: any;
  url?: string;
};

export default function CandidateCVsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cvs, setCvs] = useState<CandidateCV[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [cvToDelete, setCvToDelete] = useState<{ id: number; name: string } | null>(null);
  const [previewCV, setPreviewCV] = useState<PreviewData["cvData"] | null>(null);

  const apiBase = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_PREFIX || "/api/v1"}`;

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        router.push("/candidate/login");
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (user.role !== "CANDIDATE") {
      const timer = setTimeout(() => {
        router.push("/");
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

  const handleDeleteCV = (cvId: number, cvName: string) => {
    setCvToDelete({ id: cvId, name: cvName });
  };

  const confirmDelete = async () => {
    if (!cvToDelete) return;

    const { id: cvId } = cvToDelete;
    setDeleting(cvId);
    setCvToDelete(null);

    try {
      await candidateService.deleteCV(cvId);
      const refreshed = await candidateService.getCVs();
      setCvs(refreshed);
    } catch (error: any) {
      console.error("Error deleting CV", error);
      const errorMessage = error.response?.data?.message || "Nie udalo sie usunac CV.";
      alert(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const cancelDelete = () => {
    setCvToDelete(null);
  };

  const handleOpenPreview = async (cvId: number) => {
    try {
      const { data } = await api.get<PreviewData>(`/candidate/cvs/${cvId}/preview`);

      if (data.type === "generated" && data.cvData) {
        setPreviewCV(data.cvData);
        return;
      }

      const url = data?.url || `${apiBase}/candidate/cvs/${cvId}/preview`;
      window.open(url, "_blank", "noopener");
    } catch (error) {
      console.error("Preview open failed, using fallback", error);
      window.open(`${apiBase}/candidate/cvs/${cvId}/preview`, "_blank", "noopener");
    }
  };

  if (!user) {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4" />
        <p className="text-gray-600">Sprawdzanie uprawnien...</p>
        <p className="text-sm text-gray-500 mt-2">Przekierowanie na strone logowania</p>
      </main>
    );
  }

  if (user.role !== "CANDIDATE") {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4" />
        <p className="text-red-600">Brak dostepu do panelu kandydata</p>
        <p className="text-sm text-gray-500 mt-2">Przekierowanie na strone glowna</p>
      </main>
    );
  }

  return (
    <>
      {previewCV && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewCV(null)} />

          <div className="relative bg-white rounded-lg shadow-2xl w-[95vw] h-[95vh] mx-4 flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Podglad CV</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewCV(null)} className="hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <div className="flex-1 overflow-hidden">
              <PDFViewer width="100%" height="100%" showToolbar>
                {(() => {
                  const CVDocument = require("@/components/CVDocument").CVDocument;
                  return <CVDocument cv={previewCV} />;
                })()}
              </PDFViewer>
            </div>
          </div>
        </div>
      )}

      {cvToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelDelete} />

          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.062 21h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Potwierdz usuniecie</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Czy na pewno chcesz usunac CV <span className="font-semibold">"{cvToDelete.name}"</span>? Ta operacja jest nieodwracalna.
                </p>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={cancelDelete} disabled={deleting === cvToDelete.id}>
                    Anuluj
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                    disabled={deleting === cvToDelete.id}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting === cvToDelete.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Usuwanie...
                      </>
                    ) : (
                      "Usun CV"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Moje CV</h1>
            <p className="text-muted-foreground">Zarzadzaj swoimi CV i dokumentami aplikacyjnymi</p>
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

        <div className="bg-white rounded-lg border">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-gray-600">Ladowanie CV...</p>
            </div>
          ) : cvs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4">
                <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Nie masz jeszcze zadnego CV</h3>
              <p className="text-muted-foreground mb-6">Dodaj swoje pierwsze CV lub wygeneruj je automatycznie</p>
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
                        <h3 className="font-semibold text-lg mb-1">{cv.name || `CV #${cv.id}`}</h3>
                        <p className="text-sm text-muted-foreground">{cv.cvUrl ? "Plik PDF" : "CV wygenerowane"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary hover:text-white transition-colors"
                        onClick={() => handleOpenPreview(cv.id)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Podglad
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-500 hover:text-white transition-colors border-red-300 hover:border-red-500"
                        onClick={() => handleDeleteCV(cv.id, cv.name || `CV #${cv.id}`)}
                        disabled={deleting === cv.id}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deleting === cv.id ? "Usuwanie..." : "Usun"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cvs.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Wskazowka</h4>
                <p className="text-sm text-blue-800">
                  Przechowuj rozne wersje CV dopasowane do konkretnych stanowisk. To zwiekszy Twoje szanse na zatrudnienie!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
