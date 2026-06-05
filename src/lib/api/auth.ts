import { apiClient, setAuthToken } from "./client";
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
} from "@/lib/types";

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
  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.patch<User>("/auth/me", payload).then((r) => r.data),
  changePassword: (payload: ChangePasswordPayload) =>
    apiClient
      .post<{ success: true }>("/auth/change-password", payload)
      .then((r) => r.data),
  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient
      .post<{ success: true }>("/auth/reset-password", payload)
      .then((r) => r.data),
  logout: () => {
    setAuthToken(null);
  },
};
