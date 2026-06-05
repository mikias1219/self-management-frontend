"use client";

import { format } from "date-fns";
import { BookOpen, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ModuleShell } from "@/components/shared/module-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField, FormSelect } from "@/components/shared/form-fields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { usePeriod } from "@/hooks/use-period";
import { learningApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type {
  Book,
  Course,
  LearningProject,
  Skill,
  StudySession,
} from "@/lib/types";
import { filterByDateField } from "@/lib/utils/period";
import { useStandUi } from "@/stores/use-stand";

const STATUSES = ["not_started", "in_progress", "completed", "paused"] as const;

export function LearningModule() {
  const { query, label } = usePeriod("learning");
  const authenticated = hasAuthToken();
  const pageTab = useStandUi((s) => s.pageTab["learning"] ?? "books");
  const setPageTab = useStandUi((s) => s.setPageTab);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const onBooks = pageTab === "books";
  const onCourses = pageTab === "courses";
  const onSkills = pageTab === "skills";
  const onProjects = pageTab === "projects";
  const onSessions = pageTab === "sessions";

  const books = useStandData(["learning", "books"], () => learningApi.books.getAll(), {
    enabled: authenticated && onBooks,
  });
  const courses = useStandData(["learning", "courses"], () => learningApi.courses.getAll(), {
    enabled: authenticated && onCourses,
  });
  const skills = useStandData(["learning", "skills"], () => learningApi.skills.getAll(), {
    enabled: authenticated && onSkills,
  });
  const projects = useStandData(["learning", "projects"], () => learningApi.projects.getAll(), {
    enabled: authenticated && onProjects,
  });
  const sessions = useStandData(["learning", "sessions"], () => learningApi.studySessions.getAll(), {
    enabled: authenticated && (onSessions || onBooks || onCourses),
  });

  const filteredSessions = useMemo(
    () => filterByDateField(sessions.data ?? [], query, (s) => s.sessionDate),
    [sessions.data, query],
  );

  const studyMinutes = filteredSessions.reduce((s, x) => s + x.durationMinutes, 0);

  const invalidate = [
    ["learning", "books"],
    ["learning", "courses"],
    ["learning", "skills"],
    ["learning", "projects"],
    ["learning", "sessions"],
    ["dashboard"],
  ];

  const removeBook = useStandMutation((id: string) => learningApi.books.remove(id), { invalidateKeys: invalidate, onSuccess: () => toast.success("Deleted") });
  const removeCourse = useStandMutation((id: string) => learningApi.courses.remove(id), { invalidateKeys: invalidate, onSuccess: () => toast.success("Deleted") });
  const removeSkill = useStandMutation((id: string) => learningApi.skills.remove(id), { invalidateKeys: invalidate, onSuccess: () => toast.success("Deleted") });
  const removeProject = useStandMutation((id: string) => learningApi.projects.remove(id), { invalidateKeys: invalidate, onSuccess: () => toast.success("Deleted") });
  const removeSession = useStandMutation((id: string) => learningApi.studySessions.remove(id), { invalidateKeys: invalidate, onSuccess: () => toast.success("Deleted") });

  const bookCols: DataTableColumn<Book>[] = [
    { key: "title", header: "Title", cell: (r) => r.title },
    { key: "author", header: "Author", cell: (r) => r.author ?? "—" },
    { key: "status", header: "Status", cell: (r) => r.learningStatus },
    { key: "pages", header: "Pages", cell: (r) => `${r.pagesRead}/${r.totalPages ?? "?"}` },
  ];
  const courseCols: DataTableColumn<Course>[] = [
    { key: "title", header: "Title", cell: (r) => r.title },
    { key: "platform", header: "Platform", cell: (r) => r.platform ?? "—" },
    { key: "progress", header: "Progress", cell: (r) => `${r.progress}%` },
  ];
  const skillCols: DataTableColumn<Skill>[] = [
    { key: "name", header: "Skill", cell: (r) => r.name },
    { key: "proficiency", header: "Proficiency", cell: (r) => `${r.proficiency}/100` },
  ];
  const projectCols: DataTableColumn<LearningProject>[] = [
    { key: "name", header: "Project", cell: (r) => r.name },
    { key: "status", header: "Status", cell: (r) => r.learningStatus },
    { key: "progress", header: "Progress", cell: (r) => `${r.progress}%` },
  ];
  const sessionCols: DataTableColumn<StudySession>[] = [
    { key: "topic", header: "Topic", cell: (r) => r.topic ?? "—" },
    { key: "duration", header: "Min", cell: (r) => r.durationMinutes },
    { key: "date", header: "Date", cell: (r) => format(new Date(r.sessionDate), "MMM d") },
  ];

  if (!authenticated) {
    return (
      <ModuleShell title="Learning" icon={BookOpen} iconClassName="bg-emerald-500/15 text-emerald-600">
        <p className="text-center text-sm text-muted-foreground py-12">Sign in to track learning.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Learning"
      description={`Books, courses, skills & study time — ${label}`}
      icon={BookOpen}
      iconClassName="bg-emerald-500/15 text-emerald-600"
      actions={
        <Button size="sm" onClick={() => { setEditId(null); setOpen(true); }}>
          <Plus className="size-4" /> Add
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard title="Books" value={(books.data ?? []).length} loading={books.isLoading} />
        <StatCard title="Courses" value={(courses.data ?? []).length} loading={courses.isLoading} />
        <StatCard title="Skills" value={(skills.data ?? []).length} loading={skills.isLoading} />
        <StatCard title="Study min" value={studyMinutes} loading={sessions.isLoading} />
      </div>

      <Tabs value={pageTab} onValueChange={(v) => setPageTab("learning", v)}>
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="mt-4">
          <DataTable columns={bookCols} data={books.data ?? []} loading={books.isLoading} getRowId={(r) => r.id}
            onEdit={(r) => { setEditId(r.id); setOpen(true); }}
            onDelete={(r) => { if (window.confirm("Delete?")) removeBook.mutate(r.id); }} />
        </TabsContent>
        <TabsContent value="courses" className="mt-4">
          <DataTable columns={courseCols} data={courses.data ?? []} loading={courses.isLoading} getRowId={(r) => r.id}
            onEdit={(r) => { setEditId(r.id); setOpen(true); }}
            onDelete={(r) => { if (window.confirm("Delete?")) removeCourse.mutate(r.id); }} />
        </TabsContent>
        <TabsContent value="skills" className="mt-4">
          <DataTable columns={skillCols} data={skills.data ?? []} loading={skills.isLoading} getRowId={(r) => r.id}
            onEdit={(r) => { setEditId(r.id); setOpen(true); }}
            onDelete={(r) => { if (window.confirm("Delete?")) removeSkill.mutate(r.id); }} />
        </TabsContent>
        <TabsContent value="projects" className="mt-4">
          <DataTable columns={projectCols} data={projects.data ?? []} loading={projects.isLoading} getRowId={(r) => r.id}
            onEdit={(r) => { setEditId(r.id); setOpen(true); }}
            onDelete={(r) => { if (window.confirm("Delete?")) removeProject.mutate(r.id); }} />
        </TabsContent>
        <TabsContent value="sessions" className="mt-4">
          <DataTable columns={sessionCols} data={filteredSessions} loading={sessions.isLoading} getRowId={(r) => r.id}
            onEdit={(r) => { setEditId(r.id); setOpen(true); }}
            onDelete={(r) => { if (window.confirm("Delete?")) removeSession.mutate(r.id); }} />
        </TabsContent>
      </Tabs>

      <LearningDialog
        tab={pageTab}
        open={open}
        onOpenChange={setOpen}
        editId={editId}
        books={books.data ?? []}
        courses={courses.data ?? []}
        skills={skills.data ?? []}
        projects={projects.data ?? []}
        sessions={sessions.data ?? []}
        invalidateKeys={invalidate}
        onDone={() => { setOpen(false); setEditId(null); }}
      />
    </ModuleShell>
  );
}

function LearningDialog({
  tab,
  open,
  onOpenChange,
  editId,
  books,
  courses,
  skills,
  projects,
  sessions,
  invalidateKeys,
  onDone,
}: {
  tab: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editId: string | null;
  books: Book[];
  courses: Course[];
  skills: Skill[];
  projects: LearningProject[];
  sessions: StudySession[];
  invalidateKeys: unknown[][];
  onDone: () => void;
}) {
  const editBook = books.find((b) => b.id === editId);
  const editCourse = courses.find((c) => c.id === editId);
  const editSkill = skills.find((s) => s.id === editId);
  const editProject = projects.find((p) => p.id === editId);
  const editSession = sessions.find((s) => s.id === editId);

  const save = useStandMutation(
    async (payload: { api: () => Promise<unknown> }) => payload.api(),
    {
      invalidateKeys,
      onSuccess: () => {
        toast.success("Saved");
        onDone();
      },
      onError: () => toast.error("Failed to save"),
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editId ? "Edit" : "Add"} {tab.slice(0, -1) || tab}</DialogTitle>
        </DialogHeader>

        {tab === "books" && (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              title: String(fd.get("title")),
              author: String(fd.get("author") ?? "").trim() || undefined,
              learningStatus: fd.get("learningStatus") as Book["learningStatus"],
              pagesRead: Number(fd.get("pagesRead") ?? 0),
              totalPages: fd.get("totalPages") ? Number(fd.get("totalPages")) : undefined,
            };
            save.mutate({
              api: () => editId ? learningApi.books.update(editId, data) : learningApi.books.create(data),
            });
          }}>
            <FormField label="Title" name="title" required defaultValue={editBook?.title} />
            <FormField label="Author" name="author" defaultValue={editBook?.author} />
            <FormSelect label="Status" name="learningStatus" defaultValue={editBook?.learningStatus ?? "in_progress"} options={STATUSES.map((s) => ({ value: s, label: s }))} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Pages read" name="pagesRead" type="number" defaultValue={editBook?.pagesRead ?? 0} />
              <FormField label="Total pages" name="totalPages" type="number" defaultValue={editBook?.totalPages} />
            </div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        )}

        {tab === "courses" && (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              title: String(fd.get("title")),
              platform: String(fd.get("platform") ?? "").trim() || undefined,
              learningStatus: fd.get("learningStatus") as Course["learningStatus"],
              progress: Number(fd.get("progress") ?? 0),
              hoursSpent: Number(fd.get("hoursSpent") ?? 0),
            };
            save.mutate({
              api: () => editId ? learningApi.courses.update(editId, data) : learningApi.courses.create(data),
            });
          }}>
            <FormField label="Title" name="title" required defaultValue={editCourse?.title} />
            <FormField label="Platform" name="platform" defaultValue={editCourse?.platform} />
            <FormSelect label="Status" name="learningStatus" defaultValue={editCourse?.learningStatus ?? "in_progress"} options={STATUSES.map((s) => ({ value: s, label: s }))} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Progress %" name="progress" type="number" defaultValue={editCourse?.progress ?? 0} />
              <FormField label="Hours spent" name="hoursSpent" type="number" defaultValue={editCourse?.hoursSpent ?? 0} />
            </div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        )}

        {tab === "skills" && (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              name: String(fd.get("name")),
              description: String(fd.get("description") ?? "").trim() || undefined,
              proficiency: Number(fd.get("proficiency") ?? 0),
            };
            save.mutate({
              api: () => editId ? learningApi.skills.update(editId, data) : learningApi.skills.create(data),
            });
          }}>
            <FormField label="Skill name" name="name" required defaultValue={editSkill?.name} />
            <FormField label="Description" name="description" defaultValue={editSkill?.description} />
            <FormField label="Proficiency (0-100)" name="proficiency" type="number" min="0" max="100" defaultValue={editSkill?.proficiency ?? 0} />
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        )}

        {tab === "projects" && (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              name: String(fd.get("name")),
              description: String(fd.get("description") ?? "").trim() || undefined,
              learningStatus: fd.get("learningStatus") as LearningProject["learningStatus"],
              progress: Number(fd.get("progress") ?? 0),
            };
            save.mutate({
              api: () => editId ? learningApi.projects.update(editId, data) : learningApi.projects.create(data),
            });
          }}>
            <FormField label="Project name" name="name" required defaultValue={editProject?.name} />
            <FormField label="Description" name="description" defaultValue={editProject?.description} />
            <FormSelect label="Status" name="learningStatus" defaultValue={editProject?.learningStatus ?? "in_progress"} options={STATUSES.map((s) => ({ value: s, label: s }))} />
            <FormField label="Progress %" name="progress" type="number" defaultValue={editProject?.progress ?? 0} />
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        )}

        {tab === "sessions" && (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = {
              sessionDate: String(fd.get("sessionDate")),
              durationMinutes: Number(fd.get("durationMinutes")),
              topic: String(fd.get("topic") ?? "").trim() || undefined,
              notes: String(fd.get("notes") ?? "").trim() || undefined,
            };
            save.mutate({
              api: () => editId ? learningApi.studySessions.update(editId, data) : learningApi.studySessions.create(data),
            });
          }}>
            <FormField label="Topic" name="topic" defaultValue={editSession?.topic} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date" name="sessionDate" type="date" required defaultValue={editSession?.sessionDate ?? format(new Date(), "yyyy-MM-dd")} />
              <FormField label="Minutes" name="durationMinutes" type="number" required defaultValue={editSession?.durationMinutes ?? 30} />
            </div>
            <FormField label="Notes" name="notes" defaultValue={editSession?.notes} />
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
