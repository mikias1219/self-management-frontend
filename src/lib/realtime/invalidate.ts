import { useDataCache } from "@/stores/data-cache";

/** Any backend mutation → refresh all active API-backed views. */
export function invalidateFromRealtime(): void {
  useDataCache.getState().refetchAllRegistered();
}
