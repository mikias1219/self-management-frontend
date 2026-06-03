import { createCrudApi } from "./crud";
import type { JournalEntry } from "@/lib/types";

export const journalApi = createCrudApi<JournalEntry>("/journal");
