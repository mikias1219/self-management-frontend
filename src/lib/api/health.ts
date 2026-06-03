import { createCrudApi } from "./crud";
import type { HealthLog } from "@/lib/types";

export const healthApi = createCrudApi<HealthLog>("/health");
