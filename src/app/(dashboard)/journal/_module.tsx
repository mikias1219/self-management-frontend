"use client";

import { format } from "date-fns";
import { FileText, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ModuleShell } from "@/components/shared/module-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
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
import { Textarea } from "@/components/ui/textarea";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { usePeriod } from "@/hooks/use-period";
import { journalApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { JournalEntry, JournalEntryType } from "@/lib/types";
import { filterByDateField } from "@/lib/utils/period";

const ENTRY_TYPES: JournalEntryType[] = [
  "daily",
  "gratitude",
  "reflection",
  "freeform",
];

export function JournalModule() {
  const { query, label } = usePeriod("journal");
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<JournalEntry | null>(null);

  const { data: all, isLoading } = useStandData(
    ["journal"],
    () => journalApi.getAll(),
    { enabled: authenticated },
  );

  const entries = useMemo(
    () => filterByDateField(all ?? [], query, (e) => e.entryDate),
    [all, query],
  );

  const stats = useMemo(() => {
    const words = entries.reduce(
      (s, e) => s + (e.content?.split(/\s+/).length ?? 0),
      0,
    );
    return { count: entries.length, words };
  }, [entries]);

  const save = useStandMutation(
    (p: { id?: string; data: Partial<JournalEntry> }) =>
      p.id ? journalApi.update(p.id, p.data) : journalApi.create(p.data),
    {
      invalidateKeys: [["journal"], ["dashboard"]],
      onSuccess: () => {
        setOpen(false);
        setEdit(null);
        toast.success("Entry saved");
      },
      onError: () => toast.error("Failed to save — check required fields"),
    },
  );

  const remove = useStandMutation((id: string) => journalApi.remove(id), {
    invalidateKeys: [["journal"]],
    onSuccess: () => toast.success("Entry deleted"),
  });

  const columns: DataTableColumn<JournalEntry>[] = [
    { key: "title", header: "Title", cell: (r) => r.title },
    {
      key: "type",
      header: "Type",
      cell: (r) => (
        <Badge variant="outline" className="capitalize">
          {r.entryType}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (r) => format(new Date(r.entryDate), "MMM d, yyyy"),
    },
  ];

  if (!authenticated) {
    return (
      <ModuleShell title="Journal" icon={FileText} iconClassName="bg-orange-500/15 text-orange-600">
        <p className="text-center text-sm text-muted-foreground py-12">Sign in to write.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Journal"
      description={`Gratitude, reflection & notes — ${label}`}
      icon={FileText}
      iconClassName="bg-orange-500/15 text-orange-600"
      actions={
        <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="size-4" /> New entry
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard title="Entries" value={stats.count} loading={isLoading} />
        <StatCard title="Words written" value={stats.words} loading={isLoading} />
      </div>

      <DataTable
        columns={columns}
        data={entries}
        loading={isLoading}
        getRowId={(r) => r.id}
        onEdit={(row) => { setEdit(row); setOpen(true); }}
        onDelete={(row) => {
          if (window.confirm("Delete this entry?")) remove.mutate(row.id);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{edit ? "Edit entry" : "New journal entry"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const tagsRaw = String(fd.get("tags") ?? "").trim();
              save.mutate({
                id: edit?.id,
                data: {
                  entryType: fd.get("entryType") as JournalEntryType,
                  entryDate: String(fd.get("entryDate")),
                  title: String(fd.get("title")),
                  content: String(fd.get("content")),
                  tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()) : undefined,
                },
              });
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="entryType">Type</Label>
                <select id="entryType" name="entryType" defaultValue={edit?.entryType ?? "daily"} className="h-8 w-full rounded-lg border border-input px-2.5 text-sm">
                  {ENTRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="entryDate">Date</Label>
                <Input id="entryDate" name="entryDate" type="date" required defaultValue={edit?.entryDate ?? format(new Date(), "yyyy-MM-dd")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required defaultValue={edit?.title} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" rows={6} required defaultValue={edit?.content} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" name="tags" defaultValue={edit?.tags?.join(", ")} />
            </div>
            <DialogFooter>
              <Button type="submit">Save entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
}
