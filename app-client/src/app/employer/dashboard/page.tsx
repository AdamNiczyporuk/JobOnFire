"use client";
import { useAuth } from "@/context/authContext";

export default function EmployerDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Panel Pracodawcy</h1>
      <p className="mb-4">Witaj, <span className="font-semibold">{user?.username}</span>!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Twoje oferty pracy</h2>
          <p className="text-gray-600 mb-4">Zarządzaj swoimi ofertami pracy</p>
          <a href="/employer/job-offers" className="text-red-600 hover:text-red-700 font-medium">
            Zobacz oferty →
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profil firmy</h2>
          <p className="text-gray-600 mb-4">Edytuj informacje o swojej firmie</p>
          <a href="/employer/profile" className="text-red-600 hover:text-red-700 font-medium">
            Edytuj profil →
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Aplikacje</h2>
          <p className="text-gray-600 mb-4">Przeglądaj aplikacje kandydatów</p>
          <span className="text-gray-400">Wkrótce dostępne</span>
        </div>
      </div>
    </div>
  );
}