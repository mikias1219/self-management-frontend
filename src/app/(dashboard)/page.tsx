import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardOverview = dynamic(
  () =>
    import("@/components/dashboard/dashboard-overview").then((m) => ({
      default: m.DashboardOverview,
    })),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    ),
  },
);

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <DashboardOverview />
    </div>
  );
}
