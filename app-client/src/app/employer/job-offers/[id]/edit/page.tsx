"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import JobOfferForm from "@/components/JobOfferForm";
import { getJobOffer, updateJobOffer } from "@/services/jobOfferService";
import { JobOffer, JobOfferUpdateRequest } from "@/types/jobOffer";

export default function EmployerJobOfferEditPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string | undefined;
  const jobOfferId = idParam ? parseInt(idParam) : NaN;

  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isNaN(jobOfferId)) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobOfferId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getJobOffer(jobOfferId);
      setJobOffer(data);
    } catch (e) {
      console.error("Error loading job offer", e);
      setError("Nie udało się pobrać oferty");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (form: JobOfferUpdateRequest) => {
    if (Number.isNaN(jobOfferId)) return;
    setSaving(true);
    try {
      const updated = await updateJobOffer(jobOfferId, form);
      router.push(`/employer/job-offers/${jobOfferId}`);
      return updated;
    } catch (e) {
      console.error("Error updating job offer", e);
      setError("Nie udało się zapisać zmian");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <main className="flex-1 w-full">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Ładowanie oferty...</p>
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
            <h1 className="text-2xl font-bold mb-6">Edytuj ofertę</h1>
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchData}>Spróbuj ponownie</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edytuj ofertę pracy</h1>
      </div>

      <JobOfferForm
        initialData={jobOffer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditing={true}
        isLoading={saving}
      />
      </div>
    </div>
  );
}
