"use client";

import { format } from "date-fns";
import { Languages, Plus } from "lucide-react";
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
import { englishApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { EnglishPractice, EnglishPracticeType } from "@/lib/types";
import { filterByDateField } from "@/lib/utils/period";

const PRACTICE_TYPES: EnglishPracticeType[] = [
  "speaking",
  "listening",
  "reading",
  "writing",
  "vocabulary",
  "grammar",
];

export function EnglishModule() {
  const { query, label } = usePeriod("english");
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<EnglishPractice | null>(null);

  const { data: all, isLoading } = useStandData(
    ["english"],
    () => englishApi.getAll(),
    { enabled: authenticated },
  );

  const sessions = useMemo(
    () => filterByDateField(all ?? [], query, (p) => p.practiceDate),
    [all, query],
  );

  const stats = useMemo(() => {
    const minutes = sessions.reduce((s, p) => s + p.durationMinutes, 0);
    const scored = sessions.filter((p) => p.score != null);
    const avgScore =
      scored.length > 0
        ? (scored.reduce((s, p) => s + (p.score ?? 0), 0) / scored.length).toFixed(1)
        : "—";
    return { count: sessions.length, minutes, avgScore };
  }, [sessions]);

  const byType = PRACTICE_TYPES.map((t) => ({
    name: t,
    value: sessions.filter((p) => p.practiceType === t).reduce((s, p) => s + p.durationMinutes, 0),
  })).filter((d) => d.value > 0);

  const save = useStandMutation(
    (p: { id?: string; data: Partial<EnglishPractice> }) =>
      p.id ? englishApi.update(p.id, p.data) : englishApi.create(p.data),
    {
      invalidateKeys: [["english"], ["dashboard"]],
      onSuccess: () => {
        setOpen(false);
        setEdit(null);
        toast.success("Practice saved");
      },
    },
  );

  const remove = useStandMutation((id: string) => englishApi.remove(id), {
    invalidateKeys: [["english"]],
    onSuccess: () => toast.success("Deleted"),
  });

  const columns: DataTableColumn<EnglishPractice>[] = [
    {
      key: "type",
      header: "Type",
      cell: (r) => <span className="capitalize">{r.practiceType}</span>,
    },
    {
      key: "date",
      header: "Date",
      cell: (r) => format(new Date(r.practiceDate), "MMM d"),
    },
    { key: "duration", header: "Min", cell: (r) => r.durationMinutes },
    { key: "score", header: "Score", cell: (r) => r.score ?? "—" },
  ];

  if (!authenticated) {
    return (
      <ModuleShell title="English" icon={Languages} iconClassName="bg-teal-500/15 text-teal-600">
        <p className="text-center text-sm text-muted-foreground py-12">Sign in to track practice.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="English"
      description={`Speaking, reading, writing practice — ${label}`}
      icon={Languages}
      iconClassName="bg-teal-500/15 text-teal-600"
      actions={
        <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="size-4" /> Log practice
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard title="Sessions" value={stats.count} loading={isLoading} />
        <StatCard title="Minutes" value={stats.minutes} loading={isLoading} />
        <StatCard title="Avg score" value={stats.avgScore} loading={isLoading} />
      </div>

      {byType.length > 0 && (
        <MetricChart title="Minutes by type" data={byType} type="bar" height={200} multiColor color="#14b8a6" />
      )}

      <DataTable
        columns={columns}
        data={sessions}
        loading={isLoading}
        getRowId={(r) => r.id}
        onEdit={(row) => { setEdit(row); setOpen(true); }}
        onDelete={(row) => {
          if (window.confirm("Delete?")) remove.mutate(row.id);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit ? "Edit practice" : "Log practice"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                id: edit?.id,
                data: {
                  practiceType: fd.get("practiceType") as EnglishPracticeType,
                  practiceDate: String(fd.get("practiceDate")),
                  durationMinutes: Number(fd.get("durationMinutes")),
                  score: fd.get("score") ? Number(fd.get("score")) : undefined,
                  notes: String(fd.get("notes") ?? "").trim() || undefined,
                },
              });
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="practiceType">Type</Label>
                <select id="practiceType" name="practiceType" defaultValue={edit?.practiceType ?? "reading"} className="h-8 w-full rounded-lg border border-input px-2.5 text-sm">
                  {PRACTICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="practiceDate">Date</Label>
                <Input id="practiceDate" name="practiceDate" type="date" required defaultValue={edit?.practiceDate ?? format(new Date(), "yyyy-MM-dd")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="durationMinutes">Minutes</Label>
                <Input id="durationMinutes" name="durationMinutes" type="number" min={1} required defaultValue={edit?.durationMinutes ?? 30} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="score">Score (optional)</Label>
                <Input id="score" name="score" type="number" min={0} max={100} defaultValue={edit?.score} />
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
