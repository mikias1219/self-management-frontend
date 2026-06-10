"use client";

import { HubPageShell } from "@/components/hubs/hub-page-shell";
import { LIFE_HUB } from "@/components/hubs/configs/life-hub";

export default function LifePage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <HubPageShell {...LIFE_HUB} />
    </div>
  );
}
