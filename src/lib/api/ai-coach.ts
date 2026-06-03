import { createCrudApi } from "./crud";
import type { AiCoachSession } from "@/lib/types";

export const aiCoachApi = createCrudApi<AiCoachSession>("/ai-coach");
