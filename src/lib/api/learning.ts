import { createCrudApi } from "./crud";
import type {
  Book,
  Course,
  LearningProject,
  Skill,
  StudySession,
} from "@/lib/types";

export const learningApi = {
  books: createCrudApi<Book>("/learning/books"),
  courses: createCrudApi<Course>("/learning/courses"),
  skills: createCrudApi<Skill>("/learning/skills"),
  projects: createCrudApi<LearningProject>("/learning/projects"),
  studySessions: createCrudApi<StudySession>("/learning/study-sessions"),
};
