"use client";

import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CalendarSync,
  Check,
  CheckSquare,
  Clock,
  Flame,
  MoreHorizontal,
  Pencil,
  Target,
  Trash2,
} from "lucide-react";
import type { ScheduleItem, ScheduleItemKind } from "@/lib/api/productivity";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const KIND_META: Record<
  ScheduleItemKind,
  { label: string; className: string; Icon: typeof CalendarDays }
> = {
  task: { label: "Task", className: "bg-sky-500/12 text-sky-700", Icon: CheckSquare },
  habit: { label: "Habit", className: "bg-orange-500/12 text-orange-700", Icon: Flame },
  goal: { label: "Goal", className: "bg-violet-500/12 text-violet-700", Icon: Target },
  review: { label: "Review", className: "bg-amber-500/12 text-amber-800", Icon: BookOpen },
  calendar: {
    label: "Google event",
    className: "bg-slate-500/12 text-slate-700",
    Icon: CalendarDays,
  },
};

function formatTimeRange(item: ScheduleItem) {
  const start = format(parseISO(item.start), "h:mm a");
  if (!item.end) return start;
  const end = format(parseISO(item.end), "h:mm a");
  return `${start} – ${end}`;
}

interface ScheduleItemCardProps {
  item: ScheduleItem;
  googleConnected?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onLogHabit?: () => void;
  onOpen?: () => void;
  toggling?: boolean;
}

export function ScheduleItemCard({
  item,
  googleConnected,
  onToggle,
  onEdit,
  onDelete,
  onLogHabit,
  onOpen,
  toggling,
}: ScheduleItemCardProps) {
  const done = item.status === "done";
  const kindMeta = KIND_META[item.kind];
  const isTask = item.kind === "task";
  const isHabit = item.kind === "habit";
  const overdue = item.meta?.overdue === 1;
  const priority = item.meta?.priority as string | undefined;
  const planned = item.measurable?.plannedMinutes ?? 0;
  const spent = item.measurable?.spentMinutes ?? 0;
  const timePct =
    planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;

  return (
    <article
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
      className={cn(
        "group flex gap-4 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        done && "opacity-80",
        onOpen && "cursor-pointer",
        overdue && !done && "border-rose-500/40 bg-rose-500/[0.03]",
      )}
    >
      {(isTask || isHabit) && (
        <Checkbox
          checked={done}
          disabled={done || toggling}
          onCheckedChange={() => {
            if (isHabit && !done) onLogHabit?.();
            else if (isTask && !done) onToggle?.();
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 size-5 rounded-md data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
        />
      )}

      {!isTask && !isHabit && (
        <div className="mt-1 flex size-5 items-center justify-center shrink-0">
          <kindMeta.Icon className="size-4 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className={cn("text-[10px] font-medium", kindMeta.className)}>
            {kindMeta.label}
          </Badge>
          {priority && isTask && (
            <Badge variant="outline" className="text-[10px] capitalize">
              {priority}
            </Badge>
          )}
          {overdue && !done && (
            <Badge variant="outline" className="text-[10px] border-rose-500/50 text-rose-600 gap-0.5">
              <AlertCircle className="size-3" />
              Overdue
            </Badge>
          )}
          {isTask && googleConnected && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] gap-0.5",
                item.syncedToCalendar
                  ? "border-emerald-500/40 text-emerald-700"
                  : "text-amber-700 border-amber-500/40",
              )}
            >
              <CalendarSync className="size-3" />
              {item.syncedToCalendar ? "In Google Calendar" : "Not synced yet"}
            </Badge>
          )}
          {item.kind === "goal" && item.progress != null && (
            <Badge variant="outline" className="text-[10px] tabular-nums">
              {Math.round(item.progress)}% progress
            </Badge>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <h4
              className={cn(
                "text-base font-semibold leading-snug",
                done && "line-through text-muted-foreground font-medium",
              )}
            >
              {item.title}
            </h4>

            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
                <Clock className="size-3.5 shrink-0" />
                {formatTimeRange(item)}
              </span>
              {planned > 0 && (
                <span className="tabular-nums">
                  {done && spent > 0
                    ? `${spent} / ${planned} min logged`
                    : `${planned} min planned`}
                </span>
              )}
              {item.measurable?.streak != null && item.measurable.streak > 0 && (
                <span className="text-orange-600">{item.measurable.streak} day streak</span>
              )}
            </p>

            {isTask && planned > 0 && done && (
              <Progress value={timePct} className="h-1.5 max-w-xs">
                <ProgressTrack>
                  <ProgressIndicator className="bg-emerald-500" />
                </ProgressTrack>
              </Progress>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {isTask && !done && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted">
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil className="size-4" />
                      Edit task
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem className="text-rose-600" onClick={onDelete}>
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isHabit && !done && (
              <Button size="sm" variant="secondary" onClick={onLogHabit}>
                Log habit
              </Button>
            )}

            {done && <Check className="size-5 text-emerald-500" />}
          </div>
        </div>
      </div>
    </article>
  );
}
