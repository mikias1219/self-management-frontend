import { LineChart } from "lucide-react";
import { loadPanel } from "@/components/hubs/configs/panel-loader";
import type { HubConfig } from "@/components/hubs/configs/types";

const AnalyticsModule = loadPanel(
  () => import("@/app/(dashboard)/analytics/_module"),
  "AnalyticsModule",
);
const ActivityLogsModule = loadPanel(
  () => import("@/app/(dashboard)/activity-logs/_module"),
  "ActivityLogsModule",
);

export const INSIGHTS_HUB: HubConfig = {
  title: "Insights",
  subtitle: "Analytics and activity history across your LifeOS data.",
  icon: LineChart,
  iconClassName: "bg-violet-500/15 text-violet-600",
  tabs: [
    {
      id: "analytics",
      label: "Analytics",
      description: "Charts and cross-module metrics.",
    },
    {
      id: "activity",
      label: "Activity log",
      description: "Audit trail of actions and completions.",
    },
  ],
  defaultTab: "analytics",
  panels: {
    analytics: AnalyticsModule,
    activity: ActivityLogsModule,
  },
};
