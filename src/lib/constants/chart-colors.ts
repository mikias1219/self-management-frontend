/** Explicit hex colors — Recharts cannot use oklch/hsl CSS vars reliably. */

export const CHART_PALETTE = [
  "#0ea5e9", // sky
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#14b8a6", // teal
  "#8b5cf6", // violet
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#f97316", // orange
  "#ec4899", // pink
  "#ef4444", // rose
  "#a855f7", // purple
  "#22c55e", // green
] as const;

/** Analytics count keys → module color */
export const MODULE_COUNT_COLORS: Record<string, string> = {
  tasks: "#0ea5e9",
  goals: "#06b6d4",
  habitLogs: "#3b82f6",
  dailyReviews: "#6366f1",
  studySessions: "#10b981",
  courses: "#059669",
  books: "#14b8a6",
  transactions: "#f59e0b",
  englishPractices: "#14b8a6",
  spiritualActivities: "#a855f7",
  healthLogs: "#f43f5e",
  journalEntries: "#f97316",
};

export const MODULE_LABELS: Record<string, string> = {
  tasks: "Tasks",
  goals: "Goals",
  habitLogs: "Habit check-ins",
  dailyReviews: "Daily reviews",
  studySessions: "Study sessions",
  courses: "Courses",
  books: "Books",
  transactions: "Transactions",
  englishPractices: "English",
  spiritualActivities: "Spiritual",
  healthLogs: "Health",
  journalEntries: "Journal",
};

export function colorForIndex(i: number): string {
  return CHART_PALETTE[i % CHART_PALETTE.length];
}

export function colorForModuleKey(key: string): string {
  return MODULE_COUNT_COLORS[key] ?? colorForIndex(key.length);
}
