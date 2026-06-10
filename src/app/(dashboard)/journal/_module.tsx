"use client";

import { format } from "date-fns";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ModuleShell } from "@/components/shared/module-shell";
import { DeleteConfirmDialog } from "@/components/productivity/delete-confirm-dialog";
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
import { MarkdownEditor } from "@/components/shared/markdown-editor";
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

function previewContent(content: string, max = 150) {
  const trimmed = content.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

export function JournalModule() {
  const { query, label } = usePeriod("journal");
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<JournalEntry | null>(null);
  const [readEntry, setReadEntry] = useState<JournalEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);
  const [draftContent, setDraftContent] = useState("");

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
    onSuccess: () => {
      setDeleteTarget(null);
      toast.success("Entry deleted");
    },
  });

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
        <Button size="sm" onClick={() => { setEdit(null); setDraftContent(""); setOpen(true); }}>
          <Plus className="size-4" /> New entry
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard title="Entries" value={stats.count} loading={isLoading} />
        <StatCard title="Words written" value={stats.words} loading={isLoading} />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading entries…</p>
      ) : entries.length === 0 ? (
        <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          No entries yet. Start writing your first journal entry.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="group rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setReadEntry(entry)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{entry.title}</h3>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {entry.entryType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.entryDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {previewContent(entry.content ?? "")}
                  </p>
                </button>
                <div className="flex shrink-0 gap-1 opacity-70 group-hover:opacity-100">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Edit entry"
                    onClick={() => { setEdit(entry); setDraftContent(entry.content ?? ""); setOpen(true); }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive"
                    aria-label="Delete entry"
                    onClick={() => setDeleteTarget(entry)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={readEntry !== null} onOpenChange={(o) => !o && setReadEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{readEntry?.title}</DialogTitle>
          </DialogHeader>
          {readEntry && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {readEntry.entryType}
                </Badge>
                <span>{format(new Date(readEntry.entryDate), "MMMM d, yyyy")}</span>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {readEntry.content}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEdit(readEntry);
                    setDraftContent(readEntry.content ?? "");
                    setReadEntry(null);
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setEdit(null);
            setDraftContent("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{edit ? "Edit entry" : "New journal entry"}</DialogTitle>
          </DialogHeader>
          <form
            key={edit?.id ?? "new"}
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
                  content: draftContent,
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
              <Label>Content</Label>
              <MarkdownEditor
                value={draftContent}
                onChange={setDraftContent}
                placeholder="Write your thoughts… Supports **bold**, lists, and headings."
              />
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

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this entry?"
        description="This cannot be undone."
        loading={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
    </ModuleShell>
  );
}
