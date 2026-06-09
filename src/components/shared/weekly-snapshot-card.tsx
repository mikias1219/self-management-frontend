"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklySnapshotCardProps {
  tasksCompleted: number;
  habitsStreak: number;
  moneyVsBudget: string;
  studyMinutes: number;
}

export function WeeklySnapshotCard({
  tasksCompleted,
  habitsStreak,
  moneyVsBudget,
  studyMinutes,
}: WeeklySnapshotCardProps) {
  const metrics = [
    { label: "Tasks done", value: String(tasksCompleted) },
    { label: "Best habit streak", value: String(habitsStreak) },
    { label: "Money vs budget", value: moneyVsBudget },
    { label: "Study minutes", value: String(studyMinutes) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly snapshot</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{m.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
