import type { BaseEntity } from "./common";

export interface Notification extends BaseEntity {
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  link?: string;
}
