"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export function RowActions({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
}: RowActionsProps) {
  if (!onEdit && !onDelete) return null;
  return (
    <div className="flex justify-end gap-1">
      {onEdit && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={onEdit}
          aria-label={editLabel}
        >
          <Pencil className="size-3.5" />
        </Button>
      )}
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label={deleteLabel}
        >
          <Trash2 className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
