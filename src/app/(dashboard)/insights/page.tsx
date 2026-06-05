"use client";

import { HubPageShell } from "@/components/hubs/hub-page-shell";
import { INSIGHTS_HUB } from "@/components/hubs/configs/insights-hub";

export default function InsightsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <HubPageShell {...INSIGHTS_HUB} />
    </div>
  );
}
