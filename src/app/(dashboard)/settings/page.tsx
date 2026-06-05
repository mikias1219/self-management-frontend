"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FinanceSettingsCard } from "@/components/settings/finance-settings-card";
import { GoogleCalendarSettings } from "@/components/settings/google-calendar-settings";
import { settingsApi } from "@/lib/api";
import { useHasAuthToken } from "@/hooks/use-has-auth-token";
import {
  ACCENT_COLORS,
  accentFromSettings,
  type AccentColorId,
} from "@/lib/theme/accents";
import { useThemeAccent } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";

export default function SettingsPage() {
  const authenticated = useHasAuthToken();
  const { accent, setAccent } = useThemeAccent();

  const { data, isLoading } = useStandData(
    ["settings"],
    () => settingsApi.get(),
    { enabled: authenticated === true },
  );

  useEffect(() => {
    if (!data) return;
    const saved = accentFromSettings(data.theme, data.modulePreferences);
    setAccent(saved);
  }, [data, setAccent]);

  const mutation = useStandMutation(settingsApi.update, {
    invalidateAll: false,
    invalidateKeys: [["settings"]],
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Appearance and integrations. Manage your name, timezone, and currency
          on your Profile.
        </p>
      </div>

      {authenticated === null && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {authenticated === false && (
        <div className="rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
          Sign in to manage settings.
        </div>
      )}

      {authenticated === true && (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <FinanceSettingsCard enabled={authenticated} />
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Accent color used across LifeOS.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const accentColor = fd.get("accentColor") as AccentColorId;
                    setAccent(accentColor);
                    void mutation.mutate({
                      timezone: data?.timezone ?? "UTC",
                      locale: data?.locale ?? "en",
                      theme: "light",
                      modulePreferences: {
                        ...(data?.modulePreferences ?? {}),
                        accentColor,
                      },
                    });
                  }}
                >
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Accent color</legend>
                    <div className="flex flex-wrap gap-2">
                      {ACCENT_COLORS.map((color) => (
                        <label
                          key={color.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                            accent === color.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:bg-muted/50",
                          )}
                        >
                          <input
                            type="radio"
                            name="accentColor"
                            value={color.id}
                            defaultChecked={
                              accentFromSettings(
                                data?.theme,
                                data?.modulePreferences,
                              ) === color.id
                            }
                            className="sr-only"
                            onChange={() => setAccent(color.id)}
                          />
                          <span
                            className="size-4 rounded-full border border-black/10"
                            style={{ background: color.swatch }}
                          />
                          {color.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving…" : "Save preferences"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <GoogleCalendarSettings />
        </div>
      )}
    </div>
  );
}
