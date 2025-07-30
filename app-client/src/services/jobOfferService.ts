import api from "@/api";
import { 
  JobOffer, 
  JobOfferCreateRequest, 
  JobOfferUpdateRequest, 
  JobOfferListResponse, 
  JobOfferResponse,
  JobOfferListParams 
} from "@/types/jobOffer";

/**
 * Pobiera listę ofert pracy pracodawcy z paginacją
 */
export const getJobOffers = async (params?: JobOfferListParams): Promise<JobOfferListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const url = `/job-offers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Pobiera publiczną listę ofert pracy (bez uwierzytelniania)
 */
export const getPublicJobOffers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  contractType?: string;
  workingMode?: string;
  city?: string;
  state?: string;
  companyName?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<JobOfferListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.contractType) queryParams.append('contractType', params.contractType);
  if (params?.workingMode) queryParams.append('workingMode', params.workingMode);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.state) queryParams.append('state', params.state);
  if (params?.companyName) queryParams.append('companyName', params.companyName);
  if (params?.tags) queryParams.append('tags', params.tags);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = `/job-offers/public${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Pobiera szczegóły konkretnej oferty pracy
 */
export const getJobOffer = async (id: number): Promise<JobOffer> => {
  const response = await api.get(`/job-offers/${id}`);
  return response.data.jobOffer;
};

/**
 * Pobiera publiczne szczegóły konkretnej oferty pracy (bez uwierzytelniania)
 */
export const getPublicJobOffer = async (id: number): Promise<JobOffer> => {
  const response = await api.get(`/job-offers/public/${id}`);
  return response.data.jobOffer; // Backend zwraca { jobOffer: {...} }
};

/**
 * Tworzy nową ofertę pracy
 */
export const createJobOffer = async (data: JobOfferCreateRequest): Promise<JobOffer> => {
  const response = await api.post("/job-offers", data);
  return response.data.jobOffer;
};

/**
 * Aktualizuje istniejącą ofertę pracy
 */
export const updateJobOffer = async (id: number, data: JobOfferUpdateRequest): Promise<JobOffer> => {
  const response = await api.put(`/job-offers/${id}`, data);
  return response.data.jobOffer;
};

/**
 * Usuwa ofertę pracy
 */
export const deleteJobOffer = async (id: number): Promise<void> => {
  await api.delete(`/job-offers/${id}`);
};

/**
 * Przełącza status aktywności oferty pracy (aktywna/nieaktywna)
 */
export const toggleJobOfferStatus = async (id: number): Promise<JobOffer> => {
  const response = await api.patch(`/job-offers/${id}/toggle-active`);
  return response.data.jobOffer;
};

/**
 * Pobiera wszystkie dostępne lokalizacje dla dropdown
 */
export const getAvailableLocalizations = async () => {
  const response = await api.get("/employer/profile/locations");
  return response.data.localizations;
};

// Helpery do formatowania danych

/**
 * Formatuje datę dla API (konwersja z Date na ISO string)
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString();
};

/**
 * Formatuje datę z API dla wyświetlenia
 */
export const formatDateFromAPI = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Waliduje czy data wygaśnięcia jest w przyszłości
 */
export const validateExpireDate = (date: Date): boolean => {
  return date > new Date();
};

/**
 * Przygotowuje dane oferty do wysłania na API
 */
export const prepareJobOfferData = (formData: any): JobOfferCreateRequest => {
  return {
    name: formData.name,
    description: formData.description || undefined,
    jobLevel: formData.jobLevel?.length > 0 ? formData.jobLevel : undefined,
    contractType: formData.contractType || undefined,
    salary: formData.salary || undefined,
    expireDate: formatDateForAPI(formData.expireDate),
    workingMode: formData.workingMode?.length > 0 ? formData.workingMode : undefined,
    workload: formData.workload || undefined,
    responsibilities: formData.responsibilities?.length > 0 ? formData.responsibilities : undefined,
    requirements: formData.requirements?.length > 0 ? formData.requirements : undefined,
    whatWeOffer: formData.whatWeOffer?.length > 0 ? formData.whatWeOffer : undefined,
    applicationUrl: formData.applicationUrl || undefined,
    tags: formData.tags?.length > 0 ? formData.tags : undefined,
    lokalizationId: formData.lokalizationId || undefined,
  };
};

/**
 * Pobiera pytania rekrutacyjne dla oferty pracy (publiczne)
 */
export const getJobOfferQuestions = async (jobOfferId: number): Promise<{
  id: number;
  question?: string;
}[]> => {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + 
                   (process.env.NEXT_PUBLIC_API_PREFIX || '');
    const response = await fetch(`${baseUrl}/job-offers/public/${jobOfferId}`);
    if (!response.ok) {
      throw new Error('Nie udało się pobrać pytań rekrutacyjnych');
    }
    const data = await response.json();
    return data.jobOffer?.questions || [];
  } catch (error) {
    console.error('Error fetching recruitment questions:', error);
    // Zwracamy pustą tablicę w przypadku błędu, żeby nie blokować formularza
    return [];
  }
};
