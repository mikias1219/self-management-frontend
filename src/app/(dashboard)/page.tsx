import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Results for the period in the header. Use the sidebar to manage plans,
          goals, habits, and other areas in full detail.
        </p>
      </div>

      <DashboardOverview />
    </div>
  );
}
