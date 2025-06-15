"use client";
import { useAuth } from "@/context/authContext";

export default function CandidateDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-8 text-center">Musisz być zalogowany, aby zobaczyć ten panel.</div>;
  }

  if (user.role !== "CANDIDATE") {
    return <div className="p-8 text-center text-red-500">Brak dostępu do panelu kandydata.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Panel Kandydata</h1>
      <p className="mb-4">Witaj, <span className="font-semibold">{user.username}</span>!</p>
      {/* Tu możesz dodać np. listę aplikacji, CV, powiadomienia itp. */}
      <div className="bg-white rounded shadow p-4">
        <p>To jest Twój dashboard. Wkrótce pojawią się tu Twoje aplikacje i powiadomienia.</p>
      </div>
    </div>
  );
}