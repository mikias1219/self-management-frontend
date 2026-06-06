"use client";

import { format, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ModuleShell } from "@/components/shared/module-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DeleteConfirmDialog } from "@/components/productivity/delete-confirm-dialog";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { usePeriod } from "@/hooks/use-period";
import { notificationsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { Notification } from "@/lib/types";
import { resolvePeriodRange } from "@/lib/utils/period";

export default function NotificationsPage() {
  const router = useRouter();
  const { query, label } = usePeriod("notifications");
  const authenticated = hasAuthToken();
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);

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
    (id: string) =>
      notificationsApi.update(id, {
        isRead: true,
        readAt: new Date().toISOString(),
      }),
    {
      invalidateKeys: [["notifications"], ["notifications", "unread-count"], ["dashboard"]],
      onSuccess: () => toast.success("Marked as read"),
    },
  );

  const markAllRead = useStandMutation(
    async () => {
      const unreadItems = (all ?? []).filter((n) => !n.isRead);
      await Promise.all(
        unreadItems.map((n) =>
          notificationsApi.update(n.id, {
            isRead: true,
            readAt: new Date().toISOString(),
          }),
        ),
      );
    },
    {
      invalidateKeys: [["notifications"], ["notifications", "unread-count"], ["dashboard"]],
      onSuccess: () => toast.success("All notifications marked as read"),
    },
  );

  const remove = useStandMutation(
    (id: string) => notificationsApi.remove(id),
    {
      invalidateKeys: [["notifications"], ["notifications", "unread-count"]],
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success("Deleted");
      },
    },
  );

  const openNotification = (notification: Notification) => {
    if (!notification.isRead) {
      void markRead.mutate(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const columns: DataTableColumn<Notification>[] = [
    {
      key: "title",
      header: "Title",
      cell: (r) => (
        <button
          type="button"
          className="text-left hover:underline"
          onClick={() => openNotification(r)}
        >
          {r.title}
        </button>
      ),
    },
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
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex items-center gap-1">
          {r.link && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7"
              onClick={() => openNotification(r)}
            >
              <ExternalLink className="size-3.5" /> Open
            </Button>
          )}
          {!r.isRead && (
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => markRead.mutate(r.id)}
            >
              <Check className="size-3.5" /> Read
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (!authenticated) {
    return (
      <ModuleShell title="Notifications" icon={Bell} iconClassName="bg-slate-500/15 text-slate-600">
        <p className="text-center text-sm text-muted-foreground py-12">
          Sign in to view notifications.
        </p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Notifications"
      description={`System alerts from LifeOS — ${label}`}
      icon={Bell}
      iconClassName="bg-slate-500/15 text-slate-600"
      actions={
        unread > 0 ? (
          <Button
            size="sm"
            variant="outline"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        ) : undefined
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard title="Total" value={notifications.length} loading={isLoading} />
        <StatCard title="Unread" value={unread} loading={isLoading} />
      </div>

      {!isLoading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
          <Bell className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">No notifications</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            LifeOS generates alerts here when something needs your attention — overdue tasks, budget warnings, and more.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={notifications}
          loading={isLoading}
          getRowId={(r) => r.id}
          onDelete={(r) => setDeleteTarget(r)}
        />
      )}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this notification?"
        description="This cannot be undone."
        loading={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
    </ModuleShell>
  );
}
