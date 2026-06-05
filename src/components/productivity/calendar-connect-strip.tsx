"use client";

import { Calendar, Download, Link2, Loader2, Unlink } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { integrationsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { cn } from "@/lib/utils";

interface CalendarConnectStripProps {
  connected?: boolean;
  email?: string | null;
  className?: string;
}

export function CalendarConnectStrip({
  connected,
  email,
  className,
}: CalendarConnectStripProps) {
  const authenticated = hasAuthToken();

  const status = useStandData(
    ["integrations", "google-status"],
    () => integrationsApi.googleCalendar.getStatus(),
    { enabled: authenticated },
  );

  const exportInfo = useStandData(
    ["integrations", "export-info"],
    () => integrationsApi.googleCalendar.getExportInfo(),
    { enabled: authenticated },
  );

  const isConfigured = status.data?.configured ?? false;
  const isConnected = connected ?? status.data?.connected ?? false;
  const displayEmail = email ?? status.data?.email;

  const disconnect = useStandMutation(
    () => integrationsApi.googleCalendar.disconnect(),
    {
      invalidateKeys: [
        ["integrations", "google-status"],
        ["productivity", "schedule"],
      ],
      onSuccess: () => toast.success("Google write access disconnected"),
    },
  );

  const connectOAuth = useCallback(async () => {
    try {
      const res = await integrationsApi.googleCalendar.getAuthUrl();
      if (!res.configured || !res.url) {
        const msg =
          !res.configured && "message" in res
            ? res.message
            : undefined;
        toast.error(
          msg ??
            "Google OAuth is not configured on the server (see backend/.env)",
          { duration: 8000 },
        );
        return;
      }
      window.location.href = res.url;
    } catch {
      toast.error("Could not start Google sign-in. Is the API running?");
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
      toast.success(
        "Downloaded. In Google Calendar: Settings → Import → select this file.",
        { duration: 10000 },
      );
    } catch {
      toast.error("Could not download calendar file");
    }
  }, []);

  if (!authenticated) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {!isConfigured && !status.isLoading && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 px-4 py-3 text-sm">
          <p className="font-medium text-sky-900 dark:text-sky-100">
            No Google API? You can still get tasks into Google Calendar
          </p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            You do not need Google Cloud Console for this. Add tasks in LifeOS,
            then <strong>Download .ics</strong> and import into Google Calendar.
            Re-download after you add or change tasks (import again or use a
            new calendar).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => void downloadIcs()}>
              <Download className="size-3.5" />
              Download .ics
            </Button>
          </div>
          <details className="mt-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">
              Optional: full auto-sync (Google API + OAuth)
            </summary>
            <ol className="mt-2 list-decimal list-inside space-y-1">
              <li>
                <a
                  href="https://console.cloud.google.com/projectcreate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Create a Google Cloud project
                </a>{" "}
                (free, no billing required for Calendar API)
              </li>
              <li>
                Enable{" "}
                <a
                  href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google Calendar API
                </a>
              </li>
              <li>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Credentials → OAuth client (Web)
                </a>
                , redirect:{" "}
                <code className="rounded bg-muted px-1">
                  http://localhost:3000/settings/google-callback
                </code>
              </li>
              <li>
                Paste Client ID and Secret in{" "}
                <code className="rounded bg-muted px-1">backend/.env</code>, restart
                dev server
              </li>
              <li>
                <strong>Test users:</strong> on{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials/consent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  OAuth consent screen
                </a>
                , add <code className="rounded bg-muted px-1">mikiyasabate003@gmail.com</code>{" "}
                (fixes “Access blocked / 403 access_denied”)
              </li>
            </ol>
          </details>
        </div>
      )}

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
          isConnected
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-muted",
        )}
      >
        <div className="flex items-start gap-2 min-w-0">
          <Calendar
            className={cn(
              "size-4 shrink-0 mt-0.5",
              isConnected ? "text-emerald-600" : "text-muted-foreground",
            )}
          />
          <div>
            <p className="font-medium">
              {isConnected
                ? "Instant sync (Google API)"
                : isConfigured
                  ? "Connect for instant sync"
                  : "Reading Google events (iCal)"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isConnected
                ? `Tasks sync immediately${displayEmail ? ` as ${displayEmail}` : ""}.`
                : isConfigured
                  ? "OAuth adds/edits/deletes events in Google when you change tasks."
                  : "Your Google events already show via iCal. Use Download .ics to push LifeOS tasks into Google."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isConnected && isConfigured && (
            <Button size="sm" onClick={() => void connectOAuth()}>
              <Link2 className="size-3.5" />
              Connect Google
            </Button>
          )}
          {isConnected && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => disconnect.mutate(undefined)}
              disabled={disconnect.isPending}
            >
              {disconnect.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Unlink className="size-3.5" />
              )}
              Disconnect
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => void downloadIcs()}>
            <Download className="size-3.5" />
            Download .ics
          </Button>
        </div>
      </div>

      {isConfigured && !isConnected && (
        <p className="text-[11px] text-muted-foreground px-1">
          Blocked by Google? Add{" "}
          <code className="rounded bg-muted px-1">mikiyasabate003@gmail.com</code> as
          a{" "}
          <a
            href="https://console.cloud.google.com/apis/credentials/consent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Test user
          </a>
          , then connect again with that account.
        </p>
      )}

      {exportInfo.data?.feedUrl && (
        <p className="text-[11px] text-muted-foreground px-1">
          Subscribe URL (needs a public server):{" "}
          <code className="break-all">{exportInfo.data.feedUrl}</code>
        </p>
      )}
    </div>
  );
}
