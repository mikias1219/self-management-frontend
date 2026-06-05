export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  timezone: string;
  primaryCurrency?: string;
  about?: string | null;
  focusAreas?: string[] | null;
  createdAt?: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  timezone?: string;
  primaryCurrency?: string;
  about?: string;
  focusAreas?: string[];
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}
