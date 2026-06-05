import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { HubTab, HubTabGroup } from "@/components/hubs/hub-layout";

export interface HubConfig {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconClassName: string;
  tabs: HubTab[];
  tabGroups?: HubTabGroup[];
  defaultTab: string;
  panels: Record<string, ComponentType>;
}
