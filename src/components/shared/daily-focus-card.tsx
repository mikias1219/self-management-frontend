"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStandMutation } from "@/hooks/use-stand-data";
import { tasksApi } from "@/lib/api";
import type { Task } from "@/lib/types";

interface DailyFocusCardProps {
  tasks: Array<Pick<Task, "id" | "title" | "dueDate" | "goalId">>;
}

export function DailyFocusCard({ tasks }: DailyFocusCardProps) {
  const storageKey = `daily-focus-${new Date().toISOString().slice(0, 10)}`;
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && tasks.some((t) => t.id === saved)) {
      setFocusId(saved);
    } else if (tasks[0]) {
      setFocusId(tasks[0].id);
    }
  }, [storageKey, tasks]);

  const complete = useStandMutation(
    (id: string) => tasksApi.update(id, { taskStatus: "done" }),
    { invalidateKeys: [["productivity", "today-summary"], ["tasks"]] },
  );

  const focus = tasks.find((t) => t.id === focusId) ?? tasks[0];
  if (!focus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily focus</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No tasks due today — add one from Productivity.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-base">Daily focus</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">{focus.title}</p>
          {focus.dueDate && (
            <p className="text-sm text-muted-foreground">Due {focus.dueDate}</p>
          )}
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => complete.mutate(focus.id)}
          disabled={complete.isPending}
        >
          <CheckCircle2 className="size-5" />
          Mark done
        </Button>
      </CardContent>
      {tasks.length > 1 && (
        <div className="flex flex-wrap gap-2 px-6 pb-4">
          {tasks.slice(0, 5).map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant={t.id === focus.id ? "default" : "outline"}
              onClick={() => {
                setFocusId(t.id);
                localStorage.setItem(storageKey, t.id);
              }}
            >
              {t.title.slice(0, 24)}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}
