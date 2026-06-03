export type EntityStatus = "active" | "inactive" | "archived" | "completed";

export type AnalyticsPeriod =
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "custom";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  status: EntityStatus;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface DateRangeQuery {
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}

export interface DateRangeResult {
  start: string;
  end: string;
}

export interface ModuleCounts {
  tasks: number;
  goals: number;
  habitLogs: number;
  dailyReviews: number;
  studySessions: number;
  courses: number;
  books: number;
  transactions: number;
  englishPractices: number;
  spiritualActivities: number;
  healthLogs: number;
  journalEntries: number;
}

export interface AnalyticsCountsResponse {
  period: DateRangeQuery;
  range: DateRangeResult;
  counts: ModuleCounts;
}
