"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { candidateService } from "@/services/candidateService";
import { CandidateProfile } from "@/types/candidate";
import { Button } from "@/components/ui/button";
import { CandidateProfileForm } from "@/components/CandidateProfileForm";

export default function CandidateProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    loadProfile();
    // open edit mode if ?edit=1 is present
    const editParam = searchParams.get("edit");
    if (editParam === "1") {
      setIsEditing(true);
    }
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profileData = await candidateService.getProfile();
      setProfile(profileData);
    } catch (err: any) {
      console.error('Błąd podczas ładowania profilu:', err);
      setError(err?.response?.data?.message || 'Błąd podczas ładowania profilu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile: CandidateProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadProfile} variant="outline" className="transition-all duration-200 hover:scale-105">
              Spróbuj ponownie
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-600 mb-4">Profil nie został znaleziony</p>
            <Button onClick={loadProfile} variant="outline" className="transition-all duration-200 hover:scale-105">
              Odśwież
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Mój Profil</h1>
              <p className="text-gray-600">
                Zarządzaj swoimi danymi osobowymi i zawodowymi
              </p>
            </div>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              className="transition-all duration-200 hover:scale-105"
            >
              {isEditing ? "Anuluj" : "Edytuj profil"}
            </Button>
          </div>
        </div>

      {isEditing ? (
        <CandidateProfileForm
          profile={profile}
          onSuccess={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lewa kolumna - Podstawowe informacje i Umiejętności */}
          <div className="lg:col-span-1 space-y-6">
            {/* Podstawowe informacje */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Podstawowe informacje</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Imię i nazwisko</label>
                  <p className="text-gray-900 text-lg">
                    {profile.name && profile.lastName 
                      ? `${profile.name} ${profile.lastName}` 
                      : profile.name || profile.lastName || "Nie podano"
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{profile.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefon</label>
                  <p className="text-gray-900">{profile.phoneNumber || "Nie podano"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Lokalizacja</label>
                  <p className="text-gray-900">{profile.place || "Nie podano"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data urodzenia</label>
                  <p className="text-gray-900">
                    {profile.birthday ? new Date(profile.birthday).toLocaleDateString('pl-PL') : "Nie podano"}
                  </p>
                </div>
                {profile.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Opis</label>
                    <p className="text-gray-900 mt-1 leading-relaxed">{profile.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Umiejętności */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Umiejętności</h2>
              {profile.skills.length > 0 ? (
                <div className="space-y-3">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{skill.name}</span>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        {skill.level === 'BEGINNER' && 'Początkujący'}
                        {skill.level === 'INTERMEDIATE' && 'Średniozaawansowany'}
                        {skill.level === 'ADVANCED' && 'Zaawansowany'}
                        {skill.level === 'EXPERT' && 'Ekspert'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Brak dodanych umiejętności</p>
              )}
            </div>

            {/* Linki do profili */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Linki do profili</h2>
              {profile.profileLinks && profile.profileLinks.length > 0 ? (
                <ul className="space-y-3">
                  {profile.profileLinks.map((link) => {
                    const nameLower = (link.name || '').toLowerCase();
                    const isLinkedIn = nameLower.includes('linkedin');
                    const isGitHub = nameLower.includes('github');
                    return (
                      <li key={link.id} className="flex items-center justify-between">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          {/* Ikony inline (bez dodatkowych zależności) */}
                          <span className="inline-flex h-5 w-5 items-center justify-center">
                            {isLinkedIn ? (
                              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7 0h3.8v2.2h.05c.53-1 1.82-2.2 3.75-2.2 4.01 0 4.75 2.64 4.75 6.07V24h-4v-7.16c0-1.7-.03-3.88-2.36-3.88-2.36 0-2.72 1.84-2.72 3.75V24h-4V8z" />
                              </svg>
                            ) : isGitHub ? (
                              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                <path fillRule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.52 1.05 1.52 1.05.9 1.56 2.36 1.11 2.94.85.09-.67.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0112 6.84c.85 0 1.7.12 2.5.35 1.9-1.32 2.74-1.05 2.74-1.05.56 1.42.21 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.04 10.04 0 0022 12.26C22 6.58 17.52 2 12 2z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                <path d="M10.9 2.1c.7-.3 1.5-.3 2.2 0l6.7 2.8c.6.3 1.1.8 1.4 1.4l2.8 6.7c.3.7.3 1.5 0 2.2l-2.8 6.7c-.3.6-.8 1.1-1.4 1.4l-6.7 2.8c-.7.3-1.5.3-2.2 0l-6.7-2.8c-.6-.3-1.1-.8-1.4-1.4L.1 15.2c-.3-.7-.3-1.5 0-2.2l2.8-6.7c.3-.6.8-1.1 1.4-1.4l6.6-2.8zM12 8a4 4 0 100 8 4 4 0 000-8z" />
                              </svg>
                            )}
                          </span>
                          <span className="font-medium group-hover:underline underline-offset-4">{link.name}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">Brak dodanych linków</p>
              )}
            </div>
          </div>

          {/* Prawa kolumna - Doświadczenie i Wykształcenie */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doświadczenie zawodowe */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Doświadczenie zawodowe</h2>
              {profile.experience.length > 0 ? (
                <div className="space-y-6">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="relative pl-6 pb-6 border-l-2 border-red-200 last:pb-0">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 bg-red-500 rounded-full"></div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{exp.position}</h3>
                        <p className="text-red-600 font-medium mb-2">{exp.company}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            📅 {exp.startDate} - {exp.isCurrent ? "obecnie" : exp.endDate || "nie podano"}
                          </span>
                          {exp.location && (
                            <span className="flex items-center">
                              📍 {exp.location}
                            </span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Brak dodanego doświadczenia zawodowego</p>
              )}
            </div>

            {/* Wykształcenie */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Wykształcenie</h2>
              {profile.education.length > 0 ? (
                <div className="space-y-6">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="relative pl-6 pb-6 border-l-2 border-green-200 last:pb-0">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 bg-green-500 rounded-full"></div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{edu.degree}</h3>
                        <p className="text-green-600 font-medium mb-2">{edu.institution}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-gray-700 font-medium mb-2">{edu.fieldOfStudy}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            📅 {edu.startDate} - {edu.isCurrent ? "obecnie" : edu.endDate || "nie podano"}
                          </span>
                          {edu.location && (
                            <span className="flex items-center">
                              📍 {edu.location}
                            </span>
                          )}
                        </div>
                        {edu.description && (
                          <p className="text-gray-700 leading-relaxed">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Brak dodanego wykształcenia</p>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
