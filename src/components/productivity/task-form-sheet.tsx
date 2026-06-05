"use client";

import { Clock, ListTodo, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export interface TaskFormValues {
  title: string;
  time: string;
  minutes: string;
}

interface TaskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  values: TaskFormValues;
  onChange: (patch: Partial<TaskFormValues>) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  saving?: boolean;
  googleConnected?: boolean;
}

export function TaskFormSheet({
  open,
  onOpenChange,
  mode,
  values,
  onChange,
  onSubmit,
  onDelete,
  saving,
  googleConnected,
}: TaskFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[90vh]">
        <SheetHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 text-sky-600">
            <ListTodo className="size-5" />
            <SheetTitle className="text-lg">
              {mode === "create" ? "New task today" : "Edit task"}
            </SheetTitle>
          </div>
          <SheetDescription>
            {googleConnected
              ? "Saves to LifeOS and syncs to Google Calendar automatically."
              : "Saved in LifeOS. Connect Google on Today for live sync."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-6">
          <div className="space-y-2">
            <Label htmlFor="pf-title" className="text-xs uppercase tracking-wide text-muted-foreground">
              Task name
            </Label>
            <Input
              id="pf-title"
              value={values.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="What will you work on?"
              className="h-12 text-base"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf-time" className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                <Clock className="size-3.5" />
                Start time
              </Label>
              <Input
                id="pf-time"
                type="time"
                value={values.time}
                onChange={(e) => onChange({ time: e.target.value })}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-min" className="text-xs uppercase tracking-wide text-muted-foreground">
                Duration (min)
              </Label>
              <Input
                id="pf-min"
                type="number"
                min={5}
                max={480}
                step={5}
                value={values.minutes}
                onChange={(e) => onChange({ minutes: e.target.value })}
                className="h-12"
              />
            </div>
          </div>
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

        <SheetFooter className="pt-2">
          <Button
            className="w-full h-12 rounded-full text-base"
            onClick={onSubmit}
            disabled={saving}
          >
            {saving && <Loader2 className="size-4 animate-spin mr-2" />}
            {mode === "create" ? "Add to schedule" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
