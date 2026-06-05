"use client";

import {
  CalendarSync,
  CloudOff,
  Download,
  Loader2,
  MoreHorizontal,
  Unplug,
} from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { integrationsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { cn } from "@/lib/utils";

interface CalendarStatusChipProps {
  connected?: boolean;
  email?: string | null;
}

export function CalendarStatusChip({ connected, email }: CalendarStatusChipProps) {
  const authenticated = hasAuthToken();

  const { data: status, isLoading } = useStandData(
    ["integrations", "google-status"],
    () => integrationsApi.googleCalendar.getStatus(),
    { enabled: authenticated },
  );

  const isConfigured = status?.configured ?? false;
  const isConnected = connected ?? status?.connected ?? false;
  const displayEmail = email ?? status?.email;

  const disconnect = useStandMutation(
    () => integrationsApi.googleCalendar.disconnect(),
    {
      invalidateKeys: [
        ["integrations", "google-status"],
        ["productivity", "schedule"],
      ],
      onSuccess: () => toast.success("Calendar disconnected"),
    },
  );

  const connectOAuth = useCallback(async () => {
    try {
      const res = await integrationsApi.googleCalendar.getAuthUrl();
      if (!res.configured || !res.url) {
        const msg =
          "message" in res && res.message
            ? res.message
            : "Google OAuth not configured";
        toast.error(msg);
        return;
      }
      window.location.href = res.url;
    } catch {
      toast.error("Could not start Google sign-in");
    }
  }, []);

  const downloadIcs = useCallback(async () => {
    try {
      const ics = await integrationsApi.googleCalendar.downloadExportIcs();
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lifeos-tasks.ics";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Calendar file downloaded");
    } catch {
      toast.error("Download failed");
    }
  }, []);

  if (!authenticated || isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Calendar
      </span>
    );
  }

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
            "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
          )}
        >
          <CalendarSync className="size-3.5" />
          Synced
          <MoreHorizontal className="size-3 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {displayEmail && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground truncate">
              {displayEmail}
            </p>
          )}
          <DropdownMenuItem onClick={() => void downloadIcs()}>
            <Download className="size-4" />
            Export .ics
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-rose-600"
            onClick={() => disconnect.mutate(undefined)}
          >
            <Unplug className="size-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void (isConfigured ? connectOAuth() : downloadIcs())}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
        "hover:bg-amber-500/15",
      )}
    >
      {isConfigured ? (
        <>
          <CloudOff className="size-3.5" />
          Connect calendar
        </>
      ) : (
        <>
          <Download className="size-3.5" />
          Export to Google
        </>
      )}
    </button>
  );
}
