import { isAxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as { message?: string | string[] } | undefined;
  if (!data?.message) return fallback;
  return Array.isArray(data.message) ? data.message.join(". ") : data.message;
}
