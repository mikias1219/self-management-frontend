"use client";

import { format } from "date-fns";
import { CheckSquare, Plus } from "lucide-react";
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
import { useTasksRelations } from "@/hooks/use-module-relations";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { usePeriod } from "@/hooks/use-period";
import { goalsApi, tasksApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { Task } from "@/lib/types";
import type { TaskPriority, TaskStatus } from "@/lib/types/task";
import { filterByDateField } from "@/lib/utils/period";
import Link from "next/link";

const STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "done",
  "cancelled",
];
const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export default function TasksPage() {
  const { query, label } = usePeriod();
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

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
    const pending = tasks.filter((t) => t.taskStatus === "todo").length;
    const done = tasks.filter((t) => t.taskStatus === "done").length;
    const overdue = tasks.filter(
      (t) =>
        t.dueDate &&
        t.taskStatus !== "done" &&
        t.dueDate < format(new Date(), "yyyy-MM-dd"),
    ).length;
    return { pending, done, overdue, total: tasks.length };
  }, [tasks]);

  const invalidate = [["tasks"], ["goals"], ["dashboard"]];

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
        toast.success(editTask ? "Task updated" : "Task created");
      },
      onError: () => toast.error("Failed to save task"),
    },
  );

  const remove = useStandMutation((id: string) => tasksApi.remove(id), {
    invalidateKeys: invalidate,
    onSuccess: () => toast.success("Task deleted"),
  });

  const { links: relationLinks } = useTasksRelations();

  const goalMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of goals ?? []) m.set(g.id, g.title);
    return m;
  }, [goals]);

  const columns: DataTableColumn<Task>[] = useMemo(
    () => [
      { key: "title", header: "Title", cell: (r) => r.title },
      {
        key: "goal",
        header: "Goal",
        cell: (r) =>
          r.goalId ? (
            <Link
              href="/goals"
              className="text-sm text-cyan-600 hover:underline"
            >
              {goalMap.get(r.goalId) ?? "Linked goal"}
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
        key: "priority",
        header: "Priority",
        cell: (r) => <span className="capitalize">{r.priority}</span>,
      },
      {
        key: "due",
        header: "Due",
        cell: (r) =>
          r.dueDate ? format(new Date(r.dueDate), "MMM d") : "—",
      },
    ],
    [goalMap],
  );

  if (!authenticated) {
    return (
      <ModuleShell title="Tasks" icon={CheckSquare} iconClassName="bg-sky-500/15 text-sky-600" showPeriod={false}>
        <p className="text-center text-sm text-muted-foreground py-12">Sign in to manage tasks.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Tasks"
      description={`Todos, priorities & deadlines — ${label}`}
      icon={CheckSquare}
      iconClassName="bg-sky-500/15 text-sky-600"
      actions={
        <Button size="sm" onClick={() => { setEditTask(null); setOpen(true); }}>
          <Plus className="size-4" /> Add task
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={stats.total} loading={isLoading} />
        <StatCard title="Pending" value={stats.pending} loading={isLoading} />
        <StatCard title="Done" value={stats.done} loading={isLoading} />
        <StatCard title="Overdue" value={stats.overdue} loading={isLoading} />
      </div>

      <ModuleRelations links={relationLinks} />

      <DataTable
        columns={columns}
        data={tasks}
        loading={isLoading}
        getRowId={(r) => r.id}
        onEdit={(row) => { setEditTask(row); setOpen(true); }}
        onDelete={(row) => {
          if (window.confirm("Delete this task?")) remove.mutate(row.id);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTask ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const data: Partial<Task> = {
                title: String(fd.get("title")),
                description: String(fd.get("description") ?? "").trim() || undefined,
                taskStatus: fd.get("taskStatus") as TaskStatus,
                priority: fd.get("priority") as TaskPriority,
                dueDate: String(fd.get("dueDate") ?? "") || undefined,
                category: String(fd.get("category") ?? "").trim() || undefined,
                goalId: String(fd.get("goalId") ?? "") || undefined,
              };
              save.mutate({ id: editTask?.id, data });
            }}
          >
            <FormField label="Title" name="title" required defaultValue={editTask?.title} />
            <FormTextarea label="Description" name="description" rows={2} defaultValue={editTask?.description} />
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Status"
                name="taskStatus"
                defaultValue={editTask?.taskStatus ?? "todo"}
                options={STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))}
              />
              <FormSelect
                label="Priority"
                name="priority"
                defaultValue={editTask?.priority ?? "medium"}
                options={PRIORITIES.map((p) => ({ value: p, label: p }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Due date" name="dueDate" type="date" defaultValue={editTask?.dueDate} />
              <FormSelect
                label="Linked goal"
                name="goalId"
                defaultValue={editTask?.goalId ?? ""}
                options={[
                  { value: "", label: "None" },
                  ...(goals ?? []).map((g) => ({ value: g.id, label: g.title })),
                ]}
              />
            </div>
            <FormField label="Category" name="category" defaultValue={editTask?.category} />
            <DialogFooter>
              <Button type="submit" disabled={save.isPending}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
}
