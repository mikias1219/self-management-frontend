export type LifeArea =
  | "career"
  | "health"
  | "finance"
  | "personal"
  | "learning"
  | "spiritual"
  | "relationships";

export const LIFE_AREAS: { value: LifeArea; label: string }[] = [
  { value: "career", label: "Career" },
  { value: "health", label: "Health" },
  { value: "finance", label: "Finance" },
  { value: "personal", label: "Personal" },
  { value: "learning", label: "Learning" },
  { value: "spiritual", label: "Spiritual" },
  { value: "relationships", label: "Relationships" },
];
