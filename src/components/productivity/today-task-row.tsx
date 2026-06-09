"use client";

import { format, parseISO } from "date-fns";
import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ScheduleItem } from "@/lib/api/productivity";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TodayTaskRowProps {
  item: ScheduleItem;
  variant?: "task" | "calendar";
  isLast?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpen?: () => void;
  toggling?: boolean;
}

export function TodayTaskRow({
  item,
  variant = "task",
  isLast,
  onToggle,
  onEdit,
  onDelete,
  onOpen,
  toggling,
}: TodayTaskRowProps) {
  const isCalendar = variant === "calendar";
  const done = item.status === "done";
  const time = item.allDay
    ? "All day"
    : format(parseISO(item.start), "h:mm a");
  const mins = item.measurable?.plannedMinutes;

  return (
    <div className="group relative flex gap-4">
      <div className="flex w-14 shrink-0 flex-col items-end pt-0.5">
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {item.allDay ? "—" : format(parseISO(item.start), "HH:mm")}
        </span>
      </div>

      <div className="relative flex flex-1 min-w-0 pb-6">
        {!isLast && (
          <span
            className="absolute left-[7px] top-8 bottom-0 w-px bg-border/70"
            aria-hidden
          />
        )}
        <span
          className={cn(
            "relative z-[1] mt-1.5 size-[15px] shrink-0 rounded-full ring-4 ring-background",
            isCalendar
              ? "bg-sky-400"
              : done
                ? "bg-primary"
                : "border-2 border-primary/50 bg-background",
          )}
          aria-hidden
        />

        <div
          className={cn(
            "ml-3 flex-1 min-w-0 rounded-2xl border px-4 py-3 transition-colors",
            isCalendar
              ? "border-sky-500/25 bg-sky-500/[0.04]"
              : "border-border/60 bg-card hover:border-border",
            done && "opacity-55",
            onOpen && "cursor-pointer hover:shadow-sm",
          )}
          onClick={onOpen}
          onKeyDown={
            onOpen
              ? (e) => {
                  if (e.key === "Enter") onOpen();
                }
              : undefined
          }
          role={onOpen ? "button" : undefined}
          tabIndex={onOpen ? 0 : undefined}
        >
          <div className="flex items-start gap-3">
            {!isCalendar ? (
              <div
                className="pt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={done}
                  disabled={done || toggling}
                  onCheckedChange={() => onToggle?.()}
                  className="size-5 rounded-md"
                />
              </div>
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                <Calendar className="size-4" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-medium leading-snug",
                  done && "line-through text-muted-foreground",
                )}
              >
                {item.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isCalendar ? (
                  <>
                    <span className="text-sky-600/90 font-medium">Calendar</span>
                    {" · "}
                    {time}
                  </>
                ) : (
                  <>
                    {time}
                    {mins ? ` · ${mins} min` : ""}
                  </>
                )}
              </p>
            </div>

            {!done && (onEdit || onDelete) && (
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted">
                    <MoreHorizontal className="size-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        className="text-rose-600"
                        onClick={onDelete}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
