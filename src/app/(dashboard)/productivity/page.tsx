"use client";

import { HubPageShell } from "@/components/hubs/hub-page-shell";
import { PRODUCTIVITY_HUB } from "@/components/hubs/configs/productivity-hub";

export default function ProductivityPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <HubPageShell {...PRODUCTIVITY_HUB} />
    </div>
  );
}
