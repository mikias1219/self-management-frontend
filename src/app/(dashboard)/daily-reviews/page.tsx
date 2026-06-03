"use client";

import { format } from "date-fns";
import { Plus, Sun } from "lucide-react";
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
import { dailyReviewsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { DailyReview } from "@/lib/types";
import { filterByDateField } from "@/lib/utils/period";

export default function DailyReviewsPage() {
  const { query, label } = usePeriod();
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<DailyReview | null>(null);

  const { data: all, isLoading } = useStandData(
    ["daily-reviews"],
    () => dailyReviewsApi.getAll(),
    { enabled: authenticated },
  );

  const reviews = useMemo(
    () => filterByDateField(all ?? [], query, (r) => r.reviewDate),
    [all, query],
  );

  const stats = useMemo(() => {
    const moods = reviews.filter((r) => r.moodScore != null);
    const prod = reviews.filter((r) => r.productivityScore != null);
    const avgMood =
      moods.length > 0
        ? (moods.reduce((s, r) => s + (r.moodScore ?? 0), 0) / moods.length).toFixed(1)
        : "—";
    const avgProd =
      prod.length > 0
        ? (prod.reduce((s, r) => s + (r.productivityScore ?? 0), 0) / prod.length).toFixed(1)
        : "—";
    return { count: reviews.length, avgMood, avgProd };
  }, [reviews]);

  const moodChart = reviews
    .filter((r) => r.moodScore != null)
    .slice(0, 14)
    .reverse()
    .map((r) => ({
      name: format(new Date(r.reviewDate), "MMM d"),
      value: r.moodScore ?? 0,
    }));

  const save = useStandMutation(
    (p: { id?: string; data: Partial<DailyReview> }) =>
      p.id ? dailyReviewsApi.update(p.id, p.data) : dailyReviewsApi.create(p.data),
    {
      invalidateKeys: [["daily-reviews"], ["dashboard"]],
      onSuccess: () => {
        setOpen(false);
        setEdit(null);
        toast.success("Review saved");
      },
    },
  );

  const remove = useStandMutation((id: string) => dailyReviewsApi.remove(id), {
    invalidateKeys: [["daily-reviews"]],
    onSuccess: () => toast.success("Review deleted"),
  });

  const columns: DataTableColumn<DailyReview>[] = [
    {
      key: "date",
      header: "Date",
      cell: (r) => format(new Date(r.reviewDate), "MMM d, yyyy"),
    },
    {
      key: "mood",
      header: "Mood",
      cell: (r) => (r.moodScore != null ? `${r.moodScore}/10` : "—"),
    },
    {
      key: "productivity",
      header: "Productivity",
      cell: (r) =>
        r.productivityScore != null ? `${r.productivityScore}/10` : "—",
    },
    {
      key: "focus",
      header: "Tomorrow focus",
      cell: (r) => r.tomorrowFocus ?? "—",
    },
  ];

  if (!authenticated) {
    return (
      <ModuleShell title="Daily Reviews" icon={Sun} iconClassName="bg-indigo-500/15 text-indigo-600" showPeriod={false}>
        <p className="text-center text-sm text-muted-foreground py-12">Sign in to write reviews.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Daily Reviews"
      description={`Reflect on wins, lessons & tomorrow — ${label}`}
      icon={Sun}
      iconClassName="bg-indigo-500/15 text-indigo-600"
      actions={
        <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="size-4" /> New review
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard title="Reviews" value={stats.count} loading={isLoading} />
        <StatCard title="Avg mood" value={stats.avgMood} loading={isLoading} />
        <StatCard title="Avg productivity" value={stats.avgProd} loading={isLoading} />
      </div>

      {moodChart.length > 0 && (
        <MetricChart title="Mood trend" data={moodChart} type="line" height={200} color="#6366f1" />
      )}

      <DataTable
        columns={columns}
        data={reviews}
        loading={isLoading}
        getRowId={(r) => r.id}
        onEdit={(row) => { setEdit(row); setOpen(true); }}
        onDelete={(row) => {
          if (window.confirm("Delete this review?")) remove.mutate(row.id);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{edit ? "Edit review" : "Daily review"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                id: edit?.id,
                data: {
                  reviewDate: String(fd.get("reviewDate")),
                  wins: String(fd.get("wins") ?? "").trim() || undefined,
                  challenges: String(fd.get("challenges") ?? "").trim() || undefined,
                  lessons: String(fd.get("lessons") ?? "").trim() || undefined,
                  tomorrowFocus: String(fd.get("tomorrowFocus") ?? "").trim() || undefined,
                  moodScore: fd.get("moodScore") ? Number(fd.get("moodScore")) : undefined,
                  productivityScore: fd.get("productivityScore")
                    ? Number(fd.get("productivityScore"))
                    : undefined,
                },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="reviewDate">Date</Label>
              <Input
                id="reviewDate"
                name="reviewDate"
                type="date"
                required
                defaultValue={edit?.reviewDate ?? format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="moodScore">Mood (1-10)</Label>
                <Input id="moodScore" name="moodScore" type="number" min={1} max={10} defaultValue={edit?.moodScore} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="productivityScore">Productivity (1-10)</Label>
                <Input id="productivityScore" name="productivityScore" type="number" min={1} max={10} defaultValue={edit?.productivityScore} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wins">Wins</Label>
              <Textarea id="wins" name="wins" rows={2} defaultValue={edit?.wins} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="challenges">Challenges</Label>
              <Textarea id="challenges" name="challenges" rows={2} defaultValue={edit?.challenges} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lessons">Lessons</Label>
              <Textarea id="lessons" name="lessons" rows={2} defaultValue={edit?.lessons} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tomorrowFocus">Tomorrow focus</Label>
              <Input id="tomorrowFocus" name="tomorrowFocus" defaultValue={edit?.tomorrowFocus} />
            </div>
            <DialogFooter>
              <Button type="submit">Save review</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
}
