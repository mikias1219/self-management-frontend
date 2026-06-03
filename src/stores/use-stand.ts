"use client";

import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalyticsPeriod, DateRangeQuery } from "@/lib/types";
import {
  type AccentColorId,
  DEFAULT_ACCENT,
  applyAccentToDocument,
} from "@/lib/theme/accents";

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  day: "Today",
  week: "This Week",
  month: "This Month",
  quarter: "This Quarter",
  year: "This Year",
  custom: "Custom",
};

function resolveRange(period: AnalyticsPeriod, start?: Date, end?: Date) {
  const now = new Date();
  switch (period) {
    case "day":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "quarter":
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case "year":
      return { start: startOfYear(now), end: endOfYear(now) };
    case "custom":
      return {
        start: start ?? startOfMonth(now),
        end: end ?? endOfMonth(now),
      };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
}

export function buildPeriodQuery(
  period: AnalyticsPeriod,
  customStart?: Date,
  customEnd?: Date,
): DateRangeQuery {
  const range = resolveRange(period, customStart, customEnd);
  const startDate = format(range.start, "yyyy-MM-dd");
  const endDate = format(range.end, "yyyy-MM-dd");
  return {
    period,
    startDate,
    endDate,
  };
}

interface StandUiState {
  sidebarCollapsed: boolean;
  authReady: boolean;
  moduleSearch: Record<string, string>;
  moduleDialogOpen: Record<string, boolean>;
  pageTab: Record<string, string>;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setAuthReady: (ready: boolean) => void;
  setModuleSearch: (key: string, value: string) => void;
  setModuleDialogOpen: (key: string, open: boolean) => void;
  setPageTab: (page: string, tab: string) => void;
}

export const useStandUi = create<StandUiState>((set) => ({
  sidebarCollapsed: false,
  authReady: false,
  moduleSearch: {},
  moduleDialogOpen: {},
  pageTab: {},
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setAuthReady: (ready) => set({ authReady: ready }),
  setModuleSearch: (key, value) =>
    set((s) => ({
      moduleSearch: { ...s.moduleSearch, [key]: value },
    })),
  setModuleDialogOpen: (key, open) =>
    set((s) => ({
      moduleDialogOpen: { ...s.moduleDialogOpen, [key]: open },
    })),
  setPageTab: (page, tab) =>
    set((s) => ({
      pageTab: { ...s.pageTab, [page]: tab },
    })),
}));

interface StandPeriodState {
  period: AnalyticsPeriod;
  customStart?: Date;
  customEnd?: Date;
  setPeriod: (period: AnalyticsPeriod) => void;
  setCustomRange: (start: Date, end: Date) => void;
  getLabel: () => string;
  getQuery: () => DateRangeQuery;
}

export const useStandPeriod = create<StandPeriodState>((set, get) => ({
  period: "week",
  customStart: undefined,
  customEnd: undefined,
  setPeriod: (period) =>
    set({
      period,
      ...(period !== "custom"
        ? { customStart: undefined, customEnd: undefined }
        : {}),
    }),
  setCustomRange: (start, end) =>
    set({ period: "custom", customStart: start, customEnd: end }),
  getLabel: () => PERIOD_LABELS[get().period],
  getQuery: () =>
    buildPeriodQuery(get().period, get().customStart, get().customEnd),
}));

interface StandThemeState {
  accent: AccentColorId;
  hydrated: boolean;
  setAccent: (accent: AccentColorId) => void;
  hydrate: (accent: AccentColorId) => void;
}

export const useStandTheme = create<StandThemeState>()(
  persist(
    (set) => ({
      accent: DEFAULT_ACCENT,
      hydrated: false,
      setAccent: (accent) => {
        applyAccentToDocument(accent);
        set({ accent, hydrated: true });
      },
      hydrate: (accent) => {
        applyAccentToDocument(accent);
        set({ accent, hydrated: true });
      },
    }),
    { name: "lifeos-accent", partialize: (s) => ({ accent: s.accent }) },
  ),
);

/** Primary app store hook — prefer over useState for client UI state. */
export function useStand() {
  const ui = useStandUi();
  const period = useStandPeriod();
  const theme = useStandTheme();
  return { ui, period, theme };
}
