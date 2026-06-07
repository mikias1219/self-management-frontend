"use client";

import { format, isThisWeek, isToday } from "date-fns";
import { Clock, Play, Trophy } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskPresentViewProps {
  tasks: Task[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onReport: (task: Task) => void;
  onEdit: (task: Task) => void;
  onStartTimer: (id: string) => void;
  onBulkDone: () => void;
}

function urgency(task: Task): "overdue" | "today" | "week" | "future" {
  const now = new Date();
  if (
    task.dueDate &&
    new Date(task.dueDate) < now &&
    task.taskStatus !== "done" &&
    task.taskStatus !== "cancelled"
  ) {
    return "overdue";
  }
  if (
    (task.dueDate && isToday(new Date(task.dueDate))) ||
    (task.scheduledAt && isToday(new Date(task.scheduledAt))) ||
    task.taskStatus === "in_progress"
  ) {
    return "today";
  }
  if (task.dueDate && isThisWeek(new Date(task.dueDate), { weekStartsOn: 1 })) {
    return "week";
  }
  return "future";
}

const urgencyStyles = {
  overdue: "border-red-500/40 bg-red-500/5",
  today: "border-amber-500/40 bg-amber-500/5",
  week: "border-sky-500/30",
  future: "",
};

const urgencyBadge = {
  overdue: "destructive" as const,
  today: "default" as const,
  week: "secondary" as const,
  future: "outline" as const,
};

export function TaskPresentView({
  tasks,
  selectedIds,
  onToggleSelect,
  onReport,
  onEdit,
  onStartTimer,
  onBulkDone,
}: TaskPresentViewProps) {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const presentTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.taskStatus === "done" || t.taskStatus === "cancelled") return false;
        if (t.taskStatus === "in_progress") return true;
        const due = t.dueDate?.slice(0, 10);
        const sched = t.scheduledAt?.slice(0, 10);
        return due === todayStr || sched === todayStr;
      })
      .sort((a, b) => {
        const order = { overdue: 0, today: 1, week: 2, future: 3 };
        return order[urgency(a)] - order[urgency(b)];
      });
  }, [tasks, todayStr]);

  if (presentTasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing due today — check Future or add a task.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {selectedIds.size > 0 && (
        <Button size="sm" onClick={onBulkDone}>
          Mark {selectedIds.size} done
        </Button>
      )}
      {presentTasks.map((t) => {
        const u = urgency(t);
        return (
          <Card
            key={t.id}
            className={cn("transition-colors", urgencyStyles[u])}
          >
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <Checkbox
                checked={selectedIds.has(t.id)}
                onCheckedChange={() => onToggleSelect(t.id)}
              />
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  className="font-medium text-left hover:underline"
                  onClick={() => onEdit(t)}
                >
                  {t.title}
                </button>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant={urgencyBadge[u]}>
                    {u === "overdue" ? "Overdue" : u === "today" ? "Today" : u === "week" ? "This week" : "Upcoming"}
                  </Badge>
                  {t.taskStatus === "in_progress" && (
                    <Badge variant="outline">In progress</Badge>
                  )}
                  {t.timerStartedAt && (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="size-3" />
                      Timer running
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!t.timerStartedAt && t.taskStatus !== "done" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartTimer(t.id)}
                  >
                    <Play className="size-3.5" />
                    Start
                  </Button>
                )}
                <Button size="sm" onClick={() => onReport(t)}>
                  <Trophy className="size-3.5" />
                  Report
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function filterPresentTasks(tasks: Task[]): Task[] {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  return tasks.filter((t) => {
    if (t.taskStatus === "done" || t.taskStatus === "cancelled") return false;
    if (t.taskStatus === "in_progress") return true;
    const due = t.dueDate?.slice(0, 10);
    const sched = t.scheduledAt?.slice(0, 10);
    return due === todayStr || sched === todayStr;
  });
}

export { urgency };
