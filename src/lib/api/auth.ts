import { apiClient, setAuthToken } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/lib/types";

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    setAuthToken(data.accessToken);
    return data;
  },
  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/register",
      payload,
    );
    setAuthToken(data.accessToken);
    return data;
  },
  me: () => apiClient.get<User>("/auth/me").then((r) => r.data),
  logout: () => {
    setAuthToken(null);
  },
};
