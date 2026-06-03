import { createCrudApi } from "./crud";
import type { EnglishPractice } from "@/lib/types";

export const englishApi = createCrudApi<EnglishPractice>("/english");
