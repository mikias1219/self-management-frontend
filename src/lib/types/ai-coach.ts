import type { BaseEntity } from "./common";

export interface AiCoachMessage {
  role: string;
  content: string;
  createdAt: string;
}

export interface AiCoachSession extends BaseEntity {
  title: string;
  context?: string;
  messages?: AiCoachMessage[];
  isArchived: boolean;
}

export interface AiProposedAction {
  id: string;
  tool: string;
  label: string;
  args: Record<string, unknown>;
}

export interface AiChatResponse {
  sessionId: string;
  reply: string;
  messages: AiCoachMessage[];
  pendingActions?: AiProposedAction[];
}

export interface AiActionResult {
  sessionId: string;
  ok: boolean;
  message: string;
  messages: AiCoachMessage[];
}
