"use client";

import { format } from "date-fns";
import { ChevronDown, Flag, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ModuleShell } from "@/components/shared/module-shell";
import { DeleteConfirmDialog } from "@/components/productivity/delete-confirm-dialog";
import { FormField, FormSelect, FormTextarea } from "@/components/shared/form-fields";
import { ModuleRelations } from "@/components/shared/module-relations";
import { GoalProgressSlider } from "@/components/shared/goal-progress-slider";
import { AIInsightCard } from "@/components/shared/ai-insight-card";
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
import { cn } from "@/lib/utils";

const LEVELS: GoalLevel[] = ["life", "milestone", "target"];

const LEVEL_LABELS: Record<string, string> = {
  life: "Life Goals",
  milestone: "Milestones",
  target: "Weekly Targets",
  vision: "Life Goals",
  yearly: "Life Goals",
  quarterly: "Milestones",
  monthly: "Milestones",
  weekly: "Weekly Targets",
  daily: "Weekly Targets",
};

function normalizeGoalLevel(level: GoalLevel): GoalLevel {
  if (level === "vision" || level === "yearly") return "life";
  if (level === "quarterly" || level === "monthly") return "milestone";
  if (level === "weekly" || level === "daily") return "target";
  return level;
}

export function GoalsModule() {
  const { query, label } = usePeriod("goals");
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});

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

  const goalsByLevel = useMemo(() => {
    const grouped = new Map<GoalLevel, Goal[]>();
    for (const level of LEVELS) grouped.set(level, []);
    for (const goal of goals) {
      grouped.get(normalizeGoalLevel(goal.level))?.push(goal);
    }
    return grouped;
  }, [goals]);

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
    onSuccess: () => {
      setDeleteTarget(null);
      toast.success("Goal deleted");
    },
  });

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

      <AIInsightCard moduleKey="goals" />

      <div className="space-y-4">
        {LEVELS.map((level) => {
          const levelGoals = goalsByLevel.get(level) ?? [];
          if (levelGoals.length === 0) return null;
          const collapsed = collapsedLevels[level] ?? false;
          return (
            <section key={level} className="rounded-xl border">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
                onClick={() =>
                  setCollapsedLevels((s) => ({ ...s, [level]: !collapsed }))
                }
              >
                {LEVEL_LABELS[level]} ({levelGoals.length})
                <ChevronDown
                  className={cn("size-4 transition-transform", !collapsed && "rotate-180")}
                />
              </button>
              {!collapsed && (
                <div className="space-y-2 border-t p-3">
                  {levelGoals.map((goal) => {
                    const taskCount = taskCountByGoal.get(goal.id) ?? 0;
                    return (
                      <div
                        key={goal.id}
                        className="rounded-lg border bg-card p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{goal.title}</p>
                            {goal.targetDate && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Target {format(new Date(goal.targetDate), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setEditGoal(goal); setOpen(true); }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => setDeleteTarget(goal)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <GoalProgressSlider
                            goalId={goal.id}
                            initialProgress={goal.progress}
                            label={goal.title}
                          />
                        </div>
                        {taskCount > 0 && (
                          <Link
                            href="/productivity?tab=tasks"
                            className="mt-2 inline-block text-xs text-sky-600 hover:underline"
                          >
                            {taskCount} linked task{taskCount === 1 ? "" : "s"}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
        {!isLoading && goals.length === 0 && (
          <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            No goals in this period. Add one to start building your hierarchy.
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editGoal ? "Edit goal" : "New goal"}</DialogTitle>
          </DialogHeader>
          <form
            key={editGoal?.id ?? "new"}
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
                defaultValue={editGoal ? normalizeGoalLevel(editGoal.level) : "target"}
                options={LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l] }))}
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

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this goal?"
        description="This cannot be undone."
        loading={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
    </ModuleShell>
  );
}
