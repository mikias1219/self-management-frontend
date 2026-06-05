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
import Link from "next/link";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { integrationsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { cn } from "@/lib/utils";

export function GoogleCalendarSettings() {
  const authenticated = hasAuthToken();

  const { data: status, isLoading, refetch } = useStandData(
    ["integrations", "google-status"],
    () => integrationsApi.googleCalendar.getStatus(),
    { enabled: authenticated },
  );

  const isConfigured = status?.configured ?? false;
  const isConnected = status?.connected ?? false;
  const apiDisabled = status?.setupError === "api_disabled";
  const needsReconnect =
    !apiDisabled &&
    (status?.needsReconnect ?? status?.scopeError === "insufficient_scopes");
  const syncReady = status?.syncReady ?? false;
  const setupHelpUrl =
    status?.setupHelpUrl ??
    "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com";
  const displayEmail = status?.email;

  const reconnect = useCallback(async () => {
    try {
      const res = await integrationsApi.googleCalendar.reconnect();
      if (!res.configured || !res.url) {
        const msg =
          "message" in res && res.message ? res.message : "Google OAuth not configured";
        toast.error(msg);
        return;
      }
      toast.info("Opening Google — approve calendar permissions");
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
      toast.success("Downloaded — import in Google Calendar");
    } catch {
      toast.error("Download failed");
    }
  }, []);

  if (!authenticated) return null;

  return (
    <Card className="border shadow-sm h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarSync className="size-5 text-sky-600" />
          Google Calendar
        </CardTitle>
        <CardDescription>
          Connect once here. Tasks you create or delete in Productivity sync to Google
          automatically when sync is enabled on each task.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="size-4 animate-spin" />
            Checking connection…
          </div>
        ) : apiDisabled ? (
          <StatusBlock variant="warning" title="Enable Calendar API in Google Cloud">
            <p className="text-sm text-muted-foreground">
              OAuth is linked, but the Calendar API is off for your project. Enable it,
              wait 1–2 minutes, then reconnect.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={setupHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
              >
                <ExternalLink className="size-3.5" />
                Enable API
              </a>
              <Button type="button" size="sm" variant="outline" onClick={() => void reconnect()}>
                Reconnect
              </Button>
            </div>
          </StatusBlock>
        ) : needsReconnect ? (
          <StatusBlock variant="error" title="Permissions need refresh">
            <p className="text-sm text-muted-foreground">
              {displayEmail && <span className="block font-medium text-foreground">{displayEmail}</span>}
              Calendar scopes are outdated. Reconnect to allow creating and deleting events.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" size="sm" onClick={() => void reconnect()}>
                <RefreshCw className="size-3.5" />
                Reconnect Google
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => disconnect.mutate(undefined)}
                disabled={disconnect.isPending}
              >
                Disconnect
              </Button>
            </div>
          </StatusBlock>
        ) : isConnected ? (
          <StatusBlock variant="success" title={syncReady ? "Connected & syncing" : "Connected"}>
            {displayEmail && (
              <p className="text-sm font-medium truncate">{displayEmail}</p>
            )}
            <p className="text-sm text-muted-foreground">
              New and updated tasks can appear in Google Calendar. Deleting a task in LifeOS
              removes its calendar event.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
                <RefreshCw className="size-3.5" />
                Test connection
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => void downloadIcs()}>
                <Download className="size-3.5" />
                Export .ics
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-rose-600"
                onClick={() => disconnect.mutate(undefined)}
                disabled={disconnect.isPending}
              >
                <Unplug className="size-3.5" />
                Disconnect
              </Button>
            </div>
          </StatusBlock>
        ) : (
          <StatusBlock variant="muted" title="Not connected">
            <p className="text-sm text-muted-foreground">
              {isConfigured
                ? "Sign in with Google to sync tasks both ways."
                : "Server OAuth is not configured. You can still export a calendar file."}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {isConfigured ? (
                <Button type="button" size="sm" onClick={() => void connectOAuth()}>
                  <ExternalLink className="size-3.5" />
                  Connect Google Calendar
                </Button>
              ) : (
                <Button type="button" size="sm" variant="secondary" onClick={() => void downloadIcs()}>
                  <Download className="size-3.5" />
                  Download .ics
                </Button>
              )}
            </div>
          </StatusBlock>
        )}

        <p className="text-xs text-muted-foreground border-t pt-3">
          After connecting, open{" "}
          <Link href="/productivity" className="text-primary hover:underline">
            Productivity → Today
          </Link>{" "}
          to manage your schedule.
        </p>
      </CardContent>
    </Card>
  );
}

function StatusBlock({
  variant,
  title,
  children,
}: {
  variant: "success" | "warning" | "error" | "muted";
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    success: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    error: "border-rose-500/30 bg-rose-500/5",
    muted: "border-border bg-muted/30",
  };
  const icons = {
    success: CalendarSync,
    warning: AlertTriangle,
    error: AlertTriangle,
    muted: CloudOff,
  };
  const Icon = icons[variant];
  const iconColor = {
    success: "text-emerald-600",
    warning: "text-amber-600",
    error: "text-rose-600",
    muted: "text-muted-foreground",
  };

  return (
    <div className={cn("rounded-lg border p-4 space-y-2", styles[variant])}>
      <p className={cn("font-medium flex items-center gap-2 text-sm", iconColor[variant])}>
        <Icon className="size-4" />
        {title}
      </p>
      {children}
    </div>
  );
}
