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

export interface AiChatResponse {
  sessionId: string;
  reply: string;
  messages: AiCoachMessage[];
}
