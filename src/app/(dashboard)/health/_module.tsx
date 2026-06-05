"use client";

import { format } from "date-fns";
import { Heart, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ModuleShell } from "@/components/shared/module-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { MetricChart } from "@/components/shared/metric-chart";
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
import { healthApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { HealthLog } from "@/lib/types";
import { filterByDateField } from "@/lib/utils/period";

const METRICS = [
  "weight",
  "exercise",
  "sleep",
  "water",
  "steps",
  "workout",
] as const;

const UNITS: Record<string, string> = {
  weight: "kg",
  exercise: "min",
  sleep: "hrs",
  water: "L",
  steps: "steps",
  workout: "min",
};

export function HealthModule() {
  const { query, label } = usePeriod("health");
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<HealthLog | null>(null);

  const { data: all, isLoading } = useStandData(
    ["health"],
    () => healthApi.getAll(),
    { enabled: authenticated },
  );

  const logs = useMemo(
    () => filterByDateField(all ?? [], query, (l) => l.logDate),
    [all, query],
  );

  const weightChart = logs
    .filter((l) => l.metricType === "weight")
    .slice(0, 14)
    .reverse()
    .map((l) => ({
      name: format(new Date(l.logDate), "MMM d"),
      value: Number(l.value),
    }));

  const save = useStandMutation(
    (p: { id?: string; data: Partial<HealthLog> }) =>
      p.id ? healthApi.update(p.id, p.data) : healthApi.create(p.data),
    {
      invalidateKeys: [["health"], ["dashboard"]],
      onSuccess: () => {
        setOpen(false);
        setEdit(null);
        toast.success("Health log saved");
      },
    },
  );

  const remove = useStandMutation((id: string) => healthApi.remove(id), {
    invalidateKeys: [["health"]],
    onSuccess: () => toast.success("Log deleted"),
  });

  const columns: DataTableColumn<HealthLog>[] = [
    {
      key: "metric",
      header: "Metric",
      cell: (r) => <span className="capitalize">{r.metricType.replace("_", " ")}</span>,
    },
    {
      key: "date",
      header: "Date",
      cell: (r) => format(new Date(r.logDate), "MMM d, yyyy"),
    },
    {
      key: "value",
      header: "Value",
      cell: (r) => `${r.value}${r.unit ? ` ${r.unit}` : ""}`,
    },
  ];

  if (!authenticated) {
    return (
      <ModuleShell title="Health" icon={Heart} iconClassName="bg-rose-500/15 text-rose-600">
        <p className="text-center text-sm text-muted-foreground py-12">Sign in to log health.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Health"
      description={`Track body metrics over time — ${label}`}
      icon={Heart}
      iconClassName="bg-rose-500/15 text-rose-600"
      actions={
        <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="size-4" /> Log metric
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard title="Logs" value={logs.length} loading={isLoading} />
        <StatCard title="Metric types" value={new Set(logs.map((l) => l.metricType)).size} loading={isLoading} />
      </div>

      {weightChart.length > 0 && (
        <MetricChart title="Weight trend" data={weightChart} type="line" height={200} color="#f43f5e" />
      )}

      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        getRowId={(r) => r.id}
        onEdit={(row) => { setEdit(row); setOpen(true); }}
        onDelete={(row) => {
          if (window.confirm("Delete this log?")) remove.mutate(row.id);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit ? "Edit log" : "Log health metric"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const metric = String(fd.get("metricType"));
              save.mutate({
                id: edit?.id,
                data: {
                  metricType: metric as HealthLog["metricType"],
                  logDate: String(fd.get("logDate")),
                  value: Number(fd.get("value")),
                  unit: String(fd.get("unit") ?? "").trim() || UNITS[metric],
                  notes: String(fd.get("notes") ?? "").trim() || undefined,
                },
              });
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="metricType">Metric</Label>
                <select id="metricType" name="metricType" defaultValue={edit?.metricType ?? "weight"} className="h-8 w-full rounded-lg border border-input px-2.5 text-sm">
                  {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="logDate">Date</Label>
                <Input id="logDate" name="logDate" type="date" required defaultValue={edit?.logDate ?? format(new Date(), "yyyy-MM-dd")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="value">Value</Label>
                <Input id="value" name="value" type="number" step="0.01" required defaultValue={edit?.value} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" defaultValue={edit?.unit ?? UNITS.weight} />
              </div>
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
