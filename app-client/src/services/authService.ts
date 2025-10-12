import api from "@/api";

export const login = async (username: string, password: string, role: string) => {
  const response = await api.post("/auth/login", { username, password, role });
  return response.data;
};

export const register = async (data: {
  username: string;
  password: string;
  email: string;
  role: string;
  companyName?: string;
}) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const changePassword = async (payload: { currentPassword?: string; newPassword: string }) => {
  const response = await api.put("/auth/change-password", payload);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/auth/delete-account");
  return response.data;
};
