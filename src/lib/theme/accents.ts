export type AccentColorId =
  | "blue"
  | "teal"
  | "indigo"
  | "violet"
  | "rose"
  | "amber"
  | "emerald"
  | "slate";

export const ACCENT_COLORS: {
  id: AccentColorId;
  label: string;
  swatch: string;
}[] = [
  { id: "blue", label: "Blue", swatch: "oklch(0.52 0.17 250)" },
  { id: "teal", label: "Teal", swatch: "oklch(0.52 0.17 195)" },
  { id: "indigo", label: "Indigo", swatch: "oklch(0.52 0.17 275)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.52 0.17 305)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.52 0.17 15)" },
  { id: "amber", label: "Amber", swatch: "oklch(0.62 0.15 75)" },
  { id: "emerald", label: "Emerald", swatch: "oklch(0.52 0.14 155)" },
  { id: "slate", label: "Slate", swatch: "oklch(0.42 0.03 260)" },
];

export const DEFAULT_ACCENT: AccentColorId = "blue";

export const ACCENT_STORAGE_KEY = "lifeos-accent";

export function isAccentColorId(value: string): value is AccentColorId {
  return ACCENT_COLORS.some((c) => c.id === value);
}

export function applyAccentToDocument(accent: AccentColorId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-accent", accent);
  localStorage.setItem(ACCENT_STORAGE_KEY, accent);
}

export function getStoredAccent(): AccentColorId {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
  if (stored && isAccentColorId(stored)) return stored;
  return DEFAULT_ACCENT;
}

export function accentFromSettings(
  theme?: string,
  modulePreferences?: Record<string, unknown>,
): AccentColorId {
  const fromPrefs = modulePreferences?.accentColor;
  if (typeof fromPrefs === "string" && isAccentColorId(fromPrefs)) {
    return fromPrefs;
  }
  if (theme && isAccentColorId(theme)) return theme;
  if (theme === "light" || theme === "dark" || theme === "system") {
    return DEFAULT_ACCENT;
  }
  return DEFAULT_ACCENT;
}
