"use client";

import { create } from "zustand";

export type CacheKey = string;

/** Default cache freshness — skip network when data is younger than this. */
export const DEFAULT_STALE_MS = 30_000;

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
  fetchedAt: number | null;
  snapshot: CacheSnapshot<T>;
}

const EMPTY_SNAPSHOT: CacheSnapshot = {
  data: undefined,
  loading: false,
  error: null,
};

const listenersByKey = new Map<CacheKey, Set<() => void>>();
const inflightByKey = new Map<CacheKey, Promise<unknown>>();

function notifyKey(key: CacheKey) {
  listenersByKey.get(key)?.forEach((l) => l());
}

function subscribeKey(key: CacheKey, listener: () => void) {
  if (!listenersByKey.has(key)) listenersByKey.set(key, new Set());
  listenersByKey.get(key)!.add(listener);
  return () => listenersByKey.get(key)?.delete(listener);
}

function replaceSnapshot<T>(entry: CacheEntry<T>) {
  entry.snapshot = {
    data: entry.data,
    loading: entry.loading,
    error: entry.error,
  };
}

function isFresh(entry: CacheEntry | undefined, staleMs: number): boolean {
  if (!entry || entry.data === undefined || entry.fetchedAt === null) return false;
  return Date.now() - entry.fetchedAt < staleMs;
}

interface FetchOptions {
  staleMs?: number;
  force?: boolean;
}

interface DataCacheState {
  entries: Record<CacheKey, CacheEntry>;
  fetchers: Record<CacheKey, () => Promise<unknown>>;
  pendingMutations: number;
  subscribe: (key: CacheKey, listener: () => void) => () => void;
  getSnapshot: <T>(key: CacheKey) => CacheSnapshot<T | undefined>;
  fetch: <T>(
    keyParts: unknown[],
    fn: () => Promise<T>,
    options?: FetchOptions,
  ) => Promise<T | undefined>;
  register: <T>(keyParts: unknown[], fn: () => Promise<T>) => void;
  refetch: (keyParts: unknown[]) => Promise<void>;
  refetchMany: (keyPartsList: unknown[][]) => void;
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
      fetchedAt: null,
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
    if (get().fetchers[key]) return;
    set((s) => ({
      fetchers: { ...s.fetchers, [key]: fn as () => Promise<unknown> },
    }));
  },

  fetch: async (keyParts, fn, options) => {
    const key = serializeKey(keyParts);
    const staleMs = options?.staleMs ?? DEFAULT_STALE_MS;
    const force = options?.force ?? false;

    get().register(keyParts, fn);

    const existing = get().entries[key];
    if (!force && isFresh(existing, staleMs)) {
      return existing!.data as Awaited<ReturnType<typeof fn>> | undefined;
    }

    const inflight = inflightByKey.get(key);
    if (inflight && !force) {
      return inflight as Promise<Awaited<ReturnType<typeof fn>> | undefined>;
    }

    set((s) => {
      const entry = ensureEntry(s.entries, key);
      entry.loading = true;
      entry.error = null;
      replaceSnapshot(entry);
      return { entries: { ...s.entries } };
    });
    notifyKey(key);

    const promise = (async () => {
      try {
        const data = await fn();
        set((s) => {
          const entry = ensureEntry(s.entries, key);
          entry.data = data;
          entry.loading = false;
          entry.error = null;
          entry.fetchedAt = Date.now();
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
      } finally {
        inflightByKey.delete(key);
      }
    })();

    inflightByKey.set(key, promise);
    return promise;
  },

  refetch: async (keyParts) => {
    const key = serializeKey(keyParts);
    const fn = get().fetchers[key];
    if (fn) await get().fetch(keyParts, fn, { force: true });
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
      if (options?.invalidate?.length) {
        get().refetchMany(options.invalidate);
      } else if (options?.invalidateAll) {
        get().refetchAllRegistered();
      }
      return result;
    } finally {
      set({ pendingMutations: Math.max(0, get().pendingMutations - 1) });
    }
  },
}));
