import { createCrudApi } from "./crud";
import type { Notification } from "@/lib/types";

export const notificationsApi = createCrudApi<Notification>("/notifications");
