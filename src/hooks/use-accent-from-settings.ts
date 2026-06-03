"use client";

import { useEffect } from "react";
import { settingsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { accentFromSettings } from "@/lib/theme/accents";
import { useThemeAccent } from "@/providers/theme-provider";
import { useStandData } from "@/hooks/use-stand-data";

/** Applies saved accent color when the user is authenticated. */
export function useAccentFromSettings() {
  const { setAccent } = useThemeAccent();
  const authenticated = hasAuthToken();

  const { data } = useStandData(
    ["settings"],
    () => settingsApi.get(),
    { enabled: authenticated },
  );

  useEffect(() => {
    if (!data) return;
    setAccent(accentFromSettings(data.theme, data.modulePreferences));
  }, [data, setAccent]);
}
