"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DEFAULT_STALE_MS, useDataCache, serializeKey } from "@/stores/data-cache";

interface UseStandDataOptions {
  enabled?: boolean;
  /** How long cached data stays fresh before refetching (ms). Default 30s. */
  staleTime?: number;
}

export function useStandData<T>(
  keyParts: unknown[],
  fetchFn: () => Promise<T>,
  options?: UseStandDataOptions,
) {
  const enabled = options?.enabled ?? true;
  const staleTime = options?.staleTime ?? DEFAULT_STALE_MS;
  const key = serializeKey(keyParts);
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const subscribe = useCallback(
    (onChange: () => void) => useDataCache.getState().subscribe(key, onChange),
    [key],
  );

  const getSnapshot = useCallback(
    () => useDataCache.getState().getSnapshot<T>(key),
    [key],
  );

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!enabled) return;
    const run = () => fetchRef.current();
    useDataCache.getState().register(keyParts, run);
    const entry = useDataCache.getState().entries[key];
    const stale =
      !entry?.fetchedAt || Date.now() - entry.fetchedAt >= staleTime;
    if (!entry?.loading && (entry?.data === undefined || entry?.error || stale)) {
      void useDataCache.getState().fetch(keyParts, run, { staleMs: staleTime });
    }
  }, [key, enabled, staleTime, keyParts]);

  const refetch = useCallback(() => {
    if (!enabled) return Promise.resolve();
    return useDataCache.getState().refetch(keyParts);
  }, [keyParts, enabled]);

  return {
    data: snapshot.data,
    isLoading: snapshot.loading && snapshot.data === undefined,
    isFetching: snapshot.loading,
    isError: !!snapshot.error,
    error: snapshot.error,
    refetch,
  };
}

export function useStandMutation<TArg, TResult>(
  mutationFn: (arg: TArg) => Promise<TResult>,
  options?: {
    invalidateKeys?: unknown[][];
    invalidateAll?: boolean;
    onSuccess?: (result: TResult) => void;
    onError?: (error: unknown) => void;
  },
) {
  const [isPending, setIsPending] = useState(false);
  const mutationRef = useRef(mutationFn);
  mutationRef.current = mutationFn;

  const mutate = useCallback(
    async (arg: TArg) => {
      setIsPending(true);
      try {
        const result = await useDataCache.getState().runMutation(
          () => mutationRef.current(arg),
          {
            invalidate: options?.invalidateKeys,
            invalidateAll: options?.invalidateAll ?? false,
          },
        );
        options?.onSuccess?.(result as TResult);
        return result;
      } catch (error) {
        options?.onError?.(error);
        return undefined;
      } finally {
        setIsPending(false);
      }
    },
    [options],
  );

  return {
    mutate,
    isPending,
    isError: false,
  };
}
