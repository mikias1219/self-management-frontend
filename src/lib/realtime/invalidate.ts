import type { RealtimeUpdate } from "@/lib/realtime/socket";
import { useDataCache } from "@/stores/data-cache";

/** Modules whose cache keys should refresh when another module changes. */
const INVALIDATION_ALIASES: Record<string, string[]> = {
  finance: ["dashboard"],
  productivity: ["dashboard"],
  health: ["dashboard"],
  learning: ["dashboard"],
};

function keysForModule(module: string): unknown[][] {
  const { fetchers } = useDataCache.getState();
  const prefixes = new Set([module, ...(INVALIDATION_ALIASES[module] ?? [])]);
  const keys: unknown[][] = [];

  for (const key of Object.keys(fetchers)) {
    try {
      const parts = JSON.parse(key) as unknown[];
      if (typeof parts[0] === "string" && prefixes.has(parts[0])) {
        keys.push(parts);
      }
    } catch {
      /* skip malformed keys */
    }
  }

  return keys;
}

/** Backend mutation → refresh views for the affected module only. */
export function invalidateFromRealtime(payload?: RealtimeUpdate): void {
  const cache = useDataCache.getState();

  if (!payload?.module) {
    cache.refetchAllRegistered();
    return;
  }

  const keys = keysForModule(payload.module);
  if (keys.length > 0) {
    cache.refetchMany(keys);
  }
}
