import {
  BookOpen,
  Heart,
  HeartHandshake,
  Languages,
} from "lucide-react";
import { loadPanel } from "@/components/hubs/configs/panel-loader";
import type { HubConfig } from "@/components/hubs/configs/types";

const HealthModule = loadPanel(
  () => import("@/app/(dashboard)/health/_module"),
  "HealthModule",
);
const LearningModule = loadPanel(
  () => import("@/app/(dashboard)/learning/_module"),
  "LearningModule",
);
const SpiritualModule = loadPanel(
  () => import("@/app/(dashboard)/spiritual/_module"),
  "SpiritualModule",
);
const JournalModule = loadPanel(
  () => import("@/app/(dashboard)/journal/_module"),
  "JournalModule",
);
const EnglishModule = loadPanel(
  () => import("@/app/(dashboard)/english/_module"),
  "EnglishModule",
);

export const LIFE_HUB: HubConfig = {
  title: "Life",
  subtitle:
    "Health, learning, journaling, spiritual practice, and English — the personal side of your stand.",
  icon: HeartHandshake,
  iconClassName: "bg-rose-500/15 text-rose-600",
  tabs: [
    {
      id: "health",
      label: "Health",
      description: "Workouts, metrics, and wellness tracking.",
      icon: Heart,
      primary: true,
    },
    {
      id: "learning",
      label: "Learning",
      description: "Books, courses, skills, and study progress.",
      icon: BookOpen,
    },
    {
      id: "journal",
      label: "Journal",
      description: "Daily entries and reflections.",
      icon: BookOpen,
    },
    {
      id: "spiritual",
      label: "Spiritual",
      description: "Prayer, scripture, and faith practices.",
      icon: BookOpen,
    },
    {
      id: "english",
      label: "English",
      description: "Vocabulary, practice, and language drills.",
      icon: Languages,
    },
  ],
  defaultTab: "health",
  panels: {
    health: HealthModule,
    learning: LearningModule,
    journal: JournalModule,
    spiritual: SpiritualModule,
    english: EnglishModule,
  },
};
