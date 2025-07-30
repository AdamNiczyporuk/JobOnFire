import api from "@/api";
import { CandidateProfile, CandidateStats, CandidateProfileFormData, CandidateCV } from "@/types/candidate";

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
  }
};
