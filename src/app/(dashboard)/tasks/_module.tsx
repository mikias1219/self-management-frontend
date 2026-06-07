"use client";

import { format } from "date-fns";
import { CheckCircle2, CheckSquare, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TaskPastView } from "@/components/tasks/task-past-view";
import { TaskPresentView } from "@/components/tasks/task-present-view";
import { TaskFutureView } from "@/components/tasks/task-future-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteConfirmDialog } from "@/components/productivity/delete-confirm-dialog";
import { ModuleShell } from "@/components/shared/module-shell";
import { useHubEmbedded } from "@/components/hubs/hub-context";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { FormField, FormSelect, FormTextarea } from "@/components/shared/form-fields";
import { ModuleRelations } from "@/components/shared/module-relations";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTasksRelations } from "@/hooks/use-module-relations";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { usePeriod } from "@/hooks/use-period";
import { activityLogsApi, analyticsApi, goalsApi, tasksApi } from "@/lib/api";
import { taskSuggestsTransaction } from "@/lib/utils/finance-hints";
import { LIFE_AREAS } from "@/lib/types/life-area";
import { hasAuthToken } from "@/lib/api/client";
import type { Task } from "@/lib/types";
import type { TaskPriority, TaskStatus } from "@/lib/types/task";
import { filterByDateField } from "@/lib/utils/period";
import {
  formatMinutes,
  minutesToTimeInput,
  parseTimeInput,
} from "@/lib/utils/time-input";
import Link from "next/link";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "done", "cancelled"];
const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];
const RECURRING_INTERVALS = ["none", "weekly", "monthly", "yearly"] as const;

