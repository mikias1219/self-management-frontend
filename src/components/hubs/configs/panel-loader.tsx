"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/** Lazy-load a named module export with a lightweight loading state. */
export function loadPanel<T extends Record<string, ComponentType>>(
  loader: () => Promise<T>,
  exportName: keyof T & string,
) {
  return dynamic(
    () => loader().then((mod) => ({ default: mod[exportName] })),
    { loading: () => <PanelSkeleton /> },
  );
}
