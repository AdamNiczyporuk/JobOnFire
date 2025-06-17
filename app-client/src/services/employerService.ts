import api from "@/api";
import { EmployerProfileUpdateRequest } from "@/types/employer";

export const updateEmployerProfile = async (data: EmployerProfileUpdateRequest) => {
  const response = await api.put("/employer/profile", data);
  return response.data;
};
