"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { externalJobOfferService } from "@/services/externalJobOfferService";
import {
  ExternalJobOffer,
  ExternalJobOfferCreateRequest,
  ExternalJobOfferUpdateRequest,
} from "@/types/externalJobOffer";

type ViewMode = "list" | "create" | "edit";

export default function SavedJobsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [items, setItems] = useState<ExternalJobOffer[]>([]);
  const [selected, setSelected] = useState<ExternalJobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null; name?: string }>(
    { show: false, id: null, name: undefined }
  );

  // Form state
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [site, setSite] = useState("");
  const [company, setCompany] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await externalJobOfferService.list();
      setItems(res.externalJobOffers || []);
      setError(null);
    } catch (e) {
      console.error("Error loading external job offers", e);
      setError("Nie udało się pobrać zapisanych ofert");
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (value: string) => {
    try {
      // Accept only http/https
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const resetForm = () => {
    setName("");
    setUrl("");
    setSite("");
    setCompany("");
    setFormError(null);
  };

  const startCreate = () => {
    resetForm();
    setSelected(null);
    setViewMode("create");
  };

  const startEdit = (item: ExternalJobOffer) => {
    setSelected(item);
    setName(item.name);
    setUrl(item.url);
    setSite(item.site || "");
    setCompany(item.company || "");
    setFormError(null);
    setViewMode("edit");
  };

  const cancelForm = () => {
    setSelected(null);
    resetForm();
    setViewMode("list");
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!name.trim()) {
      setFormError("Nazwa jest wymagana");
      return;
    }
    if (!url.trim() || !isValidUrl(url.trim())) {
      setFormError("Wprowadź poprawny adres URL (http/https)");
      return;
    }

    setSubmitting(true);
    try {
      if (viewMode === "create") {
        const payload: ExternalJobOfferCreateRequest = {
          name: name.trim(),
          url: url.trim(),
          site: site.trim() || undefined,
          company: company.trim() || undefined,
        };
        await externalJobOfferService.create(payload);
      } else if (viewMode === "edit" && selected) {
        const payload: ExternalJobOfferUpdateRequest = {
          name: name.trim(),
          url: url.trim(),
          site: site.trim() || null,
          company: company.trim() || null,
        };
        await externalJobOfferService.update(selected.id, payload);
      }
      await load();
      cancelForm();
    } catch (e) {
      console.error("Error saving external job offer", e);
      setFormError("Nie udało się zapisać oferty");
    } finally {
      setSubmitting(false);
    }
  };

  const askDelete = (item: ExternalJobOffer) => {
    setDeleteConfirm({ show: true, id: item.id, name: item.name });
  };

  const cancelDelete = () => setDeleteConfirm({ show: false, id: null, name: undefined });

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await externalJobOfferService.remove(deleteConfirm.id);
      await load();
    } catch (e) {
      console.error("Error deleting external job offer", e);
      // You could surface a toast; keep silent here to avoid intrusive UI
    } finally {
      cancelDelete();
    }
  };

  const empty = useMemo(() => items.length === 0, [items]);

  return (
    <div className="flex flex-col items-center">
      <main className="w-full">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Zapisane oferty (zewnętrzne)</h1>
              <p className="text-muted-foreground mt-2">
                Dodawaj linki do ofert pracy z zewnętrznych serwisów i zarządzaj nimi w jednym miejscu.
              </p>
            </div>
            {viewMode === "list" && (
              <Button onClick={startCreate} className="transition-all duration-200 hover:scale-105">
                Dodaj ofertę
              </Button>
            )}
          </div>

          {/* Error/Loading */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Ładowanie zapisanych ofert...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={load}>Spróbuj ponownie</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: list */}
              <div className="lg:col-span-2">
                {empty ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg mb-2">Brak zapisanych zewnętrznych ofert</p>
                    <Button onClick={startCreate} className="transition-all duration-200 hover:scale-105">
                      Dodaj pierwszą ofertę
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="border rounded-lg bg-white p-4 flex items-start justify-between">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold break-words">{item.name}</h3>
                          <div className="text-sm text-muted-foreground mt-1 break-words">
                            {item.company && <span className="mr-2">{item.company}</span>}
                            {item.site && <span className="mr-2">• {item.site}</span>}
                          </div>
                          <div className="mt-2">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-700 underline-offset-2 hover:underline"
                            >
                              Otwórz ofertę
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(item)}
                            className="transition-all duration-200 hover:scale-105"
                          >
                            Edytuj
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => askDelete(item)}
                            className="transition-all duration-200 hover:scale-105"
                          >
                            Usuń
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: form */}
              {(viewMode === "create" || viewMode === "edit") && (
                <div className="bg-white rounded-lg border p-6 h-fit">
                  <h2 className="text-xl font-semibold mb-4">
                    {viewMode === "create" ? "Dodaj ofertę" : "Edytuj ofertę"}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nazwa</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="np. Frontend Developer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL</label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="https://example.com/oferta"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Serwis</label>
                      <input
                        type="text"
                        value={site}
                        onChange={(e) => setSite(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="np. Pracuj.pl, No Fluff Jobs"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Firma</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="np. Foo Sp. z o.o."
                      />
                    </div>

                    {formError && <p className="text-sm text-red-600">{formError}</p>}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="transition-all duration-200 hover:scale-105"
                      >
                        {viewMode === "create" ? "Zapisz" : "Zaktualizuj"}
                      </Button>
                      <Button
                        onClick={cancelForm}
                        variant="outline"
                        className="transition-all duration-200 hover:scale-105"
                        disabled={submitting}
                      >
                        Anuluj
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal potwierdzenia usunięcia */}
      {deleteConfirm.show && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Usuń zapisaną ofertę
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Czy na pewno chcesz usunąć ofertę "{deleteConfirm.name}"? Ta akcja jest nieodwracalna.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button onClick={cancelDelete} variant="outline" className="transition-all duration-200 hover:scale-105">
                Anuluj
              </Button>
              <Button onClick={confirmDelete} variant="destructive" className="transition-all duration-200 hover:scale-105">
                Usuń
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

