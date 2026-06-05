import type { Task } from "@/lib/types";

const FINANCIAL_KEYWORDS =
  /\b(pay|bill|rent|loan|utility|electricity|subscription|transfer|save|savings)\b/i;

export function taskSuggestsTransaction(task: Pick<Task, "title" | "description" | "lifeArea">) {
  return (
    task.lifeArea === "finance" ||
    FINANCIAL_KEYWORDS.test(task.title) ||
    FINANCIAL_KEYWORDS.test(task.description ?? "")
  );
}
