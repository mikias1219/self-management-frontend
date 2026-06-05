import { apiClient } from "./client";
import { createCrudApi } from "./crud";
import type {
  AiActionResult,
  AiChatResponse,
  AiCoachSession,
  AiProposedAction,
} from "@/lib/types";

export const aiCoachApi = {
  ...createCrudApi<AiCoachSession>("/ai-coach"),

  chat(message: string, sessionId?: string) {
    return apiClient
      .post<AiChatResponse>("/ai-coach/chat", { message, sessionId })
      .then((r) => r.data);
  },

  confirmAction(sessionId: string, action: AiProposedAction) {
    return apiClient
      .post<AiActionResult>("/ai-coach/action", {
        sessionId,
        id: action.id,
        tool: action.tool,
        label: action.label,
        args: action.args,
      })
      .then((r) => r.data);
  },
};