export function TasksModule() {
  const embedded = useHubEmbedded();
  const router = useRouter();
  const { query, label } = usePeriod("tasks");
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [reportTask, setReportTask] = useState<Task | null>(null);
  const [reportMinutes, setReportMinutes] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [ppfTab, setPpfTab] = useState<"present" | "past" | "future" | "all">("present");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: allTasks, isLoading } = useStandData(
    ["tasks"],
    () => tasksApi.getAll(),
    { enabled: authenticated },
  );
  const { data: goals } = useStandData(
    ["goals"],
    () => goalsApi.getAll(),
    { enabled: authenticated },
  );

  const tasks = useMemo(() => {
    const filtered = filterByDateField(allTasks ?? [], query, (t) =>
      t.dueDate ?? t.createdAt?.slice(0, 10),
    );
    const order = { overdue: 0, today: 1, week: 2, future: 3 } as const;
    const rank = (t: Task) => {
      const now = new Date();
      if (
        t.dueDate &&
        new Date(t.dueDate) < now &&
        t.taskStatus !== "done" &&
        t.taskStatus !== "cancelled"
      )
        return order.overdue;
      if (t.taskStatus === "in_progress") return order.today;
      return order.future;
    };
    return [...filtered].sort((a, b) => rank(a) - rank(b));
  }, [allTasks, query]);

  const { data: taskIntel } = useStandData(
    ["analytics", "task-intelligence"],
    () => analyticsApi.getTaskIntelligence(),
    { enabled: authenticated },
  );

  const { data: recentActivity } = useStandData(
    ["activity-logs", "tasks-finance-hints"],
    () => activityLogsApi.getByPeriod({ period: "week" }),
    { enabled: authenticated, staleTime: 60_000 },
  );

  const financeHints = useMemo(
    () =>
      (recentActivity ?? [])
        .filter(
          (log) =>
            log.module === "tasks" &&
            log.action === "completed" &&
            log.metadata?.suggestRecordTransaction === true,
        )
        .slice(0, 3),
    [recentActivity],
  );

  const stats = useMemo(() => {
    const pending = taskIntel?.metrics.openCount ?? tasks.filter(
      (t) => t.taskStatus === "todo" || t.taskStatus === "in_progress",
    ).length;
    const done = taskIntel?.metrics.completedThisWeek ?? tasks.filter((t) => t.taskStatus === "done").length;
    const plannedMin = tasks.reduce((s, t) => s + (t.estimatedMinutes ?? 0), 0);
    const achievedMin = tasks
      .filter((t) => t.taskStatus === "done")
      .reduce(
        (s, t) =>
          s +
          (t.timeSpentMinutes > 0
            ? t.timeSpentMinutes
            : (t.estimatedMinutes ?? 0)),
        0,
      );
    const fulfillment = taskIntel?.metrics.completionRate ?? (
      plannedMin > 0 ? Math.round((achievedMin / plannedMin) * 100) : 0
    );
    return {
      pending,
      done,
      plannedMin,
      achievedMin,
      fulfillment,
      total: tasks.length,
      overdue: taskIntel?.metrics.overdueCount ?? 0,
      productivity: taskIntel?.metrics.productivityScore ?? 0,
      velocity: taskIntel?.metrics.dailyVelocity ?? 0,
    };
  }, [tasks, taskIntel]);

  const invalidate = [
    ["tasks"],
    ["goals"],
    ["dashboard"],
    ["achievements"],
    ["activity-logs"],
    ["integrations"],
    ["productivity"],
    ["analytics"],
  ];

  const save = useStandMutation(
    (payload: { id?: string; data: Partial<Task> }) =>
      payload.id
        ? tasksApi.update(payload.id, payload.data)
        : tasksApi.create(payload.data),
    {
      invalidateKeys: invalidate,
      onSuccess: (task: Task) => {
        setOpen(false);
        setEditTask(null);
        if (task.syncToCalendar) {
          if (task.googleCalendarEventId) {
            toast.success(editTask ? "Plan updated — synced to Google" : "Plan created — synced to Google");
          } else {
            toast.warning("Saved — connect Google Calendar on Today for instant sync");
          }
        } else {
          toast.success(editTask ? "Plan updated" : "Plan created");
        }
      },
      onError: () => toast.error("Failed to save"),
    },
  );

  const remove = useStandMutation((id: string) => tasksApi.remove(id), {
    invalidateKeys: invalidate,
    onSuccess: () => {
      setDeleteId(null);
      toast.success("Task deleted — removed from Google Calendar when synced");
    },
    onError: () => toast.error("Could not delete task"),
  });

  const report = useStandMutation(
    (p: {
      id: string;
      timeSpentMinutes: number;
      completionNote?: string;
      hintTask?: Task;
    }) =>
      tasksApi.report(p.id, {
        timeSpentMinutes: p.timeSpentMinutes,
        completionNote: p.completionNote,
      }),
    {
      invalidateKeys: invalidate,
      onSuccess: (_, vars) => {
        setReportTask(null);
        setReportNote("");
        toast.success("Achievement reported — visible on dashboard");
        if (vars.hintTask && taskSuggestsTransaction(vars.hintTask)) {
          toast("Record this payment in Finance?", {
            action: {
              label: "Open Finance",
              onClick: () =>
                router.push("/life?tab=finance&action=log-expense"),
            },
          });
        }
      },
    },
  );

  const startTimer = useStandMutation((id: string) => tasksApi.startTimer(id), {
    invalidateKeys: invalidate,
    onSuccess: () => toast.success("Timer started"),
  });

  const bulkDone = useStandMutation(
    (ids: string[]) =>
      Promise.all(
        ids.map((id) =>
          tasksApi.update(id, {
            taskStatus: "done",
            completedAt: new Date().toISOString(),
          }),
        ),
      ),
    {
      invalidateKeys: invalidate,
      onSuccess: () => {
        setSelectedIds(new Set());
        toast.success("Tasks marked done");
      },
    },
  );

  const { links: relationLinks } = useTasksRelations();

  const goalMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of goals ?? []) m.set(g.id, g.title);
    return m;
  }, [goals]);

  const columns: DataTableColumn<Task>[] = useMemo(
    () => [
      { key: "title", header: "Plan / task", cell: (r) => r.title },
      {
        key: "planned",
        header: "Planned",
        cell: (r) => formatMinutes(r.estimatedMinutes ?? 0),
      },
      {
        key: "achieved",
        header: "Achieved",
        cell: (r) =>
          r.taskStatus === "done"
            ? formatMinutes(r.timeSpentMinutes)
            : "—",
      },
      {
        key: "goal",
        header: "Goal",
        cell: (r) =>
          r.goalId ? (
            <Link
              href="/productivity?tab=goals"
              className="text-sm text-cyan-600 hover:underline"
            >
              {goalMap.get(r.goalId) ?? "Goal"}
            </Link>
          ) : (
            "—"
          ),
      },
      {
        key: "area",
        header: "Life area",
        cell: (r) => (
          <span className="capitalize text-xs text-muted-foreground">
            {r.lifeArea ?? "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (r) => (
          <Badge variant="outline" className="capitalize">
            {r.taskStatus.replace("_", " ")}
          </Badge>
        ),
      },
      {
        key: "due",
        header: "Due",
        cell: (r) =>
          r.dueDate ? format(new Date(r.dueDate), "MMM d") : "—",
      },
      {
        key: "calendar",
        header: "Google",
        cell: (r) =>
          r.googleCalendarEventId ? (
            <span className="text-xs text-emerald-600 font-medium">Synced</span>
          ) : r.syncToCalendar ? (
            <span className="text-xs text-amber-600">Not synced</span>
          ) : (
            <span className="text-xs text-muted-foreground">Off</span>
          ),
      },
      {
        key: "report",
        header: "",
        className: "w-[100px]",
        cell: (r) =>
          r.taskStatus !== "done" && r.taskStatus !== "cancelled" ? (
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs"
              onClick={() => {
                setReportTask(r);
                setReportMinutes(String(r.estimatedMinutes ?? 60));
              }}
            >
              <CheckCircle2 className="size-3.5" />
              Report
            </Button>
          ) : null,
      },
    ],
    [goalMap],
  );

  if (!authenticated) {
    return (
      <ModuleShell
        title="Tasks"
        icon={CheckSquare}
        iconClassName="bg-sky-500/15 text-sky-600"
      >
        <p className="py-12 text-center text-sm text-muted-foreground">
          Sign in to manage tasks and plans.
        </p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Tasks & plans"
      description={`Plan your work for ${label.toLowerCase()} — set planned time, then report when finished. Dashboard shows results only.`}
      icon={CheckSquare}
      iconClassName="bg-sky-500/15 text-sky-600"
      actions={
        <Button
          size="sm"
          onClick={() => {
            setEditTask(null);
            setOpen(true);
          }}
        >
          <Plus className="size-4" /> Add plan
        </Button>
      }
    >
      {financeHints.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <p>
              <span className="font-medium">Finance follow-up:</span>{" "}
              {financeHints.length} completed task
              {financeHints.length === 1 ? "" : "s"} may need a transaction recorded.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/life?tab=finance")}
            >
              Record in Finance
            </Button>
          </CardContent>
        </Card>
      )}

      <StatGrid>
        <StatCard title="Open tasks" value={stats.pending} loading={isLoading} />
        <StatCard title="Overdue" value={stats.overdue} loading={isLoading} />
        <StatCard
          title="Completion rate"
          value={`${stats.fulfillment}%`}
          description={`${stats.done} done this week`}
          loading={isLoading}
        />
        <StatCard
          title="Productivity"
          value={`${stats.productivity}/100`}
          description={`${stats.velocity} tasks/day`}
          loading={isLoading}
        />
      </StatGrid>

      {taskIntel && taskIntel.overdue.length > 0 && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm">
          <p className="font-medium text-rose-700 mb-2">Overdue — focus here</p>
          <ul className="space-y-1">
            {taskIntel.overdue.slice(0, 5).map((t) => (
              <li key={t.id} className="flex justify-between gap-2">
                <span>{t.title}</span>
                <span className="text-muted-foreground shrink-0">
                  {t.daysOverdue}d late
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ModuleRelations links={relationLinks} />

      <Tabs value={ppfTab} onValueChange={(v) => setPpfTab(v as typeof ppfTab)}>
        <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {(["present", "past", "future", "all"] as const).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="h-8 rounded-full px-3 capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {ppfTab === "past" && <TaskPastView query={query} label={label} />}
      {ppfTab === "present" && (
        <TaskPresentView
          tasks={allTasks ?? []}
          selectedIds={selectedIds}
          onToggleSelect={(id) =>
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          onReport={(t) => {
            setReportTask(t);
            setReportMinutes(String(t.estimatedMinutes ?? 60));
          }}
          onEdit={(t) => {
            setEditTask(t);
            setOpen(true);
          }}
          onStartTimer={(id) => startTimer.mutate(id)}
          onBulkDone={() => bulkDone.mutate([...selectedIds])}
        />
      )}
      {ppfTab === "future" && (
        <TaskFutureView
          tasks={allTasks ?? []}
          onEdit={(t) => {
            setEditTask(t);
            setOpen(true);
          }}
        />
      )}
      {ppfTab === "all" && (
      <DataTable
        columns={columns}
        data={tasks}
        loading={isLoading}
        getRowId={(r) => r.id}
        onEdit={(row) => {
          setEditTask(row);
          setOpen(true);
        }}
        onDelete={(row) => setDeleteId(row.id)}
      />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTask ? "Edit plan" : "New plan"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const timeStr = String(fd.get("plannedTime") ?? "");
              const parsed = parseTimeInput(timeStr);
              const estimatedMinutes = parsed ?? 0;
              const isRecurring = fd.get("isRecurring") === "on";
              const data: Partial<Task> = {
                title: String(fd.get("title")),
                description:
                  String(fd.get("description") ?? "").trim() || undefined,
                taskStatus: fd.get("taskStatus") as TaskStatus,
                priority: fd.get("priority") as TaskPriority,
                startDate: String(fd.get("startDate") ?? "") || undefined,
                dueDate: String(fd.get("dueDate") ?? "") || undefined,
                lifeArea:
                  (String(fd.get("lifeArea") ?? "") as Task["lifeArea"]) ||
                  undefined,
                category: String(fd.get("category") ?? "").trim() || undefined,
                goalId: String(fd.get("goalId") ?? "") || undefined,
                scheduledAt: String(fd.get("scheduledAt") ?? "") || undefined,
                estimatedMinutes: estimatedMinutes > 0 ? estimatedMinutes : undefined,
                syncToCalendar: fd.get("syncToCalendar") === "on",
                isRecurring,
                recurringInterval: isRecurring
                  ? (String(fd.get("recurringInterval")) as Task["recurringInterval"])
                  : "none",
                parentTaskId: String(fd.get("parentTaskId") || "") || undefined,
              };
              save.mutate({ id: editTask?.id, data });
            }}
          >
            <FormField
              label="What will you do?"
              name="title"
              required
              defaultValue={editTask?.title}
              placeholder="Read Bible"
            />
            <FormTextarea
              label="Notes"
              name="description"
              rows={2}
              defaultValue={editTask?.description}
            />
            <FormField
              label="Planned time (e.g. 2h 30m)"
              name="plannedTime"
              defaultValue={minutesToTimeInput(editTask?.estimatedMinutes ?? 120)}
              placeholder="2h 30m"
            />
            <p className="text-xs text-muted-foreground -mt-2">
              Use life area for routing (work, health). Category is a free tag.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Status"
                name="taskStatus"
                defaultValue={editTask?.taskStatus ?? "todo"}
                options={STATUSES.map((s) => ({
                  value: s,
                  label: s.replace("_", " "),
                }))}
              />
              <FormSelect
                label="Priority"
                name="priority"
                defaultValue={editTask?.priority ?? "medium"}
                options={PRIORITIES.map((p) => ({ value: p, label: p }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Start date"
                name="startDate"
                type="date"
                defaultValue={editTask?.startDate?.slice(0, 10)}
              />
              <FormField
                label="Due date"
                name="dueDate"
                type="date"
                defaultValue={
                  editTask?.dueDate?.slice(0, 10) ??
                  format(new Date(), "yyyy-MM-dd")
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Life area"
                name="lifeArea"
                defaultValue={editTask?.lifeArea ?? "personal"}
                options={LIFE_AREAS.map((a) => ({
                  value: a.value,
                  label: a.label,
                }))}
              />
              <FormSelect
                label="Linked goal"
                name="goalId"
                defaultValue={editTask?.goalId ?? ""}
                options={[
                  { value: "", label: "None" },
                  ...(goals ?? []).map((g) => ({
                    value: g.id,
                    label: g.title,
                  })),
                ]}
              />
            </div>
            <FormField
              label="Category"
              name="category"
              defaultValue={editTask?.category}
              placeholder="spiritual, work…"
            />
            <FormField
              label="Scheduled (for Google Calendar)"
              name="scheduledAt"
              type="datetime-local"
              defaultValue={
                editTask?.scheduledAt?.slice(0, 16) ??
                editTask?.dueDate?.slice(0, 16)
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isRecurring"
                defaultChecked={editTask?.isRecurring}
              />
              Recurring task template
            </label>
            <FormSelect
              label="Repeat interval"
              name="recurringInterval"
              defaultValue={editTask?.recurringInterval ?? "weekly"}
              options={RECURRING_INTERVALS.filter((i) => i !== "none").map(
                (i) => ({ value: i, label: i }),
              )}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="syncToCalendar"
                defaultChecked={editTask?.syncToCalendar !== false}
              />
              Sync to Google Calendar when saved
            </label>
            {editTask?.googleCalendarEventId && (
              <p className="text-xs text-emerald-600">Linked to Google Calendar</p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={save.isPending}>
                Save plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!reportTask}
        onOpenChange={(o) => !o && setReportTask(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report achievement</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {reportTask?.title}
              {reportTask?.estimatedMinutes
                ? ` — planned ${formatMinutes(reportTask.estimatedMinutes)}`
                : ""}
            </p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="spent-min">Minutes completed</Label>
              <Input
                id="spent-min"
                type="number"
                min={0}
                max={24 * 60}
                value={reportMinutes}
                onChange={(e) => setReportMinutes(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="completion-note">What did you achieve?</Label>
              <Input
                id="completion-note"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Read Genesis 1–12…"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This marks the plan done and updates your dashboard achievement
              (planned vs achieved).
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!reportTask) return;
                const n = parseInt(reportMinutes, 10);
                if (Number.isNaN(n) || n < 0) {
                  toast.error("Enter valid minutes");
                  return;
                }
                report.mutate({
                  id: reportTask.id,
                  timeSpentMinutes: n,
                  completionNote: reportNote || undefined,
                  hintTask: reportTask,
                });
              }}
              disabled={report.isPending}
            >
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this task?"
        description="Removes from LifeOS and deletes the Google Calendar event if it was synced."
        onConfirm={() => deleteId && remove.mutate(deleteId)}
        loading={remove.isPending}
      />
    </ModuleShell>
  );
}
