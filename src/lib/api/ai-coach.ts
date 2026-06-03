import { apiClient } from "./client";
import { createCrudApi } from "./crud";
import type { AiChatResponse, AiCoachSession } from "@/lib/types";

export const aiCoachApi = {
  ...createCrudApi<AiCoachSession>("/ai-coach"),

  chat(message: string, sessionId?: string) {
    return apiClient
      .post<AiChatResponse>("/ai-coach/chat", { message, sessionId })
      .then((r) => r.data);
  },
};
