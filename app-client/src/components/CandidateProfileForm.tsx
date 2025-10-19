"use client";
import { useState } from "react";
import { candidateService } from "@/services/candidateService";
import { 
  CandidateProfile, 
  CandidateProfileFormData, 
  Experience, 
  Skill, 
  Education,
  SKILL_LEVELS
} from "@/types/candidate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CandidateProfileFormProps {
  profile: CandidateProfile;
  onSuccess: (updatedProfile: CandidateProfile) => void;
  onCancel: () => void;
}

export function CandidateProfileForm({ profile, onSuccess, onCancel }: CandidateProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CandidateProfileFormData>({
    name: profile.name || "",
    lastName: profile.lastName || "",
    description: profile.description || "",
    birthday: profile.birthday ? profile.birthday.split('T')[0] : "",
    phoneNumber: profile.phoneNumber || undefined,
    place: profile.place || "",
    experience: profile.experience.length > 0 ? profile.experience : [
      { company: "", position: "", startDate: "", endDate: "", isCurrent: false, description: "", location: "" }
    ],
    skills: profile.skills.length > 0 ? profile.skills : [
      { name: "", level: "BEGINNER" }
    ],
    education: profile.education.length > 0 ? profile.education : [
      { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", isCurrent: false, description: "", location: "" }
    ]
  });

  const updateBasicField = (field: keyof Omit<CandidateProfileFormData, 'experience' | 'skills' | 'education'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setFormData(prev => ({ ...prev, experience: updatedExperience }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { 
        company: "", 
        position: "", 
        startDate: "", 
        endDate: "", 
        isCurrent: false, 
        description: "", 
        location: "" 
      }]
    }));
  };

  const removeExperience = (index: number) => {
    if (formData.experience.length > 1) {
      setFormData(prev => ({
        ...prev,
        experience: prev.experience.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setFormData(prev => ({ ...prev, skills: updatedSkills }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: "", level: "BEGINNER" }]
    }));
  };

  const removeSkill = (index: number) => {
    if (formData.skills.length > 1) {
      setFormData(prev => ({
        ...prev,
        skills: prev.skills.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setFormData(prev => ({ ...prev, education: updatedEducation }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { 
        institution: "", 
        degree: "", 
        fieldOfStudy: "", 
        startDate: "", 
        endDate: "", 
        isCurrent: false, 
        description: "", 
        location: "" 
      }]
    }));
  };

  const removeEducation = (index: number) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);

      // Filtruj puste wpisy
      const filteredData = {
        ...formData,
        experience: formData.experience.filter(exp => exp.company && exp.position),
        skills: formData.skills.filter(skill => skill.name),
        education: formData.education.filter(edu => edu.institution && edu.degree)
      };

      const updatedProfile = await candidateService.updateProfile(filteredData);
      onSuccess(updatedProfile);
    } catch (err: any) {
      console.error('Błąd podczas aktualizacji profilu:', err);
      setError(err?.response?.data?.message || 'Błąd podczas aktualizacji profilu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Podstawowe informacje */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Podstawowe informacje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Imię</label>
            <Input
              value={formData.name}
              onChange={(e) => updateBasicField('name', e.target.value)}
              placeholder="Twoje imię"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nazwisko</label>
            <Input
              value={formData.lastName}
              onChange={(e) => updateBasicField('lastName', e.target.value)}
              placeholder="Twoje nazwisko"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Telefon</label>
            <Input
              value={formData.phoneNumber || ""}
              onChange={(e) => updateBasicField('phoneNumber', e.target.value ? parseInt(e.target.value) : undefined)}
              type="number"
              placeholder="123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Lokalizacja</label>
            <Input
              value={formData.place}
              onChange={(e) => updateBasicField('place', e.target.value)}
              placeholder="Miasto, województwo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Data urodzenia</label>
            <Input
              value={formData.birthday}
              onChange={(e) => updateBasicField('birthday', e.target.value)}
              type="date"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Opis</label>
          <textarea
            value={formData.description}
            onChange={(e) => updateBasicField('description', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Opowiedz o sobie, swoich zainteresowaniach i celach zawodowych..."
          />
        </div>
      </div>

      {/* Doświadczenie zawodowe */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Doświadczenie zawodowe</h2>
          <Button type="button" onClick={addExperience} className="transition-all duration-200 hover:scale-105">
            Dodaj doświadczenie
          </Button>
        </div>
        
        {formData.experience.map((exp, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Doświadczenie {index + 1}</h3>
              {formData.experience.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105"
                >
                  Usuń
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Firma *</label>
                <Input
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  placeholder="Nazwa firmy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stanowisko *</label>
                <Input
                  value={exp.position}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  placeholder="Twoje stanowisko"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data rozpoczęcia *</label>
                <Input
                  value={exp.startDate}
                  onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  type="month"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data zakończenia</label>
                <Input
                  value={exp.endDate || ""}
                  onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                  type="month"
                  disabled={exp.isCurrent}
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exp.isCurrent}
                    onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)}
                    className="mr-2"
                  />
                  Obecnie pracuję w tej firmie
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lokalizacja</label>
                <Input
                  value={exp.location || ""}
                  onChange={(e) => updateExperience(index, 'location', e.target.value)}
                  placeholder="Miasto, kraj"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Opis obowiązków</label>
                <textarea
                  value={exp.description || ""}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Opisz swoje główne obowiązki i osiągnięcia..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Umiejętności */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Umiejętności</h2>
          <Button type="button"  onClick={addSkill} className="transition-all duration-200 hover:scale-105">
            Dodaj umiejętność
          </Button>
        </div>
        
        {formData.skills.map((skill, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Umiejętność {index + 1}</h3>
              {formData.skills.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSkill(index)}
                  className="text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105"
                >
                  Usuń
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nazwa umiejętności *</label>
                <Input
                  value={skill.name}
                  onChange={(e) => updateSkill(index, 'name', e.target.value)}
                  placeholder="np. React, Python, Photoshop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Poziom *</label>
                <select
                  value={skill.level}
                  onChange={(e) => updateSkill(index, 'level', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {SKILL_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Wykształcenie */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Wykształcenie</h2>
          <Button type="button" onClick={addEducation} className="transition-all duration-200 hover:scale-105">
            Dodaj wykształcenie
          </Button>
        </div>
        
        {formData.education.map((edu, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Wykształcenie {index + 1}</h3>
              {formData.education.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105"
                >
                  Usuń
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Instytucja *</label>
                <Input
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  placeholder="Nazwa uczelni/szkoły"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stopień/Tytuł *</label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  placeholder="np. Licencjat, Magister, Technik"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kierunek studiów</label>
                <Input
                  value={edu.fieldOfStudy || ""}
                  onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                  placeholder="Nazwa kierunku"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lokalizacja</label>
                <Input
                  value={edu.location || ""}
                  onChange={(e) => updateEducation(index, 'location', e.target.value)}
                  placeholder="Miasto, kraj"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data rozpoczęcia *</label>
                <Input
                  value={edu.startDate}
                  onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                  type="month"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data zakończenia</label>
                <Input
                  value={edu.endDate || ""}
                  onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                  type="month"
                  disabled={edu.isCurrent}
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={edu.isCurrent}
                    onChange={(e) => updateEducation(index, 'isCurrent', e.target.checked)}
                    className="mr-2"
                  />
                  Obecnie studiuję/uczę się
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Opis</label>
                <textarea
                  value={edu.description || ""}
                  onChange={(e) => updateEducation(index, 'description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Opisz specjalizację, osiągnięcia, projekty..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Przyciski akcji */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="transition-all duration-200 hover:scale-105"
        >
          Anuluj
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="transition-all duration-200 hover:scale-105"
        >
          {isSubmitting ? "Zapisywanie..." : "Zapisz profil"}
        </Button>
      </div>
    </form>
  );
}
