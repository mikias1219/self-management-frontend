"use client";

import { format, parseISO } from "date-fns";
import { Loader2, Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/productivity/delete-confirm-dialog";
import { TaskFormDialog } from "@/components/productivity/task-form-dialog";
import { TodayTaskRow } from "@/components/productivity/today-task-row";
import type { TaskFormValues } from "@/components/productivity/task-form-sheet";
import {
  EmptyState,
  ProgressRing,
  SegmentControl,
} from "@/components/productivity/productivity-ui";
import { Button } from "@/components/ui/button";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { productivityApi, tasksApi, integrationsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { ScheduleItem } from "@/lib/types/productivity";
import type { Task } from "@/lib/types";

const INVALIDATE = [
  ["productivity", "schedule"],
  ["tasks"],
  ["integrations"],
  ["dashboard"],
  ["achievements"],
];

type DayFilter = "remaining" | "done";

function sortByTime(items: ScheduleItem[]) {
  return [...items].sort((a, b) => a.start.localeCompare(b.start));
}

export function TodayView() {
  const authenticated = hasAuthToken();
  const [filter, setFilter] = useState<DayFilter>("remaining");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [calendarEventId, setCalendarEventId] = useState<string | null>(null);
  const [calendarEventDay, setCalendarEventDay] = useState<string | null>(null);
  const [deleteCalendarEventId, setDeleteCalendarEventId] = useState<
    string | null
  >(null);
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [form, setForm] = useState<TaskFormValues>({
    title: "",
    time: "09:00",
    minutes: "60",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: calendarStatus } = useStandData(
    ["integrations", "google-status"],
    () => integrationsApi.googleCalendar.getStatus(),
    { enabled: authenticated },
  );

  const { data, isLoading, refetch } = useStandData(
    ["productivity", "schedule", "today"],
    () => productivityApi.getSchedule({ scope: "today" }),
    { enabled: authenticated },
  );

  const calendarReady = calendarStatus?.syncReady ?? false;

  const { remaining, done } = useMemo(() => {
    const now = new Date();
    const items = data?.items ?? [];
    const taskItems = sortByTime(items.filter((i) => i.kind === "task"));
    const calendarItems = sortByTime(items.filter((i) => i.kind === "calendar"));
    const openTasks = taskItems.filter((t) => t.status !== "done");
    const upcomingCalendar = calendarItems.filter(
      (c) => !c.end || new Date(c.end) >= now,
    );
    return {
      remaining: sortByTime([...openTasks, ...upcomingCalendar]),
      done: taskItems.filter((t) => t.status === "done"),
    };
  }, [data?.items]);

  const success = data?.todaySuccess;
  const score = success?.successScore ?? 0;

  const openCreate = () => {
    setEditId(null);
    setCalendarEventId(null);
    setCalendarEventDay(null);
    setForm({
      title: "",
      time: format(new Date(), "HH:mm"),
      minutes: "60",
    });
    setSyncToCalendar(calendarReady);
    setDialogOpen(true);
  };

  const openEdit = (item: ScheduleItem) => {
    setEditId(item.entityId);
    setCalendarEventId(null);
    setForm({
      title: item.title,
      time: format(parseISO(item.start), "HH:mm"),
      minutes: String(item.measurable?.plannedMinutes ?? 60),
    });
    setSyncToCalendar(true);
    setDialogOpen(true);
  };

  const openCalendarEvent = (item: ScheduleItem) => {
    const start = parseISO(item.start);
    const end = item.end ? parseISO(item.end) : start;
    const durationMins = Math.max(
      15,
      Math.round((end.getTime() - start.getTime()) / 60_000) || 60,
    );
    setEditId(null);
    setCalendarEventId(item.entityId);
    setCalendarEventDay(format(start, "yyyy-MM-dd"));
    setForm({
      title: item.title,
      time: format(start, "HH:mm"),
      minutes: String(durationMins),
    });
    setSyncToCalendar(false);
    setDialogOpen(true);
  };

  const saveTask = useStandMutation(
    (payload: {
      id?: string;
      title: string;
      scheduledAt: string;
      dueDate: string;
      estimatedMinutes: number;
      syncToCalendar: boolean;
      googleCalendarEventId?: string;
    }) =>
      payload.id
        ? tasksApi.update(payload.id, {
            title: payload.title,
            scheduledAt: payload.scheduledAt,
            dueDate: payload.dueDate,
            estimatedMinutes: payload.estimatedMinutes,
            syncToCalendar: payload.syncToCalendar,
          })
        : tasksApi.create({
            title: payload.title,
            scheduledAt: payload.scheduledAt,
            dueDate: payload.dueDate,
            estimatedMinutes: payload.estimatedMinutes,
            syncToCalendar: payload.syncToCalendar,
            googleCalendarEventId: payload.googleCalendarEventId,
          }),
    {
      invalidateKeys: INVALIDATE,
      invalidateAll: false,
      onSuccess: async (task: Task, arg) => {
        setDialogOpen(false);
        setCalendarEventId(null);
        setCalendarEventDay(null);
        await refetch();
        if (arg.googleCalendarEventId) {
          toast.success("Imported from Google Calendar — you can edit it as a task");
        } else if (calendarReady && task.syncToCalendar && task.googleCalendarEventId) {
          toast.success("Task saved — synced to Google");
        } else {
          toast.success("Task saved");
        }
      },
      onError: () => toast.error("Could not save task"),
    },
  );

  const completeTask = useStandMutation(
    (id: string) =>
      tasksApi.update(id, {
        taskStatus: "done",
        completedAt: new Date().toISOString(),
      }),
    {
      invalidateKeys: INVALIDATE,
      invalidateAll: false,
      onSuccess: async () => {
        toast.success("Done", {
          action: {
            label: "Report time",
            onClick: () => {
              window.location.href = "/productivity?tab=tasks";
            },
          },
        });
        await refetch();
      },
    },
  );

  const deleteCalendarEvent = useStandMutation(
    (eventId: string) => integrationsApi.googleCalendar.deleteEvent(eventId),
    {
      invalidateKeys: INVALIDATE,
      invalidateAll: false,
      onSuccess: async () => {
        setDeleteCalendarEventId(null);
        toast.success("Removed from Google Calendar");
        await refetch();
      },
      onError: () => toast.error("Could not remove calendar event"),
    },
  );

  const deleteTask = useStandMutation((id: string) => tasksApi.remove(id), {
    invalidateKeys: INVALIDATE,
    invalidateAll: false,
    onSuccess: async () => {
      setDeleteId(null);
      toast.success(
        calendarReady
          ? "Deleted — removed from Google Calendar too"
          : "Task deleted",
      );
      await refetch();
    },
    onError: () => toast.error("Could not delete"),
  });

  const handleSubmit = () => {
    const t = form.title.trim();
    if (!t) {
      toast.error("Enter a task name");
      return;
    }
    const day = calendarEventDay ?? format(new Date(), "yyyy-MM-dd");
    const scheduledAt = new Date(`${day}T${form.time}`);
    saveTask.mutate({
      id: editId ?? undefined,
      title: t,
      scheduledAt: scheduledAt.toISOString(),
      dueDate: scheduledAt.toISOString(),
      estimatedMinutes: parseInt(form.minutes, 10) || 60,
      syncToCalendar: calendarReady && syncToCalendar,
      googleCalendarEventId: calendarEventId ?? undefined,
    });
  };

  if (!authenticated) {
    return (
      <EmptyState
        title="Sign in to see today"
        description="Your schedule and tasks appear here once you're logged in."
      />
    );
  }

  const todayLabel = data?.today
    ? format(parseISO(data.today), "EEEE")
    : format(new Date(), "EEEE");
  const dateNum = data?.today
    ? format(parseISO(data.today), "MMMM d")
    : format(new Date(), "MMMM d");

  const list = filter === "remaining" ? remaining : done;

  return (
    <div className="space-y-6 w-full">
      <section className="relative overflow-hidden rounded-3xl border border-sky-500/15 bg-gradient-to-br from-sky-500/[0.08] via-background to-cyan-500/[0.05] p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600/90">
              {todayLabel}
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
              {dateNum}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {remaining.length} left · {done.length} done
              {success
                ? ` · ${success.minutesAchieved}m of ${success.minutesPlanned}m`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center">
              <ProgressRing value={score} size={96} stroke={7} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tabular-nums">{score}</span>
                <span className="text-[10px] uppercase text-muted-foreground">
                  score
                </span>
              </div>
            </div>
            <Button
              onClick={openCreate}
              size="lg"
              className="hidden sm:inline-flex gap-2 rounded-xl shadow-lg shadow-primary/15"
            >
              <Plus className="size-4" />
              Add task
            </Button>
          </div>
        </div>
        {!calendarReady && (
          <Link
            href="/settings"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
          >
            <Settings2 className="size-3.5" />
            Connect Google Calendar in Settings
          </Link>
        )}
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SegmentControl
          options={[
            { id: "remaining" as const, label: "Remaining", count: remaining.length },
            { id: "done" as const, label: "Completed", count: done.length },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <Button
          onClick={openCreate}
          size="sm"
          className="sm:hidden gap-1.5 rounded-xl"
        >
          <Plus className="size-4" />
          Add task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title={
            filter === "remaining"
              ? calendarReady
                ? "Clear schedule"
                : "No tasks left today"
              : "Nothing completed yet"
          }
          description={
            filter === "remaining" && !calendarReady
              ? "Add a task or connect Google Calendar to see events here."
              : filter === "remaining"
                ? "You're all caught up for today."
                : "Complete tasks to see them here."
          }
          action={
            filter === "remaining" ? (
              <Button onClick={openCreate} variant="outline" className="rounded-xl">
                Add task
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="pl-0 md:pl-2">
          {list.map((item, i) => {
            const isCalendar = item.kind === "calendar";
            const isGoogleEvent =
              isCalendar && item.meta?.source === "google_api";
            return (
              <TodayTaskRow
                key={item.id}
                item={item}
                isLast={i === list.length - 1}
                variant={isCalendar ? "calendar" : "task"}
                onOpen={
                  isCalendar
                    ? () => openCalendarEvent(item)
                    : () => openEdit(item)
                }
                onToggle={
                  !isCalendar && filter === "remaining"
                    ? () => completeTask.mutate(item.entityId)
                    : undefined
                }
                onEdit={
                  isCalendar
                    ? () => openCalendarEvent(item)
                    : () => openEdit(item)
                }
                onDelete={
                  filter !== "remaining"
                    ? undefined
                    : isGoogleEvent && calendarReady
                      ? () => setDeleteCalendarEventId(item.entityId)
                      : !isCalendar
                        ? () => setDeleteId(item.entityId)
                        : undefined
                }
                toggling={completeTask.isPending}
              />
            );
          })}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteCalendarEventId}
        onOpenChange={(o) => !o && setDeleteCalendarEventId(null)}
        title="Remove from Google Calendar?"
        description="Deletes this event from your Google Calendar. You can also import it as a LifeOS task first."
        onConfirm={() =>
          deleteCalendarEventId &&
          deleteCalendarEvent.mutate(deleteCalendarEventId)
        }
        loading={deleteCalendarEvent.isPending}
      />

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editId ? "edit" : calendarEventId ? "edit" : "create"}
        values={form}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onSubmit={handleSubmit}
        syncEnabled={syncToCalendar}
        onSyncChange={setSyncToCalendar}
        calendarReady={calendarReady}
        onDelete={
          editId
            ? () => {
                setDialogOpen(false);
                setDeleteId(editId);
              }
            : undefined
        }
        saving={saveTask.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete task?"
        description={
          calendarReady
            ? "Removes from today and from Google Calendar."
            : "Removes this task permanently."
        }
        onConfirm={() => deleteId && deleteTask.mutate(deleteId)}
        loading={deleteTask.isPending}
      />
    </div>
  );
}
