import { HeartHandshake } from "lucide-react";
import { loadPanel } from "@/components/hubs/configs/panel-loader";
import type { HubConfig } from "@/components/hubs/configs/types";

const FinanceModule = loadPanel(
  () => import("@/app/(dashboard)/finance/_module"),
  "FinanceModule",
);
const HealthModule = loadPanel(
  () => import("@/app/(dashboard)/health/_module"),
  "HealthModule",
);
const SpiritualModule = loadPanel(
  () => import("@/app/(dashboard)/spiritual/_module"),
  "SpiritualModule",
);
const JournalModule = loadPanel(
  () => import("@/app/(dashboard)/journal/_module"),
  "JournalModule",
);

export const LIFE_HUB: HubConfig = {
  title: "Life",
  subtitle:
    "Finance, health, spiritual practice, and journaling — the personal side of your stand.",
  icon: HeartHandshake,
  iconClassName: "bg-rose-500/15 text-rose-600",
  tabs: [
    {
      id: "finance",
      label: "Finance",
      description: "Accounts, budgets, transactions, and savings.",
    },
    {
      id: "health",
      label: "Health",
      description: "Workouts, metrics, and wellness tracking.",
    },
    {
      id: "spiritual",
      label: "Spiritual",
      description: "Prayer, scripture, and faith practices.",
    },
    {
      id: "journal",
      label: "Journal",
      description: "Daily entries and reflections.",
    },
  ],
  defaultTab: "finance",
  panels: {
    finance: FinanceModule,
    health: HealthModule,
    spiritual: SpiritualModule,
    journal: JournalModule,
  },
};
