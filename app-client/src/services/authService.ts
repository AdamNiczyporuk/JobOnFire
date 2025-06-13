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
}) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};