"use client";

import { useEffect } from "react";
import { useStandTheme } from "@/stores/use-stand";
import { getStoredAccent } from "@/lib/theme/accents";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useStandTheme((s) => s.hydrate);

  useEffect(() => {
    hydrate(getStoredAccent());
  }, [hydrate]);

  return children;
}

export function useThemeAccent() {
  const accent = useStandTheme((s) => s.accent);
  const setAccent = useStandTheme((s) => s.setAccent);
  return { accent, setAccent };
}
