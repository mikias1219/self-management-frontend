"use client";

import { format } from "date-fns";
import { Calendar, ExternalLink, Link2, Loader2, Unlink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { integrationsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";

export function GoogleCalendarPanel() {
  const authenticated = hasAuthToken();
  const [icalUrl, setIcalUrl] = useState("");
  const [embedSrc, setEmbedSrc] = useState("");
  const [timezone, setTimezone] = useState("Africa/Nairobi");

  const status = useStandData(
    ["integrations", "google-status"],
    () => integrationsApi.googleCalendar.getStatus(),
    { enabled: authenticated },
  );

  const feed = useStandData(
    ["integrations", "calendar-feed"],
    () => integrationsApi.googleCalendar.getFeed(),
    { enabled: authenticated },
  );

  const events = useStandData(
    ["integrations", "calendar-events"],
    () => integrationsApi.googleCalendar.getEvents(14),
    { enabled: authenticated },
  );

  const embed = useStandData(
    ["integrations", "embed-url"],
    () => integrationsApi.googleCalendar.getEmbedUrl(),
    { enabled: authenticated },
  );

  useEffect(() => {
    if (feed.data) {
      setIcalUrl(feed.data.icalFeedUrl ?? "");
      setEmbedSrc(feed.data.embedSrc ?? "");
      setTimezone(feed.data.timezone ?? "Africa/Nairobi");
    }
  }, [feed.data]);

  const saveFeed = useStandMutation(
    () =>
      integrationsApi.googleCalendar.updateFeed({
        icalFeedUrl: icalUrl.trim() || undefined,
        embedSrc: embedSrc.trim() || undefined,
        timezone: timezone.trim() || "Africa/Nairobi",
      }),
    {
      invalidateKeys: [
        ["integrations", "calendar-feed"],
        ["integrations", "calendar-events"],
        ["integrations", "embed-url"],
      ],
      onSuccess: () => toast.success("Calendar feed saved"),
      onError: () => toast.error("Could not save calendar feed"),
    },
  );

  const connectOAuth = useCallback(async () => {
    try {
      const res = await integrationsApi.googleCalendar.getAuthUrl();
      if (!res.configured || !res.url) {
        const msg =
          !res.configured && "message" in res ? res.message : undefined;
        toast.error(
          msg ??
            "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env",
          { duration: 8000 },
        );
        return;
      }
      window.location.href = res.url;
    } catch {
      toast.error("Could not start Google sign-in. Is the API running?");
    }
  }, []);

  const disconnectOAuth = useStandMutation(
    () => integrationsApi.googleCalendar.disconnect(),
    {
      invalidateKeys: [["integrations", "google-status"]],
      onSuccess: () => toast.success("Disconnected Google write access"),
    },
  );

  if (!authenticated) return null;

  const embedUrl =
    embed.data?.url ??
    (embedSrc
      ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(embedSrc)}&ctz=${encodeURIComponent(timezone)}`
      : null);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="size-4 text-sky-600" />
            Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-xs text-muted-foreground">
            <strong>Read:</strong> paste your private iCal URL to show events here.{" "}
            <strong>Write:</strong> connect OAuth so new tasks/goals sync into Google
            Calendar automatically.
            {feed.data?.usingDefaults && (
              <span className="block mt-1 text-emerald-600">
                Using server calendar defaults (Africa/Nairobi).
              </span>
            )}
          </p>

          <div className="space-y-2">
            <Label htmlFor="embed-src">Calendar email (embed)</Label>
            <Input
              id="embed-src"
              placeholder="you@gmail.com"
              value={embedSrc}
              onChange={(e) => setEmbedSrc(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ical-url">Private iCal URL</Label>
            <Input
              id="ical-url"
              type="url"
              placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
              value={icalUrl}
              onChange={(e) => setIcalUrl(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              From Google Calendar → Settings → your calendar → Secret address in iCal
              format. Never share this URL publicly.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tz">Timezone</Label>
            <Input
              id="tz"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            onClick={() => saveFeed.mutate(undefined)}
            disabled={saveFeed.isPending}
          >
            {saveFeed.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Link2 className="size-4" />
            )}
            Save calendar connection
          </Button>

          <div className="flex flex-wrap gap-2 border-t pt-3">
            {status.data?.connected ? (
              <>
                <span className="text-xs text-emerald-600">
                  Write access: {status.data.email ?? "connected"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => disconnectOAuth.mutate(undefined)}
                  disabled={disconnectOAuth.isPending}
                >
                  <Unlink className="size-3.5" />
                  Disconnect OAuth
                </Button>
              </>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => void connectOAuth()}>
                Connect Google (auto-insert tasks)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {embedUrl && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Live calendar</CardTitle>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary inline-flex items-center gap-1"
            >
              Open <ExternalLink className="size-3" />
            </a>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              src={embedUrl}
              className="w-full border-0"
              style={{ height: 420 }}
              title="Google Calendar"
            />
          </CardContent>
        </Card>
      )}

      {events.data && events.data.configured && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming from Google ({events.data.events.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
              {events.data.events.slice(0, 20).map((ev) => (
                <li
                  key={ev.uid}
                  className="flex justify-between gap-2 border-b border-dashed pb-2 last:border-0"
                >
                  <span className="truncate font-medium">{ev.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {format(new Date(ev.start), "EEE MMM d · HH:mm")}
                    {ev.recurring ? " ↻" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
