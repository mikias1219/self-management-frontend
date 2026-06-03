"use client";

import { Badge } from "@/components/ui/badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import type {
  AiCoachSession,
  DailyReview,
  EnglishPractice,
  Goal,
  Habit,
  HealthLog,
  JournalEntry,
  Notification,
  SpiritualActivity,
  Task,
} from "@/lib/types";
import { format } from "date-fns";

export const taskColumns: DataTableColumn<Task>[] = [
  { key: "title", header: "Title", cell: (r) => r.title },
  {
    key: "status",
    header: "Status",
    cell: (r) => (
      <Badge variant="outline" className="text-xs capitalize">
        {r.taskStatus.replace("_", " ")}
      </Badge>
    ),
  },
  {
    key: "priority",
    header: "Priority",
    cell: (r) => <span className="capitalize">{r.priority}</span>,
  },
  {
    key: "due",
    header: "Due",
    cell: (r) =>
      r.dueDate ? format(new Date(r.dueDate), "MMM d") : "—",
  },
];

export const goalColumns: DataTableColumn<Goal>[] = [
  { key: "title", header: "Title", cell: (r) => r.title },
  { key: "level", header: "Level", cell: (r) => r.level },
  {
    key: "progress",
    header: "Progress",
    cell: (r) => `${Math.round(r.progress)}%`,
  },
];

export const habitColumns: DataTableColumn<Habit>[] = [
  { key: "name", header: "Habit", cell: (r) => r.name },
  { key: "frequency", header: "Frequency", cell: (r) => r.frequency },
  { key: "streak", header: "Streak", cell: (r) => `${r.currentStreak}d` },
];

export const dailyReviewColumns: DataTableColumn<DailyReview>[] = [
  {
    key: "date",
    header: "Date",
    cell: (r) => format(new Date(r.reviewDate), "MMM d, yyyy"),
  },
  {
    key: "mood",
    header: "Mood",
    cell: (r) => (r.moodScore != null ? `${r.moodScore}/10` : "—"),
  },
  {
    key: "productivity",
    header: "Productivity",
    cell: (r) =>
      r.productivityScore != null ? `${r.productivityScore}/10` : "—",
  },
];

export const englishColumns: DataTableColumn<EnglishPractice>[] = [
  {
    key: "type",
    header: "Type",
    cell: (r) => <span className="capitalize">{r.practiceType}</span>,
  },
  {
    key: "date",
    header: "Date",
    cell: (r) => format(new Date(r.practiceDate), "MMM d"),
  },
  { key: "duration", header: "Min", cell: (r) => r.durationMinutes },
];

export const spiritualColumns: DataTableColumn<SpiritualActivity>[] = [
  {
    key: "type",
    header: "Type",
    cell: (r) => <span className="capitalize">{r.activityType}</span>,
  },
  {
    key: "date",
    header: "Date",
    cell: (r) => format(new Date(r.activityDate), "MMM d"),
  },
  {
    key: "duration",
    header: "Min",
    cell: (r) => r.durationMinutes ?? "—",
  },
];

export const healthColumns: DataTableColumn<HealthLog>[] = [
  {
    key: "metric",
    header: "Metric",
    cell: (r) => <span className="capitalize">{r.metricType}</span>,
  },
  {
    key: "date",
    header: "Date",
    cell: (r) => format(new Date(r.logDate), "MMM d"),
  },
  {
    key: "value",
    header: "Value",
    cell: (r) => `${r.value}${r.unit ? ` ${r.unit}` : ""}`,
  },
];

export const journalColumns: DataTableColumn<JournalEntry>[] = [
  { key: "title", header: "Title", cell: (r) => r.title },
  { key: "type", header: "Type", cell: (r) => r.entryType },
  {
    key: "date",
    header: "Date",
    cell: (r) => format(new Date(r.entryDate), "MMM d"),
  },
];

export const notificationColumns: DataTableColumn<Notification>[] = [
  { key: "title", header: "Title", cell: (r) => r.title },
  {
    key: "read",
    header: "Status",
    cell: (r) => (
      <Badge variant={r.isRead ? "outline" : "default"}>
        {r.isRead ? "Read" : "Unread"}
      </Badge>
    ),
  },
];

export const aiCoachColumns: DataTableColumn<AiCoachSession>[] = [
  { key: "title", header: "Session", cell: (r) => r.title },
  {
    key: "archived",
    header: "Status",
    cell: (r) => (r.isArchived ? "Archived" : "Active"),
  },
];
