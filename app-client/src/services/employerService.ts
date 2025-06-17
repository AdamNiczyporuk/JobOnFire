import api from "@/api";
import { EmployerProfileUpdateRequest, EmployerProfileAddress, EmployerProfile, EmployerProfileLokalization } from "@/types/employer";

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
