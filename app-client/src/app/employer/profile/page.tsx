"use client";
import { useAuth } from "@/context/authContext";
import { useEffect, useState } from "react";
import { getEmployerProfile, updateEmployerProfile, addEmployerProfileLocation, removeEmployerProfileLocation } from "@/services/employerService";
import { EmployerProfile, EmployerProfileUpdateRequest, EmployerProfileAddress } from "@/types/employer";
import { COMPANY_LOGOS, CONTRACT_TYPES, POPULAR_INDUSTRIES, POPULAR_BENEFITS } from "@/constants/employer";
import { Building } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState<EmployerProfileUpdateRequest>({
    companyName: "",
    companyImageUrl: "",
    industry: [],
    description: "",
    contractType: [],
    contactPhone: "",
    contactEmail: "",
    benefits: []
  });
  const [newIndustry, setNewIndustry] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [newLocation, setNewLocation] = useState<EmployerProfileAddress>({
    city: "",
    state: "",
    street: "",
    postalCode: "",
    latitude: undefined,
    longtitude: undefined
  });
  const [addingLocation, setAddingLocation] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await getEmployerProfile();
      setProfile(profileData);
      setFormData({
        companyName: profileData.companyName,
        companyImageUrl: profileData.companyImageUrl || "",
        industry: profileData.industry || [],
        description: profileData.description || "",
        contractType: profileData.contractType || [],
        contactPhone: profileData.contactPhone || "",
        contactEmail: profileData.contactEmail || "",
        benefits: profileData.benefits || []
      });
    } catch (error) {
      console.error("Błąd podczas ładowania profilu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIndustry = () => {
    if (newIndustry.trim() && !formData.industry?.includes(newIndustry.trim())) {
      setFormData({
        ...formData, 
        industry: [...(formData.industry || []), newIndustry.trim()]
      });
      setNewIndustry("");
    }
  };

  const handleRemoveIndustry = (industryToRemove: string) => {
    setFormData({
      ...formData,
      industry: formData.industry?.filter(industry => industry !== industryToRemove) || []
    });
  };

  const handleAddContractType = (contractType: string) => {
    if (!formData.contractType?.includes(contractType)) {
      setFormData({
        ...formData,
        contractType: [...(formData.contractType || []), contractType]
      });
    }
  };

  const handleRemoveContractType = (contractTypeToRemove: string) => {
    setFormData({
      ...formData,
      contractType: formData.contractType?.filter(type => type !== contractTypeToRemove) || []
    });
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim() && !formData.benefits?.includes(newBenefit.trim())) {
      setFormData({
        ...formData,
        benefits: [...(formData.benefits || []), newBenefit.trim()]
      });
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (benefitToRemove: string) => {
    setFormData({
      ...formData,
      benefits: formData.benefits?.filter(benefit => benefit !== benefitToRemove) || []
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Wysyłane dane profilu:", formData);
      await updateEmployerProfile(formData);
      await loadProfile();
      setEditing(false);
      alert("Profil zaktualizowany pomyślnie!");
    } catch (error: any) {
      console.error("Błąd podczas aktualizacji profilu:", error);
      console.error("Szczegóły błędu:", error.response?.data);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join('\n');
        alert(`Błąd walidacji:\n${errorMessages}`);
      } else if (error.response?.data?.message) {
        alert(`Błąd: ${error.response.data.message}`);
      } else {
        alert("Błąd podczas aktualizacji profilu");
      }
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEmployerProfileLocation(newLocation);
      await loadProfile();
      setNewLocation({
        city: "",
        state: "",
        street: "",
        postalCode: "",
        latitude: undefined,
        longtitude: undefined
      });
      setAddingLocation(false);
      alert("Lokalizacja dodana pomyślnie!");
    } catch (error) {
      console.error("Błąd podczas dodawania lokalizacji:", error);
      alert("Błąd podczas dodawania lokalizacji");
    }
  };

  const handleRemoveLocation = async (lokalizationId: number) => {
    if (confirm("Czy na pewno chcesz usunąć tę lokalizację?")) {
      try {
        await removeEmployerProfileLocation(lokalizationId);
        await loadProfile();
        alert("Lokalizacja usunięta pomyślnie!");
      } catch (error) {
        console.error("Błąd podczas usuwania lokalizacji:", error);
        alert("Błąd podczas usuwania lokalizacji");
      }
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Musisz być zalogowany, aby zobaczyć profil.</div>;
  }

  if (user.role !== "EMPLOYER") {
    return <div className="p-8 text-center text-red-500">Brak dostępu do profilu pracodawcy.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center">Ładowanie profilu...</div>;
  }

  return (
    <div className="w-[70%] mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Profil pracodawcy</h1>
      
      {profile && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Dane firmy</h2>
            <Button
              onClick={() => setEditing(!editing)}
              className="transition-all duration-200 hover:scale-105"
            >
              {editing ? "Anuluj" : "Edytuj profil"}
            </Button>
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nazwa firmy *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Logo firmy</label>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {COMPANY_LOGOS.map((logo) => (
                    <div key={logo.id} className="text-center">
                      <div
                        className={`cursor-pointer border-2 rounded p-2 ${
                          formData.companyImageUrl === logo.url 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setFormData({...formData, companyImageUrl: logo.url})}
                      >
                        <img 
                          src={logo.url} 
                          alt={logo.name} 
                          className="w-16 h-16 mx-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyOEgzNlYzNkgyOFYyOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-gray-600">{logo.name}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Wybierz jedno z dostępnych logo dla swojej firmy</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Branże</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="Dodaj branżę..."
                    className="flex-1 border rounded px-3 py-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIndustry();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddIndustry}
                    variant="outline"
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Dodaj
                  </Button>
                </div>
                
                {/* Dropdown z popularnymi branżami */}
                {POPULAR_INDUSTRIES.filter(industry => !formData.industry?.includes(industry)).length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">Popularne branże:</p>
                    <div className="flex flex-wrap gap-1">
                      {POPULAR_INDUSTRIES.filter(industry => !formData.industry?.includes(industry)).map(industry => (
                        <button
                          key={industry}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              industry: [...(formData.industry || []), industry]
                            });
                          }}
                          className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                        >
                          + {industry}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {formData.industry?.map((industry, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {industry}
                      <button
                        type="button"
                        onClick={() => handleRemoveIndustry(industry)}
                        className="text-red-500 hover:text-red-700 text-lg leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {formData.industry?.length === 0 && (
                  <p className="text-gray-500 text-sm mt-2">Brak dodanych branży</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Opis firmy</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded px-3 py-2 h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Typy umów</label>
                <div className="mb-2">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddContractType(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Wybierz typ umowy...</option>
                    {CONTRACT_TYPES.filter(type => !formData.contractType?.includes(type)).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.contractType?.map((type, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => handleRemoveContractType(type)}
                        className="text-red-500 hover:text-red-700 text-lg leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {formData.contractType?.length === 0 && (
                  <p className="text-gray-500 text-sm mt-2">Brak wybranych typów umów</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefon kontaktowy</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email kontaktowy</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Benefity</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Dodaj benefit..."
                    className="flex-1 border rounded px-3 py-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddBenefit}
                    variant="outline"
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Dodaj
                  </Button>
                </div>
                
                {/* Dropdown z popularnymi benefitami */}
                {POPULAR_BENEFITS.filter(benefit => !formData.benefits?.includes(benefit)).length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">Popularne benefity:</p>
                    <div className="flex flex-wrap gap-1">
                      {POPULAR_BENEFITS.filter(benefit => !formData.benefits?.includes(benefit)).map(benefit => (
                        <button
                          key={benefit}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              benefits: [...(formData.benefits || []), benefit]
                            });
                          }}
                          className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                        >
                          + {benefit}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {formData.benefits?.map((benefit, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(benefit)}
                        className="text-red-500 hover:text-red-700 text-lg leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {formData.benefits?.length === 0 && (
                  <p className="text-gray-500 text-sm mt-2">Brak wybranych benefitów</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="transition-all duration-200 hover:scale-105"
                >
                  Zapisz zmiany
                </Button>
                <Button
                  type="button"
                  onClick={() => setEditing(false)}
                  variant="outline"
                  className="transition-all duration-200 hover:scale-105"
                >
                  Anuluj
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Sekcja podstawowych informacji */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Informacje podstawowe</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-24">Nazwa:</span>
                      <span className="text-gray-900 font-medium">{profile.companyName}</span>
                    </div>
                    {profile.contactPhone && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 w-24">Telefon:</span>
                        <span className="text-gray-900">{profile.contactPhone}</span>
                      </div>
                    )}
                    {profile.contactEmail && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 w-24">Email:</span>
                        <span className="text-gray-900">{profile.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo firmy */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Logo firmy</h3>
                  <div className="flex justify-center md:justify-start">
                    {profile.companyImageUrl ? (
                      <img 
                        src={profile.companyImageUrl} 
                        alt="Logo firmy" 
                        className="h-20 w-20 object-contain border border-gray-200 rounded-lg p-2"
                      />
                    ) : (
                      <div className="h-20 w-20 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Building className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Opis firmy */}
              {profile.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Opis firmy</h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {profile.description}
                  </p>
                </div>
              )}

              {/* Branże */}
              {profile.industry && profile.industry.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Branże</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.industry.map((industry, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Typy umów */}
              {profile.contractType && profile.contractType.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Typy umów</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.contractType.map((type, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefity */}
              {profile.benefits && profile.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Benefity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {profile.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Komunikaty o braku danych */}
              {(!profile.industry || profile.industry.length === 0) &&
               (!profile.contractType || profile.contractType.length === 0) &&
               (!profile.benefits || profile.benefits.length === 0) &&
               !profile.description && (
                <div className="text-center py-8">
                  <p className="text-gray-500 italic">
                    Profil wymaga uzupełnienia. Kliknij "Edytuj profil" aby dodać informacje o firmie.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sekcja lokalizacji */}
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Lokalizacje firmy</h3>
          
          <Button
            onClick={() => setAddingLocation(!addingLocation)}
            className="transition-all duration-200 hover:scale-105"
          >
            {addingLocation ? "Anuluj" : "Dodaj lokalizację"}
          </Button>
        </div>

        {addingLocation && (
          <form onSubmit={handleAddLocation} className="mb-4 p-4 border rounded space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Miasto</label>
                <input
                  type="text"
                  value={newLocation.city}
                  onChange={(e) => setNewLocation({...newLocation, city: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Województwo</label>
                <input
                  type="text"
                  value={newLocation.state}
                  onChange={(e) => setNewLocation({...newLocation, state: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ulica</label>
                <input
                  type="text"
                  value={newLocation.street}
                  onChange={(e) => setNewLocation({...newLocation, street: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kod pocztowy</label>
                <input
                  type="text"
                  value={newLocation.postalCode}
                  onChange={(e) => setNewLocation({...newLocation, postalCode: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Szerokość geograficzna</label>
                <input
                  type="number"
                  step="any"
                  value={newLocation.latitude || ""}
                  onChange={(e) => setNewLocation({...newLocation, latitude: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Długość geograficzna</label>
                <input
                  type="number"
                  step="any"
                  value={newLocation.longtitude || ""}
                  onChange={(e) => setNewLocation({...newLocation, longtitude: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="transition-all duration-200 hover:scale-105"
            >
              Dodaj lokalizację
            </Button>
          </form>
        )}

        <div className="space-y-2">
          {profile?.lokalizations?.length === 0 ? (
            <p className="text-gray-500">Brak dodanych lokalizacji</p>
          ) : (
            profile?.lokalizations?.map((l) => (
              <div key={l.lokalization.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">
                    {l.lokalization.city || "Brak miasta"}, {l.lokalization.state || "Brak województwa"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {l.lokalization.street || "Brak ulicy"}, {l.lokalization.postalCode || "Brak kodu"}
                  </div>
                  {(l.lokalization.latitude || l.lokalization.longtitude) && (
                    <div className="text-xs text-gray-500">
                      Współrzędne: {l.lokalization.latitude}, {l.lokalization.longtitude}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleRemoveLocation(l.lokalization.id)}
                  variant="destructive"
                  size="sm"
                  className="transition-all duration-200 hover:scale-105"
                >
                  Usuń
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
