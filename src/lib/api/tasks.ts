import { createCrudApi } from "./crud";
import type { Task } from "@/lib/types";

export const tasksApi = createCrudApi<Task>("/tasks");
