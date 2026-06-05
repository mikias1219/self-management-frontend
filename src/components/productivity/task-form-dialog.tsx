"use client";

import { Clock, ListTodo, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { TaskFormValues } from "@/components/productivity/task-form-sheet";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  values: TaskFormValues;
  onChange: (patch: Partial<TaskFormValues>) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  saving?: boolean;
  calendarReady?: boolean;
  syncEnabled?: boolean;
  onSyncChange?: (enabled: boolean) => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  mode,
  values,
  onChange,
  onSubmit,
  onDelete,
  saving,
  calendarReady,
  syncEnabled = true,
  onSyncChange,
}: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListTodo className="size-5 text-sky-600" />
            {mode === "create" ? "New task for today" : "Edit task"}
          </DialogTitle>
          <DialogDescription>
            {calendarReady && syncEnabled
              ? "Saving updates Google Calendar. Deleting this task removes the event there too."
              : calendarReady
                ? "Calendar sync is off for this task."
                : (
                    <>
                      Connect Google in{" "}
                      <Link href="/settings" className="text-primary underline">
                        Settings
                      </Link>{" "}
                      to sync tasks.
                    </>
                  )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pf-title">Task name</Label>
            <Input
              id="pf-title"
              value={values.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="What will you work on?"
              className="h-11"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf-time" className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Start time
              </Label>
              <Input
                id="pf-time"
                type="time"
                value={values.time}
                onChange={(e) => onChange({ time: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-min">Duration (minutes)</Label>
              <Input
                id="pf-min"
                type="number"
                min={5}
                max={480}
                step={5}
                value={values.minutes}
                onChange={(e) => onChange({ minutes: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          {calendarReady && onSyncChange && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={syncEnabled}
                onChange={(e) => onSyncChange(e.target.checked)}
                className="rounded border-input"
              />
              Sync to Google Calendar when saved
            </label>
          )}
        </div>

        {mode === "edit" && onDelete && (
          <>
            <Separator />
            <Button
              type="button"
              variant="ghost"
              className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              Delete task
            </Button>
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin mr-2" />}
            {mode === "create" ? "Add to schedule" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
