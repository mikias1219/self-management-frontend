import { createCrudApi } from "./crud";
import { apiClient } from "./client";
import type { Notification } from "@/lib/types";

export const notificationsApi = {
  ...createCrudApi<Notification>("/notifications"),
  getUnreadCount: () =>
    apiClient
      .get<{ count: number }>("/notifications/unread-count")
      .then((r) => r.data.count),
};
