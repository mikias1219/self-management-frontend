"use client";

import { create } from "zustand";

export type CacheKey = string;

export function serializeKey(key: unknown[]): CacheKey {
  return JSON.stringify(key);
}

export interface CacheSnapshot<T = unknown> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
}

interface CacheEntry<T = unknown> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  snapshot: CacheSnapshot<T>;
}

const EMPTY_SNAPSHOT: CacheSnapshot = {
  data: undefined,
  loading: false,
  error: null,
};

const listenersByKey = new Map<CacheKey, Set<() => void>>();

function notifyKey(key: CacheKey) {
  listenersByKey.get(key)?.forEach((l) => l());
}

function subscribeKey(key: CacheKey, listener: () => void) {
  if (!listenersByKey.has(key)) listenersByKey.set(key, new Set());
  listenersByKey.get(key)!.add(listener);
  return () => listenersByKey.get(key)?.delete(listener);
}

/** New object each update so useSyncExternalStore sees a changed snapshot. */
function replaceSnapshot<T>(entry: CacheEntry<T>) {
  entry.snapshot = {
    data: entry.data,
    loading: entry.loading,
    error: entry.error,
  };
}

interface DataCacheState {
  entries: Record<CacheKey, CacheEntry>;
  fetchers: Record<CacheKey, () => Promise<unknown>>;
  pendingMutations: number;
  subscribe: (key: CacheKey, listener: () => void) => () => void;
  getSnapshot: <T>(key: CacheKey) => CacheSnapshot<T | undefined>;
  fetch: <T>(keyParts: unknown[], fn: () => Promise<T>) => Promise<T | undefined>;
  register: <T>(keyParts: unknown[], fn: () => Promise<T>) => void;
  refetch: (keyParts: unknown[]) => Promise<void>;
  refetchMany: (keyPartsList: unknown[][]) => void;
  /** Refetch every registered query (used after realtime events). */
  refetchAllRegistered: () => void;
  runMutation: <T>(
    fn: () => Promise<T>,
    options?: { invalidate?: unknown[][]; invalidateAll?: boolean },
  ) => Promise<T>;
}

function ensureEntry<T>(
  entries: Record<CacheKey, CacheEntry>,
  key: CacheKey,
): CacheEntry<T> {
  if (!entries[key]) {
    entries[key] = {
      data: undefined,
      loading: false,
      error: null,
      snapshot: { data: undefined, loading: false, error: null },
    };
  }
  return entries[key] as CacheEntry<T>;
}

export const useDataCache = create<DataCacheState>((set, get) => ({
  entries: {},
  fetchers: {},
  pendingMutations: 0,

  subscribe: subscribeKey,

  getSnapshot: <T>(key: CacheKey) => {
    const entry = get().entries[key];
    return (entry?.snapshot ?? EMPTY_SNAPSHOT) as CacheSnapshot<T | undefined>;
  },

  register: (keyParts, fn) => {
    const key = serializeKey(keyParts);
    set((s) => ({
      fetchers: { ...s.fetchers, [key]: fn as () => Promise<unknown> },
    }));
  },

  fetch: async (keyParts, fn) => {
    const key = serializeKey(keyParts);
    get().register(keyParts, fn);
    set((s) => {
      const entry = ensureEntry(s.entries, key);
      entry.loading = true;
      entry.error = null;
      replaceSnapshot(entry);
      return { entries: { ...s.entries } };
    });
    notifyKey(key);
    try {
      const data = await fn();
      set((s) => {
        const entry = ensureEntry(s.entries, key);
        entry.data = data;
        entry.loading = false;
        entry.error = null;
        replaceSnapshot(entry);
        return { entries: { ...s.entries } };
      });
      notifyKey(key);
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Request failed";
      set((s) => {
        const entry = ensureEntry(s.entries, key);
        entry.error = message;
        entry.loading = false;
        replaceSnapshot(entry);
        return { entries: { ...s.entries } };
      });
      notifyKey(key);
      return undefined;
    }
  },

  refetch: async (keyParts) => {
    const key = serializeKey(keyParts);
    const fn = get().fetchers[key];
    if (fn) await get().fetch(keyParts, fn);
  },

  refetchMany: (keyPartsList) => {
    for (const parts of keyPartsList) {
      void get().refetch(parts);
    }
  },

  refetchAllRegistered: () => {
    const { fetchers } = get();
    for (const key of Object.keys(fetchers)) {
      try {
        const parts = JSON.parse(key) as unknown[];
        void get().refetch(parts);
      } catch {
        /* skip malformed keys */
      }
    }
  },

  runMutation: async (fn, options) => {
    set({ pendingMutations: get().pendingMutations + 1 });
    try {
      const result = await fn();
      if (options?.invalidateAll) {
        get().refetchAllRegistered();
      } else if (options?.invalidate?.length) {
        get().refetchMany(options.invalidate);
      }
      return result;
    } finally {
      set({ pendingMutations: Math.max(0, get().pendingMutations - 1) });
    }
  },
}));
