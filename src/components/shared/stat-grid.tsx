import { cn } from "@/lib/utils";

/**
 * Consistent responsive layout for a module's key stats.
 * Keeps every module's stat row calm and uniform (max 4 across).
 */
export function StatGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
