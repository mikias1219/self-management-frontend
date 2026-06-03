"use client";

import { format, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { Bell, Check, Plus } from "lucide-react";
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
import { notificationsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { Notification } from "@/lib/types";
import { resolvePeriodRange } from "@/lib/utils/period";

export default function NotificationsPage() {
  const { query, label } = usePeriod();
  const authenticated = hasAuthToken();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Notification | null>(null);

  const { data: all, isLoading } = useStandData(
    ["notifications"],
    () => notificationsApi.getAll(),
    { enabled: authenticated },
  );

  const notifications = useMemo(() => {
    const { start, end } = resolvePeriodRange(query);
    return (all ?? []).filter((n) =>
      isWithinInterval(parseISO(n.createdAt.slice(0, 10)), {
        start: startOfDay(start),
        end,
      }),
    );
  }, [all, query]);

  const unread = notifications.filter((n) => !n.isRead).length;

  const markRead = useStandMutation(
    (id: string) => notificationsApi.update(id, { isRead: true, readAt: new Date().toISOString() }),
    { invalidateKeys: [["notifications"], ["dashboard"]], onSuccess: () => toast.success("Marked as read") },
  );

  const save = useStandMutation(
    (p: { id?: string; data: Partial<Notification> }) =>
      p.id
        ? notificationsApi.update(p.id, p.data)
        : notificationsApi.create(p.data),
    {
      invalidateKeys: [["notifications"]],
      onSuccess: () => {
        setOpen(false);
        setEdit(null);
        toast.success("Notification saved");
      },
    },
  );

  const remove = useStandMutation(
    (id: string) => notificationsApi.remove(id),
    { invalidateKeys: [["notifications"]], onSuccess: () => toast.success("Deleted") },
  );

  const columns: DataTableColumn<Notification>[] = [
    { key: "title", header: "Title", cell: (r) => r.title },
    {
      key: "read",
      header: "Status",
      cell: (r) => (
        <Badge variant={r.isRead ? "outline" : "default"}>
          {r.isRead ? "Read" : "Unread"}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (r) => format(new Date(r.createdAt), "MMM d"),
    },
    {
      key: "mark",
      header: "",
      cell: (r) =>
        !r.isRead ? (
          <Button size="sm" variant="outline" className="h-7" onClick={() => markRead.mutate(r.id)}>
            <Check className="size-3.5" /> Read
          </Button>
        ) : null,
    },
  ];

  if (!authenticated) {
    return (
      <ModuleShell title="Notifications" icon={Bell} iconClassName="bg-slate-500/15 text-slate-600">
        <p className="text-center text-sm text-muted-foreground py-12">Sign in to view notifications.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Notifications"
      description={`Alerts & reminders — ${label}`}
      icon={Bell}
      iconClassName="bg-slate-500/15 text-slate-600"
      actions={
        <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="size-4" /> Add
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard title="Total" value={notifications.length} loading={isLoading} />
        <StatCard title="Unread" value={unread} loading={isLoading} />
      </div>

      <DataTable
        columns={columns}
        data={notifications}
        loading={isLoading}
        getRowId={(r) => r.id}
        onEdit={(r) => { setEdit(r); setOpen(true); }}
        onDelete={(r) => {
          if (window.confirm("Delete?")) remove.mutate(r.id);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit ? "Edit notification" : "New notification"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            save.mutate({
              id: edit?.id,
              data: {
                title: String(fd.get("title")),
                message: String(fd.get("message")),
              },
            });
          }}>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required defaultValue={edit?.title} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={3} required defaultValue={edit?.message} />
            </div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  );
}
