"use client";

import { Check, ChevronDown, Plus, Repeat } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ModuleShell } from "@/components/shared/module-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DeleteConfirmDialog } from "@/components/productivity/delete-confirm-dialog";
import { StatCard } from "@/components/shared/stat-card";
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
import { Textarea } from "@/components/ui/textarea";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { usePeriod } from "@/hooks/use-period";
import { habitsApi, productivityApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

const FREQUENCIES = ["daily", "weekly", "monthly"] as const;

export function HabitsModule() {
  const { label } = usePeriod("habits");
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [showAllHabits, setShowAllHabits] = useState(false);

  const { data: habits, isLoading } = useStandData(
    ["habits"],
    () => habitsApi.getAll(),
    { enabled: authenticated },
  );
  const { data: schedule } = useStandData(
    ["productivity", "schedule", "today"],
    () => productivityApi.getSchedule({ scope: "today" }),
    { enabled: authenticated, staleTime: 30_000 },
  );

  const list = habits ?? [];

  const loggedTodayIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of schedule?.items ?? []) {
      if (item.kind === "habit" && item.status === "done") {
        ids.add(item.entityId);
      }
    }
    return ids;
  }, [schedule?.items]);

  const stats = useMemo(() => {
    const totalStreak = list.reduce((s, h) => s + h.currentStreak, 0);
    const best = list.reduce((m, h) => Math.max(m, h.bestStreak), 0);
    const active = list.length;
    return { totalStreak, best, active };
  }, [list]);

  const invalidate = [["habits"], ["dashboard"], ["analytics"], ["productivity", "schedule", "today"]];

  const save = useStandMutation(
    (p: { id?: string; data: Partial<Habit> & { name?: string } }) =>
      p.id
        ? habitsApi.update(p.id, p.data)
        : habitsApi.create(p.data),
    {
      invalidateKeys: invalidate,
      onSuccess: () => {
        setOpen(false);
        setEditHabit(null);
        toast.success("Habit saved");
      },
    },
  );

  const remove = useStandMutation((id: string) => habitsApi.remove(id), {
    invalidateKeys: invalidate,
    onSuccess: () => {
      setDeleteTarget(null);
      toast.success("Habit deleted");
    },
  });

  const checkIn = useStandMutation(
    (habitId: string) =>
      habitsApi.createLog(habitId, {
        completedAt: new Date().toISOString(),
      }),
    {
      invalidateKeys: invalidate,
      onSuccess: () => toast.success("Checked in! Streak updated."),
      onError: () => toast.error("Already logged or failed"),
    },
  );

  const columns: DataTableColumn<Habit>[] = [
    { key: "name", header: "Habit", cell: (r) => r.name },
    { key: "frequency", header: "Frequency", cell: (r) => r.frequency },
    { key: "streak", header: "Streak", cell: (r) => `${r.currentStreak}d` },
    { key: "best", header: "Best", cell: (r) => `${r.bestStreak}d` },
    {
      key: "checkin",
      header: "Today",
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7"
          disabled={loggedTodayIds.has(r.id)}
          onClick={() => checkIn.mutate(r.id)}
        >
          <Check className="size-3.5" /> {loggedTodayIds.has(r.id) ? "Done" : "Log"}
        </Button>
      ),
    },
  ];

  if (!authenticated) {
    return (
      <ModuleShell title="Habits" icon={Repeat} iconClassName="bg-blue-500/15 text-blue-600">
        <p className="text-center text-sm text-muted-foreground py-12">Sign in to track habits.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Habits"
      description={`Daily consistency & streaks — ${label}`}
      icon={Repeat}
      iconClassName="bg-blue-500/15 text-blue-600"
      actions={
        <Button size="sm" onClick={() => { setEditHabit(null); setOpen(true); }}>
          <Plus className="size-4" /> Add habit
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard title="Active habits" value={stats.active} loading={isLoading} />
        <StatCard title="Combined streak" value={`${stats.totalStreak}d`} loading={isLoading} />
        <StatCard title="Best streak" value={`${stats.best}d`} loading={isLoading} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Today&apos;s habits</p>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No habits yet — add your first routine.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {list.map((habit) => {
              const done = loggedTodayIds.has(habit.id);
              return (
                <button
                  key={habit.id}
                  type="button"
                  disabled={done || checkIn.isPending}
                  onClick={() => checkIn.mutate(habit.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    done
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                      : "border-border bg-muted/40 text-foreground hover:bg-muted",
                  )}
                >
                  {done && <Check className="size-3.5" />}
                  <span>{habit.name}</span>
                  <span className="text-xs text-muted-foreground">{habit.currentStreak}d</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
          onClick={() => setShowAllHabits((v) => !v)}
        >
          All habits ({list.length})
          <ChevronDown
            className={cn("size-4 transition-transform", showAllHabits && "rotate-180")}
          />
        </button>
        {showAllHabits && (
          <div className="border-t px-2 pb-2">
            <DataTable
              columns={columns}
              data={list}
              loading={isLoading}
              getRowId={(r) => r.id}
              onEdit={(row) => { setEditHabit(row); setOpen(true); }}
              onDelete={(row) => setDeleteTarget(row)}
            />
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editHabit ? "Edit habit" : "New habit"}</DialogTitle>
          </DialogHeader>
          <form
            key={editHabit?.id ?? "new"}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                id: editHabit?.id,
                data: {
                  name: String(fd.get("name")),
                  description: String(fd.get("description") ?? "").trim() || undefined,
                  frequency: fd.get("frequency") as Habit["frequency"],
                  category: String(fd.get("category") ?? "").trim() || undefined,
                  color: String(fd.get("color") ?? "").trim() || undefined,
                },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required defaultValue={editHabit?.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} defaultValue={editHabit?.description} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="frequency">Frequency</Label>
                <select id="frequency" name="frequency" defaultValue={editHabit?.frequency ?? "daily"} className="h-8 w-full rounded-lg border border-input px-2.5 text-sm">
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color">Color</Label>
                <Input id="color" name="color" placeholder="#3b82f6" defaultValue={editHabit?.color} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={editHabit?.category} />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this habit?"
        description="This cannot be undone."
        loading={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
    </ModuleShell>
  );
}
