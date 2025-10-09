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
            <Button onClick={loadProfile} variant="outline">
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
            <Button onClick={loadProfile} variant="outline">
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
              variant={isEditing ? "outline" : "default"}
              size="lg"
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
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
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
          </div>

          {/* Prawa kolumna - Doświadczenie i Wykształcenie */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doświadczenie zawodowe */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Doświadczenie zawodowe</h2>
              {profile.experience.length > 0 ? (
                <div className="space-y-6">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="relative pl-6 pb-6 border-l-2 border-blue-200 last:pb-0">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{exp.position}</h3>
                        <p className="text-blue-600 font-medium mb-2">{exp.company}</p>
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
