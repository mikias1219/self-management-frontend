"use client";

import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskMatrixViewProps {
  tasks: Task[];
  onSelect?: (task: Task) => void;
}

type Quadrant = "do" | "schedule" | "delegate" | "eliminate";

function isUrgent(task: Task) {
  if (task.priority === "urgent") return true;
  if (!task.dueDate) return false;
  const due = parseISO(task.dueDate.slice(0, 10));
  const today = startOfDay(new Date());
  return isBefore(due, today) || due.getTime() <= today.getTime() + 2 * 86400000;
}

function isImportant(task: Task) {
  return task.priority === "high" || task.priority === "urgent";
}

function quadrant(task: Task): Quadrant {
  const urgent = isUrgent(task);
  const important = isImportant(task);
  if (urgent && important) return "do";
  if (!urgent && important) return "schedule";
  if (urgent && !important) return "delegate";
  return "eliminate";
}

const QUADRANTS: {
  id: Quadrant;
  title: string;
  subtitle: string;
  className: string;
}[] = [
  {
    id: "do",
    title: "Do first",
    subtitle: "Urgent & important",
    className: "border-red-500/30 bg-red-500/5",
  },
  {
    id: "schedule",
    title: "Schedule",
    subtitle: "Important, not urgent",
    className: "border-sky-500/30 bg-sky-500/5",
  },
  {
    id: "delegate",
    title: "Delegate",
    subtitle: "Urgent, not important",
    className: "border-amber-500/30 bg-amber-500/5",
  },
  {
    id: "eliminate",
    title: "Later",
    subtitle: "Neither urgent nor important",
    className: "border-muted bg-muted/20",
  },
];

export function TaskMatrixView({ tasks, onSelect }: TaskMatrixViewProps) {
  const open = tasks.filter(
    (t) => t.taskStatus !== "done" && t.taskStatus !== "cancelled",
  );

  const grouped = QUADRANTS.map((q) => ({
    ...q,
    items: open.filter((t) => quadrant(t) === q.id),
  }));

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {grouped.map((q) => (
        <Card key={q.id} className={cn("border", q.className)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{q.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{q.subtitle}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {q.items.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tasks</p>
            ) : (
              q.items.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelect?.(t)}
                  className="flex w-full items-start justify-between gap-2 rounded-lg border bg-background/80 px-3 py-2 text-left text-sm hover:bg-background"
                >
                  <span className="min-w-0 truncate">{t.title}</span>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {t.priority}
                    </Badge>
                    {t.dueDate && (
                      <span className="text-[10px] text-muted-foreground">
                        {format(parseISO(t.dueDate.slice(0, 10)), "MMM d")}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
