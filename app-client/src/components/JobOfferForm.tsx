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
  REQUIREMENT_TEMPLATES,
  POPULAR_BENEFITS,
  POPULAR_TECH_TAGS,
  POPULAR_SOFT_TAGS
} from '@/constants/employer';
import { JobOffer, JobOfferCreateRequest, JobOfferUpdateRequest } from '@/types/jobOffer';
import { getAvailableLocalizations } from '@/services/jobOfferService';

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
  const [availableLocalizations, setAvailableLocalizations] = useState<any[]>([]);

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

  // Ładowanie dostępnych lokalizacji
  useEffect(() => {
    const loadLocalizations = async () => {
      try {
        const localizations = await getAvailableLocalizations();
        setAvailableLocalizations(localizations || []);
      } catch (error) {
        console.error('Error loading localizations:', error);
        setAvailableLocalizations([]);
      }
    };
    
    loadLocalizations();
  }, []);

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

    // Walidacja URL aplikacji
    if (formData.applicationUrl) {
      if (!isValidUrl(formData.applicationUrl)) {
        newErrors.applicationUrl = 'Nieprawidłowy format URL';
      }
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

        {/* Poziomy stanowisk */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Poziomy stanowisk
          </label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-300 rounded-md bg-gray-50">
              {formData.jobLevel.map((level, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                >
                  {level}
                  <button
                    type="button"
                    onClick={() => removeFromList('jobLevel', index)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {JOB_LEVELS.filter(level => !formData.jobLevel.includes(level)).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => addToList('jobLevel', level)}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  + {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tryby pracy */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tryby pracy
          </label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-300 rounded-md bg-gray-50">
              {formData.workingMode.map((mode, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                >
                  {mode}
                  <button
                    type="button"
                    onClick={() => removeFromList('workingMode', index)}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {WORKING_MODES.filter(mode => !formData.workingMode.includes(mode)).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => addToList('workingMode', mode)}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  + {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Obowiązki */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Obowiązki
          </label>
          <ResponsibilityInput
            items={formData.responsibilities}
            onAdd={(item) => addToList('responsibilities', item)}
            onRemove={(index) => removeFromList('responsibilities', index)}
            placeholder="Dodaj obowiązek..."
          />
        </div>

        {/* Wymagania */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Wymagania
          </label>
          <RequirementInput
            items={formData.requirements}
            onAdd={(item) => addToList('requirements', item)}
            onRemove={(index) => removeFromList('requirements', index)}
            placeholder="Dodaj wymaganie..."
          />
        </div>

        {/* Co oferujemy */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Co oferujemy
          </label>
          <OfferInput
            items={formData.whatWeOffer}
            onAdd={(item) => addToList('whatWeOffer', item)}
            onRemove={(index) => removeFromList('whatWeOffer', index)}
            placeholder="Dodaj benefit..."
          />
        </div>

        {/* Tagi */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tagi / Umiejętności
          </label>
          <TagInput
            items={formData.tags}
            onAdd={(item) => addToList('tags', item)}
            onRemove={(index) => removeFromList('tags', index)}
            suggestions={ALL_POPULAR_TAGS}
            placeholder="Dodaj tag..."
          />
        </div>

        {/* Lokalizacja */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Lokalizacja
          </label>
          <select
            value={formData.lokalizationId || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              lokalizationId: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Wybierz lokalizację (opcjonalnie)</option>
            {availableLocalizations.map(location => (
              <option key={location.id} value={location.id}>
                {[location.city, location.state].filter(Boolean).join(', ')}
                {location.street && ` - ${location.street}`}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Lokalizacje można zarządzać w profilu pracodawcy
          </p>
        </div>

        {/* Metoda aplikacji */}
        <div className="space-y-4">
          <label className="block text-sm font-medium mb-3">
            Metoda aplikacji
          </label>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="internal-app"
                name="applicationMethod"
                checked={!formData.applicationUrl}
                onChange={() => setFormData(prev => ({ ...prev, applicationUrl: '' }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="internal-app" className="text-sm">
                <span className="font-medium">System wewnętrzny</span>
                <p className="text-gray-500">Kandydaci będą aplikować przez naszą platformę. Otrzymasz powiadomienia i możesz zarządzać aplikacjami w panelu.</p>
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="external-app"
                name="applicationMethod"
                checked={!!formData.applicationUrl}
                onChange={() => setFormData(prev => ({ ...prev, applicationUrl: 'https://' }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="external-app" className="text-sm">
                <span className="font-medium">Link zewnętrzny</span>
                <p className="text-gray-500">Kandydaci zostaną przekierowani na zewnętrzną stronę do aplikacji.</p>
              </label>
            </div>
          </div>
        </div>

        {/* URL aplikacji - pokazywane tylko przy wyborze zewnętrznego linka */}
        {formData.applicationUrl && (
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
        )}

        {/* Przyciski */}
        <div className="flex gap-4 pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="transition-all duration-200 hover:scale-105"
          >
            {isLoading ? 'Zapisywanie...' : (isEditing ? 'Zapisz zmiany' : 'Utwórz ofertę')}
          </Button>
          
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="transition-all duration-200 hover:scale-105"
          >
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  );
}

// Komponenty pomocnicze dla wprowadzania list

interface ListInputProps {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  suggestions?: string[];
}

const ResponsibilityInput: React.FC<ListInputProps> = ({ items, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <div className="min-h-[60px] p-2 border border-gray-300 rounded-md bg-gray-50">
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex items-start gap-2 mb-2 p-2 bg-white rounded border"
          >
            <span className="flex-1 text-sm">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAdd}
          variant="outline"
          size="sm"
        >
          Dodaj
        </Button>
      </div>
      {/* Szablony obowiązków */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(RESPONSIBILITY_TEMPLATES).map(([role, responsibilities]) => (
          <details key={role} className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              Szablon: {role}
            </summary>
            <div className="mt-1 space-y-1">
              {responsibilities.map((resp, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onAdd(resp)}
                  className="block w-full text-left px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  + {resp}
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

const RequirementInput: React.FC<ListInputProps> = ({ items, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <div className="min-h-[60px] p-2 border border-gray-300 rounded-md bg-gray-50">
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex items-start gap-2 mb-2 p-2 bg-white rounded border"
          >
            <span className="flex-1 text-sm">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAdd}
          variant="outline"
          size="sm"
        >
          Dodaj
        </Button>
      </div>
      {/* Szablony wymagań */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(REQUIREMENT_TEMPLATES).map(([role, requirements]) => (
          <details key={role} className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              Szablon: {role}
            </summary>
            <div className="mt-1 space-y-1">
              {requirements.map((req, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onAdd(req)}
                  className="block w-full text-left px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  + {req}
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

const OfferInput: React.FC<ListInputProps> = ({ items, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <div className="min-h-[60px] p-2 border border-gray-300 rounded-md bg-gray-50">
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex items-start gap-2 mb-2 p-2 bg-white rounded border"
          >
            <span className="flex-1 text-sm">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAdd}
          variant="outline"
          size="sm"
        >
          Dodaj
        </Button>
      </div>
      {/* Popularne benefity */}
      <div className="flex flex-wrap gap-2">
        {POPULAR_BENEFITS.filter(benefit => !items.includes(benefit)).slice(0, 8).map(benefit => (
          <button
            key={benefit}
            type="button"
            onClick={() => onAdd(benefit)}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            + {benefit}
          </button>
        ))}
      </div>
    </div>
  );
};

const TagInput: React.FC<ListInputProps> = ({ items, onAdd, onRemove, placeholder, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !items.includes(suggestion)
  ).slice(0, 10);

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-300 rounded-md bg-gray-50">
        {items.map((item, index) => (
          <span 
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-blue-500 hover:text-blue-700"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAdd}
            variant="outline"
            size="sm"
          >
            Dodaj
          </Button>
        </div>
        
        {/* Podpowiedzi */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onAdd(suggestion);
                  setInputValue('');
                  setShowSuggestions(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Popularne tagi */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Popularne tagi techniczne:</div>
        <div className="flex flex-wrap gap-1">
          {POPULAR_TECH_TAGS.filter(tag => !items.includes(tag)).slice(0, 12).map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => onAdd(tag)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              + {tag}
            </button>
          ))}
        </div>
        
        <div className="text-sm font-medium text-gray-700">Umiejętności miękkie:</div>
        <div className="flex flex-wrap gap-1">
          {POPULAR_SOFT_TAGS.filter(tag => !items.includes(tag)).slice(0, 8).map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => onAdd(tag)}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
