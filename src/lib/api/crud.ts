import { apiClient } from "./client";
import type { DateRangeQuery } from "@/lib/types";

export function createCrudApi<T>(path: string) {
  return {
    getAll: (params?: DateRangeQuery) =>
      apiClient.get<T[]>(path, { params }).then((r) => r.data),
    getOne: (id: string) =>
      apiClient.get<T>(`${path}/${id}`).then((r) => r.data),
    create: (data: Partial<T>) =>
      apiClient.post<T>(path, data).then((r) => r.data),
    update: (id: string, data: Partial<T>) =>
      apiClient.patch<T>(`${path}/${id}`, data).then((r) => r.data),
    remove: (id: string) =>
      apiClient.delete(`${path}/${id}`).then((r) => r.data),
  };
}
