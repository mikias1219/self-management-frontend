"use client";

import { format } from "date-fns";
import { CheckCircle2, CheckSquare, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ModuleShell } from "@/components/shared/module-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { FormField, FormSelect, FormTextarea } from "@/components/shared/form-fields";
import { ModuleRelations } from "@/components/shared/module-relations";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
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
import { goalsApi, tasksApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { Task } from "@/lib/types";
import type { TaskPriority, TaskStatus } from "@/lib/types/task";
import { filterByDateField } from "@/lib/utils/period";
import Link from "next/link";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done", "cancelled"];
const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

function formatMinutes(m: number) {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h > 0 && r > 0) return `${h}h ${r}m`;
  if (h > 0) return `${h}h`;
  return r > 0 ? `${r}m` : "—";
}

export function TasksModule() {
  const { query, label } = usePeriod();
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [reportTask, setReportTask] = useState<Task | null>(null);
  const [reportMinutes, setReportMinutes] = useState("");

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

  const tasks = useMemo(
    () =>
      filterByDateField(allTasks ?? [], query, (t) =>
        t.dueDate ?? t.createdAt?.slice(0, 10),
      ),
    [allTasks, query],
  );

  const stats = useMemo(() => {
    const pending = tasks.filter(
      (t) => t.taskStatus === "todo" || t.taskStatus === "in_progress",
    ).length;
    const done = tasks.filter((t) => t.taskStatus === "done").length;
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
    const fulfillment =
      plannedMin > 0 ? Math.round((achievedMin / plannedMin) * 100) : 0;
    return { pending, done, plannedMin, achievedMin, fulfillment, total: tasks.length };
  }, [tasks]);

  const invalidate = [
    ["tasks"],
    ["goals"],
    ["dashboard"],
    ["achievements"],
    ["activity-logs"],
  ];

  const save = useStandMutation(
    (payload: { id?: string; data: Partial<Task> }) =>
      payload.id
        ? tasksApi.update(payload.id, payload.data)
        : tasksApi.create(payload.data),
    {
      invalidateKeys: invalidate,
      onSuccess: () => {
        setOpen(false);
        setEditTask(null);
        toast.success(editTask ? "Plan updated" : "Plan created");
      },
      onError: () => toast.error("Failed to save"),
    },
  );

  const remove = useStandMutation((id: string) => tasksApi.remove(id), {
    invalidateKeys: invalidate,
    onSuccess: () => toast.success("Deleted"),
  });

  const report = useStandMutation(
    (p: { id: string; timeSpentMinutes: number }) =>
      tasksApi.report(p.id, { timeSpentMinutes: p.timeSpentMinutes }),
    {
      invalidateKeys: invalidate,
      onSuccess: () => {
        setReportTask(null);
        toast.success("Achievement reported — visible on dashboard");
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Plans" value={stats.total} loading={isLoading} />
        <StatCard title="Planned time" value={formatMinutes(stats.plannedMin)} loading={isLoading} />
        <StatCard title="Achieved time" value={formatMinutes(stats.achievedMin)} loading={isLoading} />
        <StatCard title="Fulfillment" value={`${stats.fulfillment}%`} loading={isLoading} />
        <StatCard title="Pending" value={stats.pending} loading={isLoading} />
      </div>

      <ModuleRelations links={relationLinks} />

      <DataTable
        columns={columns}
        data={tasks}
        loading={isLoading}
        getRowId={(r) => r.id}
        onEdit={(row) => {
          setEditTask(row);
          setOpen(true);
        }}
        onDelete={(row) => {
          if (window.confirm("Delete this plan?")) remove.mutate(row.id);
        }}
      />

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
              const hours = Number(fd.get("hours") || 0);
              const mins = Number(fd.get("mins") || 0);
              const estimatedMinutes = hours * 60 + mins;
              const data: Partial<Task> = {
                title: String(fd.get("title")),
                description:
                  String(fd.get("description") ?? "").trim() || undefined,
                taskStatus: fd.get("taskStatus") as TaskStatus,
                priority: fd.get("priority") as TaskPriority,
                dueDate: String(fd.get("dueDate") ?? "") || undefined,
                category: String(fd.get("category") ?? "").trim() || undefined,
                goalId: String(fd.get("goalId") ?? "") || undefined,
                estimatedMinutes: estimatedMinutes > 0 ? estimatedMinutes : undefined,
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Planned hours</Label>
                <Input
                  name="hours"
                  type="number"
                  min={0}
                  max={24}
                  defaultValue={
                    editTask?.estimatedMinutes
                      ? Math.floor(editTask.estimatedMinutes / 60)
                      : 2
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Planned minutes</Label>
                <Input
                  name="mins"
                  type="number"
                  min={0}
                  max={59}
                  defaultValue={
                    editTask?.estimatedMinutes
                      ? editTask.estimatedMinutes % 60
                      : 0
                  }
                />
              </div>
            </div>
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
                label="Due date"
                name="dueDate"
                type="date"
                defaultValue={
                  editTask?.dueDate?.slice(0, 10) ??
                  format(new Date(), "yyyy-MM-dd")
                }
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
                report.mutate({ id: reportTask.id, timeSpentMinutes: n });
              }}
              disabled={report.isPending}
            >
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
}
