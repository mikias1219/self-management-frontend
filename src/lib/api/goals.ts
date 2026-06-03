import { createCrudApi } from "./crud";
import type { Goal } from "@/lib/types";

export const goalsApi = createCrudApi<Goal>("/goals");
