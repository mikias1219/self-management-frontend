"use client";

import { HubPageShell } from "@/components/hubs/hub-page-shell";
import { INSIGHTS_HUB } from "@/components/hubs/hub-configs";

export default function InsightsHubPage() {
  return <HubPageShell {...INSIGHTS_HUB} />;
}
