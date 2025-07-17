"use client";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    loadProfile();
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
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProfile} variant="outline">
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-600 mb-4">Profil nie został znaleziony</p>
          <Button onClick={loadProfile} variant="outline">
            Odśwież
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mój Profil</h1>
            <p className="text-gray-600">
              Zarządzaj swoimi danymi osobowymi i zawodowymi
            </p>
          </div>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
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
        <div className="space-y-8">
          {/* Podstawowe informacje */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Podstawowe informacje</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Imię</label>
                <p className="text-gray-900">{profile.name || "Nie podano"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nazwisko</label>
                <p className="text-gray-900">{profile.lastName || "Nie podano"}</p>
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
            </div>
            {profile.description && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Opis</label>
                <p className="text-gray-900 mt-1">{profile.description}</p>
              </div>
            )}
          </div>

          {/* Doświadczenie zawodowe */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Doświadczenie zawodowe</h2>
            {profile.experience.length > 0 ? (
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-blue-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {exp.startDate} - {exp.isCurrent ? "obecnie" : exp.endDate || "nie podano"}
                    </p>
                    {exp.location && (
                      <p className="text-sm text-gray-500">{exp.location}</p>
                    )}
                    {exp.description && (
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Brak dodanego doświadczenia zawodowego</p>
            )}
          </div>

          {/* Umiejętności */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Umiejętności</h2>
            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <div 
                    key={index} 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill.name} ({skill.level})
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Brak dodanych umiejętności</p>
            )}
          </div>

          {/* Wykształcenie */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Wykształcenie</h2>
            {profile.education.length > 0 ? (
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-green-600">{edu.institution}</p>
                    {edu.fieldOfStudy && (
                      <p className="text-gray-700">{edu.fieldOfStudy}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {edu.startDate} - {edu.isCurrent ? "obecnie" : edu.endDate || "nie podano"}
                    </p>
                    {edu.location && (
                      <p className="text-sm text-gray-500">{edu.location}</p>
                    )}
                    {edu.description && (
                      <p className="text-gray-700 mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Brak dodanego wykształcenia</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
