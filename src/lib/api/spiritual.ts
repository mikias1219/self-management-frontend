import { createCrudApi } from "./crud";
import type { SpiritualActivity } from "@/lib/types";

export const spiritualApi = createCrudApi<SpiritualActivity>("/spiritual");
