import api from "@/api";
import { EmployerProfileUpdateRequest, EmployerProfileAddress, EmployerProfile, EmployerProfileLokalization, EmployerStats } from "@/types/employer";

export const getEmployerStats = async (): Promise<EmployerStats> => {
  try {
    const response = await api.get("/employer/stats");
    return response.data as EmployerStats;
  } catch (error) {
    console.error("Error fetching employer stats:", error);
    return {
      totalJobOffers: 0,
      activeJobOffers: 0,
      totalApplications: 0,
      pendingApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0
    } as EmployerStats;
  }
};

export const updateEmployerProfile = async (data: EmployerProfileUpdateRequest) => {
  const response = await api.put("/employer/profile", data);
  return response.data;
};

export const getEmployerProfile = async (): Promise<EmployerProfile> => {
  const response = await api.get("/employer/profile");
  return response.data.profile;
};

export const addEmployerProfileLocation = async (address: EmployerProfileAddress) => {
  const response = await api.post("/employer/profile/location", address);
  return response.data;
};

export const removeEmployerProfileLocation = async (lokalizationId: number) => {
  const response = await api.delete(`/employer/profile/location/${lokalizationId}`);
  return response.data;
};
