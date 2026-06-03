import { createCrudApi } from "./crud";
import type { DailyReview } from "@/lib/types";

export const dailyReviewsApi = createCrudApi<DailyReview>("/daily-reviews");
