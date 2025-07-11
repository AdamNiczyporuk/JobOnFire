'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  JOB_LEVELS, 
  WORKING_MODES, 
  WORKLOAD_OPTIONS, 
  ALL_POPULAR_TAGS,
  CONTRACT_TYPES,
  RESPONSIBILITY_TEMPLATES,
  REQUIREMENT_TEMPLATES
} from '@/constants/employer';
import { JobOffer, JobOfferCreateRequest, JobOfferUpdateRequest } from '@/types/jobOffer';

interface JobOfferFormProps {
  initialData?: JobOffer;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

export default function JobOfferForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing = false,
  isLoading = false 
}: JobOfferFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    jobLevel: [] as string[],
    contractType: '',
    salary: '',
    expireDate: '',
    workingMode: [] as string[],
    workload: '',
    responsibilities: [] as string[],
    requirements: [] as string[],
    whatWeOffer: [] as string[],
    applicationUrl: '',
    tags: [] as string[],
    lokalizationId: undefined as number | undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicjalizacja danych w trybie edycji
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        jobLevel: initialData.jobLevel || [],
        contractType: initialData.contractType || '',
        salary: initialData.salary || '',
        expireDate: initialData.expireDate ? initialData.expireDate.split('T')[0] : '',
        workingMode: initialData.workingMode || [],
        workload: initialData.workload || '',
        responsibilities: initialData.responsibilities || [],
        requirements: initialData.requirements || [],
        whatWeOffer: initialData.whatWeOffer || [],
        applicationUrl: initialData.applicationUrl || '',
        tags: initialData.tags || [],
        lokalizationId: initialData.lokalizationId
      });
    }
  }, [initialData, isEditing]);

  // Walidacja formularza
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nazwa oferty jest wymagana';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nazwa oferty musi mieć co najmniej 3 znaki';
    }

    if (!formData.expireDate) {
      newErrors.expireDate = 'Data wygaśnięcia jest wymagana';
    } else {
      const expireDate = new Date(formData.expireDate);
      if (expireDate <= new Date()) {
        newErrors.expireDate = 'Data wygaśnięcia musi być w przyszłości';
      }
    }

    if (formData.applicationUrl && !isValidUrl(formData.applicationUrl)) {
      newErrors.applicationUrl = 'Nieprawidłowy format URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Obsługa submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        expireDate: new Date(formData.expireDate).toISOString(),
        // Filtruj puste tablice
        jobLevel: formData.jobLevel.length > 0 ? formData.jobLevel : undefined,
        workingMode: formData.workingMode.length > 0 ? formData.workingMode : undefined,
        responsibilities: formData.responsibilities.filter(r => r.trim()).length > 0 
          ? formData.responsibilities.filter(r => r.trim()) : undefined,
        requirements: formData.requirements.filter(r => r.trim()).length > 0 
          ? formData.requirements.filter(r => r.trim()) : undefined,
        whatWeOffer: formData.whatWeOffer.filter(w => w.trim()).length > 0 
          ? formData.whatWeOffer.filter(w => w.trim()) : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Pomocnicze funkcje dla tagów/list
  const addToList = (listName: keyof typeof formData, value: string) => {
    if (value.trim() && Array.isArray(formData[listName])) {
      const currentList = formData[listName] as string[];
      if (!currentList.includes(value.trim())) {
        setFormData(prev => ({
          ...prev,
          [listName]: [...currentList, value.trim()]
        }));
      }
    }
  };

  const removeFromList = (listName: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [listName]: (prev[listName] as string[]).filter((_, i) => i !== index)
    }));
  };

  const addCustomToList = (listName: keyof typeof formData, value: string) => {
    if (value.trim()) {
      addToList(listName, value);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edytuj ofertę pracy' : 'Utwórz nową ofertę pracy'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Podstawowe informacje */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nazwa oferty *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="np. Senior Frontend Developer"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Data wygaśnięcia *
            </label>
            <Input
              type="date"
              value={formData.expireDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expireDate: e.target.value }))}
              className={errors.expireDate ? 'border-red-500' : ''}
            />
            {errors.expireDate && <p className="text-red-500 text-sm mt-1">{errors.expireDate}</p>}
          </div>
        </div>

        {/* Opis */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Opis oferty
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Krótki opis oferty pracy..."
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
          />
        </div>

        {/* Podstawowe dane oferty */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Typ umowy
            </label>
            <select
              value={formData.contractType}
              onChange={(e) => setFormData(prev => ({ ...prev, contractType: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Wybierz typ umowy</option>
              {CONTRACT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Wynagrodzenie
            </label>
            <Input
              value={formData.salary}
              onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
              placeholder="np. 10000 - 15000 PLN"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Wymiar pracy
            </label>
            <select
              value={formData.workload}
              onChange={(e) => setFormData(prev => ({ ...prev, workload: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Wybierz wymiar pracy</option>
              {WORKLOAD_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* URL aplikacji */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Link do aplikacji
          </label>
          <Input
            value={formData.applicationUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, applicationUrl: e.target.value }))}
            placeholder="https://example.com/apply"
            className={errors.applicationUrl ? 'border-red-500' : ''}
          />
          {errors.applicationUrl && <p className="text-red-500 text-sm mt-1">{errors.applicationUrl}</p>}
        </div>

        {/* Przyciski */}
        <div className="flex gap-4 pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            {isLoading ? 'Zapisywanie...' : (isEditing ? 'Zapisz zmiany' : 'Utwórz ofertę')}
          </Button>
          
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="px-6 py-2"
          >
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  );
}
