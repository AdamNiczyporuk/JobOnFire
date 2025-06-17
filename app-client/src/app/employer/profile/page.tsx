"use client";
import { useEffect, useState } from "react";
import { getEmployerProfile } from "@/services/employerService";
import { EmployerProfile } from "@/types/employer";

export default function EmployerProfilePage() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEmployerProfile()
      .then(setProfile)
      .catch(() => setError("Nie udało się pobrać profilu pracodawcy."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Ładowanie profilu...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Brak danych profilu.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Profil pracodawcy</h1>
      <div className="mb-2"><b>Nazwa firmy:</b> {profile.companyName}</div>
      {profile.companyImageUrl && (
        <div className="mb-2">
          <img src={profile.companyImageUrl} alt="Logo firmy" className="h-20" />
        </div>
      )}
      <div className="mb-2"><b>Branże:</b> {profile.industry?.join(", ") || "-"}</div>
      <div className="mb-2"><b>Opis:</b> {profile.description || "-"}</div>
      <div className="mb-2"><b>Typy umów:</b> {profile.contractType?.join(", ") || "-"}</div>
      <div className="mb-2"><b>Telefon kontaktowy:</b> {profile.contactPhone || "-"}</div>
      <div className="mb-2"><b>Email kontaktowy:</b> {profile.contactEmail || "-"}</div>
      <div className="mb-2"><b>Benefity:</b> {profile.benefits?.join(", ") || "-"}</div>
      <div className="mb-2">
        <b>Lokalizacje:</b>
        {profile.lokalizations.length === 0 ? (
          <span> brak</span>
        ) : (
          <ul className="list-disc ml-6">
            {profile.lokalizations.map((l) => (
              <li key={l.lokalization.id}>
                {l.lokalization.city || "-"}, {l.lokalization.street || "-"}, {l.lokalization.postalCode || "-"}, {l.lokalization.state || "-"} 
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
