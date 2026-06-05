"use client";

import {
  AlertTriangle,
  CalendarSync,
  CloudOff,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  Unplug,
} from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { integrationsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { cn } from "@/lib/utils";

interface CalendarSyncBarProps {
  /** From schedule API — optional until loaded */
  connected?: boolean;
  email?: string | null;
  className?: string;
}

export function CalendarSyncBar({ connected, email, className }: CalendarSyncBarProps) {
  const authenticated = hasAuthToken();

  const { data: status, isLoading, refetch } = useStandData(
    ["integrations", "google-status"],
    () => integrationsApi.googleCalendar.getStatus(),
    { enabled: authenticated },
  );

  const isConfigured = status?.configured ?? false;
  const isConnected = connected ?? status?.connected ?? false;
  const apiDisabled = status?.setupError === "api_disabled";
  const needsReconnect =
    !apiDisabled &&
    (status?.needsReconnect ?? status?.scopeError === "insufficient_scopes");
  const syncReady = status?.syncReady ?? false;
  const setupHelpUrl =
    status?.setupHelpUrl ??
    "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com";
  const displayEmail = email ?? status?.email;

  const reconnect = useCallback(async () => {
    try {
      const res = await integrationsApi.googleCalendar.reconnect();
      if (!res.configured || !res.url) {
        const msg =
          "message" in res && res.message
            ? res.message
            : "Google OAuth not configured";
        toast.error(msg);
        return;
      }
      toast.info("Opening Google — approve all calendar permissions");
      window.location.href = res.url;
    } catch {
      toast.error("Reconnect failed");
    }
  }, []);

  const disconnect = useStandMutation(
    () => integrationsApi.googleCalendar.disconnect(),
    {
      invalidateKeys: [
        ["integrations", "google-status"],
        ["productivity", "schedule"],
        ["tasks"],
      ],
      onSuccess: () => toast.success("Google Calendar disconnected"),
    },
  );

  const connectOAuth = useCallback(async () => {
    try {
      const res = await integrationsApi.googleCalendar.getAuthUrl();
      if (!res.configured) {
        const msg =
          "message" in res && res.message
            ? res.message
            : "Google OAuth not configured on server";
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
      toast.success("Downloaded — import in Google Calendar → Settings → Import");
    } catch {
      toast.error("Download failed");
    }
  }, []);

  if (!authenticated) return null;

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3",
          className,
        )}
      >
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Checking calendar connection…</span>
      </div>
    );
  }

  if (isConnected) {
    if (apiDisabled) {
      return (
        <div
          className={cn(
            "flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
            className,
          )}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-amber-900 dark:text-amber-200">
                Enable Google Calendar API in Cloud Console
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                OAuth is connected, but your Google Cloud project must have the{" "}
                <strong>Google Calendar API</strong> enabled. Click the button below, press{" "}
                <strong>Enable</strong>, wait 1–2 minutes, then click Reconnect Google.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href={setupHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ExternalLink className="size-3.5" />
              Enable Calendar API
            </a>
            <Button type="button" variant="outline" size="sm" onClick={() => void reconnect()}>
              Reconnect Google
            </Button>
          </div>
        </div>
      );
    }

    if (needsReconnect) {
      return (
        <div
          className={cn(
            "flex flex-col gap-3 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
            className,
          )}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-rose-800 dark:text-rose-300">
                Connected — but calendar sync is blocked
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {displayEmail && <span className="block truncate">{displayEmail}</span>}
                Google returned <strong>insufficient authentication scopes</strong>. Your old
                token cannot create events. Click <strong>Reconnect Google</strong> below (revokes
                the old token and asks for calendar access again).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button type="button" size="sm" className="gap-1.5" onClick={() => void reconnect()}>
              <RefreshCw className="size-3.5" />
              Reconnect Google
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => disconnect.mutate(undefined)}
              disabled={disconnect.isPending}
            >
              Disconnect
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
            <CalendarSync className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-emerald-800 dark:text-emerald-300">
              Google Calendar ready {syncReady ? "— sync active" : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {displayEmail && <span className="block truncate">{displayEmail}</span>}
              <span className="block mt-0.5">
                Tasks sync to Google as soon as you save.
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void refetch()}
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void downloadIcs()}
          >
            <Download className="size-3.5" />
            Export .ics
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700"
            onClick={() => disconnect.mutate(undefined)}
            disabled={disconnect.isPending}
          >
            <Unplug className="size-3.5" />
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700">
          <CloudOff className="size-5" />
        </div>
        <div>
          <p className="font-medium">Calendar not connected</p>
          <p className="text-sm text-muted-foreground max-w-xl">
            {isConfigured
              ? "Connect Google to push tasks instantly when you create or edit them."
              : "Server OAuth is off — download .ics and import into Google Calendar, or add GOOGLE_CLIENT_ID to backend .env."}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {isConfigured ? (
          <Button type="button" size="sm" className="gap-1.5" onClick={() => void connectOAuth()}>
            <ExternalLink className="size-3.5" />
            Connect Google Calendar
          </Button>
        ) : (
          <Button type="button" size="sm" variant="secondary" className="gap-1.5" onClick={() => void downloadIcs()}>
            <Download className="size-3.5" />
            Download calendar file
          </Button>
        )}
      </div>
    </div>
  );
}
