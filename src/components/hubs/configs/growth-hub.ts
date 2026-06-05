import { GraduationCap } from "lucide-react";
import { loadPanel } from "@/components/hubs/configs/panel-loader";
import type { HubConfig } from "@/components/hubs/configs/types";

const LearningModule = loadPanel(
  () => import("@/app/(dashboard)/learning/_module"),
  "LearningModule",
);
const EnglishModule = loadPanel(
  () => import("@/app/(dashboard)/english/_module"),
  "EnglishModule",
);

export const GROWTH_HUB: HubConfig = {
  title: "Growth",
  subtitle:
    "Skills and language in one place — track learning and English practice together.",
  icon: GraduationCap,
  iconClassName: "bg-emerald-500/15 text-emerald-600",
  tabs: [
    {
      id: "learning",
      label: "Learning",
      description: "Courses, skills, and study sessions.",
    },
    {
      id: "english",
      label: "English",
      description: "Vocabulary, practice, and language progress.",
    },
  ],
  defaultTab: "learning",
  panels: {
    learning: LearningModule,
    english: EnglishModule,
  },
};
