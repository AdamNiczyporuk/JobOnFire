import api from "@/api";
import { 
  CandidateProfile, 
  CandidateStats, 
  CandidateProfileFormData, 
  CandidateCV,
  CandidateListResponse,
  CandidateFilters,
  CandidateDetailedProfile
} from "@/types/candidate";

export const candidateService = {
  /**
   * Pobiera profil aktualnie zalogowanego kandydata
   */
  async getProfile(): Promise<CandidateProfile> {
    const response = await api.get("/candidate/profile");
    return response.data.profile;
  },

  /**
   * Aktualizuje profil kandydata
   */
  async updateProfile(profileData: CandidateProfileFormData): Promise<CandidateProfile> {
    const response = await api.put("/candidate/profile", profileData);
    return response.data.profile;
  },

  /**
   * Pobiera statystyki kandydata
   */
  async getStats(): Promise<CandidateStats> {
    const response = await api.get("/candidate/profile/stats");
    return response.data.stats;
  },

  /**
   * Pobiera wszystkie CV kandydata
   */
  async getCVs(): Promise<CandidateCV[]> {
    const response = await api.get("/candidate/cvs");
    return response.data.cvs || [];
  },

  /**
   * Pobiera szczegóły konkretnego CV
   */
  async getCV(id: number): Promise<CandidateCV> {
    const response = await api.get(`/candidate/cvs/${id}`);
    return response.data.cv;
  },

  /**
   * Usuwa (soft delete) CV kandydata
   */
  async deleteCV(id: number): Promise<void> {
    await api.delete(`/candidate/cvs/${id}`);
  },

  /**
   * Pobiera listę wszystkich kandydatów z możliwością filtrowania
   */
  async getCandidatesList(filters: CandidateFilters = {}): Promise<CandidateListResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.experience) params.append('experience', filters.experience);
    if (filters.skills) params.append('skills', filters.skills);
    if (filters.place) params.append('place', filters.place);
    if (filters.education) params.append('education', filters.education);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/candidate/candidates?${params.toString()}`);
    return response.data;
  },

  /**
   * Pobiera szczegółowy profil konkretnego kandydata (publiczny dostęp)
   */
  async getCandidateProfile(candidateId: number): Promise<CandidateDetailedProfile> {
    const response = await api.get(`/candidate/candidates/${candidateId}`);
    return response.data.candidate;
  }
};
