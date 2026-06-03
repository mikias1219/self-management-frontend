"use client";

import { HubPageShell } from "@/components/hubs/hub-page-shell";
import { PRODUCTIVITY_HUB } from "@/components/hubs/hub-configs";

export default function ProductivityHubPage() {
  return <HubPageShell {...PRODUCTIVITY_HUB} />;
}
