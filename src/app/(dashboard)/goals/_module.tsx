"use client";

import { format } from "date-fns";
import { Flag, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ModuleShell } from "@/components/shared/module-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { FormField, FormSelect, FormTextarea } from "@/components/shared/form-fields";
import { ModuleRelations } from "@/components/shared/module-relations";
import { StatCard } from "@/components/shared/stat-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGoalsRelations } from "@/hooks/use-module-relations";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { usePeriod } from "@/hooks/use-period";
import { goalsApi } from "@/lib/api";
import { LIFE_AREAS } from "@/lib/types/life-area";
import { hasAuthToken } from "@/lib/api/client";
import type { Goal } from "@/lib/types";
import type { GoalLevel } from "@/lib/types/goal";
import { filterByDateField } from "@/lib/utils/period";

const LEVELS: GoalLevel[] = [
  "vision",
  "yearly",
  "quarterly",
  "monthly",
  "weekly",
  "daily",
];

export function GoalsModule() {
  const { query, label } = usePeriod("goals");
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const { links, goals: allGoals, tasks: allTasks } = useGoalsRelations();
  const { data: goalsData, isLoading } = useStandData(
    ["goals"],
    () => goalsApi.getAll(),
    { enabled: authenticated },
  );

  const goals = useMemo(
    () =>
      filterByDateField(goalsData ?? allGoals, query, (g) =>
        g.targetDate ?? g.createdAt?.slice(0, 10),
      ),
    [goalsData, allGoals, query],
  );

  const taskCountByGoal = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of allTasks) {
      if (t.goalId) m.set(t.goalId, (m.get(t.goalId) ?? 0) + 1);
    }
    return m;
  }, [allTasks]);

  const stats = useMemo(() => {
    const avg =
      goals.length > 0
        ? Math.round(
            goals.reduce((s, g) => s + g.progress, 0) / goals.length,
          )
        : 0;
    return { count: goals.length, avgProgress: avg };
  }, [goals]);

  const save = useStandMutation(
    (p: { id?: string; data: Partial<Goal> }) =>
      p.id ? goalsApi.update(p.id, p.data) : goalsApi.create(p.data),
    {
      invalidateKeys: [
        ["goals"],
        ["tasks"],
        ["dashboard"],
        ["integrations"],
        ["productivity"],
      ],
      onSuccess: () => {
        setOpen(false);
        setEditGoal(null);
        toast.success("Goal saved");
      },
    },
  );

  const remove = useStandMutation((id: string) => goalsApi.remove(id), {
    invalidateKeys: [["goals"], ["tasks"]],
    onSuccess: () => toast.success("Goal deleted"),
  });

  const columns: DataTableColumn<Goal>[] = useMemo(
    () => [
      { key: "title", header: "Title", cell: (r) => r.title },
      { key: "level", header: "Level", cell: (r) => r.level },
      {
        key: "tasks",
        header: "Tasks",
        cell: (r) => {
          const n = taskCountByGoal.get(r.id) ?? 0;
          return n > 0 ? (
            <Link
              href="/productivity?tab=tasks"
              className="text-sky-600 hover:underline"
            >
              {n} linked
            </Link>
          ) : (
            "—"
          );
        },
      },
      {
        key: "progress",
        header: "Progress",
        cell: (r) => (
          <div className="flex min-w-[120px] items-center gap-2">
            <Progress value={r.progress} className="flex-1" />
            <span className="text-xs tabular-nums">{Math.round(r.progress)}%</span>
          </div>
        ),
      },
      {
        key: "target",
        header: "Target",
        cell: (r) =>
          r.targetDate ? format(new Date(r.targetDate), "MMM d, yyyy") : "—",
      },
    ],
    [taskCountByGoal],
  );

  if (!authenticated) {
    return (
      <ModuleShell title="Goals" icon={Flag} iconClassName="bg-cyan-500/15 text-cyan-600">
        <p className="py-12 text-center text-sm text-muted-foreground">Sign in to manage goals.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Goals"
      description={`Vision to daily objectives — ${label}`}
      icon={Flag}
      iconClassName="bg-cyan-500/15 text-cyan-600"
      actions={
        <Button size="sm" onClick={() => { setEditGoal(null); setOpen(true); }}>
          <Plus className="size-4" /> Add goal
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard title="Active goals" value={stats.count} loading={isLoading} />
        <StatCard title="Avg progress" value={`${stats.avgProgress}%`} loading={isLoading} />
      </div>

      <ModuleRelations links={links} />

      <DataTable
        columns={columns}
        data={goals}
        loading={isLoading}
        getRowId={(r) => r.id}
        onEdit={(row) => { setEditGoal(row); setOpen(true); }}
        onDelete={(row) => {
          if (window.confirm("Delete this goal?")) remove.mutate(row.id);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editGoal ? "Edit goal" : "New goal"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                id: editGoal?.id,
                data: {
                  title: String(fd.get("title")),
                  description: String(fd.get("description") ?? "").trim() || undefined,
                  level: fd.get("level") as GoalLevel,
                  progress: Number(fd.get("progress") ?? 0),
                  targetDate: String(fd.get("targetDate") ?? "") || undefined,
                  parentId: String(fd.get("parentId") ?? "") || undefined,
                  lifeArea:
                    (String(fd.get("lifeArea") ?? "") as Goal["lifeArea"]) ||
                    undefined,
                  measurableTarget: fd.get("measurableTarget")
                    ? Number(fd.get("measurableTarget"))
                    : undefined,
                  syncToCalendar: fd.get("syncToCalendar") === "on",
                },
              });
            }}
          >
            <FormField label="Title" name="title" required defaultValue={editGoal?.title} />
            <FormTextarea label="Description" name="description" rows={2} defaultValue={editGoal?.description} />
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Level"
                name="level"
                defaultValue={editGoal?.level ?? "weekly"}
                options={LEVELS.map((l) => ({ value: l, label: l }))}
              />
              <FormField label="Progress %" name="progress" type="number" defaultValue={editGoal?.progress ?? 0} min="0" max="100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Target date" name="targetDate" type="date" defaultValue={editGoal?.targetDate} />
              <FormSelect
                label="Parent goal"
                name="parentId"
                defaultValue={editGoal?.parentId ?? ""}
                options={[
                  { value: "", label: "None" },
                  ...(goalsData ?? allGoals)
                    .filter((g) => g.id !== editGoal?.id)
                    .map((g) => ({ value: g.id, label: g.title })),
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Life area"
                name="lifeArea"
                defaultValue={editGoal?.lifeArea ?? ""}
                options={[
                  { value: "", label: "None" },
                  ...LIFE_AREAS.map((a) => ({ value: a.value, label: a.label })),
                ]}
              />
              <FormField
                label="Measurable target"
                name="measurableTarget"
                type="number"
                min="0"
                defaultValue={editGoal?.measurableTarget}
                placeholder="e.g. 10 tasks"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="syncToCalendar"
                defaultChecked={editGoal?.syncToCalendar !== false}
              />
              Add target date to Google Calendar
            </label>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
}
