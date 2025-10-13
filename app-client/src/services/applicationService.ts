import { ApplicationCreateRequest, ApplicationUpdateRequest, EmployerApplicationsResponse, EmployerApplicationsParams } from '@/types/application';
import { Application } from '@/types/candidate';
import api from '@/api';

// Sprawdzenie czy kandydat już aplikował na daną ofertę
export const checkApplicationStatus = async (jobOfferId: number): Promise<{ hasApplied: boolean; applicationId: number | null }> => {
  const response = await api.get(`/applications/check/${jobOfferId}`);
  return response.data;
};

// Aplikowanie na ofertę pracy
export const createApplication = async (data: ApplicationCreateRequest): Promise<{ message: string; application: Application }> => {
  const response = await api.post('/applications', data);
  return response.data;
};

// Pobranie wszystkich aplikacji kandydata
export const getCandidateApplications = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{
  applications: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  const response = await api.get('/applications', { params });
  return response.data;
};

// Pobranie szczegółów aplikacji
export const getApplication = async (id: number): Promise<Application> => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

// Aktualizacja aplikacji (głównie anulowanie)
export const updateApplication = async (id: number, data: ApplicationUpdateRequest): Promise<{ message: string; application: Application }> => {
  const response = await api.put(`/applications/${id}`, data);
  return response.data;
};

// Usunięcie aplikacji
export const deleteApplication = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

// Pobranie statystyk aplikacji
export const getApplicationStats = async (): Promise<{
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  canceled: number;
}> => {
  const response = await api.get('/applications/stats/summary');
  return response.data;
};

// Pobranie pytań rekrutacyjnych dla aplikacji
export const getApplicationQuestions = async (id: number): Promise<{
  applicationId: number;
  jobOfferId: number;
  jobOfferName: string;
  questions: {
    id: number;
    question?: string;
    currentAnswer?: string | null;
  }[];
  canEdit: boolean;
}> => {
  const response = await api.get(`/applications/${id}/questions`);
  return response.data;
};

// Aktualizacja odpowiedzi na pytania rekrutacyjne
export const updateApplicationAnswers = async (id: number, answers: { recruitmentQuestionId: number; answer?: string }[]): Promise<{ message: string; application: Application }> => {
  const response = await api.put(`/applications/${id}/answers`, { answers });
  return response.data;
};

// METODY DLA PRACODAWCÓW

// Pobranie wszystkich aplikacji do ofert pracodawcy
export const getEmployerApplications = async (params?: EmployerApplicationsParams): Promise<EmployerApplicationsResponse> => {
  const response = await api.get('/applications/employer', { params });
  return response.data;
};
