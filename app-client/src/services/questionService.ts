import api from '@/api';

export interface GenerateQuestionsRequest {
  mode: 'application' | 'custom';
  // For application mode
  applicationId?: number;
  // For custom mode
  position?: string;
  jobLevel?: string;
  jobDescription?: string;
  requirements?: string;
  responsibilities?: string;
  count?: number;
}

export interface GenerateQuestionsResponse {
  message: string;
  questions: string[];
  count: number;
}

/**
 * Generuje pytania rekrutacyjne za pomocą AI na serwerze
 * 
 * Dwa tryby:
 * 1. application - generuje pytania na podstawie aplikacji użytkownika
 * 2. custom - generuje pytania na podstawie podanych parametrów stanowiska
 */
export const generateQuestionsWithAI = async (data: GenerateQuestionsRequest): Promise<string[]> => {
  try {
    // Zwiększony timeout do 60 sekund dla generowania pytań przez AI
    const response = await api.post<GenerateQuestionsResponse>('/question-generator', data, {
      timeout: 60000, // 60 sekund
    });
    return response.data.questions;
  } catch (error: any) {
    console.error('Error generating questions:', error);
    const status = error?.response?.status;
    const serverMsg = error?.response?.data?.message;
    
    // Specjalna obsługa timeout
    if (error.code === 'ECONNABORTED') {
      throw new Error('Generowanie pytań trwa zbyt długo. Spróbuj ponownie.');
    }
    
    if (status === 401) {
      throw new Error('Musisz być zalogowany jako kandydat, aby wygenerować pytania.');
    }
    if (status === 403) {
      throw new Error('Brak uprawnień do wygenerowania pytań.');
    }
    if (status === 404) {
      throw new Error(serverMsg || 'Nie znaleziono aplikacji lub nie masz do niej dostępu.');
    }
    throw new Error(serverMsg || 'Nie udało się wygenerować pytań rekrutacyjnych');
  }
};
