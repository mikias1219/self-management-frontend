import type { BaseEntity } from "./common";

export type JournalEntryType = "daily" | "gratitude" | "reflection" | "freeform";

export interface JournalEntry extends BaseEntity {
  entryType: JournalEntryType;
  entryDate: string;
  title: string;
  content: string;
  tags?: string[];
}
