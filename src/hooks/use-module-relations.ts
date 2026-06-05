"use client";

import { useMemo } from "react";
import type { RelationLink } from "@/components/shared/module-relations";
import {
  colorForModuleKey,
  MODULE_LABELS,
} from "@/lib/constants/chart-colors";
import { financeApi, goalsApi, habitsApi, tasksApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";
import type { ModuleCounts } from "@/lib/types";

export function useTasksRelations() {
  const authenticated = hasAuthToken();

  const tasks = useStandData(["tasks"], () => tasksApi.getAll(), {
    enabled: authenticated,
    staleTime: 60_000,
  });
  const goals = useStandData(["goals"], () => goalsApi.getAll(), {
    enabled: authenticated,
    staleTime: 60_000,
  });
  const habits = useStandData(["habits"], () => habitsApi.getAll(), {
    enabled: authenticated,
    staleTime: 60_000,
  });

  const links = useMemo((): RelationLink[] => {
    const taskList = tasks.data ?? [];
    const goalList = goals.data ?? [];
    const linked = taskList.filter((t) => t.goalId).length;
    const done = taskList.filter((t) => t.taskStatus === "done").length;
    const habitStreak = (habits.data ?? []).reduce(
      (s, h) => s + h.currentStreak,
      0,
    );

    return [
      {
        label: "Linked to goals",
        href: "/goals",
        value: `${linked} / ${taskList.length}`,
        color: colorForModuleKey("goals"),
      },
      {
        label: "Goals available",
        href: "/goals",
        value: goalList.length,
        color: colorForModuleKey("goals"),
      },
      {
        label: "Completed tasks",
        href: "/tasks",
        value: done,
        color: colorForModuleKey("tasks"),
      },
      {
        label: "Habit streak total",
        href: "/habits",
        value: `${habitStreak}d`,
        color: colorForModuleKey("habitLogs"),
      },
    ];
  }, [tasks.data, goals.data, habits.data]);

  return { links };
}

export function useGoalsRelations() {
  const authenticated = hasAuthToken();

  const goals = useStandData(["goals"], () => goalsApi.getAll(), {
    enabled: authenticated,
  });
  const tasks = useStandData(["tasks"], () => tasksApi.getAll(), {
    enabled: authenticated,
  });

  const links = useMemo((): RelationLink[] => {
    const goalList = goals.data ?? [];
    const taskList = tasks.data ?? [];
    const withTasks = goalList.filter((g) =>
      taskList.some((t) => t.goalId === g.id),
    ).length;
    const orphanTasks = taskList.filter((t) => !t.goalId).length;

    return [
      {
        label: "Goals with tasks",
        href: "/tasks",
        value: withTasks,
        color: colorForModuleKey("tasks"),
      },
      {
        label: "Tasks without goal",
        href: "/tasks",
        value: orphanTasks,
        color: colorForModuleKey("tasks"),
      },
      {
        label: "Avg progress",
        href: "/goals",
        value:
          goalList.length > 0
            ? `${Math.round(goalList.reduce((s, g) => s + g.progress, 0) / goalList.length)}%`
            : "—",
        color: colorForModuleKey("goals"),
      },
    ];
  }, [goals.data, tasks.data]);

  return { links, goals: goals.data ?? [], tasks: tasks.data ?? [] };
}

export function useFinanceRelations() {
  const { query } = usePeriod("finance");
  const authenticated = hasAuthToken();

  const summary = useStandData(
    ["finance", "summary", query],
    () => financeApi.getSummary(query),
    { enabled: authenticated, staleTime: 60_000 },
  );

  const links = useMemo((): RelationLink[] => {
    const t = summary.data?.totals;
    if (!t) return [];
    return [
      {
        label: "Transactions",
        href: "/finance",
        value: t.transactionCount,
        color: colorForModuleKey("transactions"),
      },
      {
        label: "Savings rate",
        href: "/finance",
        value: `${t.savingsRate}%`,
        color: "#22c55e",
      },
      {
        label: "Budgets tracked",
        href: "/finance",
        value: summary.data?.budgets.length ?? 0,
        color: "#f59e0b",
      },
    ];
  }, [summary.data]);

  return { links, summary: summary.data };
}

export function analyticsToChartData(counts: ModuleCounts) {
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: MODULE_LABELS[key] ?? key,
      value,
      moduleKey: key,
    }));
}
