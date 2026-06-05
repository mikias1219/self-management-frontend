import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { TOKEN_COOKIE, TOKEN_KEY } from "@/lib/constants/auth";

export { TOKEN_COOKIE, TOKEN_KEY };

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      setAuthToken(null);
    }
    return Promise.reject(error);
  },
);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/** Mirror JWT into a cookie so Next.js middleware can auth-check before hydration. */
export function syncAuthCookie(token?: string | null) {
  if (typeof document === "undefined") return;
  const value = token ?? localStorage.getItem(TOKEN_KEY);
  if (value) {
    document.cookie = `${TOKEN_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } else {
    document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  syncAuthCookie(token);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function hasAuthToken(): boolean {
  return !!getAuthToken();
}
