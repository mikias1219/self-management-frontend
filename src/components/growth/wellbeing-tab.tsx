"use client";

import { JournalModule } from "@/app/(dashboard)/journal/_module";
import { SpiritualModule } from "@/app/(dashboard)/spiritual/_module";

export function WellbeingTab() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Journal
        </h3>
        <JournalModule />
      </section>
      <section>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Spiritual practice
        </h3>
        <SpiritualModule />
      </section>
    </div>
  );
}
