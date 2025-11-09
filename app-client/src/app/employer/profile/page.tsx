"use client";
import { useAuth } from "@/context/authContext";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getEmployerProfile, updateEmployerProfile, addEmployerProfileLocation, removeEmployerProfileLocation, uploadCompanyLogo } from "@/services/employerService";
import { EmployerProfile, EmployerProfileUpdateRequest, EmployerProfileAddress } from "@/types/employer";
import { COMPANY_LOGOS, CONTRACT_TYPES, POPULAR_INDUSTRIES, POPULAR_BENEFITS } from "@/constants/employer";
import { Building, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadProfile();
    // Włącz tryb edycji, jeśli w URL jest parametr ?edit=1/true
    const editParam = searchParams.get("edit");
    if (editParam && (editParam === "1" || editParam.toLowerCase() === "true")) {
      setEditing(true);
    }
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Walidacja typu pliku
    if (!file.type.startsWith('image/')) {
      addToast({
        title: "Błąd",
        description: "Proszę wybrać plik obrazu (JPG, PNG, GIF)",
        type: "error",
        duration: 5000
      });
      return;
    }

    // Walidacja rozmiaru pliku (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      addToast({
        title: "Błąd",
        description: "Rozmiar pliku nie może przekraczać 3MB",
        type: "error",
        duration: 5000
      });
      return;
    }

    try {
      setUploadingLogo(true);
      const logoUrl = await uploadCompanyLogo(file);
      setFormData({
        ...formData,
        companyImageUrl: logoUrl
      });
      addToast({
        title: "Sukces!",
        description: "Logo firmy zostało przesłane pomyślnie",
        type: "success",
        duration: 5000
      });
    } catch (error) {
      console.error("Błąd podczas przesyłania logo:", error);
      addToast({
        title: "Błąd",
        description: "Nie udało się przesłać logo",
        type: "error",
        duration: 5000
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.companyName || formData.companyName.trim().length === 0) {
      errors.companyName = "Nazwa firmy jest wymagana";
    } else if (formData.companyName.trim().length < 2) {
      errors.companyName = "Nazwa firmy musi mieć minimum 2 znaki";
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = "Nieprawidłowy format adresu email";
    }

    if (formData.contactPhone && !/^[\d\s\+\-\(\)]+$/.test(formData.contactPhone)) {
      errors.contactPhone = "Nieprawidłowy format numeru telefonu";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Walidacja po stronie klienta
    if (!validateForm()) {
      addToast({
        title: "Błąd walidacji",
        description: "Proszę poprawić błędy w formularzu",
        type: "error",
        duration: 5000
      });
      return;
    }

    try {
      console.log("Wysyłane dane profilu:", formData);
      await updateEmployerProfile(formData);
      await loadProfile();
      setEditing(false);
      setValidationErrors({});
      addToast({
        title: "Sukces!",
        description: "Profil zaktualizowany pomyślnie!",
        type: "success",
        duration: 5000
      });
    } catch (error: any) {
      console.error("Błąd podczas aktualizacji profilu:", error);
      console.error("Szczegóły błędu:", error.response?.data);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join('\n');
        addToast({
          title: "Błąd walidacji",
          description: errorMessages,
          type: "error",
          duration: 7000
        });
      } else if (error.response?.data?.message) {
        addToast({
          title: "Błąd",
          description: error.response.data.message,
          type: "error",
          duration: 5000
        });
      } else {
        addToast({
          title: "Błąd",
          description: "Błąd podczas aktualizacji profilu",
          type: "error",
          duration: 5000
        });
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
      addToast({
        title: "Sukces!",
        description: "Lokalizacja dodana pomyślnie!",
        type: "success",
        duration: 5000
      });
    } catch (error) {
      console.error("Błąd podczas dodawania lokalizacji:", error);
      addToast({
        title: "Błąd",
        description: "Błąd podczas dodawania lokalizacji",
        type: "error",
        duration: 5000
      });
    }
  };

  const handleRemoveLocation = async (lokalizationId: number) => {
    const confirmed = window.confirm("Czy na pewno chcesz usunąć tę lokalizację?");
    if (confirmed) {
      try {
        await removeEmployerProfileLocation(lokalizationId);
        await loadProfile();
        addToast({
          title: "Sukces!",
          description: "Lokalizacja usunięta pomyślnie!",
          type: "success",
          duration: 5000
        });
      } catch (error) {
        console.error("Błąd podczas usuwania lokalizacji:", error);
        addToast({
          title: "Błąd",
          description: "Błąd podczas usuwania lokalizacji",
          type: "error",
          duration: 5000
        });
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
      <div className="mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót
        </Button>
        <h1 className="text-3xl font-bold">Profil pracodawcy</h1>
      </div>
      
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
                <label className="block text-sm font-medium mb-1">
                  Nazwa firmy <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({...formData, companyName: e.target.value});
                    if (validationErrors.companyName) {
                      setValidationErrors({...validationErrors, companyName: ''});
                    }
                  }}
                  className={`w-full border rounded px-3 py-2 transition-colors ${
                    validationErrors.companyName 
                      ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                  required
                />
                {validationErrors.companyName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.companyName}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Logo firmy</label>
                <div className="flex items-center gap-4 mt-2">
                  {formData.companyImageUrl && (
                    <div className="relative">
                      <img 
                        src={formData.companyImageUrl} 
                        alt="Logo firmy" 
                        className="w-24 h-24 object-contain border-2 border-gray-300 rounded p-2"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyOEgzNlYzNkgyOFYyOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="logoUpload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />
                    <Button
                      type="button"
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => document.getElementById('logoUpload')?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? 'Przesyłanie...' : 'Prześlij logo'}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Prześlij logo swojej firmy (max 3MB, formaty: JPG, PNG, GIF)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Branże</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="Dodaj branżę..."
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
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
                  placeholder="Opisz swoją firmę, jej misję i wartości..."
                  className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description?.length || 0} znaków
                </p>
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
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
                  onChange={(e) => {
                    setFormData({...formData, contactPhone: e.target.value});
                    if (validationErrors.contactPhone) {
                      setValidationErrors({...validationErrors, contactPhone: ''});
                    }
                  }}
                  placeholder="np. +48 123 456 789"
                  className={`w-full border rounded px-3 py-2 transition-colors ${
                    validationErrors.contactPhone 
                      ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
                {validationErrors.contactPhone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.contactPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email kontaktowy</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => {
                    setFormData({...formData, contactEmail: e.target.value});
                    if (validationErrors.contactEmail) {
                      setValidationErrors({...validationErrors, contactEmail: ''});
                    }
                  }}
                  placeholder="np. kontakt@firma.pl"
                  className={`w-full border rounded px-3 py-2 transition-colors ${
                    validationErrors.contactEmail 
                      ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
                {validationErrors.contactEmail && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.contactEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Benefity</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Dodaj benefit..."
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
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
  <div id="locations" className="bg-white rounded shadow p-6">
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
          <form onSubmit={handleAddLocation} className="mb-4 p-6 border-2 border-primary/20 rounded-lg bg-gradient-to-br from-white to-red-50/30 space-y-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Miasto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newLocation.city}
                  onChange={(e) => setNewLocation({...newLocation, city: e.target.value})}
                  placeholder="np. Warszawa"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Województwo</label>
                <input
                  type="text"
                  value={newLocation.state}
                  onChange={(e) => setNewLocation({...newLocation, state: e.target.value})}
                  placeholder="np. Mazowieckie"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ulica</label>
                <input
                  type="text"
                  value={newLocation.street}
                  onChange={(e) => setNewLocation({...newLocation, street: e.target.value})}
                  placeholder="np. Nowa 10"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kod pocztowy</label>
                <input
                  type="text"
                  value={newLocation.postalCode}
                  onChange={(e) => setNewLocation({...newLocation, postalCode: e.target.value})}
                  placeholder="np. 00-001"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Szerokość geograficzna
                  <span className="text-xs text-gray-500 ml-1">(opcjonalnie)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={newLocation.latitude || ""}
                  onChange={(e) => setNewLocation({...newLocation, latitude: e.target.value ? Number(e.target.value) : undefined})}
                  placeholder="np. 52.2297"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Długość geograficzna
                  <span className="text-xs text-gray-500 ml-1">(opcjonalnie)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={newLocation.longtitude || ""}
                  onChange={(e) => setNewLocation({...newLocation, longtitude: e.target.value ? Number(e.target.value) : undefined})}
                  placeholder="np. 21.0122"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="transition-all duration-200 hover:scale-105"
              >
                Dodaj lokalizację
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddingLocation(false)}
                className="transition-all duration-200 hover:scale-105"
              >
                Anuluj
              </Button>
            </div>
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
                  <span className="text-xl font-bold text-red-900">×</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
