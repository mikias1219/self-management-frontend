"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import {
  ACCENT_COLORS,
  accentFromSettings,
  type AccentColorId,
} from "@/lib/theme/accents";
import { useThemeAccent } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";

export default function SettingsPage() {
  const authenticated = hasAuthToken();
  const { accent, setAccent } = useThemeAccent();

  const { data, isLoading } = useStandData(
    ["settings"],
    () => settingsApi.get(),
    { enabled: authenticated },
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Timezone, locale, accent color, and notification preferences.
          </p>
        </div>
      </div>

      {!authenticated && (
        <div className="rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
          Sign in to manage settings.
        </div>
      )}

      {authenticated && (
        <Card className="max-w-lg border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const accentColor = fd.get("accentColor") as AccentColorId;
                  setAccent(accentColor);
                  void mutation.mutate({
                    timezone: fd.get("timezone") as string,
                    locale: fd.get("locale") as string,
                    theme: "light",
                    modulePreferences: {
                      ...(data?.modulePreferences ?? {}),
                      accentColor,
                    },
                  });
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    name="timezone"
                    defaultValue={data?.timezone ?? "UTC"}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="locale">Locale</Label>
                  <Input
                    id="locale"
                    name="locale"
                    defaultValue={data?.locale ?? "en"}
                  />
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">Accent color</legend>
                  <p className="text-xs text-muted-foreground">
                    Choose a primary color for buttons, links, charts, and
                    highlights across LifeOS.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_COLORS.map((color) => (
                      <label
                        key={color.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                          accent === color.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border bg-card hover:bg-muted/50",
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
                          className="size-4 shrink-0 rounded-full border border-black/10 shadow-sm"
                          style={{ background: color.swatch }}
                          aria-hidden
                        />
                        {color.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save settings"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
