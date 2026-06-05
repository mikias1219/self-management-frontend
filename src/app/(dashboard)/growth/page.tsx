"use client";

import { HubPageShell } from "@/components/hubs/hub-page-shell";
import { GROWTH_HUB } from "@/components/hubs/configs/growth-hub";

export default function GrowthPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <HubPageShell {...GROWTH_HUB} />
    </div>
  );
}
