"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function renderMarkdown(text: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-semibold mt-3 mb-1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/g, "<br />");
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 8,
  className,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const wordCount = useMemo(
    () => (value.trim() ? value.trim().split(/\s+/).length : 0),
    [value],
  );
  const html = useMemo(() => renderMarkdown(value), [value]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "write" ? "default" : "ghost"}
            onClick={() => setMode("write")}
          >
            Write
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "preview" ? "default" : "ghost"}
            onClick={() => setMode("preview")}
          >
            Preview
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">{wordCount} words</span>
      </div>
      {mode === "write" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <div
          className="min-h-[12rem] rounded-md border bg-muted/20 px-3 py-2 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html || "<p class='text-muted-foreground'>Nothing to preview</p>" }}
        />
      )}
      <p className="text-[11px] text-muted-foreground">
        Supports **bold**, *italic*, # headings, and - lists
      </p>
    </div>
  );
}
