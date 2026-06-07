"use client";

import { format, isAfter, startOfDay } from "date-fns";
import { Calendar, Repeat } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useStandData } from "@/hooks/use-stand-data";
import { tasksApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { Task } from "@/lib/types";
import { formatMinutes } from "@/lib/utils/time-input";

interface TaskFutureViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function TaskFutureView({ tasks, onEdit }: TaskFutureViewProps) {
  const authenticated = hasAuthToken();
  const { data: recurringTemplates } = useStandData(
    ["tasks", "recurring"],
    () => tasksApi.getAll({ recurringOnly: true }),
    { enabled: authenticated },
  );

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    return tasks
      .filter((t) => {
        if (t.taskStatus === "done" || t.taskStatus === "cancelled") return false;
        const anchor = t.dueDate ?? t.scheduledAt ?? t.startDate;
        if (!anchor) return false;
        return isAfter(new Date(anchor), today) || anchor.slice(0, 10) > format(today, "yyyy-MM-dd");
      })
      .sort((a, b) => {
        const da = a.dueDate ?? a.scheduledAt ?? "";
        const db = b.dueDate ?? b.scheduledAt ?? "";
        return da.localeCompare(db);
      });
  }, [tasks]);

  return (
    <div className="space-y-6">
      {(recurringTemplates ?? []).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Repeat className="size-3.5" />
            Recurring templates
          </h3>
          <ul className="space-y-2">
            {(recurringTemplates ?? []).map((t) => (
              <li
                key={t.id}
                className="rounded-lg border px-3 py-2 text-sm flex justify-between items-center cursor-pointer hover:bg-muted/50"
                onClick={() => onEdit(t)}
              >
                <span className="font-medium">{t.title}</span>
                <Badge variant="outline">{t.recurringInterval}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          Upcoming tasks
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming tasks scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border px-3 py-2 text-sm flex flex-wrap justify-between gap-2 cursor-pointer hover:bg-muted/50"
                onClick={() => onEdit(t)}
              >
                <div>
                  <p className="font-medium">{t.title}</p>
                  {t.goalId && (
                    <p className="text-xs text-muted-foreground">Linked to goal</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {t.dueDate && (
                    <p>Due {format(new Date(t.dueDate), "MMM d, yyyy")}</p>
                  )}
                  {t.estimatedMinutes && (
                    <p>{formatMinutes(t.estimatedMinutes)} planned</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
