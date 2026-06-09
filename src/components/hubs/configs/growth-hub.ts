import { GraduationCap } from "lucide-react";
import { loadPanel } from "@/components/hubs/configs/panel-loader";
import type { HubConfig } from "@/components/hubs/configs/types";

const LearningModule = loadPanel(
  () => import("@/app/(dashboard)/learning/_module"),
  "LearningModule",
);
const HealthModule = loadPanel(
  () => import("@/app/(dashboard)/health/_module"),
  "HealthModule",
);
const WellbeingTab = loadPanel(
  () => import("@/components/growth/wellbeing-tab"),
  "WellbeingTab",
);

export const GROWTH_HUB: HubConfig = {
  title: "Growth",
  subtitle: "Learning, health, and wellbeing — improve yourself in one place.",
  icon: GraduationCap,
  iconClassName: "bg-emerald-500/15 text-emerald-600",
  tabs: [
    {
      id: "learning",
      label: "Learning",
      description: "Books, courses, skills, and study progress.",
      primary: true,
    },
    {
      id: "health",
      label: "Health",
      description: "Daily metrics — steps, sleep, water, exercise.",
    },
    {
      id: "wellbeing",
      label: "Wellbeing",
      description: "Journal and spiritual practice in one view.",
    },
  ],
  defaultTab: "learning",
  panels: {
    learning: LearningModule,
    health: HealthModule,
    wellbeing: WellbeingTab,
  },
};
