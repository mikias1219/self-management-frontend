"use client";

import { format } from "date-fns";
import { Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/productivity/delete-confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
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
import { spiritualApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { SpiritualActivity, SpiritualActivityType } from "@/lib/types";
import { filterByDateField } from "@/lib/utils/period";

const ACTIVITY_TYPES: SpiritualActivityType[] = [
  "prayer",
  "bible_reading",
  "meditation",
  "reflection",
  "church",
];

export function SpiritualModule() {
  const { query, label } = usePeriod("spiritual");
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<SpiritualActivity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SpiritualActivity | null>(null);

  const { data: all, isLoading } = useStandData(
    ["spiritual"],
    () => spiritualApi.getAll(),
    { enabled: authenticated },
  );

  const activities = useMemo(
    () => filterByDateField(all ?? [], query, (a) => a.activityDate),
    [all, query],
  );

  const stats = useMemo(() => {
    const minutes = activities.reduce((s, a) => s + (a.durationMinutes ?? 0), 0);
    return { count: activities.length, minutes };
  }, [activities]);

  const save = useStandMutation(
    (p: { id?: string; data: Partial<SpiritualActivity> }) =>
      p.id ? spiritualApi.update(p.id, p.data) : spiritualApi.create(p.data),
    {
      invalidateKeys: [["spiritual"], ["dashboard"]],
      onSuccess: () => {
        setOpen(false);
        setEdit(null);
        toast.success("Activity saved");
      },
    },
  );

  const remove = useStandMutation((id: string) => spiritualApi.remove(id), {
    invalidateKeys: [["spiritual"]],
    onSuccess: () => {
      setDeleteTarget(null);
      toast.success("Deleted");
    },
  });

  const columns: DataTableColumn<SpiritualActivity>[] = [
    {
      key: "type",
      header: "Type",
      cell: (r) => (
        <span className="capitalize">{r.activityType.replace("_", " ")}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (r) => format(new Date(r.activityDate), "MMM d"),
    },
    {
      key: "duration",
      header: "Min",
      cell: (r) => r.durationMinutes ?? "—",
    },
  ];

  if (!authenticated) {
    return (
      <ModuleShell title="Spiritual" icon={Sparkles} iconClassName="bg-purple-500/15 text-purple-600">
        <p className="text-center text-sm text-muted-foreground py-12">Sign in to log activities.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Spiritual"
      description={`Prayer, meditation & reflection — ${label}`}
      icon={Sparkles}
      iconClassName="bg-purple-500/15 text-purple-600"
      actions={
        <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="size-4" /> Log activity
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard title="Activities" value={stats.count} loading={isLoading} />
        <StatCard title="Total minutes" value={stats.minutes} loading={isLoading} />
      </div>

      <DataTable
        columns={columns}
        data={activities}
        loading={isLoading}
        getRowId={(r) => r.id}
        onEdit={(row) => { setEdit(row); setOpen(true); }}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this activity?"
        description="This cannot be undone."
        loading={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit ? "Edit activity" : "Log activity"}</DialogTitle>
          </DialogHeader>
          <form
            key={edit?.id ?? "new"}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                id: edit?.id,
                data: {
                  activityType: fd.get("activityType") as SpiritualActivityType,
                  activityDate: String(fd.get("activityDate")),
                  durationMinutes: fd.get("durationMinutes")
                    ? Number(fd.get("durationMinutes"))
                    : undefined,
                  notes: String(fd.get("notes") ?? "").trim() || undefined,
                },
              });
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="activityType">Type</Label>
                <select id="activityType" name="activityType" defaultValue={edit?.activityType ?? "prayer"} className="h-8 w-full rounded-lg border border-input px-2.5 text-sm">
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="activityDate">Date</Label>
                <Input id="activityDate" name="activityDate" type="date" required defaultValue={edit?.activityDate ?? format(new Date(), "yyyy-MM-dd")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="durationMinutes">Minutes</Label>
              <Input id="durationMinutes" name="durationMinutes" type="number" min={1} defaultValue={edit?.durationMinutes} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={edit?.notes} />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
}
