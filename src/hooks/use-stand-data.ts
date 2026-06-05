"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useDataCache, serializeKey } from "@/stores/data-cache";

interface UseStandDataOptions {
  enabled?: boolean;
}

export function useStandData<T>(
  keyParts: unknown[],
  fetchFn: () => Promise<T>,
  options?: UseStandDataOptions,
) {
  const enabled = options?.enabled ?? true;
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
    if (!entry?.loading && (entry?.data === undefined || entry?.error)) {
      void useDataCache.getState().fetch(keyParts, run);
    }
  }, [key, enabled, keyParts]);

  const refetch = useCallback(() => {
    if (!enabled) return Promise.resolve();
    return useDataCache.getState().refetch(keyParts);
  }, [keyParts, enabled]);

  return {
    data: snapshot.data,
    isLoading: snapshot.loading,
    isError: !!snapshot.error,
    error: snapshot.error,
    refetch,
  };
}

export function useStandMutation<TArg, TResult>(
  mutationFn: (arg: TArg) => Promise<TResult>,
  options?: {
    invalidateKeys?: unknown[][];
    /** Refetch all registered API data (default true for creates). */
    invalidateAll?: boolean;
    onSuccess?: (result: TResult) => void;
    onError?: (error: unknown) => void;
  },
) {
  const isPending = useDataCache((s) => s.pendingMutations > 0);
  const mutationRef = useRef(mutationFn);
  mutationRef.current = mutationFn;

  const mutate = useCallback(
    async (arg: TArg) => {
      try {
        const result = await useDataCache.getState().runMutation(
          () => mutationRef.current(arg),
          {
            invalidate: options?.invalidateKeys,
            invalidateAll: options?.invalidateAll ?? true,
          },
        );
        options?.onSuccess?.(result as TResult);
        return result;
      } catch (error) {
        options?.onError?.(error);
        return undefined;
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
